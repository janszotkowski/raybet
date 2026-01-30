import { useQuery } from '@tanstack/react-query';
import { playerService } from '../appwrite/services/playerService';
import type { Profile } from '../appwrite/types';

export const useMyRooms = (userId: string | null) => {
    return useQuery<Profile[]>({
        queryKey: ['my-rooms', userId],
        queryFn: async () => {
            if (!userId) return [];
            return await playerService.getProfilesByUserId(userId);
        },
        enabled: !!userId,
    });
};
