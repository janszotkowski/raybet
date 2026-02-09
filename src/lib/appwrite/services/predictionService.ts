// ... imports
import { ID, Query } from 'appwrite';
import { tables } from '../client';
import { appwriteConfig } from '../config';
import type { Prediction, CreatePredictionRequest } from '../types';
import { matchService } from './matchService';
import { isMatchLocked } from '../../matchUtils';

const { databaseId, collections } = appwriteConfig;

export const predictionService = {
    async createPrediction(payload: CreatePredictionRequest): Promise<Prediction> {
        // Validation: Check if match is locked
        const match = await matchService.getMatch(payload.matchId);
        if (isMatchLocked(match)) {
            throw new Error('Prediction is locked for this match.');
        }

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
        // Validation: Check if match is locked
        // We first need to get the prediction to know which match it belongs to
        const prediction = await tables.getRow({
            databaseId,
            tableId: collections.predictions,
            rowId: predictionId
        }) as unknown as Prediction;

        const match = await matchService.getMatch(prediction.matchId);
        if (isMatchLocked(match)) {
            throw new Error('Prediction is locked for this match.');
        }

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
