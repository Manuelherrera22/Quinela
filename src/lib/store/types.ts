import { User, Match, Prediction } from '@/types';
import { Group } from '@/lib/constants';

export interface AuthSlice {
    user: User | null;
    users: User[];
    settings: { champion: string | null };
    registerUser: (name: string, country: string, email: string, password: string) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<boolean>;
    logoutUser: () => void;
    setChampion: (champion: string) => Promise<void>;
    setAdminChampion: (champion: string) => Promise<void>;
    updateAvatar: (file: File) => Promise<void>;
}

export interface MatchesSlice {
    matches: (Match & { group?: Group })[];
    fetchMatches: () => Promise<void>;
    updateMatchResult: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
    checkMatchStatus: () => Promise<void>;
}

export interface PredictionsSlice {
    predictions: Prediction[];
    submitPrediction: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
}

export interface CommonSlice {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    fetchInitialData: () => Promise<void>;
    recalculatePoints: () => Promise<void>;
}

export type AppState = AuthSlice & MatchesSlice & PredictionsSlice & CommonSlice;
