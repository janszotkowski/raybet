/// <reference types="vite/client" />
import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../app.css'

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
                title: 'TanStack Start Starter',
            },
        ],
    }),
    component: RootComponent,
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from '../components/layout/MainLayout'

const queryClient = new QueryClient()

function RootComponent() {
    return (
        <RootDocument>
            <QueryClientProvider client={queryClient}>
                <MainLayout>
                    <Outlet />
                </MainLayout>
            </QueryClientProvider>
        </RootDocument>
    )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html>
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    )
}