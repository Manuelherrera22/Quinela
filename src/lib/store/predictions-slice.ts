import { StateCreator } from 'zustand';
import { supabase } from '../supabase';
import { AppState, PredictionsSlice } from './types';
import toast from 'react-hot-toast';

export const createPredictionsSlice: StateCreator<AppState, [], [], PredictionsSlice> = (set, get) => ({
    predictions: [],

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
            console.error('Error saving prediction:', error);
            toast.error('Error al guardar predicción.');
        }
    }
});
