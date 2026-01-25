// ./src/lexer/State.ts

import { CharType } from '../char/Char';
import { type Token, TokenType } from './Token';

/**
 * Description placeholder
 *
 * @export
 * @enum {number}
 */
export enum State {
    InitialState = 'InitialState',

    Identifier = 'Identifier',
    DashOne = 'DashOne',
    DashTwo = 'DashTwo',

    Number = 'Number',
    Dot = 'Dot',
    Fraction = 'Fraction',
    Slash = 'Slash',

    // Unit DFA
    Dimension = 'Dimension',

    // Hex
    Hash = 'Hash',
    Hex1 = 'Hex1',
    Hex2 = 'Hex2',
    Hex3 = 'Hex3',
    Hex4 = 'Hex4',
    Hex5 = 'Hex5',
    Hex6 = 'Hex6',
    Hex7 = 'Hex7',
    Hex8 = 'Hex8',

    WS = 'WS',

    ErrorChar = 'ErrorChar',
    ErrorToken = 'ErrorToken',
    SYNC = 'SYNC',
    EOF = 'EOF',
}

/**
 * Description placeholder
 *
 * @export
 * @typedef {TransitionTable}
 */
export type TransitionTable = Partial<
    Record<State, Partial<Record<CharType, State>>>
>;

/**
 * Description placeholder
 *
 * @type {TransitionTable}
 */
export const DFA: TransitionTable = {
    [State.InitialState]: {
        [CharType.EOF]: State.EOF,
        [CharType.Whitespace]: State.WS,
        [CharType.NewLine]: State.WS,
        [CharType.Letter]: State.Identifier,
        [CharType.Number]: State.Number,
        [CharType.Dot]: State.Dot,
        [CharType.Minus]: State.DashOne,
        [CharType.Hash]: State.Hash,
        [CharType.LParen]: State.SYNC,
        [CharType.RParen]: State.SYNC,
        [CharType.Comma]: State.SYNC,
        [CharType.Slash]: State.SLASH,
        [CharType.Whitespace]: State.WS,
        [CharType.NewLine]: State.WS,
        [CharType.Percent]: State.SYNC,
    },
    [State.Identifier]: {
        [CharType.Letter]: State.Identifier,
        [CharType.Number]: State.Identifier,
        [CharType.Minus]: State.Identifier,
    },
    [State.DashOne]: {
        // CSS property
        [CharType.Minus]: State.DashTwo,
        // Negative number
        [CharType.Number]: State.Number,
    },
    [State.DashTwo]: {
        [CharType.Letter]: State.DashTwo,
        [CharType.Number]: State.DashTwo,
        [CharType.Minus]: State.DashTwo,
    },

    [State.Number]: {
        [CharType.Number]: State.Number,
        [CharType.Dot]: State.Dot,
        [CharType.Percent]: State.SYNC,
        [CharType.Letter]: State.Dimension,
    },
    [State.Dot]: {
        [CharType.Number]: State.Fraction,
    },
    [State.Fraction]: {
        [CharType.Number]: State.Fraction,
        [CharType.Percent]: State.SYNC,
        [CharType.Letter]: State.Dimension,
    },

    [State.Dimension]: {
        [CharType.Letter]: State.Dimension,
    },

    [State.Hash]: {
        [CharType.Hex]: State.Hex1,
        [CharType.Letter]: State.Hex1,
        [CharType.Number]: State.Hex1,
    },
    [State.Hex1]: {
        [CharType.Hex]: State.Hex2,
        [CharType.Letter]: State.Hex2,
        [CharType.Number]: State.Hex2,
    },
    [State.Hex2]: {
        [CharType.Hex]: State.Hex3,
        [CharType.Letter]: State.Hex3,
        [CharType.Number]: State.Hex3,
    },
    [State.Hex3]: {
        [CharType.Hex]: State.Hex4,
        [CharType.Letter]: State.Hex4,
        [CharType.Number]: State.Hex4,
    },
    [State.Hex4]: {
        [CharType.Hex]: State.Hex5,
        [CharType.Letter]: State.Hex5,
        [CharType.Number]: State.Hex5,
    },
    [State.Hex5]: {
        [CharType.Hex]: State.Hex6,
        [CharType.Letter]: State.Hex6,
        [CharType.Number]: State.Hex6,
    },
    [State.Hex6]: {
        [CharType.Hex]: State.Hex7,
        [CharType.Letter]: State.Hex7,
        [CharType.Number]: State.Hex7,
    },
    [State.Hex7]: {
        [CharType.Hex]: State.Hex8,
        [CharType.Letter]: State.Hex8,
        [CharType.Number]: State.Hex8,
    },
};

