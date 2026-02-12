import {Client, Databases, Query, ID} from 'node-appwrite';
import axios from 'axios';

// Constants
const THESPORTSDB_V1_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
// Defaults: NHL (4380)
const DEFAULT_LEAGUE_ID = '5137';

export default async ({req, res, log, error}) => {
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

        // 2. Fetch data from TheSportsDB v1
        // Endpoint: /eventsseason.php?id=XXXX&s=YYYY
        // User requested URL: https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=5137&s=2026

        const SEASON = '2026';
        const url = `${THESPORTSDB_V1_BASE_URL}/${API_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`;

        log(`Fetching events from: ${url}`);

        const response = await axios.get(url);
        const allEvents = response.data.events || [];

        log(`Fetched ${allEvents.length} events from v1 API (Season: ${SEASON}).`);

        let createdCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        // 3. Sync with Appwrite
        for (const event of allEvents) {
            const externalId = event.idEvent;
            const homeTeam = event.strHomeTeam;
            const awayTeam = event.strAwayTeam;
            // v1 date format is usually "YYYY-MM-DD" and time "HH:MM:SS"
            const date = event.dateEvent + 'T' + (event.strTime || '00:00:00');

            // Status mapping
            let status = 'scheduled';
            if (event.strStatus === 'Match Finished' || event.strStatus === 'FT') {
                status = 'completed';
            } else if (event.strStatus === 'Live' || event.strStatus === 'In Progress') {
                status = 'in_progress';
            }

            const homeScore = event.intHomeScore ? parseInt(event.intHomeScore) : null;
            const awayScore = event.intAwayScore ? parseInt(event.intAwayScore) : null;

            const homeTeamBadge = event.strHomeTeamBadge;
            const awayTeamBadge = event.strAwayTeamBadge;

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
                    doc.awayScore !== awayScore ||
                    doc.homeTeamBadge !== homeTeamBadge ||
                    doc.awayTeamBadge !== awayTeamBadge
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
                            homeTeamBadge,
                            awayTeamBadge
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
                        homeTeamBadge,
                        awayTeamBadge
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
