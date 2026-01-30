import { create } from 'zustand';
import type { Profile } from '../appwrite/types';

type ProfileState = {
    profile: Profile | null;
    isLoading: boolean;
    setProfile: (profile: Profile | null) => void;
    setIsLoading: (isLoading: boolean) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    isLoading: false,
    setProfile: (profile) => set({ profile }),
    setIsLoading: (isLoading) => set({ isLoading }),
}));