/**
 * Description placeholder
 *
 * @type {Partial<Record<State, TokenType>>}
 */
export const ACCEPT: Partial<Record<State, TokenType>> = {
    // identifiers
    [State.Identifier]: TokenType.IDENTIFIER,
    [State.DashTwo]: TokenType.IDENTIFIER,

    // numbers
    [State.Number]: TokenType.NUMBER,
    [State.Fraction]: TokenType.NUMBER,

    // dimensions
    [State.Dimension]: TokenType.DIMENSION,

    // slash
    [State.Slash]: TokenType.SLASH,

    // hex
    [State.Hex3]: TokenType.HEX_COLOR,
    [State.Hex4]: TokenType.HEX_COLOR,
    [State.Hex6]: TokenType.HEX_COLOR,
    [State.Hex8]: TokenType.HEX_COLOR,

    // whitespace
    [State.WS]: TokenType.WHITESPACE,

    // eof
    [State.EOF]: TokenType.EOF,
};

/**
 * A comprehensive set of CSS dimensions available as of 2026,
 * categorized by length, angle, time, resolution, and grIdentifier.
 */
export const DIMENSIONS = new Set([
    // Absolute Lengths
    'px',
    'cm',
    'mm',
    'Q',
    'in',
    'pc',
    'pt',

    // Relative Lengths (Font-based)
    'em',
    'rem',
    'ch',
    'ex',
    'cap',
    'rcap',
    'ic',
    'ric',
    'lh',
    'rlh',

    // Relative Lengths (Viewport-based)
    'vw',
    'vh',
    'vmin',
    'vmax',
    'svw',
    'svh',
    'lvw',
    'lvh',
    'dvw',
    'dvh',
    'vi',
    'vb',

    // Angles
    'deg',
    'rad',
    'grad',
    'turn',

    // Time
    's',
    'ms',

    // Resolution
    'dpi',
    'dpcm',
    'dppx',
    'x',

    // Frequency
    'Hz',
    'kHz',

    // GrIdentifier & Others
    'fr',
    '%',
]);

/**
 * Description placeholder
 *
 * @type {*}
 */
export const KEYWORDS = new Set(['none', 'currentcolor']);

/**
 * Description placeholder
 *
 * @type {*}
 */
export const FUNCTIONS = new Set([
    'rgb',
    'rgba',
    'hsl',
    'hsla',
    'hwb',
    'lab',
    'lch',
    'color',
    'color-mix',
]);

/**
 * Description placeholder
 *
 * @export
 * @param {Token} token
 * @returns {Token}
 */
export function foldIdentifierToken(token: Token): Token {
    const v = token.value.toLowerCase();

    if (FUNCTIONS.has(v)) {
        // Valid Function Tokens
        return { ...token, type: TokenType.FUNCTION, message: 'Function' };
    } else if (KEYWORDS.has(v)) {
        // Valid Keyword Tokens
        return { ...token, type: TokenType.KEYWORD, message: 'Keyword' };
    } else if (DIMENSIONS.has(v)) {
        // Valid Dimension Tokens
        return { ...token, type: TokenType.DIMENSION, message: 'Dimension' };
    } else if (v.startsWith('--')) {
        // Valid Property Tokens
        return { ...token, type: TokenType.PROPERTY, message: 'Property' };
    } else {
        // Invalid identifiers
        return {
            ...token,
            type: TokenType.ERROR,
            message: 'Invalid identifier',
        };
    }
}

/**
 * Description placeholder
 *
 * @export
 * @param {LexerState} state
 * @returns {boolean}
 */
export function isHexState(state: LexerState): boolean {
    const result = state >= LexerState.HEX1 && state <= LexerState.HEX8;
    return result;
}

/**
 * Description placeholder
 *
 * @export
 * @param {LexerState} state
 * @returns {boolean}
 */
export function isValidHexEnd(state: LexerState): boolean {
    return (
        state === LexerState.HEX3 ||
        state === LexerState.HEX4 ||
        state === LexerState.HEX6 ||
        state === LexerState.HEX8
    );
}

/**
 * Description placeholder
 *
 * @export
 * @param {State} state
 * @returns {boolean}
 */
export function isErrorState(state: State): boolean {
    return state === State.ErrorChar || state === State.ErrorToken;
}
