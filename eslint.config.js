// import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import eslintParserHTML from '@html-eslint/parser';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import globals from 'globals';
import js from '@eslint/js';
import markdown from '@eslint/markdown';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        ignores: [
            'dist/',
            'node_modules/',
            'vite.config.ts',
            'prettier.config.ts',
            'storybook-static/',
            '.*/',
        ],
    },
    {
        files: ['**/*.html'],
        languageOptions: { parser: eslintParserHTML },
    },
    {
        files: ['src/**/*.{js,ts,html}'],
        extends: [
            eslintPluginBetterTailwindcss.configs['recommended-error'],
            eslintPluginBetterTailwindcss.configs['stylistic-error'],
            eslintPluginBetterTailwindcss.configs['correctness-error'],
        ],
        settings: {
            'better-tailwindcss': {
                entryPoint: 'src/style.css',
                rootFontSize: 16,
            },
        },
        rules: {
            'better-tailwindcss/enforce-canonical-classes': 'error',
            'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
            'better-tailwindcss/enforce-consistent-class-order': 'off',
        },
    },
    {
        files: ['{src,tests}/**/*.{js,mjs,cjs,ts,mts,cts}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.config.js', '*.config.ts'],
                    defaultProject: 'tsconfig.json',
                },
            },
        },
        ...js.configs.recommended,
        extends: [
            tseslint.configs.recommended,
            tseslint.configs.eslintRecommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }], // No debug logs in prod
            eqeqeq: ['error', 'always'], // No == allowed
            curly: ['error', 'all'], // Force {} for all if/else
            'no-implicit-coercion': 'error', // No !! or +str tricks
            '@typescript-eslint/strict-boolean-expressions': [
                'error',
                {
                    allowAny: false,
                    allowNullableBoolean: false,
                    allowNullableNumber: false,
                    allowNullableObject: false,
                    allowNullableString: false,
                    allowNumber: false,
                    allowString: false,
                },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            'no-trailing-spaces': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            '@typescript-eslint/no-floating-promises': 'error', // Vital for Service Workers
            'object-curly-newline': ['off'], // let prettier handle this
            'comma-dangle': ['error', 'only-multiline'],
            'object-curly-spacing': ['error', 'always'],
            'sort-imports': [
                'error',
                {
                    ignoreCase: false,
                    ignoreDeclarationSort: false,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: [
                        'none',
                        'all',
                        'multiple',
                        'single',
                    ],
                    allowSeparatedGroups: true,
                },
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowNumber: true,
                },
            ],
        },
    },

    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/gfm',
        rules: { 'markdown/no-invalid-label-refs': 'error' },
    }

    // TODO: How to configure this to work with tailwind v4?
    // {
    //     files: ['**/*.css'],
    //     plugins: { css },
    //     language: 'css/css',
    //     rules: {
    //         'css/no-duplicate-imports': 'error',
    //         'css/no-empty-blocks': 'error',
    //         'css/no-invalid-at-rules': 'error',
    //         'css/no-invalid-properties': 'error',
    //         'css/use-baseline': ['error', { available: 'widely' }],
    //         'css/use-layers': 'error',
    //     },
    // }
);
