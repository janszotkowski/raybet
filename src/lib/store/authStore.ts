import { create } from 'zustand';
import { authService } from '../appwrite/services/authService';
import { Models } from 'appwrite';

type AuthState = {
    user: Models.User<Models.Preferences> | null;
    userId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    login: (user: Models.User<Models.Preferences>) => void;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true,

    checkAuth: async () => {
        try {
            const user = await authService.getAccount();
            set({user, userId: user.$id, isAuthenticated: true, isLoading: false});
        } catch (error: unknown) {
            set({user: null, userId: null, isAuthenticated: false, isLoading: false});
        }
    },

    login: (user) => {
        set({user, userId: user.$id, isAuthenticated: true});
    },

    logout: async () => {
        try {
            await authService.deleteSession();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            set({user: null, userId: null, isAuthenticated: false});
        }
    },
}));
