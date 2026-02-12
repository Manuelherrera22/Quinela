import { create } from 'zustand';
import { createAuthSlice } from './auth-slice';
import { createMatchesSlice } from './matches-slice';
import { createPredictionsSlice } from './predictions-slice';
import { createCommonSlice } from './common-slice';
import { AppState } from './types';

export const useStore = create<AppState>((...a) => ({
    ...createAuthSlice(...a),
    ...createMatchesSlice(...a),
    ...createPredictionsSlice(...a),
    ...createCommonSlice(...a),
}));
