// ./index.ts

import { inspect } from 'node:util';
import { inspectOptions } from './src/utils/InspectOptions';
import { Char } from './src/char/Char';
import { Lexer } from './src/lexer/Lexer';
import { Parser } from './src/parser/Parser';
import { ParseError } from './src/parser/ParseError';
import { LexerError } from './src/lexer/LexerError';

const tests: string[] = [
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

const test = () => {
    console.log(`\n--- PARSER TESTING ---\n`);

    tests.forEach(str => {
        try {
            console.log(`\n--- Testing Input: "${str}" ---`);

            const chars = Char.fromString(str);

            const lexer = new Lexer(chars, str);
            const tokens: Token[] = lexer.tokens;

            // Optional: Output the tokens to the console
            console.log('Tokens:');
            const filtered = tokens.filter(t => t.type !== 'EOF');
            const formatted = inspect(filtered, inspectOptions);
            console.log(formatted);

            // Parse the token array into a concrete systax tree (CST)
            const parser = new Parser(tokens, str);
            const cst = parser.parse();

            // Optional: Output the tokens to the console
            console.log('Concrete Syntax Tree (CST):');
            const cstOptions = { ...inspectOptions, breakLength: 80 };
            const cstFormatted = inspect(cst, cstOptions);
            console.log(cstFormatted);
        } catch (e) {
            console.error('--- PARSE FAILED ---');
            if (e instanceof LexerError || e instanceof ParseError) {
                console.error(e.toString());
            } else {
                //console.error('An unknown error occurred:', e);
            }
        }
    });
};

test();
