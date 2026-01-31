// ./index.ts

import { styleText, type InspectOptions } from 'node:util';
import { inspect, inspectOptions } from './src/utils/InspectOptions';
import { Char } from './src/char/Char';
import { Lexer } from './src/lexer/Lexer';
import { Parser } from './src/parser/Parser';
import { ParseError } from './src/parser/ParseError';
import { LexerError } from './src/lexer/LexerError';
import { CstNode } from './src/parser/Node';
import { BoxText, BoxType } from './src/logger/logger';

// TODO add custom inspect to tokens and cst

// Types
type Result<T, E = Error> =
    | { success: true; value: T; }
    | { success: false; error: E; };

type TestResult = Result<
    { chars?: Char[]; lexer?: Lexer; cst?: CstNode; },
    LexerError | ParseError
>;

// Constants
const ON = true;
const OFF = false;

/**
 * Configuration for controlling console.log output of testing
 */
const config = {
    // OPTIONAL: SET THE LAST TEST NUMBER TO EXECUTE
    lastTest: 15,

    // CUSTOM INSPECT BREAKLENGTH
    options: { ...inspectOptions, breakLength: 80 } as InspectOptions,

    // OPTIONAL FORMATTING FLAGS:
    display: { EOF: OFF, pos: ON, span: ON, msg: ON },

    // CHARS
    chars: { get: ON, log: ON },

    // LEXER/TOKENS
    tokens: { get: ON, log: ON },

    // PARSER/CST
    cst: { get: ON, log: ON },
} as const;

const tests: Map<number, string> = new Map<number, string>( [
    /* Basic Tests*/
    [ 1, 'red' ],
    [ 2, '#ff00aa' ],
    [ 3, '#f0c' ],
    [ 4, 'rgb(255, 100, 0)' ],
    [ 5, 'rgba(0 100 200 / 0.5)' ],
    [ 6, 'hsl(120deg, 100%, 50%)' ],

    /* Good error cases to test */
    [ 7, 'rgb(255, 100,)' ], // Unexpected ')'
    [ 8, 'lch(50% 100)' ], // Unclosed function
    [ 9, '#badcolor' ], // Invalid hex length

    // Additional Tests from https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value
    /* Named colors */
    [ 10, 'rebeccapurple' ],
    [ 11, 'aliceblue' ],

    /* RGB Hexadecimal */
    [ 12, '#f09' ],
    [ 13, '#ff0099' ],

    /* RGB (Red, Green, Blue) */
    [ 14, 'rgb(255 0 153)' ],
    [ 15, 'rgb(255 0 153 / 80%)' ],

    /* HSL (Hue, Saturation, Lightness) */
    [ 16, 'hsl(150 30% 60%)' ],
    [ 17, 'hsl(150 30% 60% / 80%)' ],

    /* HWB (Hue, Whiteness, Blackness) */
    [ 18, 'hwb(12 50% 0%)' ],
    [ 19, 'hwb(194 0% 0% / 0.5)' ],

    /* Lab (Lightness, A-axis, B-axis) */
    [ 20, 'lab(50% 40 59.5)' ],
    [ 21, 'lab(50% 40 59.5 / 0.5)' ],

    /* LCH (Lightness, Chroma, Hue) */
    [ 21, 'lch(52.2% 72.2 50)' ],
    [ 22, 'lch(52.2% 72.2 50 / 0.5)' ],

    /* Oklab (Lightness, A-axis, B-axis) */
    [ 23, 'oklab(59% 0.1 0.1)' ],
    [ 24, 'oklab(59% 0.1 0.1 / 0.5)' ],

    /* OkLCh (Lightness, Chroma, Hue) */
    [ 25, 'oklch(60% 0.15 50)' ],
    [ 26, 'oklch(60% 0.15 50 / 0.5)' ],

    /* Relative CSS colors */
    /* HSL hue change */
    [ 27, 'hsl(from red 240deg s l)' ],
    /* HWB alpha channel change */
    [ 28, 'hwb(from green h w b / 0.5)' ],
    /* LCH lightness change */
    [ 29, 'lch(from blue calc(l + 20) c h)' ],

    /* light-dark */
    [ 30, 'light-dark(white, black)' ],
    [ 31, 'light-dark(rgb(255 255 255), rgb(0 0 0))' ],

    // Relative Colors from https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors
    [ 32, 'red' ],
    [ 33, 'rgb(255 0 0)' ],

    // Valid Relative Color Strings
    [ 34, 'rgb(from red 255 0 0)' ], // Absolute overrides
    [ 35, 'rgb(from red 255 0 0 / 1)' ], // Absolute overrides with alpha
    [ 36, 'rgb(from red 255 0 0 / 100%)' ], // Percentage alpha

    [ 37, 'rgb(from red 255 g b)' ], // Mixed: absolute R, relative G and B
    [ 38, 'rgb(from red r 0 0)' ], // Mixed: relative R, absolute G and B
    [ 39, 'rgb(from red r g b / 1)' ], // Relative channels, absolute alpha
    [ 40, 'rgb(from red r g b / 100%)' ], // Relative channels, absolute percentage alpha

    [ 41, 'rgb(from red r g b)' ], // Identity (returns red)
    [ 42, 'rgb(from red r g b / alpha)' ], // Identity including alpha

    /* Interchangeable channels (since red's g and b are both 0) */
    [ 43, 'rgb(from red r g g)' ], // Using green channel for blue
    [ 44, 'rgb(from red r b b)' ], // Using blue channel for green
    [ 45, 'rgb(from red 255 g g)' ], // Absolute R, green channel for blue
    [ 46, 'rgb(from red 255 b b)' ], // Absolute R, blue channel for green
] );

