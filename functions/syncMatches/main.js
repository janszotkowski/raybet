import { Client, Databases, Query, ID } from 'node-appwrite';
import axios from 'axios';

// Constants
const THESPORTSDB_V1_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
// Defaults: NHL (4380)
const DEFAULT_LEAGUE_ID = '4380';

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
    const API_KEY = process.env.THESPORTSDB_API_KEY || '123';

    try {
        log(`Starting sync(v1) for League ID: ${LEAGUE_ID} with API Key: ${API_KEY} `);

        // 2. Fetch data from TheSportsDB v1
        // Endpoints:
        // /eventsnextleague.php?id=XXXX
        // /eventspastleague.php?id=XXXX

        const [nextEventsRes, pastEventsRes] = await Promise.all([
            axios.get(`${THESPORTSDB_V1_BASE_URL}/${API_KEY}/eventsnextleague.php?id=${LEAGUE_ID}`),
            axios.get(`${THESPORTSDB_V1_BASE_URL}/${API_KEY}/eventspastleague.php?id=${LEAGUE_ID}`)
        ]);

        const nextEvents = nextEventsRes.data.events || [];
        const pastEvents = pastEventsRes.data.events || [];

        // Combine (past events override next events if ID matches, though usually they are distinct sets)
        // We use a Map to ensure uniqueness by ID.
        const allEventsMap = new Map();
        [...pastEvents, ...nextEvents].forEach(evt => allEventsMap.set(evt.idEvent, evt));
        const allEvents = Array.from(allEventsMap.values());

        log(`Fetched ${allEvents.length} events(Past: ${pastEvents.length}, Next: ${nextEvents.length}) from v1 API.`);

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

        log(`Sync complete.Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount} `);

        return res.json({
            success: true,
            stats: { created: createdCount, updated: updatedCount, skipped: skippedCount }
        });

    } catch (err) {
        error(`Error syncing matches: ${err.message} `);
        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};
