export interface User {
    name: string;
    country: string;
    email: string;
    password?: string; // Optional for now to avoid breaking existing mocks immediately
    selectedChampion?: string;
    points: number;
    exactMatches: number;
    avatarUrl?: string;
}

export interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeFlag?: string;
    awayFlag?: string;
    date: string;
    stage: "group" | "r32" | "r16" | "qf" | "sf" | "f";
    status: "locked" | "open" | "finished";
    homeScore?: number;
    awayScore?: number;
    group?: import('@/lib/constants').Group;
}

export interface Prediction {
    matchId: string;
    homeScore: number;
    awayScore: number;
}

// Countries moved to src/lib/constants.ts
export type { Group } from '@/lib/constants';