// Helper functions
const ok = <T>( value: T ): Result<T, never> => ( { success: true, value } );

const err = <E>( error: E ): Result<never, E> => ( { success: false, error } );

const strip = {
    charsEOF: ( chars: Char[] ): Char[] => {
        if ( !Array.isArray( chars ) ) return chars;
        return chars.slice( 0, -1 );
    },

    tokensEOF: ( lexer: Lexer ): Lexer => {
        if ( !( lexer instanceof Lexer ) ) return lexer;
        if ( !Array.isArray( lexer.tokens ) ) return lexer;
        lexer.tokens = lexer.tokens.filter( t => t.type !== 'EOF' );
        return lexer;
    },
};

const log = {
    mainTitle: (): void => {
        console.log( '\n' );
        BoxText( 'TESTING', { width: 'max', boxType: BoxType.light } );
    },

    title: ( num: number, str: string ): void => {
        const spacer = ' '.repeat( 12 );
        const styledNum = styleText( [ 'blue', 'bold' ], `Test[${num}]` );
        const styledStr = styleText( [ 'black', 'bgYellow' ], `"${str}"` );
        const styledStrLabel = styleText( [ 'yellow' ], 'Current Input' );
        const result = `${styledNum}: ${spacer}${styledStrLabel}: ${styledStr}`;
        console.log( '\n' );
        BoxText( result, { width: 'max', boxAlign: 'left' } );
    },

    chars: ( chars: Char[] ): void => {
        console.log( 'CHARS:' );
        const strippedEOF = config.display.EOF ? strip.charsEOF( chars ) : chars;
        const options = { ...config.options, showPosition: config.display.pos };
        console.log( inspect( strippedEOF, options ) + '\n' );
    },

    tokens: ( lexer: Lexer ): void => {
        console.log( 'TOKENS:' );
        const strippedEOF = config.display.EOF ? strip.tokensEOF( lexer ) : lexer;
        const options = {
            ...config.options,
            showSpan: config.display.span,
            showMessage: config.display.msg,
        };
        console.log( inspect( strippedEOF, options ) );
    },

    cst: ( parser: Parser ): void => {
        console.log( 'CONCRETE SYNTAX TREE (CST):' );
        const options = {
            ...config.options,
            showSpan: config.display.span,
            showMessage: config.display.msg,
        };
        console.log( inspect( parser, options ) );
    },
};

/**
 * Separates error reporting from the execution logic.
 */
const handleTestError = ( e: Error ) => {
    if ( e instanceof LexerError ) {
        console.error( '\n*** LEXING FAILED ***', e.toString() );
    } else if ( e instanceof ParseError ) {
        console.error( '\n*** PARSING FAILED ***', e.toString() );
    } else {
        console.error( '\n*** UNKNOWN FAILURE ***', e );
    }
};

/**
 * Simplifies the main loop by focusing strictly on the execution flow.
 * Each step only runs if the previous one succeeded and the config allows it.
 */
const runTests = ( testStr: string ): TestResult => {
    try {
        const output: { chars?: Char[]; lexer?: Lexer; parser?: CstNode; } = {};

        if ( config.chars.get ) {
            output.chars = Char.fromString( testStr );
        } else {
            throw new Error(
                'Character processing (config.chars.get) is disabled.',
            );
        }

        if ( config.tokens.get ) {
            output.lexer = new Lexer( output.chars, testStr );
        }

        if ( config.cst.get ) {
            if ( !output.lexer ) {
                throw new Error(
                    'Lexer step must be enabled (config.tokens.get) to generate a CST.',
                );
            }
            output.parser = new Parser( output.lexer.tokens, testStr );
            output.parser.parse();
        }

        if ( Object.keys( output ).length === 0 ) {
            throw new Error(
                'Nothing to do! All processing steps are disabled in the config.',
            );
        }

        return ok( output );
    } catch ( e ) {
        return err( e as LexerError | ParseError );
    }
};

const main = (): void => {
    log.mainTitle();
    for ( const [ testNumber, testStr ] of tests ) {
        if ( config.lastTest && testNumber >= config.lastTest ) break;
        log.title( testNumber, testStr );

        const result = runTests( testStr );

        if ( result.success ) {
            // Check if the value and the corresponding log flag are present
            if ( result.value.chars && config.chars.log ) {
                log.chars( result.value.chars );
            }
            if ( result.value.lexer && config.tokens.log ) {
                log.tokens( result.value.lexer );
            }
            if ( result.value.parser && config.cst.log ) {
                log.cst( result.value.parser );
            }
        } else {
            handleTestError( result.error );
        }
    }
};

main();
console.log( '\n' );
