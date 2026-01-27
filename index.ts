// ./index.ts

import { inspect, styleText } from 'node:util';
import { inspectOptions } from './src/utils/InspectOptions';
import { Char } from './src/char/Char';
import { Lexer } from './src/lexer/Lexer';
import { Parser } from './src/parser/Parser';
import { ParseError } from './src/parser/ParseError';
import { LexerError } from './src/lexer/LexerError';
import { CstNode } from './src/parser/Node';

export const config: Record<string, boolean> = {
    getChars: true,
    logChars: true,
    getTokens: false,
    logTokens: false,
    getCST: false,
    logCST: false,
};

export const tests: Map<number, string> = new Map<number, string>([
    /* Basic Tests*/
    [1, 'red'],
    [2, '#ff00aa'],
    [3, '#f0c'],
    [4, 'rgb(255, 100, 0)'],
    [5, 'rgba(0 100 200 / 0.5)'],
    [6, 'hsl(120deg, 100%, 50%)'],

    /* Good error cases to test */
    [7, 'rgb(255, 100,)'], // Unexpected ')'
    [8, 'lch(50% 100)'], // Unclosed function
    [9, '#badcolor'], // Invalid hex length

    // Additional Tests from https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value
    /* Named colors */
    [10, 'rebeccapurple'],
    [11, 'aliceblue'],

    /* RGB Hexadecimal */
    [12, '#f09'],
    [13, '#ff0099'],

    /* RGB (Red, Green, Blue) */
    [14, 'rgb(255 0 153)'],
    [15, 'rgb(255 0 153 / 80%)'],

    /* HSL (Hue, Saturation, Lightness) */
    [16, 'hsl(150 30% 60%)'],
    [17, 'hsl(150 30% 60% / 80%)'],

    /* HWB (Hue, Whiteness, Blackness) */
    [18, 'hwb(12 50% 0%)'],
    [19, 'hwb(194 0% 0% / 0.5)'],

    /* Lab (Lightness, A-axis, B-axis) */
    [20, 'lab(50% 40 59.5)'],
    [21, 'lab(50% 40 59.5 / 0.5)'],

    /* LCH (Lightness, Chroma, Hue) */
    [21, 'lch(52.2% 72.2 50)'],
    [22, 'lch(52.2% 72.2 50 / 0.5)'],

    /* Oklab (Lightness, A-axis, B-axis) */
    [23, 'oklab(59% 0.1 0.1)'],
    [24, 'oklab(59% 0.1 0.1 / 0.5)'],

    /* OkLCh (Lightness, Chroma, Hue) */
    [25, 'oklch(60% 0.15 50)'],
    [26, 'oklch(60% 0.15 50 / 0.5)'],

    /* Relative CSS colors */
    /* HSL hue change */
    [27, 'hsl(from red 240deg s l)'],
    /* HWB alpha channel change */
    [28, 'hwb(from green h w b / 0.5)'],
    /* LCH lightness change */
    [29, 'lch(from blue calc(l + 20) c h)'],

    /* light-dark */
    [30, 'light-dark(white, black)'],
    [31, 'light-dark(rgb(255 255 255), rgb(0 0 0))'],

    // Relative Colors from https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors
    [32, 'red'],
    [33, 'rgb(255 0 0)'],

    // Valid Relative Color Strings
    [34, 'rgb(from red 255 0 0)'], // Absolute overrides
    [35, 'rgb(from red 255 0 0 / 1)'], // Absolute overrides with alpha
    [36, 'rgb(from red 255 0 0 / 100%)'], // Percentage alpha

    [37, 'rgb(from red 255 g b)'], // Mixed: absolute R, relative G and B
    [38, 'rgb(from red r 0 0)'], // Mixed: relative R, absolute G and B
    [39, 'rgb(from red r g b / 1)'], // Relative channels, absolute alpha
    [40, 'rgb(from red r g b / 100%)'], // Relative channels, absolute percentage alpha

    [41, 'rgb(from red r g b)'], // Identity (returns red)
    [42, 'rgb(from red r g b / alpha)'], // Identity including alpha

    /* Interchangeable channels (since red's g and b are both 0) */
    [43, 'rgb(from red r g g)'], // Using green channel for blue
    [44, 'rgb(from red r b b)'], // Using blue channel for green
    [45, 'rgb(from red 255 g g)'], // Absolute R, green channel for blue
    [46, 'rgb(from red 255 b b)'], // Absolute R, blue channel for green
]);

export const logChars = (chars: Char[]): void => {
    console.log('Chars:');
    for (const ch of chars) {
        console.log(ch);
    }
};

export const logTokens = (tokens: Token[]): void => {
    console.log('Tokens:');
    const filtered = tokens.filter(t => t.type !== 'EOF');
    const formatted = inspect(filtered, inspectOptions);
    console.log(formatted);
};

export const stripSpan = (node: CstNode): CstNode => {
    if (Array.isArray(node)) {
        return node.map(stripSpan);
    }

    if (node && typeof node === 'object') {
        const { span, ...rest } = node;
        return Object.fromEntries(
            Object.entries(rest).map(([k, v]) => [k, stripSpan(v)]),
        );
    }

    return node;
};

export const logCST = (cst: CstNode): void => {
    console.log('Concrete Syntax Tree (CST):');
    //console.dir(stripSpan(cst), { depth: null });
    const options = { ...inspectOptions, breakLength: 80 };
    const formatted = inspect(stripSpan(cst), options);
    console.log(formatted);
};

export const test = () => {
    let chars: string = '';
    let tokens: Token[] = [];
    let cst: CstNode = {};
    console.log(`\nTESTING`);

    for (const [testNumber, testStr] of tests) {
        const testNum = styleText(['blue'], `[${testNumber}]`);
        const test = styleText(['black', 'bgYellow'], `"${testStr}"`);

        try {
            console.log(`\nTest${testNum}:\tCurrent Input: ${test}`);

            if (config.getChars) {
                chars = Char.fromString(testStr);
                if (config.logChars) logChars(chars);
            } else {
                continue;
            }

            if (config.getTokens) {
                tokens = new Lexer(chars, testStr).tokens;
                if (config.logTokens) logTokens(tokens);
            } else {
                continue;
            }

            if (config.logChars) {
                cst = new Parser(tokens, testStr).parse();
                if (config.logCST) logCST(cst);
            } else {
                continue;
            }
        } catch (e) {
            if (e instanceof LexerError) {
                console.error('\n*** LEXING FAILED ***');
                console.error(e.toString());
            } else if (e instanceof ParseError) {
                console.error('\n*** PARSING FAILED ***');
                console.error(e.toString());
            } else {
                console.error('\n*** TESTING FAILED ***');
                console.error('An unknown error occurred:', e);
            }
        }
    }
};

test();
