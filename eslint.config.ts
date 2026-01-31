// ./eslint.config.ts

import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
//import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    globalIgnores([
        '.vscode/',
        'ALL/',
        'node_modules/',
        'dist/',
        'build/**/*',
        'temp.js',
        '**/*.config.js',
    ]),
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        files: ['index.ts', 'src/**/*.ts'],
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@stylistic/array-bracket-spacing': ['error', 'always'],
            '@stylistic/space-in-parens': ['error', 'always'],
            '@stylistic/indent': ['error', 4],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single'],
            'prefer-const': 'error',
        },
    },
    // IMPORTANT: This plugin runs Prettier AS an eslint rule.
    // It will still conflict unless you disable Prettier's
    // control over those specific files or characters.
    //eslintPluginPrettierRecommended,
]);
