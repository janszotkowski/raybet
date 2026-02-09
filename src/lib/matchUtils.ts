import { Match } from './appwrite/types';

export const isMatchLocked = (match: Match): boolean => {
    // 1. Check status
    if (match.status === 'in_progress' || match.status === 'completed' || match.status === 'canceled') {
        return true;
    }

    // 2. Check time (2 minutes before start)
    const matchDate = new Date(match.date);
    const now = new Date();

    // Calculate difference in minutes
    const diffMs = matchDate.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes < 2;
};
