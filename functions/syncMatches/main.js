import { Client, Databases, Query, ID } from 'node-appwrite';
import axios from 'axios';

// Constants
const THESPORTSDB_V1_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
// Defaults: NHL (4380)
const DEFAULT_LEAGUE_ID = '5137';

export default async ({ req, res, log, error }) => {
    // 1. Initialize Appwrite Client
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(req.headers['x-appwrite-key'] || process.env.APPWRITE_API_KEY);

    const db = new Databases(client);

    const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'raybet-db';
    const COLLECTION_MATCHES = process.env.VITE_APPWRITE_COLLECTION_MATCHES || 'matches';

    // Configuration
    const LEAGUE_ID = process.env.THESPORTSDB_LEAGUE_ID || DEFAULT_LEAGUE_ID;
    // User specified "123" as the free key, though "3" is the standard public test key.
    // We will respect the env var if present, else default to "123" or "3".
    const API_KEY = process.env.THESPORTSDB_API_KEY || '3';

    try {
        log(`Starting sync(v1) for League ID: ${LEAGUE_ID} with API Key: ${API_KEY} `);

        // 2. Fetch data from Beeceptor (RayBet specific endpoint)
        // Endpoint: https://raybet.free.beeceptor.com/raybet.csv
        // The endpoint returns JSON despite the .csv extension in the URL name provided by user.

        const url = 'https://raybet.free.beeceptor.com/raybet.csv';

        log(`Fetching events from: ${url}`);

        const response = await axios.get(url);
        // The structure is { "events": [ ... ] }
        const allEvents = response.data.events || [];

        log(`Fetched ${allEvents.length} events from custom endpoint.`);

        let createdCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        // 3. Sync with Appwrite
        for (const event of allEvents) {
            const externalId = event.externalId;
            const homeTeam = event.homeTeam;
            const awayTeam = event.awayTeam;
            // New date format from source is ISO "2026-02-11T20:10:00" which is good for Appwrite
            const date = event.date;

            // Status mapping
            // Source uses "FT" (Full Time), "NS" (Not Started)
            let status = 'scheduled';
            if (event.status === 'FT') {
                status = 'completed';
            } else if (event.status === 'NS') {
                status = 'scheduled';
            } else if (event.status === 'Live' || event.status === 'In Progress') { // Keeping just in case
                status = 'in_progress';
            }

            // Scores come as strings "5", "2", or empty ""
            // We use 0 if empty/null only if status is completed? 
            // Actually better to keep null if not started.
            // But per previous logic:
            // "intHomeScore": "5" -> 5

            let homeScore = null;
            let awayScore = null;

            if (event.intHomeScore !== "" && event.intHomeScore !== null && event.intHomeScore !== undefined) {
                homeScore = parseInt(event.intHomeScore);
            }
            if (event.intAwayScore !== "" && event.intAwayScore !== null && event.intAwayScore !== undefined) {
                awayScore = parseInt(event.intAwayScore);
            }

            // Badges are not provided by this endpoint.
            // We will NOT update them. If creating new, they will be null.

            // Check if exists
            const existingMatches = await db.listDocuments(
                DATABASE_ID,
                COLLECTION_MATCHES,
                [Query.equal('externalId', externalId)]
            );

            if (existingMatches.total > 0) {
                const doc = existingMatches.documents[0];

                // Update if changed
                if (doc.status !== status ||
                    doc.homeScore !== homeScore ||
                    doc.awayScore !== awayScore
                ) {
                    await db.updateDocument(
                        DATABASE_ID,
                        COLLECTION_MATCHES,
                        doc.$id,
                        {
                            status,
                            homeScore,
                            awayScore,
                            date,
                            leagueId: LEAGUE_ID,
                            // badges handled separately or ignored
                        }
                    );
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                // Create new
                await db.createDocument(
                    DATABASE_ID,
                    COLLECTION_MATCHES,
                    ID.unique(),
                    {
                        externalId,
                        homeTeam,
                        awayTeam,
                        date,
                        status,
                        homeScore,
                        awayScore,
                        leagueId: LEAGUE_ID,
                        // homeTeamBadge, awayTeamBadge omitted
                    }
                );
                createdCount++;
            }
        }

        log(`Sync complete. Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`);

        // ---------------------------------------------------------
        // 4. Calculate Points (Recalculate ALL points for consistency)
        // ---------------------------------------------------------

        log('Starting point recalculation...');

        // A. Fetch all COMPLETED matches
        // We need to paginate if > 100, but for now we assume < 100 completed matches for this tournament context
        const completedMatches = await db.listDocuments(
            DATABASE_ID,
            COLLECTION_MATCHES,
            [
                Query.equal('status', 'completed'),
                Query.limit(100)
            ]
        );

        const matchMap = new Map();
        completedMatches.documents.forEach(m => {
            matchMap.set(m.$id, m);
        });

        // B. Fetch all Predictions
        // In a real large scale app, we would only fetch predictions for the matches that just finished,
        // or use an aggregation pipeline. valid for this scale.
        // We'll fetch ALL predictions to ensure full consistency.
        let allPredictions = [];
        let pOffset = 0;
        let pLimit = 100;
        let pTotal = 0;

        do {
            const pRes = await db.listDocuments(
                DATABASE_ID,
                process.env.VITE_APPWRITE_COLLECTION_PREDICTIONS || 'predictions',
                [
                    Query.limit(pLimit),
                    Query.offset(pOffset)
                ]
            );
            allPredictions = allPredictions.concat(pRes.documents);
            pTotal = pRes.total;
            pOffset += pLimit;
        } while (allPredictions.length < pTotal);

        log(`Fetched ${allPredictions.length} predictions for recalculation.`);

        // C. Calculate scores per user
        const userPoints = new Map(); // userId -> totalPoints

        allPredictions.forEach(pred => {
            const match = matchMap.get(pred.matchId);
            if (!match) return; // Prediction for a match that isn't completed or doesn't exist

            const points = calculatePoints(pred, match);

            const current = userPoints.get(pred.userId) || 0;
            userPoints.set(pred.userId, current + points);
        });

        // D. Update Profiles
        // Fetch all profiles to compare and update
        let allProfiles = [];
        let uOffset = 0;
        let uLimit = 100;
        let uTotal = 0;

        do {
            const uRes = await db.listDocuments(
                DATABASE_ID,
                process.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles',
                [
                    Query.limit(uLimit),
                    Query.offset(uOffset)
                ]
            );
            allProfiles = allProfiles.concat(uRes.documents);
            uTotal = uRes.total;
            uOffset += uLimit;
        } while (allProfiles.length < uTotal);

        let profilesUpdated = 0;

        for (const profile of allProfiles) {
            const calculatedPoints = userPoints.get(profile.userId) || 0;

            if (profile.totalPoints !== calculatedPoints) {
                await db.updateDocument(
                    DATABASE_ID,
                    process.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles',
                    profile.$id,
                    {
                        totalPoints: calculatedPoints
                    }
                );
                profilesUpdated++;
                log(`Updated profile for ${profile.nickname} (${profile.userId}): ${profile.totalPoints} -> ${calculatedPoints}`);
            }
        }

        log(`Point recalculation complete. Profiles updated: ${profilesUpdated}`);

        return res.json({
            success: true,
            stats: {
                created: createdCount,
                updated: updatedCount,
                skipped: skippedCount,
                profilesUpdated
            }
        });

    } catch (err) {
        error(`Error syncing matches: ${err.message}`);
        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};

/**
 * Calculates points based on the rules:
 * 6: Exact score
 * 4: Correct winner/draw AND correct goal diff
 * 2: Correct winner/draw
 * 0: Incorrect
 */
function calculatePoints(prediction, match) {
    if (match.homeScore === null || match.awayScore === null) return 0;
    // Predictions usually store numbers, but verify.
    // If prediction is missing scores, 0 points.
    if (prediction.homeScore === null || prediction.awayScore === null || prediction.homeScore === undefined || prediction.awayScore === undefined) return 0;

    const pHome = Number(prediction.homeScore);
    const pAway = Number(prediction.awayScore);
    const mHome = Number(match.homeScore);
    const mAway = Number(match.awayScore);

    // 1. Exact score (6 pts)
    if (pHome === mHome && pAway === mAway) {
        return 6;
    }

    const pDiff = pHome - pAway;
    const mDiff = mHome - mAway;

    const pResult = Math.sign(pDiff); // 1 = Home, -1 = Away, 0 = Draw
    const mResult = Math.sign(mDiff);

    // 2. Correct outcome (Winner/Draw)
    if (pResult === mResult) {
        // Check for correct goal difference (4 pts)
        if (pDiff === mDiff) {
            return 4;
        }
        // Just correct outcome (2 pts)
        return 2;
    }

    return 0;
}
