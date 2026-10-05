import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({plugins:[react()],css:{postcss:{plugins:[tailwindcss()]}},resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},server:{allowedHosts:['terminal.local']},build:{target:'es2022'}});
