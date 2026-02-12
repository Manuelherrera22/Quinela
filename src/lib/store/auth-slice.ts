import { StateCreator } from 'zustand';
import { supabase } from '../supabase';
import { AppState, AuthSlice } from './types';
import { User } from '@/types';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set, get) => ({
    user: null,
    users: [],
    settings: { champion: null },

    registerUser: async (name, country, email, password) => {
        // 1. Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            toast.error('El correo electrónico ya está registrado.');
            throw new Error('El correo electrónico ya está registrado.');
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert user manually into public table
        const { error } = await supabase.from('users').insert([
            {
                name,
                country,
                email,
                password: hashedPassword,
                points: 0,
                exact_matches: 0
            }
        ]);

        if (error) {
            console.error('Registration error:', error);
            toast.error(`Error al registrar: ${error.message}`);
            throw error;
        }

        toast.success('¡Registro exitoso!');
        await get().loginUser(email, password);
    },

    loginUser: async (email, password) => {
        // 1. Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.error('Login error:', error);
            toast.error('Credenciales inválidas.');
            return false;
        }

        // 2. Compare password
        if (!user.password) {
            toast.error('Error de integridad de datos del usuario.');
            return false;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            toast.error('Contraseña incorrecta.');
            return false;
        }

        // 3. Set User State
        const mappedUser: User = {
            name: user.name,
            country: user.country,
            email: user.email,
            points: user.points,
            exactMatches: user.exact_matches,
            selectedChampion: user.selected_champion,
            avatarUrl: user.avatar_url,
        };

        // 4. Fetch predictions
        const { data: predictions } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_email', email);

        const mappedPredictions = (predictions || []).map((p: any) => ({
            matchId: p.match_id,
            homeScore: p.home_score,
            awayScore: p.away_score
        }));

        set({ user: mappedUser, predictions: mappedPredictions });

        // Persist session somewhat manually (or rely on local state rehydration if implemented)
        if (typeof window !== 'undefined') {
            localStorage.setItem('quiniela_user_email', email);
        }

        return true;
    },

    logoutUser: async () => {
        // Just clear local state
        if (typeof window !== 'undefined') {
            localStorage.removeItem('quiniela_user_email');
        }
        set({ user: null, predictions: [] });
        toast.success('Sesión cerrada');
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
            // Recalculate or refresh data if needed
            await get().fetchInitialData();
        } else {
            toast.error('Error al seleccionar campeón.');
        }
    },

    setAdminChampion: async (champion) => {
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'champion', value: champion });

        if (!error) {
            set((state) => ({ settings: { ...state.settings, champion } }));
            await get().recalculatePoints(); // Assuming this function exists in CommonSlice or elsewhere
        }
    },

    updateAvatar: async (file: File) => {
        const { user } = get();
        if (!user) return;

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

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('email', user.email);

        if (dbError) {
            console.error('Error updating user avatar:', dbError);
            toast.error('Error al actualizar perfil.');
            return;
        }

        set((state) => ({
            user: state.user ? { ...state.user, avatarUrl: publicUrl } : null
        }));

        await get().fetchInitialData();
        toast.success('Foto de perfil actualizada 📸');
    }
});
