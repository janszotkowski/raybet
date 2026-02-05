import { useQuery } from '@tanstack/react-query';
import { playerService } from '../appwrite/services/playerService';
import type { Profile } from '../appwrite/types';
import { roomService } from '../appwrite/services/roomService';

export const useMyRooms = (userId: string | null) => {
    return useQuery<Profile[]>({
        queryKey: ['my-rooms', userId],
        queryFn: async () => {
            if (!userId) return [];
            const profiles = await playerService.getProfilesByUserId(userId);

            // Enrich profiles with room details to get the name
            const profilesWithRooms = await Promise.all(profiles.map(async (p) => {
                try {
                    const room = await roomService.getRoom(p.roomId);
                    // We append the full room object to the profile. 
                    // This matches the access pattern (profile as any).room.name
                    return {...p, room};
                } catch (e) {
                    // Fallback if room fetch fails
                    return p;
                }
            }));

            return profilesWithRooms;
        },
        enabled: !!userId,
    });
};
