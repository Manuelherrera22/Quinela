import { create } from 'zustand';
import { supabase } from './supabase';
import { User, Match, Prediction } from '@/types';
import { Group, COUNTRY_FLAG_MAP } from '@/lib/constants';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

// Initial Mock Data (used for seeding if DB is empty)
const INITIAL_MATCHES: (Match & { group?: Group })[] = [
    // ====== JORNADA 1 ======
    // Group A
    { id: 'a1', homeTeam: 'Mexico', awayTeam: 'South Africa', homeFlag: COUNTRY_FLAG_MAP['Mexico'], awayFlag: COUNTRY_FLAG_MAP['South Africa'], date: '2026-06-11T14:00:00', stage: 'group', group: 'A', status: 'open' },
    { id: 'a2', homeTeam: 'Colombia', awayTeam: 'Nigeria', homeFlag: COUNTRY_FLAG_MAP['Colombia'], awayFlag: COUNTRY_FLAG_MAP['Nigeria'], date: '2026-06-11T17:00:00', stage: 'group', group: 'A', status: 'open' },
    // Group B
    { id: 'b1', homeTeam: 'Canada', awayTeam: 'Switzerland', homeFlag: COUNTRY_FLAG_MAP['Canada'], awayFlag: COUNTRY_FLAG_MAP['Switzerland'], date: '2026-06-12T12:00:00', stage: 'group', group: 'B', status: 'open' },
    { id: 'b2', homeTeam: 'Japan', awayTeam: 'Ecuador', homeFlag: COUNTRY_FLAG_MAP['Japan'], awayFlag: COUNTRY_FLAG_MAP['Ecuador'], date: '2026-06-12T15:00:00', stage: 'group', group: 'B', status: 'open' },
    // Group C
    { id: 'c1', homeTeam: 'Brazil', awayTeam: 'France', homeFlag: COUNTRY_FLAG_MAP['Brazil'], awayFlag: COUNTRY_FLAG_MAP['France'], date: '2026-06-13T15:00:00', stage: 'group', group: 'C', status: 'open' },
    { id: 'c2', homeTeam: 'Morocco', awayTeam: 'Australia', homeFlag: COUNTRY_FLAG_MAP['Morocco'], awayFlag: COUNTRY_FLAG_MAP['Australia'], date: '2026-06-13T18:00:00', stage: 'group', group: 'C', status: 'open' },
    // Group D
    { id: 'd1', homeTeam: 'Argentina', awayTeam: 'Poland', homeFlag: COUNTRY_FLAG_MAP['Argentina'], awayFlag: COUNTRY_FLAG_MAP['Poland'], date: '2026-06-14T12:00:00', stage: 'group', group: 'D', status: 'open' },
    { id: 'd2', homeTeam: 'Saudi Arabia', awayTeam: 'Denmark', homeFlag: COUNTRY_FLAG_MAP['Saudi Arabia'], awayFlag: COUNTRY_FLAG_MAP['Denmark'], date: '2026-06-14T15:00:00', stage: 'group', group: 'D', status: 'open' },
    // Group E
    { id: 'e1', homeTeam: 'United States', awayTeam: 'Italy', homeFlag: COUNTRY_FLAG_MAP['United States'], awayFlag: COUNTRY_FLAG_MAP['Italy'], date: '2026-06-14T18:00:00', stage: 'group', group: 'E', status: 'open' },
    { id: 'e2', homeTeam: 'Uruguay', awayTeam: 'Iran', homeFlag: COUNTRY_FLAG_MAP['Uruguay'], awayFlag: COUNTRY_FLAG_MAP['Iran'], date: '2026-06-14T21:00:00', stage: 'group', group: 'E', status: 'open' },
    // Group F
    { id: 'f1', homeTeam: 'Spain', awayTeam: 'Croatia', homeFlag: COUNTRY_FLAG_MAP['Spain'], awayFlag: COUNTRY_FLAG_MAP['Croatia'], date: '2026-06-15T12:00:00', stage: 'group', group: 'F', status: 'open' },
    { id: 'f2', homeTeam: 'Belgium', awayTeam: 'Cameroon', homeFlag: COUNTRY_FLAG_MAP['Belgium'], awayFlag: COUNTRY_FLAG_MAP['Cameroon'], date: '2026-06-15T15:00:00', stage: 'group', group: 'F', status: 'open' },
    // Group G
    { id: 'g1', homeTeam: 'Germany', awayTeam: 'South Korea', homeFlag: COUNTRY_FLAG_MAP['Germany'], awayFlag: COUNTRY_FLAG_MAP['South Korea'], date: '2026-06-15T18:00:00', stage: 'group', group: 'G', status: 'open' },
    { id: 'g2', homeTeam: 'Portugal', awayTeam: 'Senegal', homeFlag: COUNTRY_FLAG_MAP['Portugal'], awayFlag: COUNTRY_FLAG_MAP['Senegal'], date: '2026-06-15T21:00:00', stage: 'group', group: 'G', status: 'open' },
    // Group H
    { id: 'h1', homeTeam: 'England', awayTeam: 'Serbia', homeFlag: COUNTRY_FLAG_MAP['England'], awayFlag: COUNTRY_FLAG_MAP['Serbia'], date: '2026-06-16T12:00:00', stage: 'group', group: 'H', status: 'open' },
    { id: 'h2', homeTeam: 'Netherlands', awayTeam: 'Chile', homeFlag: COUNTRY_FLAG_MAP['Netherlands'], awayFlag: COUNTRY_FLAG_MAP['Chile'], date: '2026-06-16T15:00:00', stage: 'group', group: 'H', status: 'open' },
    // Group I
    { id: 'i1', homeTeam: 'Costa Rica', awayTeam: 'Peru', homeFlag: COUNTRY_FLAG_MAP['Costa Rica'], awayFlag: COUNTRY_FLAG_MAP['Peru'], date: '2026-06-16T18:00:00', stage: 'group', group: 'I', status: 'open' },
    { id: 'i2', homeTeam: 'Sweden', awayTeam: 'Tunisia', homeFlag: COUNTRY_FLAG_MAP['Sweden'], awayFlag: COUNTRY_FLAG_MAP['Tunisia'], date: '2026-06-16T21:00:00', stage: 'group', group: 'I', status: 'open' },
    // Group J
    { id: 'j1', homeTeam: 'Panama', awayTeam: 'Paraguay', homeFlag: COUNTRY_FLAG_MAP['Panama'], awayFlag: COUNTRY_FLAG_MAP['Paraguay'], date: '2026-06-17T12:00:00', stage: 'group', group: 'J', status: 'open' },
    { id: 'j2', homeTeam: 'Jamaica', awayTeam: 'Ukraine', homeFlag: COUNTRY_FLAG_MAP['Jamaica'], awayFlag: COUNTRY_FLAG_MAP['Ukraine'], date: '2026-06-17T15:00:00', stage: 'group', group: 'J', status: 'open' },
    // Group K
    { id: 'k1', homeTeam: 'Algeria', awayTeam: 'Qatar', homeFlag: COUNTRY_FLAG_MAP['Algeria'], awayFlag: COUNTRY_FLAG_MAP['Qatar'], date: '2026-06-17T18:00:00', stage: 'group', group: 'K', status: 'open' },
    { id: 'k2', homeTeam: 'New Zealand', awayTeam: 'Ivory Coast', homeFlag: COUNTRY_FLAG_MAP['New Zealand'], awayFlag: COUNTRY_FLAG_MAP['Ivory Coast'], date: '2026-06-17T21:00:00', stage: 'group', group: 'K', status: 'open' },
    // Group L
    { id: 'l1', homeTeam: 'Egypt', awayTeam: 'Iraq', homeFlag: COUNTRY_FLAG_MAP['Egypt'], awayFlag: COUNTRY_FLAG_MAP['Iraq'], date: '2026-06-18T12:00:00', stage: 'group', group: 'L', status: 'open' },
    { id: 'l2', homeTeam: 'Uzbekistan', awayTeam: 'Mali', homeFlag: COUNTRY_FLAG_MAP['Uzbekistan'], awayFlag: COUNTRY_FLAG_MAP['Mali'], date: '2026-06-18T15:00:00', stage: 'group', group: 'L', status: 'open' },

    // ====== JORNADA 2 ======
    // Group A: Mexico vs Nigeria, South Africa vs Colombia
    { id: 'a3', homeTeam: 'Mexico', awayTeam: 'Nigeria', homeFlag: COUNTRY_FLAG_MAP['Mexico'], awayFlag: COUNTRY_FLAG_MAP['Nigeria'], date: '2026-06-19T14:00:00', stage: 'group', group: 'A', status: 'open' },
    { id: 'a4', homeTeam: 'South Africa', awayTeam: 'Colombia', homeFlag: COUNTRY_FLAG_MAP['South Africa'], awayFlag: COUNTRY_FLAG_MAP['Colombia'], date: '2026-06-19T17:00:00', stage: 'group', group: 'A', status: 'open' },
    // Group B
    { id: 'b3', homeTeam: 'Canada', awayTeam: 'Ecuador', homeFlag: COUNTRY_FLAG_MAP['Canada'], awayFlag: COUNTRY_FLAG_MAP['Ecuador'], date: '2026-06-20T12:00:00', stage: 'group', group: 'B', status: 'open' },
    { id: 'b4', homeTeam: 'Switzerland', awayTeam: 'Japan', homeFlag: COUNTRY_FLAG_MAP['Switzerland'], awayFlag: COUNTRY_FLAG_MAP['Japan'], date: '2026-06-20T15:00:00', stage: 'group', group: 'B', status: 'open' },
    // Group C
    { id: 'c3', homeTeam: 'Brazil', awayTeam: 'Australia', homeFlag: COUNTRY_FLAG_MAP['Brazil'], awayFlag: COUNTRY_FLAG_MAP['Australia'], date: '2026-06-21T15:00:00', stage: 'group', group: 'C', status: 'open' },
    { id: 'c4', homeTeam: 'France', awayTeam: 'Morocco', homeFlag: COUNTRY_FLAG_MAP['France'], awayFlag: COUNTRY_FLAG_MAP['Morocco'], date: '2026-06-21T18:00:00', stage: 'group', group: 'C', status: 'open' },
    // Group D
    { id: 'd3', homeTeam: 'Argentina', awayTeam: 'Denmark', homeFlag: COUNTRY_FLAG_MAP['Argentina'], awayFlag: COUNTRY_FLAG_MAP['Denmark'], date: '2026-06-22T12:00:00', stage: 'group', group: 'D', status: 'open' },
    { id: 'd4', homeTeam: 'Poland', awayTeam: 'Saudi Arabia', homeFlag: COUNTRY_FLAG_MAP['Poland'], awayFlag: COUNTRY_FLAG_MAP['Saudi Arabia'], date: '2026-06-22T15:00:00', stage: 'group', group: 'D', status: 'open' },
    // Group E
    { id: 'e3', homeTeam: 'United States', awayTeam: 'Iran', homeFlag: COUNTRY_FLAG_MAP['United States'], awayFlag: COUNTRY_FLAG_MAP['Iran'], date: '2026-06-22T18:00:00', stage: 'group', group: 'E', status: 'open' },
    { id: 'e4', homeTeam: 'Italy', awayTeam: 'Uruguay', homeFlag: COUNTRY_FLAG_MAP['Italy'], awayFlag: COUNTRY_FLAG_MAP['Uruguay'], date: '2026-06-22T21:00:00', stage: 'group', group: 'E', status: 'open' },
    // Group F
    { id: 'f3', homeTeam: 'Spain', awayTeam: 'Cameroon', homeFlag: COUNTRY_FLAG_MAP['Spain'], awayFlag: COUNTRY_FLAG_MAP['Cameroon'], date: '2026-06-23T12:00:00', stage: 'group', group: 'F', status: 'open' },
    { id: 'f4', homeTeam: 'Croatia', awayTeam: 'Belgium', homeFlag: COUNTRY_FLAG_MAP['Croatia'], awayFlag: COUNTRY_FLAG_MAP['Belgium'], date: '2026-06-23T15:00:00', stage: 'group', group: 'F', status: 'open' },
    // Group G
    { id: 'g3', homeTeam: 'Germany', awayTeam: 'Senegal', homeFlag: COUNTRY_FLAG_MAP['Germany'], awayFlag: COUNTRY_FLAG_MAP['Senegal'], date: '2026-06-23T18:00:00', stage: 'group', group: 'G', status: 'open' },
    { id: 'g4', homeTeam: 'South Korea', awayTeam: 'Portugal', homeFlag: COUNTRY_FLAG_MAP['South Korea'], awayFlag: COUNTRY_FLAG_MAP['Portugal'], date: '2026-06-23T21:00:00', stage: 'group', group: 'G', status: 'open' },
    // Group H
    { id: 'h3', homeTeam: 'England', awayTeam: 'Chile', homeFlag: COUNTRY_FLAG_MAP['England'], awayFlag: COUNTRY_FLAG_MAP['Chile'], date: '2026-06-24T12:00:00', stage: 'group', group: 'H', status: 'open' },
    { id: 'h4', homeTeam: 'Serbia', awayTeam: 'Netherlands', homeFlag: COUNTRY_FLAG_MAP['Serbia'], awayFlag: COUNTRY_FLAG_MAP['Netherlands'], date: '2026-06-24T15:00:00', stage: 'group', group: 'H', status: 'open' },
    // Group I
    { id: 'i3', homeTeam: 'Costa Rica', awayTeam: 'Tunisia', homeFlag: COUNTRY_FLAG_MAP['Costa Rica'], awayFlag: COUNTRY_FLAG_MAP['Tunisia'], date: '2026-06-24T18:00:00', stage: 'group', group: 'I', status: 'open' },
    { id: 'i4', homeTeam: 'Peru', awayTeam: 'Sweden', homeFlag: COUNTRY_FLAG_MAP['Peru'], awayFlag: COUNTRY_FLAG_MAP['Sweden'], date: '2026-06-24T21:00:00', stage: 'group', group: 'I', status: 'open' },
    // Group J
    { id: 'j3', homeTeam: 'Panama', awayTeam: 'Ukraine', homeFlag: COUNTRY_FLAG_MAP['Panama'], awayFlag: COUNTRY_FLAG_MAP['Ukraine'], date: '2026-06-25T12:00:00', stage: 'group', group: 'J', status: 'open' },
    { id: 'j4', homeTeam: 'Paraguay', awayTeam: 'Jamaica', homeFlag: COUNTRY_FLAG_MAP['Paraguay'], awayFlag: COUNTRY_FLAG_MAP['Jamaica'], date: '2026-06-25T15:00:00', stage: 'group', group: 'J', status: 'open' },
    // Group K
    { id: 'k3', homeTeam: 'Algeria', awayTeam: 'Ivory Coast', homeFlag: COUNTRY_FLAG_MAP['Algeria'], awayFlag: COUNTRY_FLAG_MAP['Ivory Coast'], date: '2026-06-25T18:00:00', stage: 'group', group: 'K', status: 'open' },
    { id: 'k4', homeTeam: 'Qatar', awayTeam: 'New Zealand', homeFlag: COUNTRY_FLAG_MAP['Qatar'], awayFlag: COUNTRY_FLAG_MAP['New Zealand'], date: '2026-06-25T21:00:00', stage: 'group', group: 'K', status: 'open' },
    // Group L
    { id: 'l3', homeTeam: 'Egypt', awayTeam: 'Mali', homeFlag: COUNTRY_FLAG_MAP['Egypt'], awayFlag: COUNTRY_FLAG_MAP['Mali'], date: '2026-06-26T12:00:00', stage: 'group', group: 'L', status: 'open' },
    { id: 'l4', homeTeam: 'Iraq', awayTeam: 'Uzbekistan', homeFlag: COUNTRY_FLAG_MAP['Iraq'], awayFlag: COUNTRY_FLAG_MAP['Uzbekistan'], date: '2026-06-26T15:00:00', stage: 'group', group: 'L', status: 'open' },

    // ====== JORNADA 3 ======
    // Group A: Mexico vs Colombia, Nigeria vs South Africa
    { id: 'a5', homeTeam: 'Mexico', awayTeam: 'Colombia', homeFlag: COUNTRY_FLAG_MAP['Mexico'], awayFlag: COUNTRY_FLAG_MAP['Colombia'], date: '2026-06-27T14:00:00', stage: 'group', group: 'A', status: 'open' },
    { id: 'a6', homeTeam: 'Nigeria', awayTeam: 'South Africa', homeFlag: COUNTRY_FLAG_MAP['Nigeria'], awayFlag: COUNTRY_FLAG_MAP['South Africa'], date: '2026-06-27T14:00:00', stage: 'group', group: 'A', status: 'open' },
    // Group B
    { id: 'b5', homeTeam: 'Canada', awayTeam: 'Japan', homeFlag: COUNTRY_FLAG_MAP['Canada'], awayFlag: COUNTRY_FLAG_MAP['Japan'], date: '2026-06-28T12:00:00', stage: 'group', group: 'B', status: 'open' },
    { id: 'b6', homeTeam: 'Ecuador', awayTeam: 'Switzerland', homeFlag: COUNTRY_FLAG_MAP['Ecuador'], awayFlag: COUNTRY_FLAG_MAP['Switzerland'], date: '2026-06-28T12:00:00', stage: 'group', group: 'B', status: 'open' },
    // Group C
    { id: 'c5', homeTeam: 'Brazil', awayTeam: 'Morocco', homeFlag: COUNTRY_FLAG_MAP['Brazil'], awayFlag: COUNTRY_FLAG_MAP['Morocco'], date: '2026-06-29T15:00:00', stage: 'group', group: 'C', status: 'open' },
    { id: 'c6', homeTeam: 'Australia', awayTeam: 'France', homeFlag: COUNTRY_FLAG_MAP['Australia'], awayFlag: COUNTRY_FLAG_MAP['France'], date: '2026-06-29T15:00:00', stage: 'group', group: 'C', status: 'open' },
    // Group D
    { id: 'd5', homeTeam: 'Argentina', awayTeam: 'Saudi Arabia', homeFlag: COUNTRY_FLAG_MAP['Argentina'], awayFlag: COUNTRY_FLAG_MAP['Saudi Arabia'], date: '2026-06-30T12:00:00', stage: 'group', group: 'D', status: 'open' },
    { id: 'd6', homeTeam: 'Denmark', awayTeam: 'Poland', homeFlag: COUNTRY_FLAG_MAP['Denmark'], awayFlag: COUNTRY_FLAG_MAP['Poland'], date: '2026-06-30T12:00:00', stage: 'group', group: 'D', status: 'open' },
    // Group E
    { id: 'e5', homeTeam: 'United States', awayTeam: 'Uruguay', homeFlag: COUNTRY_FLAG_MAP['United States'], awayFlag: COUNTRY_FLAG_MAP['Uruguay'], date: '2026-06-30T18:00:00', stage: 'group', group: 'E', status: 'open' },
    { id: 'e6', homeTeam: 'Iran', awayTeam: 'Italy', homeFlag: COUNTRY_FLAG_MAP['Iran'], awayFlag: COUNTRY_FLAG_MAP['Italy'], date: '2026-06-30T18:00:00', stage: 'group', group: 'E', status: 'open' },
    // Group F
    { id: 'f5', homeTeam: 'Spain', awayTeam: 'Belgium', homeFlag: COUNTRY_FLAG_MAP['Spain'], awayFlag: COUNTRY_FLAG_MAP['Belgium'], date: '2026-07-01T12:00:00', stage: 'group', group: 'F', status: 'open' },
    { id: 'f6', homeTeam: 'Cameroon', awayTeam: 'Croatia', homeFlag: COUNTRY_FLAG_MAP['Cameroon'], awayFlag: COUNTRY_FLAG_MAP['Croatia'], date: '2026-07-01T12:00:00', stage: 'group', group: 'F', status: 'open' },
    // Group G
    { id: 'g5', homeTeam: 'Germany', awayTeam: 'Portugal', homeFlag: COUNTRY_FLAG_MAP['Germany'], awayFlag: COUNTRY_FLAG_MAP['Portugal'], date: '2026-07-01T18:00:00', stage: 'group', group: 'G', status: 'open' },
    { id: 'g6', homeTeam: 'Senegal', awayTeam: 'South Korea', homeFlag: COUNTRY_FLAG_MAP['Senegal'], awayFlag: COUNTRY_FLAG_MAP['South Korea'], date: '2026-07-01T18:00:00', stage: 'group', group: 'G', status: 'open' },
    // Group H
    { id: 'h5', homeTeam: 'England', awayTeam: 'Netherlands', homeFlag: COUNTRY_FLAG_MAP['England'], awayFlag: COUNTRY_FLAG_MAP['Netherlands'], date: '2026-07-02T12:00:00', stage: 'group', group: 'H', status: 'open' },
    { id: 'h6', homeTeam: 'Chile', awayTeam: 'Serbia', homeFlag: COUNTRY_FLAG_MAP['Chile'], awayFlag: COUNTRY_FLAG_MAP['Serbia'], date: '2026-07-02T12:00:00', stage: 'group', group: 'H', status: 'open' },
    // Group I
    { id: 'i5', homeTeam: 'Costa Rica', awayTeam: 'Sweden', homeFlag: COUNTRY_FLAG_MAP['Costa Rica'], awayFlag: COUNTRY_FLAG_MAP['Sweden'], date: '2026-07-02T18:00:00', stage: 'group', group: 'I', status: 'open' },
    { id: 'i6', homeTeam: 'Tunisia', awayTeam: 'Peru', homeFlag: COUNTRY_FLAG_MAP['Tunisia'], awayFlag: COUNTRY_FLAG_MAP['Peru'], date: '2026-07-02T18:00:00', stage: 'group', group: 'I', status: 'open' },
    // Group J
    { id: 'j5', homeTeam: 'Panama', awayTeam: 'Jamaica', homeFlag: COUNTRY_FLAG_MAP['Panama'], awayFlag: COUNTRY_FLAG_MAP['Jamaica'], date: '2026-07-03T12:00:00', stage: 'group', group: 'J', status: 'open' },
    { id: 'j6', homeTeam: 'Ukraine', awayTeam: 'Paraguay', homeFlag: COUNTRY_FLAG_MAP['Ukraine'], awayFlag: COUNTRY_FLAG_MAP['Paraguay'], date: '2026-07-03T12:00:00', stage: 'group', group: 'J', status: 'open' },
    // Group K
    { id: 'k5', homeTeam: 'Algeria', awayTeam: 'New Zealand', homeFlag: COUNTRY_FLAG_MAP['Algeria'], awayFlag: COUNTRY_FLAG_MAP['New Zealand'], date: '2026-07-03T18:00:00', stage: 'group', group: 'K', status: 'open' },
    { id: 'k6', homeTeam: 'Ivory Coast', awayTeam: 'Qatar', homeFlag: COUNTRY_FLAG_MAP['Ivory Coast'], awayFlag: COUNTRY_FLAG_MAP['Qatar'], date: '2026-07-03T18:00:00', stage: 'group', group: 'K', status: 'open' },
    // Group L
    { id: 'l5', homeTeam: 'Egypt', awayTeam: 'Uzbekistan', homeFlag: COUNTRY_FLAG_MAP['Egypt'], awayFlag: COUNTRY_FLAG_MAP['Uzbekistan'], date: '2026-07-04T12:00:00', stage: 'group', group: 'L', status: 'open' },
    { id: 'l6', homeTeam: 'Mali', awayTeam: 'Iraq', homeFlag: COUNTRY_FLAG_MAP['Mali'], awayFlag: COUNTRY_FLAG_MAP['Iraq'], date: '2026-07-04T12:00:00', stage: 'group', group: 'L', status: 'open' },

    // ====== OCTAVOS DE FINAL ======
    { id: 'r32-1', homeTeam: '1A', awayTeam: '2B', date: '2026-07-05T12:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-2', homeTeam: '1C', awayTeam: '2D', date: '2026-07-05T15:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-3', homeTeam: '1E', awayTeam: '2F', date: '2026-07-05T18:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-4', homeTeam: '1G', awayTeam: '2H', date: '2026-07-05T21:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-5', homeTeam: '1B', awayTeam: '2A', date: '2026-07-06T12:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-6', homeTeam: '1D', awayTeam: '2C', date: '2026-07-06T15:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-7', homeTeam: '1F', awayTeam: '2E', date: '2026-07-06T18:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-8', homeTeam: '1H', awayTeam: '2G', date: '2026-07-06T21:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-9', homeTeam: '1I', awayTeam: '2J', date: '2026-07-07T12:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-10', homeTeam: '1K', awayTeam: '2L', date: '2026-07-07T15:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-11', homeTeam: '1J', awayTeam: '2I', date: '2026-07-07T18:00:00', stage: 'r32', status: 'open' },
    { id: 'r32-12', homeTeam: '1L', awayTeam: '2K', date: '2026-07-07T21:00:00', stage: 'r32', status: 'open' },

    // ====== CUARTOS DE FINAL ======
    { id: 'qf-1', homeTeam: 'Cuartos 1', awayTeam: 'Cuartos 2', date: '2026-07-09T15:00:00', stage: 'qf', status: 'open' },
    { id: 'qf-2', homeTeam: 'Cuartos 3', awayTeam: 'Cuartos 4', date: '2026-07-09T18:00:00', stage: 'qf', status: 'open' },
    { id: 'qf-3', homeTeam: 'Cuartos 5', awayTeam: 'Cuartos 6', date: '2026-07-10T15:00:00', stage: 'qf', status: 'open' },
    { id: 'qf-4', homeTeam: 'Cuartos 7', awayTeam: 'Cuartos 8', date: '2026-07-10T18:00:00', stage: 'qf', status: 'open' },

    // ====== SEMIFINALES ======
    { id: 'sf-1', homeTeam: 'Semi 1', awayTeam: 'Semi 2', date: '2026-07-14T18:00:00', stage: 'sf', status: 'open' },
    { id: 'sf-2', homeTeam: 'Semi 3', awayTeam: 'Semi 4', date: '2026-07-15T18:00:00', stage: 'sf', status: 'open' },

    // ====== FINAL ======
    { id: 'final', homeTeam: 'Finalista 1', awayTeam: 'Finalista 2', date: '2026-07-19T18:00:00', stage: 'f', status: 'open' },
];

