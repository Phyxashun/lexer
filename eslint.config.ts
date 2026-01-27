import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

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
    eslintPluginPrettierRecommended,
]);

/* OLD CONFIG
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
    // Global Ignores (Must be the first object, only 'ignores' key)
    {
        ignores: ['**.*', '***.config.{js,ts,mjs,cjs}', 'test/**', 'dist/**', 'build/**', 'coverage/**', 'ALL/**'],
    },

    // Base Recommended Configs
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // roject-specific Settings & Rules
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    // Specify globs for "out-of-project" files to be linted with type info
                    //allowDefaultProject: ['eslint.config.mjs'],
                    // Optional: specify a default tsconfig to use for these files
                    //defaultProject: 'tsconfig.json',
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'no-control-regex': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },

    // Prettier (Must be last to override everything else)
    eslintConfigPrettier,
);
*/
