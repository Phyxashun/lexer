// ./src/lexer/State.ts

import { CharType } from '../char/Char';
import { type Token, TokenType } from './Token';

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

export type TransitionTable = Partial<
    Record<State, Partial<Record<CharType, State>>>
>;

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
        [CharType.Slash]: State.SYNC,
        [CharType.Plus]: State.SYNC,
        [CharType.Star]: State.SYNC,
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

export const ACCEPT: Partial<Record<State, TokenType>> = {
    // identifiers
    [State.Identifier]: TokenType.IDENTIFIER,
    [State.DashTwo]: TokenType.IDENTIFIER,

    // numbers
    [State.Number]: TokenType.NUMBER,
    [State.Fraction]: TokenType.NUMBER,

    // dimensions
    [State.Dimension]: TokenType.DIMENSION,

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

export const CHANNELS = new Map<string, Set>([
    ['rgb', ['r', 'g', 'b']],
    ['rgba', ['r', 'g', 'b']],
    ['hsl', ['h', 's', 'l']],
    ['hwb', ['h', 'w', 'b']],
    ['lab', ['l', 'a', 'b']],
    ['lch', ['l', 'c', 'h']],
    ['oklab', ['l', 'a', 'b']],
    ['oklch', ['l', 'c', 'h']],
    ['alpha', ['alpha']],
]);

export const ALL_CHANNELS = new Set(Array.from(CHANNELS.values()).flat());

export const FUNCTIONS = new Set([
    'rgb',
    'rgba',
    'hsl',
    'hsla',
    'hwb',
    'lab',
    'lch',
    'oklab',
    'oklch',
    'ictcp',
    'jzazbz',
    'jzczhx',
    'alpha',
    'color',
    'color-mix',
    'light-dark',
    'var',
    'calc',
]);

export const KEYWORDS = new Set([
    'none',
    'currentcolor',
    'from',
    'transparent',
    'e',
    'pi',
    'infinity',
    '-infinity',
    'NaN',
]);

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

export const SYSTEMCOLORS = new Set([
    'AccentColor',
    'AccentColorText',
    'ActiveText',
    'ButtonBorder',
    'ButtonFace',
    'ButtonText',
    'Canvas',
    'CanvasText',
    'Field',
    'FieldText',
    'GrayText',
    'Highlight',
    'HighlightText',
    'LinkText',
    'Mark',
    'MarkText',
    'SelectedItem',
    'SelectedItemText',
    'VisitedText',
]);

export const COLORS = new Set([
    // Standard Colors
    'black',
    'silver',
    'gray',
    'white',
    'maroon',
    'red',
    'purple',
    'fuchsia',
    'green',
    'lime',
    'olive',
    'yellow',
    'navy',
    'blue',
    'teal',
    'aqua',
    // Recognized Colors
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkgrey',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'grey',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'rebeccapurple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
]);

export const DEPRECATEDCOLORS = new Set([
    'ActiveBorder',
    'ActiveCaption',
    'AppWorkspace',
    'Background',
    'ButtonHighlight',
    'ButtonShadow',
    'CaptionText',
    'InactiveBorder',
    'InactiveCaption',
    'InactiveCaptionText',
    'InfoBackground',
    'InfoText',
    'Menu',
    'MenuText',
    'Scrollbar',
    'ThreeDDarkShadow',
    'ThreeDFace',
    'ThreeDHighlight',
    'ThreeDLightShadow',
    'ThreeDShadow',
    'Window',
    'WindowFrame',
    'WindowText',
]);

export function foldIdentifierToken(token: Token): Token {
    const v = token.value.toLowerCase();
    let type: TokenType;

    if (ALL_CHANNELS.has(v)) type = TokenType.CHANNEL;
    else if (FUNCTIONS.has(v)) type = TokenType.FUNCTION;
    else if (KEYWORDS.has(v)) type = TokenType.KEYWORD;
    else if (DIMENSIONS.has(v)) type = TokenType.DIMENSION;
    else if (SYSTEMCOLORS.has(v)) type = TokenType.KEYWORD;
    else if (COLORS.has(v)) type = TokenType.COLOR;
    else if (v.startsWith('--')) type = TokenType.PROPERTY;
    else type = TokenType.ERROR;

    if (DEPRECATEDCOLORS.has(v)) type = TokenType.ERROR;

    return {
        ...token,
        type,
        message: type === TokenType.ERROR ? 'Unknown identifier' : type,
    };
}

export function isHexState(state: LexerState): boolean {
    const result = state >= LexerState.HEX1 && state <= LexerState.HEX8;
    return result;
}

export function isValidHexEnd(state: LexerState): boolean {
    return (
        state === LexerState.HEX3 ||
        state === LexerState.HEX4 ||
        state === LexerState.HEX6 ||
        state === LexerState.HEX8
    );
}

export function isErrorState(state: State): boolean {
    return state === State.ErrorChar || state === State.ErrorToken;
}
