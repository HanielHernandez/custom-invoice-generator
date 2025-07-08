import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools(), tailwindcss()],
    server: {
        allowedHosts: ['buutlm-ip-190-143-252-237.tunnelmole.net']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
