import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    base: isDev ? '/absproxy/5175/' : '/',
    plugins: [
        tailwindcss(),
    ],
    root: 'UI',
    build: {
        outDir: '../dist',
    },
    resolve: {
        alias: {
            'sigpro': './sigpro.js',
        },
    },
    server: {
        port: 5175,
        open: true,
        allowedHosts: true,
    },
});
