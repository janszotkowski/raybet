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

import { MainLayout } from '../components/layout/MainLayout'

function RootComponent() {
    return (
        <RootDocument>
            <MainLayout>
                <Outlet />
            </MainLayout>
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