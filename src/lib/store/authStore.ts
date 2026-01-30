import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
    userId: string | null;
    setUserId: (id: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            userId: null,
            setUserId: (id) => set({ userId: id }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
