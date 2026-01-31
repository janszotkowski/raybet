import { paraglideVitePlugin } from '@inlang/paraglide-js'
import path from 'path';
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        paraglideVitePlugin({
            project: './project.inlang',
            outdir: './src/paraglide'
        }),
        tsConfigPaths(),
        tanstackStart(),
        viteReact(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            appwrite: path.resolve(__dirname, 'node_modules/appwrite'),
        },
    },
});
