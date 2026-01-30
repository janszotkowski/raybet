import { ID, Query } from 'appwrite';
import { tables } from '../client';
import { appwriteConfig } from '../config';
import type { Prediction, CreatePredictionRequest } from '../types';

const { databaseId, collections } = appwriteConfig;

export const predictionService = {
    async createPrediction(payload: CreatePredictionRequest): Promise<Prediction> {
        return await tables.createRow({
            databaseId,
            tableId: collections.predictions,
            rowId: ID.unique(),
            data: {
                matchId: payload.matchId,
                userId: payload.userId,
                homeScore: payload.homeScore,
                awayScore: payload.awayScore,
            }
        }) as unknown as Prediction;
    },

    async updatePrediction(predictionId: string, homeScore: number, awayScore: number): Promise<Prediction> {
        return await tables.updateRow({
            databaseId,
            tableId: collections.predictions,
            rowId: predictionId,
            data: {
                homeScore,
                awayScore
            }
        }) as unknown as Prediction;
    },

    async getUserPredictions(userId: string): Promise<Prediction[]> {
        const response = await tables.listRows({
            databaseId,
            tableId: collections.predictions,
            queries: [Query.equal('userId', userId)]
        });
        return response.rows as unknown as Prediction[];
    }
};
