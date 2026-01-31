#!/usr/bin/env bun
/// <reference types='./logger.d.ts' />

// ./src/logger/Logger.ts

import { styleText } from 'node:util';
import figlet from 'figlet';
import standard from 'figlet/fonts/Standard';

/**
 * @description CONSTANTS.
 */
export const MAX_WIDTH = 100;
export const TAB_WIDTH = 4;
export const SPACE = ' ';
export const FIGLET_FONT = 'Standard';

/**
 * @description Default font to use with figlet.
 */
figlet.parseFont(FIGLET_FONT, standard);

/**
 * @enum Align
 * @description Enum for different text alignments.
 */
export enum Align {
    left = 'left',
    center = 'center',
    right = 'right',
}

/**
 * @enum Style
 * @description Enum for different text styles.
 */
export enum Style {
    bold = 'bold',
    reset = 'reset',
    dim = 'dim',
    italic = 'italic',
    underline = 'underline',
    blink = 'blink',
    inverse = 'inverse',
    hidden = 'hidden',
    strikethrough = 'strikethrough',
    doubleunderline = 'doubleunderline',
}

/**
 * @enum Color
 * @description Enum for different text colors.
 */
export enum Color {
    green = 'green',
    red = 'red',
    yellow = 'yellow',
    cyan = 'cyan',
    black = 'black',
    blue = 'blue',
    magenta = 'magenta',
    white = 'white',
    gray = 'gray',
    redBright = 'redBright',
    greenBright = 'greenBright',
    yellowBright = 'yellowBright',
    blueBright = 'blueBright',
    magentaBright = 'magentaBright',
    cyanBright = 'cyanBright',
    whiteBright = 'whiteBright',
}

/**
 * @enum BackgroundColor
 * @description Enum for different background colors.
 */
export enum BackgroundColor {
    bgGreen = 'bgGreen',
    bgRed = 'bgRed',
    bgYellow = 'bgYellow',
    bgCyan = 'bgCyan',
    bgBlack = 'bgBlack',
    bgBlue = 'bgBlue',
    bgMagenta = 'bgMagenta',
    bgWhite = 'bgWhite',
    bgGray = 'bgGray',
    bgRedBright = 'bgRedBright',
    bgGreenBright = 'bgGreenBright',
    bgYellowBright = 'bgYellowBright',
    bgBlueBright = 'bgBlueBright',
    bgMagentaBright = 'bgMagentaBright',
    bgCyanBright = 'bgCyanBright',
    bgWhiteBright = 'bgWhiteBright',
}

/**
 * @enum LineType
 * @description Enum for different line types.
 */
export enum LineType {
    default = '─',
    dashed = '-',
    underscore = '_',
    doubleUnderscore = '‗',
    equals = '=',
    double = '═',
    diaeresis = '¨',
    macron = '¯',
    section = '§',
    interpunct = '·',
    lightBlock = '░',
    mediumBlock = '▒',
    heavyBlock = '▓',
    boldBlock = '█',
    boldSquare = '■',
    boldBottom = '▄',
    boldTop = '▀',
}

/**
 * @enum BoxType
 * @description Enum for different box styles.
 */
export enum BoxType {
    single,
    double,
    light,
    medium,
    heavy,
    bold,
    half,
    star,
    circle,
    square,
    hash,
}

/**
 * @type BoxPart
 * @description Type defining the keys for box parts.
 */
export enum BoxPart {
    tl,
    t,
    tr,
    l,
    r,
    bl,
    b,
    br,
}

/**
 * @constant BoxStyles
 * @description Predefined box styles with their corresponding characters.
 */
