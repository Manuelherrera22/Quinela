import { StateCreator } from 'zustand';
import { supabase } from '../supabase';
import { AppState, CommonSlice } from './types';
import { User } from '@/types';

export const createCommonSlice: StateCreator<AppState, [], [], CommonSlice> = (set, get) => ({
    isLoading: false,

    setLoading: (loading) => set({ isLoading: loading }),

    fetchInitialData: async () => {
        set({ isLoading: true });

        try {
            // 1. Fetch Matches
            await get().fetchMatches();

            // 2. Fetch Users (Leaderboard)
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
            }));

            // 3. Fetch Settings
            const { data: settingsData } = await supabase.from('settings').select('*');
            const championSetting = settingsData?.find((s: any) => s.key === 'champion')?.value || null;

            // 4. Restore Session from localStorage (custom auth)
            let restoredEmail: string | null = null;
            if (typeof window !== 'undefined') {
                restoredEmail = localStorage.getItem('quiniela_user_email');
            }

            if (restoredEmail && !get().user) {
                const profile = (users || []).find((u: any) => u.email === restoredEmail);

                if (profile) {
                    const mappedUser: User = {
                        name: profile.name,
                        country: profile.country,
                        email: profile.email,
                        points: profile.points || 0,
                        exactMatches: profile.exact_matches || 0,
                        selectedChampion: profile.selected_champion,
                        avatarUrl: profile.avatar_url,
                    };

                    const { data: predictions } = await supabase
                        .from('predictions')
                        .select('*')
                        .eq('user_email', restoredEmail);

                    const mappedPredictions = (predictions || []).map((p: any) => ({
                        matchId: p.match_id,
                        homeScore: p.home_score,
                        awayScore: p.away_score
                    }));

                    set({ user: mappedUser, predictions: mappedPredictions });
                } else {
                    // User no longer exists in DB, clear stale session
                    localStorage.removeItem('quiniela_user_email');
                }
            }

            set({
                users: mappedUsers,
                settings: { champion: championSetting },
                isLoading: false
            });
        } catch (error) {
            console.error('Error during initial data fetch:', error);
            set({ isLoading: false });
        }
    },

    recalculatePoints: async () => {
        console.log('Recalculating points...');
        const { data: allPredictions } = await supabase.from('predictions').select('*');
        const { data: allMatches } = await supabase.from('matches').select('*');
        const { data: allUsers } = await supabase.from('users').select('*');
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

            if (realChampion && u.selected_champion === realChampion) {
                totalPoints += 10;
            }

            return {
                email: u.email,
                points: totalPoints,
                exact_matches: totalExact
            };
        });

        for (const update of updates) {
            await supabase
                .from('users')
                .update({ points: update.points, exact_matches: update.exact_matches })
                .eq('email', update.email);
        }

        await get().fetchInitialData();

        const currentUserEmail = get().user?.email;
        if (currentUserEmail) {
            const updatedUser = updates.find(u => u.email === currentUserEmail);
            if (updatedUser) {
                set(state => ({
                    user: state.user ? { ...state.user, points: updatedUser.points, exactMatches: updatedUser.exact_matches } : null
                }));
            }
        }
    }
});
