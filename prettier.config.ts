import { type Config } from 'prettier';

/**
 * @see https://prettier.io/docs/configuration
 */
const config: Config = {
    arrowParens: 'avoid',
    bracketSameLine: false,
    objectWrap: 'preserve',
    bracketSpacing: true,
    bracketSameLine: true,
    semi: true,
    experimentalOperatorPosition: 'end',
    experimentalTernaries: false,
    singleQuote: true,
    jsxSingleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'all',
    singleAttributePerLine: false,
    htmlWhitespaceSensitivity: 'strict',
    vueIndentScriptAndStyle: false,
    proseWrap: 'preserve',
    endOfLine: 'lf',
    insertPragma: false,
    printWidth: 80,
    requirePragma: false,
    tabWidth: 4,
    useTabs: false,
    embeddedLanguageFormatting: 'auto',
};

export default config;