export const BoxStyles: Record<BoxType, BoxParts> = {
    [BoxType.single]: {
        tl: '┌',
        t: '─',
        tr: '┐',
        l: '│',
        r: '│',
        bl: '└',
        b: '─',
        br: '┘',
    },
    [BoxType.double]: {
        tl: '╔',
        t: '═',
        tr: '╗',
        l: '║',
        r: '║',
        bl: '╚',
        b: '═',
        br: '╝',
    },
    [BoxType.light]: {
        tl: '░',
        t: '░',
        tr: '░',
        l: '░',
        r: '░',
        bl: '░',
        b: '░',
        br: '░',
    },
    [BoxType.medium]: {
        tl: '▒',
        t: '▒',
        tr: '▒',
        l: '▒',
        r: '▒',
        bl: '▒',
        b: '▒',
        br: '▒',
    },
    [BoxType.heavy]: {
        tl: '▓',
        t: '▓',
        tr: '▓',
        l: '▓',
        r: '▓',
        bl: '▓',
        b: '▓',
        br: '▓',
    },
    [BoxType.bold]: {
        tl: '█',
        t: '█',
        tr: '█',
        l: '█',
        r: '█',
        bl: '█',
        b: '█',
        br: '█',
    },
    [BoxType.half]: {
        tl: '▄',
        t: '▄',
        tr: '▄',
        l: '█',
        r: '█',
        bl: '▀',
        b: '▀',
        br: '▀',
    },
    [BoxType.star]: {
        tl: '*',
        t: '*',
        tr: '*',
        l: '*',
        r: '*',
        bl: '*',
        b: '*',
        br: '*',
    },
    [BoxType.circle]: {
        tl: '●',
        t: '●',
        tr: '●',
        l: '●',
        r: '●',
        bl: '●',
        b: '●',
        br: '●',
    },
    [BoxType.square]: {
        tl: '■',
        t: '■',
        tr: '■',
        l: '■',
        r: '■',
        bl: '■',
        b: '■',
        br: '■',
    },
    [BoxType.hash]: {
        tl: '#',
        t: '#',
        tr: '#',
        l: '#',
        r: '#',
        bl: '#',
        b: '#',
        br: '#',
    },
} as const;

/**
 * @constant THEMES
 * @description Predefined themes for PrintLine.
 */
export const Themes: Record<string, Theme> = {
    Success: { color: 'green', line: LineType.default, styles: ['bold'] },
    Error: { color: 'red', line: LineType.boldBlock },
    Warning: { color: 'yellow', line: LineType.dashed },
    Info: { color: 'cyan', line: LineType.default },
} as const;

/**
 * Description placeholder
 *
 * @type {{ readonly default: 80; readonly tight: "tight"; readonly max: "max"; }}
 */
export const Width = {
    default: 80,
    tight: 'tight',
    max: 'max',
} as const;

/**
 * @function Spacer
 * @description Creates a string of repeated characters, useful for padding.
 * @param {number} [width=TAB_WIDTH] - Number of characters to repeat.
 * @param {string} [char=SPACE] - The character to repeat.
 * @returns {string} A string of repeated characters.
 */
export const Spacer = (
    width: number = TAB_WIDTH,
    char: string = SPACE,
): string => char.repeat(width);

/**
 * @function CenterText
 * @description Centers a line of text within a given width by adding padding.
 * @param {string} text - The text to center.
 * @param {number} [width=MAX_WIDTH] - The total width to center within.
 * @returns {string} The centered text string.
 * @requires spacer - Function that return a string for spacing.
 */
export const CenterText = (text: string, width: number = MAX_WIDTH): string => {
    const ansiRegex = new RegExp('\\x1b\\[[0-9;]*m', 'g');
    const unstyledText = text.replace(ansiRegex, '');
    const padding = Math.max(0, Math.floor((width - unstyledText.length) / 2));
    return `${Spacer(padding)}${text}`;
};

/**
 * @function CenteredText
 * @description Outputs centered text to the console.
 * @param {string} text - The text to center and print.
 */
export const CenteredText = (text: string): void => {
    console.log(CenterText(text));
};

/**
 * @function CenteredFiglet
 * @description Generates and centers multi-line FIGlet (ASCII) text.
 * @param {string} text - The text to convert to ASCII art.
 * @param {number} [width=MAX_WIDTH] - The total width to center the art within.
 * @returns {string} The centered, multi-line ASCII art as a single string.
 * @requires centerText
 */
export const CenteredFiglet = (
    text: string,
    width: number = MAX_WIDTH,
): string => {
    const rawFiglet = figlet.textSync(text, {
        font: FIGLET_FONT,
        width: width,
        whitespaceBreak: true,
    });
    return rawFiglet
        .split('\n')
        .map(line => CenterText(line, width))
        .join('\n');
};

/**
 * @function PrintLine
 * @description Outputs a styled horizontal line to the console.
 * @param {PrintLineOptions} [options={}] - Configuration options for the line.
 * @returns {string}
 */