interface AppState {
    user: User | null;
    users: User[];
    matches: (Match & { group?: Group })[];
    predictions: Prediction[];
    isLoading: boolean;
    settings: { champion: string | null };

    fetchInitialData: () => Promise<void>;
    registerUser: (name: string, country: string, email: string, password: string) => Promise<void>;
    loginUser: (email: string) => Promise<boolean>;
    logoutUser: () => void;
    setChampion: (champion: string) => Promise<void>;
    setAdminChampion: (champion: string) => Promise<void>;
    submitPrediction: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
    updateMatchResult: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
    recalculatePoints: () => Promise<void>;
    checkMatchStatus: () => Promise<void>;
    updateAvatar: (file: File) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    user: null,
    users: [],
    matches: [],
    predictions: [],
    settings: { champion: null },
    isLoading: false,

    fetchInitialData: async () => {
        set({ isLoading: true });

        try {
            // 1. Fetch Matches
            let { data: matches, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .order('date', { ascending: true });

            if (matchesError) {
                console.error('Error fetching matches:', matchesError);
                toast.error('Error al cargar partidos. Revisa tu conexión.');
            }

            // Seed matches if empty (first run)
            if (!matches || matches.length === 0) {
                console.log('Seeding matches...');
                const { error: seedError } = await supabase
                    .from('matches')
                    .insert(INITIAL_MATCHES.map(m => ({
                        id: m.id,
                        home_team: m.homeTeam,
                        away_team: m.awayTeam,
                        home_flag: m.homeFlag,
                        away_flag: m.awayFlag,
                        date: m.date,
                        stage: m.stage,
                        group_name: m.group,
                        status: m.status,
                        home_score: m.homeScore,
                        away_score: m.awayScore
                    })));

                if (!seedError) {
                    const res = await supabase.from('matches').select('*').order('date', { ascending: true });
                    matches = res.data;
                }
            }

            const mappedMatches = (matches || []).map((m: any) => ({
                id: m.id,
                homeTeam: m.home_team,
                awayTeam: m.away_team,
                homeFlag: m.home_flag,
                awayFlag: m.away_flag,
                date: m.date,
                stage: m.stage,
                group: m.group_name,
                status: m.status,
                homeScore: m.home_score,
                awayScore: m.away_score
            }));

            // 2. Fetch Users
            const { data: users } = await supabase
                .from('users')
                .select('*')
                .order('points', { ascending: false });

            const mappedUsers = (users || []).map((u: any) => ({
                name: u.name,
                country: u.country,
                email: u.email,
                points: u.points,
                exactMatches: u.exact_matches,
                selectedChampion: u.selected_champion,
                avatarUrl: u.avatar_url,
                password: u.password
            }));

            // 3. Fetch Settings
            const { data: settingsData } = await supabase.from('settings').select('*');
            const championSetting = settingsData?.find((s: any) => s.key === 'champion')?.value || null;

            // 4. Restore Session (if exists)
            const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('quiniela_user_email') : null;
            if (savedEmail) {
                const user = (users || []).find((u: any) => u.email === savedEmail);
                if (user) {
                    const mappedUser: User = {
                        name: user.name,
                        country: user.country,
                        email: user.email,
                        points: user.points,
                        exactMatches: user.exact_matches,
                        selectedChampion: user.selected_champion,
                        avatarUrl: user.avatar_url,
                        password: user.password
                    };

                    const { data: predictions } = await supabase
                        .from('predictions')
                        .select('*')
                        .eq('user_email', savedEmail);

                    const mappedPredictions = (predictions || []).map((p: any) => ({
                        matchId: p.match_id,
                        homeScore: p.home_score,
                        awayScore: p.away_score
                    }));

                    set({ user: mappedUser, predictions: mappedPredictions });
                }
            }

            set({
                matches: mappedMatches,
                users: mappedUsers,
                settings: { champion: championSetting },
                isLoading: false
            });
        } catch (error) {
            console.error('Error during initial data fetch:', error);
            set({ isLoading: false });
        }
    },

    registerUser: async (name, country, email, password) => {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase
            .from('users')
            .insert([{ name, country, email, password: hashedPassword, points: 0, exact_matches: 0 }]);

        if (error) {
            console.error('Error registering:', error.message, error.details, error.hint, error.code);
            const errMsg = error.message || error.details || '';
            if (error.code === '23505' || errMsg.includes('duplicate') || errMsg.includes('unique') || errMsg.includes('already exists') || errMsg.includes('conflict')) {
                toast.error('Este correo ya está registrado. Intenta iniciar sesión.');
            } else {
                toast.error(`Error al registrar: ${errMsg || 'Intenta de nuevo.'}`);
            }
            throw error;
        }

        toast.success('¡Cuenta creada exitosamente!');
        // Auto login
        await get().loginUser(email);
        await get().fetchInitialData(); // Refresh users list
    },

    loginUser: async (email) => {
        // Fetch user details
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.error('Login error:', error);
            return false;
        }

        const mappedUser: User = {
            name: user.name,
            country: user.country,
            email: user.email,
            points: user.points,
            exactMatches: user.exact_matches,
            selectedChampion: user.selected_champion,
            avatarUrl: user.avatar_url,
            password: user.password
        };

        // Fetch user predictions
        const { data: predictions } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_email', email);

        const mappedPredictions = (predictions || []).map((p: any) => ({
            matchId: p.match_id,
            homeScore: p.home_score,
            awayScore: p.away_score
        }));

        // Save session to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('quiniela_user_email', email);
        }

