// ./prettier.config.ts

import { type Config } from 'prettier';

/**
 * @see https://prettier.io/docs/configuration
 */
const config: Config = {
    arrowParens: 'always',
    bracketSameLine: true,
    objectWrap: 'preserve',
    bracketSpacing: true,
    semi: true,
    experimentalOperatorPosition: 'end',
    experimentalTernaries: false,
    singleQuote: true,
    jsxSingleQuote: false,
    quoteProps: 'as-needed',
    trailingComma: 'all',
    singleAttributePerLine: false,
    htmlWhitespaceSensitivity: 'ignore',
    vueIndentScriptAndStyle: false,
    proseWrap: 'always',
    endOfLine: 'lf',
    insertPragma: false,
    printWidth: 80,
    requirePragma: false,
    tabWidth: 4,
    useTabs: false,
    embeddedLanguageFormatting: 'auto',
};

export default config;
