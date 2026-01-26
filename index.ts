// ./index.ts

import { inspect, styleText } from 'node:util';
import { inspectOptions } from './src/utils/InspectOptions';
import { Char } from './src/char/Char';
import { Lexer } from './src/lexer/Lexer';
import { Parser } from './src/parser/Parser';
import { ParseError } from './src/parser/ParseError';
import { LexerError } from './src/lexer/LexerError';

export const tests: string[] = [
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

export const logCST = (cst: ASTNode): void => {
    console.log('Concrete Syntax Tree (CST):');
    const options = { ...inspectOptions, breakLength: 80 };
    const formatted = inspect(cst, options);
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
