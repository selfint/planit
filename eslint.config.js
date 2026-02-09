import js from '@eslint/js';

import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';

export default defineConfig(
    {
        ignores: [
            'dist/',
            'node_modules/',
            'vite.config.ts',
            'prettier.config.ts',
        ],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.es2021 },
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.config.js', '*.config.ts'],
                    defaultProject: 'tsconfig.json',
                },
            },
        },
        ...js.configs.recommended,
        extends: [
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }], // No debug logs in prod
            eqeqeq: ['error', 'always'], // No == allowed
            curly: ['error', 'all'], // Force {} for all if/else
            'no-implicit-coercion': 'error', // No !! or +str tricks
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            'no-trailing-spaces': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/consistent-type-definitions': [
                'error',
                'interface',
            ],
            '@typescript-eslint/no-floating-promises': 'error', // Vital for Service Workers
        },
    },

    {
        files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
        plugins: { json },
        language: 'json/json',
        rules: {
            'json/no-duplicate-keys': 'error',
        },
    },

    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/gfm',
        rules: {
            'markdown/no-invalid-label-refs': 'error',
        },
    },

    {
        files: ['**/*.css'],
        plugins: { css },
        language: 'css/css',
        rules: {
            'css/no-duplicate-imports': 'error',
            'css/no-empty-blocks': 'error',
            'css/no-invalid-at-rules': 'error',
            'css/no-invalid-properties': 'error',
            'css/use-baseline': ['error', { available: 'widely' }],
            'css/use-layers': 'error',
        },
    }
);
