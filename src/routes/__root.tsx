/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation, useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import '../app.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuthStore } from '../lib/store/authStore';
import { Loader2 } from 'lucide-react';

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

function AuthGuard({children}: { children: React.ReactNode }) {
    const {isAuthenticated, isLoading, checkAuth} = useAuthStore();
    const router = useRouter();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const publicPaths = ['/signin', '/signup'];
            if (!publicPaths.includes(location.pathname)) {
                router.navigate({to: '/signin', search: {redirect: location.pathname}});
            }
        } else if (!isLoading && isAuthenticated) {
            const publicPaths = ['/signin', '/signup'];
            if (publicPaths.includes(location.pathname)) {
                router.navigate({to: '/'});
            }
        }
    }, [isLoading, isAuthenticated, location.pathname, router]);

    if (isLoading) {
        return (
            <div className={'flex h-screen w-full items-center justify-center bg-sport-bg'}>
                <Loader2 className={'h-8 w-8 animate-spin text-brand-primary'}/>
            </div>
        );
    }

    return <>{children}</>;
}

function RootComponent() {
    return (
        <RootDocument>
            <QueryClientProvider client={queryClient}>
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