        set({ user: mappedUser, predictions: mappedPredictions });
        return true;
    },

    logoutUser: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('quiniela_user_email');
        }
        set({ user: null, predictions: [] });
    },

    setChampion: async (champion) => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase
            .from('users')
            .update({ selected_champion: champion })
            .eq('email', user.email);

        if (!error) {
            set((state) => ({
                user: state.user ? { ...state.user, selectedChampion: champion } : null
            }));
            toast.success(`¡${champion} seleccionado como campeón!`);
            get().fetchInitialData();
        } else {
            toast.error('Error al seleccionar campeón.');
        }
    },

    setAdminChampion: async (champion) => {
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'champion', value: champion });

        if (!error) {
            set(() => ({ settings: { champion } }));
            await get().recalculatePoints();
        }
    },

    submitPrediction: async (matchId, homeScore, awayScore) => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase
            .from('predictions')
            .upsert({
                user_email: user.email,
                match_id: matchId,
                home_score: homeScore,
                away_score: awayScore
            }, { onConflict: 'user_email, match_id' });

        if (!error) {
            // Update local state optimistically
            set((state) => {
                const existing = state.predictions.find(p => p.matchId === matchId);
                let newPredictions;
                if (existing) {
                    newPredictions = state.predictions.map(p =>
                        p.matchId === matchId ? { ...p, homeScore, awayScore } : p
                    );
                } else {
                    newPredictions = [...state.predictions, { matchId, homeScore, awayScore }];
                }
                return { predictions: newPredictions };
            });
            toast.success('Predicción guardada ✅');
        } else {
            toast.error('Error al guardar predicción.');
        }
    },

    updateMatchResult: async (matchId, homeScore, awayScore) => {
        const { error } = await supabase
            .from('matches')
            .update({ home_score: homeScore, away_score: awayScore, status: 'finished' })
            .eq('id', matchId);

        if (!error) {
            set((state) => ({
                matches: state.matches.map(m =>
                    m.id === matchId ? { ...m, homeScore, awayScore, status: 'finished' } : m
                )
            }));
            await get().recalculatePoints();
        }
    },

    recalculatePoints: async () => {
        console.log('Recalculating points...');
        const { data: allPredictions } = await supabase.from('predictions').select('*');
        const { data: allMatches } = await supabase.from('matches').select('*');
        const { data: allUsers } = await supabase.from('users').select('*');
        // Fetch champion setting
        const { data: settingsData } = await supabase.from('settings').select('*').eq('key', 'champion').single();
        const realChampion = settingsData?.value;

        if (!allPredictions || !allMatches || !allUsers) return;

        const matchesMap = new Map(allMatches.map((m: any) => [m.id, m]));

        const updates = allUsers.map((u: any) => {
            let totalPoints = 0;
            let totalExact = 0;

            const userPredictions = allPredictions.filter((p: any) => p.user_email === u.email);

            userPredictions.forEach((pred: any) => {
                const match = matchesMap.get(pred.match_id);
                if (match && match.status === 'finished' && match.home_score !== null && match.away_score !== null) {
                    const predHome = pred.home_score;
                    const predAway = pred.away_score;
                    const realHome = match.home_score;
                    const realAway = match.away_score;

                    if (predHome === realHome && predAway === realAway) {
                        totalPoints += 5;
                        totalExact += 1;
                    } else {
                        const predWinner = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
                        const realWinner = realHome > realAway ? 'home' : (realHome < realAway ? 'away' : 'draw');

                        if (predWinner === realWinner) {
                            totalPoints += 3;
                        }
                    }
                }
            });

            // Champion Points
            if (realChampion && u.selected_champion === realChampion) {
                totalPoints += 10;
            }

            return {
                email: u.email,
                points: totalPoints,
                exact_matches: totalExact
            };
        });

        // Batch update
        for (const update of updates) {
            await supabase
                .from('users')
                .update({ points: update.points, exact_matches: update.exact_matches })
                .eq('email', update.email);
        }

        // Refresh data
        get().fetchInitialData();

        // Update current user if logged in
        const currentUserEmail = get().user?.email;
        if (currentUserEmail) {
            const updatedUser = updates.find(u => u.email === currentUserEmail);
            if (updatedUser) {
                set(state => ({
                    user: state.user ? { ...state.user, points: updatedUser.points, exactMatches: updatedUser.exact_matches } : null
                }));
            }
        }
    },

    checkMatchStatus: async () => {
        // SIMULATION Logic triggers updates to DB
        const now = new Date();
        const matches = get().matches;

        for (const match of matches) {
            const matchDate = new Date(match.date);
            // Lock match
            if (match.status === 'open' && now >= matchDate) {
                await supabase.from('matches').update({ status: 'locked' }).eq('id', match.id);
            }

            // Finish match (Simulation)
            const twoHoursAfter = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);
            if (match.status === 'locked' && now >= twoHoursAfter && match.homeScore === undefined) {
                const homeScore = Math.floor(Math.random() * 4);
                const awayScore = Math.floor(Math.random() * 4);

                await get().updateMatchResult(match.id, homeScore, awayScore);
            }
        }

        // Refresh
        get().fetchInitialData();
    },

    updateAvatar: async (file: File) => {
        const { user } = get();
        if (!user) return;

        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            toast.error('Error al subir la imagen.');
            return;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // 3. Update User in DB
        const { error: dbError } = await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('email', user.email);

        if (dbError) {
            console.error('Error updating user avatar:', dbError);
            toast.error('Error al actualizar perfil.');
            return;
        }

        // 4. Update Local State
        set((state) => ({
            user: state.user ? { ...state.user, avatarUrl: publicUrl } : null
        }));

        // Also update the users list so leaderboard reflects it
        get().fetchInitialData();

        toast.success('Foto de perfil actualizada 📸');
    }
}));
