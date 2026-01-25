import { defineConfig } from 'eslint/config';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
    {
        files: ['**/*.ts'],

        languageOptions: {
            parser: tsparser,
            sourceType: 'module',
        },

        plugins: {
            '@typescript-eslint': tseslint,
            prettier: prettierPlugin,
        },

        rules: {
            ...tseslint.configs.recommended.rules,
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
            'no-console': 'warn',
            semi: ['error', 'always'],
            quotes: ['error', 'double'],
            'prettier/prettier': 'error',
            ...prettierConfig.rules,
        },
    },
]);
