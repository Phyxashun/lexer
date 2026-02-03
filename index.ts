// ./index.ts

import { styleText, type InspectOptions } from 'node:util';
import { inspect, inspectOptions } from './src/utils/InspectOptions';
import { Char, CharArray } from './src/char/Char';
import { Lexer } from './src/lexer/Lexer';
import { Parser } from './src/parser/Parser';
import { ParseError } from './src/parser/ParseError';
import { LexerError } from './src/lexer/LexerError';
import { BoxText, BoxType } from './src/logger/logger';

type Results = { chars?: Char[]; lexer?: Lexer; parser?: Parser; };

const LAST_TEST = 15;
const SPACER = ( n: number = 1 ) => '\u0020'.repeat( n );

const config = {
    // OPTIONAL: SET THE LAST TEST NUMBER TO EXECUTE
    lastTest: LAST_TEST,

    // CUSTOM INSPECT BREAKLENGTH
    options: { ...inspectOptions, breakLength: 80 } as InspectOptions,

    // OPTIONAL FORMATTING FLAGS:
    display: { EOF: true, pos: true, span: true, msg: true },

    // CHARS
    chars: { get: true, log: true },

    // LEXER/TOKENS
    tokens: { get: false, log: false },

    // PARSER/CST
    cst: { get: false, log: false },
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

const maybeStripEOF = <T> ( value: T, shouldStrip: boolean ): T => {
    if ( !shouldStrip ) return value;

    if ( Array.isArray( value ) ) {
        return value.slice( 0, -1 ) as T;
    }

    if ( value instanceof Lexer && Array.isArray( value.tokens ) ) {
        value.removeEOF();
    }

    return value;
};

const logger = {
    mainTitle: () => {
        console.log( '\n' );
        BoxText( 'TESTING', { width: 'max', boxType: BoxType.light } );
    },

    testTitle: ( num: number, str: string ) => {
        const styledNum = styleText( [ 'blue', 'bold' ], `Test[${ num }]` );
        const styledStr = styleText( [ 'black', 'bgYellow' ], `"${ str }"` );
        const label = styleText( [ 'yellow' ], 'Current Input' );
        console.log( '\n' );
        BoxText( `${ styledNum }: ${ SPACER( 12 ) }${ label }: ${ styledStr }`, {
            width: 'max',
            boxAlign: 'left'
        } );
    },

    section: ( title: string, data: unknown, extraOptions = {} ) => {
        console.log( `${ title }:` );
        console.log( inspect( data, { ...config.options, ...extraOptions } ) );
        if ( title !== 'CONCRETE SYNTAX TREE (CST)' ) console.log();
    },

    error: ( e: Error ) => {
        const message = e instanceof LexerError ? '*** LEXING FAILED ***'
            : e instanceof ParseError ? '*** PARSING FAILED ***'
                : '*** UNKNOWN FAILURE ***';
        console.error( `\n${ message }`, e.toString() );
    }
};

const runTest = ( testStr: string ): Results => {
    const results: Results = {};

    if ( !config.chars.get ) throw new Error( 'Character processing disabled' );
    results.chars = CharArray.fromString( testStr );

    if ( config.tokens.get ) results.lexer = new Lexer( results.chars, testStr );

    if ( config.cst.get ) {
        if ( !results.lexer ) throw new Error( 'Lexer must be enabled to generate CST' );

        results.parser = new Parser( results.lexer.tokens, testStr );
        results.parser.parse();
    }

    return results;
};

const displayResults = ( results: Results ): void => {
    if ( results.chars && config.chars.log ) {
        logger.section(
            'CHARS',
            maybeStripEOF( results.chars, !config.display.EOF ),
            { showPosition: config.display.pos }
        );
    }

    if ( results.lexer && config.tokens.log ) {
        logger.section(
            'TOKENS',
            maybeStripEOF( results.lexer, !config.display.EOF ),
            {
                showSpan: config.display.span,
                showMessage: config.display.msg,
            }
        );
    }

    if ( results.parser && config.cst.log ) {
        logger.section(
            'CONCRETE SYNTAX TREE (CST)',
            results.parser,
            {
                showSpan: config.display.span,
                showMessage: config.display.msg,
            }
        );
    }
};

const main = (): void => {
    logger.mainTitle();

    for ( const [ testNumber, testStr ] of tests ) {
        if ( config.lastTest && testNumber >= config.lastTest ) break;

        logger.testTitle( testNumber, testStr );

        try {
            const results = runTest( testStr );
            displayResults( results );
        } catch ( e ) {
            logger.error( e as Error );
        }
    }

    console.log( '\n' );
};

main();