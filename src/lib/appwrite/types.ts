import type { Models } from 'appwrite';

export type Room = Models.Document & {
    name: string;
    ownerId: string;
};

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export type Match = Models.Document & {
    externalId: string;
    date: string; // ISO date string
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: MatchStatus;
    leagueId: string;
};

export type Prediction = Models.Document & {
    matchId: string;
    userId: string;
    homeScore: number;
    awayScore: number;
    // relations
    match?: Match;
};

export type TournamentWinnerTip = string; // Country code or name

export type Profile = Models.Document & {
    userId: string;
    nickname: string;
    avatarUrl: string | null;
    roomId: string; // Current active room
    totalPoints: number;
    tournamentWinnerTip: TournamentWinnerTip | null;
    isTournamentTipLocked: boolean;
};

// Request Types for Services
export type CreateRoomRequest = {
    name: string;
    ownerId: string;
};

export type CreateProfileRequest = {
    userId: string;
    nickname: string;
    roomId: string;
};

export type CreatePredictionRequest = {
    matchId: string;
    userId: string;
    homeScore: number;
    awayScore: number;
};
