import { ID, Query } from 'appwrite';
import { tables } from '../client';
import { appwriteConfig } from '../config';
import type { Room, CreateRoomRequest } from '../types';

const { databaseId, collections } = appwriteConfig;

export const roomService = {
    async createRoom(payload: CreateRoomRequest): Promise<Room> {
        return await tables.createRow({
            databaseId,
            tableId: collections.rooms,
            rowId: ID.unique(),
            data: {
                name: payload.name,
                ownerId: payload.ownerId,
            }
        }) as unknown as Room;
    },

    async getRoom(roomId: string): Promise<Room> {
        return await tables.getRow({
            databaseId,
            tableId: collections.rooms,
            rowId: roomId
        }) as unknown as Room;
    },

    async listRooms(): Promise<Room[]> {
        const response = await tables.listRows({
            databaseId,
            tableId: collections.rooms
        });
        return response.rows as unknown as Room[];
    }
};
