import { ID, Query } from 'appwrite';
import { tables } from '../client';
import { appwriteConfig } from '../config';
import type { Profile, CreateProfileRequest } from '../types';

const { databaseId, collections } = appwriteConfig;

export const playerService = {
    async createProfile(payload: CreateProfileRequest): Promise<Profile> {
        return await tables.createRow({
            databaseId,
            tableId: collections.profiles,
            rowId: ID.unique(),
            data: {
                userId: payload.userId,
                nickname: payload.nickname,
                roomId: payload.roomId,
                totalPoints: 0,
                isTournamentTipLocked: false,
            }
        }) as unknown as Profile;
    },

    async getProfileByUserId(userId: string): Promise<Profile | null> {
        try {
            const response = await tables.listRows({
                databaseId,
                tableId: collections.profiles,
                queries: [Query.equal('userId', userId), Query.limit(5000)]
            });
            return (response.rows[0] as unknown as Profile) || null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    async getProfilesByUserId(userId: string): Promise<Profile[]> {
        try {
            const response = await tables.listRows({
                databaseId,
                tableId: collections.profiles,
                queries: [Query.equal('userId', userId), Query.limit(5000)]
            });
            return response.rows as unknown as Profile[];
        } catch (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
    },

    async updateAvatar(profileId: string, avatarUrl: string): Promise<Profile> {
        return await tables.updateRow({
            databaseId,
            tableId: collections.profiles,
            rowId: profileId,
            data: { avatarUrl }
        }) as unknown as Profile;
    },

    async setTournamentTip(profileId: string, winner: string): Promise<Profile> {
        // We should verify if it is already locked, but for now we just update
        return await tables.updateRow({
            databaseId,
            tableId: collections.profiles,
            rowId: profileId,
            data: {
                tournamentWinnerTip: winner
            }
        }) as unknown as Profile;
    },

    async lockTournamentTip(profileId: string): Promise<Profile> {
        return await tables.updateRow({
            databaseId,
            tableId: collections.profiles,
            rowId: profileId,
            data: { isTournamentTipLocked: true }
        }) as unknown as Profile;
    },

    async listProfiles(roomId: string): Promise<Profile[]> {
        const response = await tables.listRows({
            databaseId,
            tableId: collections.profiles,
            queries: [
                Query.equal('roomId', roomId),
                Query.limit(5000), // Increased from 100 to 5000 to prevent disappearing profiles
                // Sorting will be done client side usually for complex points, but here we can try sorting by points if indexed
                // Query.orderDesc('totalPoints') // Requires index
            ]
        });
        return response.rows as unknown as Profile[];
    }
};
