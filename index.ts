// ./index.ts

import { inspect, styleText } from 'node:util';
import { inspectOptions } from './src/utils/InspectOptions';
import { Char } from './src/char/Char';
import { Lexer } from './src/lexer/Lexer';
import { Parser } from './src/parser/Parser';
import { ParseError } from './src/parser/ParseError';
import { LexerError } from './src/lexer/LexerError';
import { CstNode } from './src/parser/Node';

export const tests: string[] = [
    // Basic Tests
    'red',
    '#ff00aa',
    '#f0c',
    'rgb(255, 100, 0)',
    'rgba(0 100 200 / 0.5)',
    'hsl(120deg, 100%, 50%)',
    // Good error cases to test:
    'rgb(255, 100,)', // Unexpected ')'
    'lch(50% 100)', // Unclosed function
    '#badcolor', // Invalid hex length

    // Additional Tests from https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value
    /* Named colors */
    'rebeccapurple',
    'aliceblue',

    /* RGB Hexadecimal */
    '#f09',
    '#ff0099',

    /* RGB (Red, Green, Blue) */
    'rgb(255 0 153)',
    'rgb(255 0 153 / 80%)',

    /* HSL (Hue, Saturation, Lightness) */
    'hsl(150 30% 60%)',
    'hsl(150 30% 60% / 80%)',

    /* HWB (Hue, Whiteness, Blackness) */
    'hwb(12 50% 0%)',
    'hwb(194 0% 0% / 0.5)',

    /* Lab (Lightness, A-axis, B-axis) */
    'lab(50% 40 59.5)',
    'lab(50% 40 59.5 / 0.5)',

    /* LCH (Lightness, Chroma, Hue) */
    'lch(52.2% 72.2 50)',
    'lch(52.2% 72.2 50 / 0.5)',

    /* Oklab (Lightness, A-axis, B-axis) */
    'oklab(59% 0.1 0.1)',
    'oklab(59% 0.1 0.1 / 0.5)',

    /* OkLCh (Lightness, Chroma, Hue) */
    'oklch(60% 0.15 50)',
    'oklch(60% 0.15 50 / 0.5)',

    /* Relative CSS colors */
    /* HSL hue change */
    'hsl(from red 240deg s l)',
    /* HWB alpha channel change */
    'hwb(from green h w b / 0.5)',
    /* LCH lightness change */
    'lch(from blue calc(l + 20) c h)',

    /* light-dark */
    'light-dark(white, black)',
    'light-dark(rgb(255 255 255), rgb(0 0 0))',

    // Relative Colors from https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors
    'red',
    'rgb(255 0 0)',

    // Valid Relative Color Strings
    'rgb(from red 255 0 0)', // Absolute overrides
    'rgb(from red 255 0 0 / 1)', // Absolute overrides with alpha
    'rgb(from red 255 0 0 / 100%)', // Percentage alpha

    'rgb(from red 255 g b)', // Mixed: absolute R, relative G and B
    'rgb(from red r 0 0)', // Mixed: relative R, absolute G and B
    'rgb(from red r g b / 1)', // Relative channels, absolute alpha
    'rgb(from red r g b / 100%)', // Relative channels, absolute percentage alpha

    'rgb(from red r g b)', // Identity (returns red)
    'rgb(from red r g b / alpha)', // Identity including alpha

    /* Interchangeable channels (since red's g and b are both 0) */
    'rgb(from red r g g)', // Using green channel for blue
    'rgb(from red r b b)', // Using blue channel for green
    'rgb(from red 255 g g)', // Absolute R, green channel for blue
    'rgb(from red 255 b b)', // Absolute R, blue channel for green
];

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
    let count = 0;
    console.log(`\nTESTING\n`);

    tests.forEach(str => {
        const test = styleText(['black', 'bgYellow'], `"${str}"`);
        const nums = styleText(['blue'], `[${count}]`);
        try {
            console.log(`\nTest${nums}:\tCurrent Input: ${test}`);

            const chars = Char.fromString(str);
            // Optional: Output the Char[] to the console
            //logChars(chars);

            const tokens: Token[] = new Lexer(chars, str).tokens;
            // Optional: Output the tokens to the console
            //logTokens(tokens);

            const cst = new Parser(tokens, str).parse();
            // Optional: Output the CST to the console
            logCST(cst);
        } catch (e) {
            console.error('\n*** PARSE FAILED ***');
            if (e instanceof LexerError || e instanceof ParseError) {
                console.error(e.toString());
            } else {
                console.error('An unknown error occurred:', e);
            }
        } finally {
            count++;
        }
    });
};

test();
