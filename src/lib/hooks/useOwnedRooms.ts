import { useQuery } from '@tanstack/react-query';
import { roomService } from '../appwrite/services/roomService';
import type { Room } from '../appwrite/types';

export const useOwnedRooms = (userId: string | null) => {
    return useQuery<Room[]>({
        queryKey: ['owned-rooms', userId],
        queryFn: async () => {
            if (!userId) return [];
            return await roomService.getOwnedRooms(userId);
        },
        enabled: !!userId,
    });
};