export const PrintLine = (options: PrintLineOptions = {}): string => {
    const defaultOptions: PrintLineOptions = {
        preNewLine: false,
        postNewLine: false,
        width: MAX_WIDTH,
        lineType: LineType.double,
        color: [Color.gray, Style.bold],
        textAlign: Align.center,
    } as const;
    const themeOptions = options.theme
        ? (Themes as unknown)[options.theme]
        : {};
    const mergedOptions = { ...defaultOptions, ...themeOptions, ...options };
    const {
        width,
        preNewLine,
        postNewLine,
        lineType,
        color,
        bgColor,
        gradient,
        styles,
        text,
        textColor,
        textAlign,
    } = mergedOptions;
    const colorStyles = color ? (Array.isArray(color) ? color : [color]) : [];
    const bgColorStyles = bgColor
        ? Array.isArray(bgColor)
            ? bgColor
            : [bgColor]
        : [];
    const otherStyles = styles ?? [];
    const lineStyles = [...colorStyles, ...bgColorStyles, ...otherStyles];
    const textStyles = textColor
        ? Array.isArray(textColor)
            ? textColor
            : [textColor]
        : lineStyles;
    const pre = preNewLine ? '\n' : '';
    const post = postNewLine ? '\n' : '';

    let finalOutput: string;
    if (gradient) {
        const [startColor, endColor] = gradient;
        const halfWidth = Math.floor(width / 2);
        const startSegment = styleText(
            [startColor],
            lineType?.repeat(halfWidth),
        );
        const endSegment = styleText(
            [endColor],
            lineType?.repeat(width - halfWidth),
        );
        finalOutput = startSegment + endSegment;
    } else if (!text) {
        finalOutput = styleText(lineStyles, lineType?.repeat(width));
    } else {
        const paddedText = ` ${text} `;
        const styledText = styleText(textStyles, paddedText);
        const lineCharCount = width - paddedText.length;
        if (lineCharCount < 0) {
            finalOutput = styledText;
        } else {
            switch (textAlign) {
                case 'left': {
                    const rightLine = styleText(
                        lineStyles,
                        lineType?.repeat(lineCharCount),
                    );
                    finalOutput = styledText + rightLine;
                    break;
                }
                case 'right': {
                    const leftLine = styleText(
                        lineStyles,
                        lineType?.repeat(lineCharCount),
                    );
                    finalOutput = leftLine + styledText;
                    break;
                }
                case 'center':
                default: {
                    const leftCount = Math.floor(lineCharCount / 2);
                    const rightCount = lineCharCount - leftCount;
                    const leftLine = styleText(
                        lineStyles,
                        lineType?.repeat(leftCount),
                    );
                    const rightLine = styleText(
                        lineStyles,
                        lineType?.repeat(rightCount),
                    );
                    finalOutput = leftLine + styledText + rightLine;
                    break;
                }
            }
        }
    }
    const result = `${pre}${finalOutput}${post}`;
    console.log(result);
    return result;
};

/**
 * @function BoxText
 * @description Draws a styled ASCII box around a given text string and prints it to the console.
 * @param {string | string[]} text - The text to be enclosed in the box.
 * @param {BoxTextOptions} [options={}] - Configuration options for the box.
 * @returns {string}
 */
