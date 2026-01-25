import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    // TypeScript & ESLint Recommended
    ...tseslint.configs.recommended,

    // Project-Specific configuration
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
            '@stylistic/indent': ['error', 4],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single'],
            'prefer-const': 'error',
        },
    },

    // Prettier (Must be last to override stylistic conflicts)
    eslintPluginPrettierRecommended,
]);
