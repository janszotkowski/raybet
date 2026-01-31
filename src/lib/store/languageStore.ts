import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLocale, setLocale } from '@/paraglide/runtime';

type LanguageStore = {
    language: string;
    setLanguage: (lang: string) => void;
};

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            language: getLocale(),
            setLanguage: (lang) => {
                setLocale(lang as any);
                set({language: lang});
            },
        }),
        {
            name: 'language-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    setLocale(state.language as any);
                }
            },
        },
    ),
);