export const BoxText = (
    text: string | string[],
    options: BoxTextOptions = {},
): void => {
    const defaultOptions: BoxTextOptions = {
        width: Width.tight,
        preNewLine: false,
        postNewLine: false,
        boxType: BoxType.single,
        boxAlign: Align.center,
        textAlign: 'center',
        color: [Color.gray, Style.bold],
        textColor: Color.white,
    } as const;
    const themeOptions = options.theme
        ? (Themes as unknown)[options.theme]
        : {};
    const mergedOptions = { ...defaultOptions, ...themeOptions, ...options };
    const {
        width,
        preNewLine,
        postNewLine,
        boxType,
        boxAlign,
        textAlign,
        color,
        bgColor,
        textColor,
        textBgColor,
        styles,
    } = mergedOptions;

    const boxChars = BoxStyles[boxType] as BoxParts;
    const boxFinalStyles = [
        ...(color ? (Array.isArray(color) ? color : [color]) : []),
        ...(bgColor ? (Array.isArray(bgColor) ? bgColor : [bgColor]) : []),
        ...(styles ?? []),
    ];
    const textFinalStyles = [
        ...(textColor
            ? Array.isArray(textColor)
                ? textColor
                : [textColor]
            : boxFinalStyles),
        ...(textBgColor
            ? Array.isArray(textBgColor)
                ? textBgColor
                : [textBgColor]
            : []),
    ];

    const stripAnsi = (str: string): string =>
        str.replace(/\x1b\[[0-9;]*m/g, '');
    const expandTabs = (str: string, tabWidth: number = 8): string => {
        if (str.indexOf('\t') === -1) return str;
        let output = '';
        str.split('\t').forEach((part, i, arr) => {
            output += part;
            if (i < arr.length - 1) {
                const spaces = tabWidth - (stripAnsi(output).length % tabWidth);
                output += ' '.repeat(spaces > 0 ? spaces : tabWidth);
            }
        });
        return output;
    };

    const initialText = expandTabs(
        Array.isArray(text) ? text.join('\n') : text,
    );
    let contentWidth: number;
    let textLines: string[];

    if (width === 'max') {
        contentWidth = MAX_WIDTH - 4;
    } else if (typeof width === 'number') {
        contentWidth = width - 4;
    } else {
        // 'tight'
        contentWidth = Math.max(
            ...initialText.split('\n').map(line => stripAnsi(line).length),
        );
    }

    if (width !== 'tight') {
        const potentialLines = initialText.split('\n');
        textLines = [];
        for (const line of potentialLines) {
            if (stripAnsi(line).length > contentWidth) {
                const words = line.split(' ');
                const newLines = words.reduce<string[]>((acc, word) => {
                    if (acc.length === 0) return [word];
                    const last = acc[acc.length - 1];
                    if (
                        stripAnsi(last).length + stripAnsi(word).length + 1 >
                        contentWidth
                    ) {
                        acc.push(word);
                    } else {
                        acc[acc.length - 1] = last + ' ' + word;
                    }
                    return acc;
                }, []);
                textLines.push(...newLines);
            } else {
                textLines.push(line);
            }
        }
    } else {
        textLines = initialText.split('\n');
    }

    const fullBoxWidth = contentWidth + 4;
    let outerPadding = '';
    if (boxAlign === 'center') {
        outerPadding = ' '.repeat(Math.floor((MAX_WIDTH - fullBoxWidth) / 2));
    } else if (boxAlign === 'right') {
        outerPadding = ' '.repeat(MAX_WIDTH - fullBoxWidth);
    }

    const leftAlign = (s: string, w: number) =>
        s + ' '.repeat(Math.max(0, w - stripAnsi(s).length));
    const rightAlign = (s: string, w: number) =>
        ' '.repeat(Math.max(0, w - stripAnsi(s).length)) + s;
    const centerAlign = (s: string, w: number) => {
        const len = stripAnsi(s).length;
        const left = Math.floor((w - len) / 2);
        const right = w - len - left;
        return (
            ' '.repeat(Math.max(0, left)) + s + ' '.repeat(Math.max(0, right))
        );
    };

    const styledTop = styleText(
        boxFinalStyles,
        boxChars.tl + boxChars.t.repeat(contentWidth + 2) + boxChars.tr,
    );
    const styledBottom = styleText(
        boxFinalStyles,
        boxChars.bl + boxChars.b.repeat(contentWidth + 2) + boxChars.br,
    );
    const styledLeftBorder = styleText(boxFinalStyles, boxChars.l + ' ');
    const styledRightBorder = styleText(boxFinalStyles, ' ' + boxChars.r);

    const styledContentLines = textLines.map(line => {
        let alignedText: string;
        switch (textAlign) {
            case 'left':
                alignedText = leftAlign(line, contentWidth);
                break;
            case 'right':
                alignedText = rightAlign(line, contentWidth);
                break;
            default:
                alignedText = centerAlign(line, contentWidth);
                break;
        }
        const styledText = styleText(textFinalStyles, alignedText);
        return outerPadding + styledLeftBorder + styledText + styledRightBorder;
    });

    const fullBoxString = [
        outerPadding + styledTop,
        ...styledContentLines,
        outerPadding + styledBottom,
    ].join('\n');
    const pre = preNewLine ? '\n' : '';
    const post = postNewLine ? '\n' : '';
    console.log(`${pre}${fullBoxString}${post}`);
};

