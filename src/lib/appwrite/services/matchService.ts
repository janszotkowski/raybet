import { ID, Query } from 'appwrite';
import { tables } from '../client';
import { appwriteConfig } from '../config';
import type { Match } from '../types';

const { databaseId, collections } = appwriteConfig;

export const matchService = {
    async listMatches(): Promise<Match[]> {
        // In a real app we might want to paginate or filter by date
        // For now, list all (limit is usually 25 default, we might want more)
        const response = await tables.listRows({
            databaseId,
            tableId: collections.matches,
            queries: [
                Query.limit(100),
                Query.orderAsc('date')
            ]
        });
        return response.rows as unknown as Match[];
    },

    async getMatch(matchId: string): Promise<Match> {
        return await tables.getRow({
            databaseId,
            tableId: collections.matches,
            rowId: matchId
        }) as unknown as Match;
    }
};
