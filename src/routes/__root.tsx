/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation, useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import * as React from 'react';
import '../app.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';
import { useProfileStore } from '@/lib/store/profileStore';
import { playerService } from '@/lib/appwrite/services/playerService';
import { useLanguageStore } from '../lib/store/languageStore';

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'RAYBET',
            },
        ],
    }),
    component: RootComponent,
});

const queryClient = new QueryClient();

function LanguageInit() {
    // Just by accessing the store, we trigger the persist/rehydrate logic if using persist middleware correctly options.
    // But we also want to ensure the paraglide runtime tagging is synced if we use `setLanguageTag` inside store actions.
    // The store initializes `language` from storage.
    // AND the store has onRehydrateStorage which calls setLanguageTag.
    // So just mounting this hook is enough to ensure the store is active.
    // However, if we want to support html lang attribute:
    const {language} = useLanguageStore();

    React.useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return null;
}

function AuthGuard({children}: { children: React.ReactNode }) {
    const {isAuthenticated, isLoading: isAuthLoading, checkAuth, user} = useAuthStore();
    const {profile, setProfile} = useProfileStore();
    const [isProfileLoading, setIsProfileLoading] = React.useState(true);
    const router = useRouter();
    const location = useLocation();

    // 1. Check Auth (User Session)
    React.useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // 2. Check Profile (Database Data) - Only if authenticated
    React.useEffect(() => {
        const fetchProfile = async () => {
            // If we are still checking auth, do nothing yet
            if (isAuthLoading) return;

            // If not authenticated, we don't need profile
            if (!isAuthenticated || !user?.$id) {
                setIsProfileLoading(false);
                return;
            }

            // If we already have a profile and it matches current user, skipping fetch
            if (profile && profile.userId === user.$id) {
                setIsProfileLoading(false);
                return;
            }

            // Fetch profile
            try {
                const fetchedProfile = await playerService.getProfileByUserId(user.$id);
                if (fetchedProfile) {
                    setProfile(fetchedProfile);
                }
            } catch (err) {
                console.error('Failed to fetch profile in AuthGuard', err);
            } finally {
                setIsProfileLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthLoading, isAuthenticated, user, profile, setProfile]);

    // 3. Routing Logic
    React.useEffect(() => {
        const isLoading = isAuthLoading || isProfileLoading;

        if (!isLoading && !isAuthenticated) {
            const publicPaths = ['/signin', '/signup'];
            if (!publicPaths.includes(location.pathname)) {
                router.navigate({to: '/signin', search: {redirect: location.pathname}});
            }
        } else if (!isLoading && isAuthenticated) {
            // Basic Public Path Redirect
            const publicPaths = ['/signin', '/signup'];
            if (publicPaths.includes(location.pathname)) {
                router.navigate({to: '/'});
            }
        }
    }, [isAuthLoading, isProfileLoading, isAuthenticated, location.pathname, router]);

    if (isAuthLoading || isProfileLoading) {
        return (
            <div className={'flex h-screen w-full items-center justify-center bg-sport-bg'}>
                <Loader2 className={'h-8 w-8 animate-spin text-brand-primary'}/>
            </div>
        );
    }

    // Don't render children if not authenticated (unless public path - handled by router usually but good saftynet here or inside specific routes)
    // Actually, our router logic handles redirects, so we just render children.
    // However, if we are on a private route and not authenticated, we shouldn't flash content.
    // The redirect effect above happens, but React might render one frame.
    // For now, we trust the redirect effect or the individual route protection if any.
    // But since this is a global guard, it wraps everything.

    return <>{children}</>;
}

function RootComponent() {
    return (
        <RootDocument>
            <QueryClientProvider client={queryClient}>
                <LanguageInit/>
                <AuthGuard>
                    <MainLayout>
                        <Outlet/>
                    </MainLayout>
                </AuthGuard>
            </QueryClientProvider>
        </RootDocument>
    );
}

function RootDocument({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html>
        <head>
            <HeadContent/>
        </head>
        <body>
        {children}
        <Scripts/>
        </body>
        </html>
    );
}