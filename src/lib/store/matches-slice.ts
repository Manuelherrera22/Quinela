import { StateCreator } from 'zustand';
import { supabase } from '../supabase';
import { AppState, MatchesSlice } from './types';

export const createMatchesSlice: StateCreator<AppState, [], [], MatchesSlice> = (set, get) => ({
    matches: [],

    fetchMatches: async () => {
        let { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: true });

        if (matchesError) {
            console.error('Error fetching matches:', matchesError);
            return;
        }


        // Removed auto-seeding logic to rely on manual seeding script
        if (!matches) matches = [];

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

        set({ matches: mappedMatches });
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

    checkMatchStatus: async () => {
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
            if (match.status === 'locked' && now >= twoHoursAfter && (match.homeScore === undefined || match.homeScore === null)) {
                const homeScore = Math.floor(Math.random() * 4);
                const awayScore = Math.floor(Math.random() * 4);
                await get().updateMatchResult(match.id, homeScore, awayScore);
            }
        }
        await get().fetchMatches();
    }
});
