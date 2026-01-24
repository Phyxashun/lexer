#!/usr/bin/env bun
/// <reference types='./logger.d.ts' />
// ./src/logger/Logger.ts

import { styleText } from "node:util";
import figlet from "figlet";
import standard from "figlet/fonts/Standard";

/**
 * Description placeholder
 *
 * @type {100}
 */
export const MAX_WIDTH = 100;
/**
 * Description placeholder
 *
 * @type {4}
 */
export const TAB_WIDTH = 4;
/**
 * Description placeholder
 *
 * @type {" "}
 */
export const SPACE = " ";
/**
 * Description placeholder
 *
 * @type {"Standard"}
 */
export const FIGLET_FONT = "Standard";
figlet.parseFont(FIGLET_FONT, standard);

/**
 * @enum Align
 * @description Enum for different text alignments.
 */
export enum Align {
  left = "left",
  center = "center",
  right = "right",
}

/**
 * @enum Style
 * @description Enum for different text styles.
 */
export enum Style {
  bold = "bold",
  reset = "reset",
  dim = "dim",
  italic = "italic",
  underline = "underline",
  blink = "blink",
  inverse = "inverse",
  hidden = "hidden",
  strikethrough = "strikethrough",
  doubleunderline = "doubleunderline",
}

/**
 * @enum Color
 * @description Enum for different text colors.
 */
export enum Color {
  green = "green",
  red = "red",
  yellow = "yellow",
  cyan = "cyan",
  black = "black",
  blue = "blue",
  magenta = "magenta",
  white = "white",
  gray = "gray",
  redBright = "redBright",
  greenBright = "greenBright",
  yellowBright = "yellowBright",
  blueBright = "blueBright",
  magentaBright = "magentaBright",
  cyanBright = "cyanBright",
  whiteBright = "whiteBright",
}

/**
 * @enum BackgroundColor
 * @description Enum for different background colors.
 */
export enum BackgroundColor {
  bgGreen = "bgGreen",
  bgRed = "bgRed",
  bgYellow = "bgYellow",
  bgCyan = "bgCyan",
  bgBlack = "bgBlack",
  bgBlue = "bgBlue",
  bgMagenta = "bgMagenta",
  bgWhite = "bgWhite",
  bgGray = "bgGray",
  bgRedBright = "bgRedBright",
  bgGreenBright = "bgGreenBright",
  bgYellowBright = "bgYellowBright",
  bgBlueBright = "bgBlueBright",
  bgMagentaBright = "bgMagentaBright",
  bgCyanBright = "bgCyanBright",
  bgWhiteBright = "bgWhiteBright",
}

/**
 * @enum LineType
 * @description Enum for different line types.
 */
export enum LineType {
  default = "─",
  dashed = "-",
  underscore = "_",
  doubleUnderscore = "‗",
  equals = "=",
  double = "═",
  diaeresis = "¨",
  macron = "¯",
  section = "§",
  interpunct = "·",
  lightBlock = "░",
  mediumBlock = "▒",
  heavyBlock = "▓",
  boldBlock = "█",
  boldSquare = "■",
  boldBottom = "▄",
  boldTop = "▀",
}

/**
 * @enum BoxStyle
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
 * @type BoxPartKeys
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
    tl: "┌",
    t: "─",
    tr: "┐",
    l: "│",
    r: "│",
    bl: "└",
    b: "─",
    br: "┘",
  },
  [BoxType.double]: {
    tl: "╔",
    t: "═",
    tr: "╗",
    l: "║",
    r: "║",
    bl: "╚",
    b: "═",
    br: "╝",
  },
  [BoxType.light]: {
    tl: "░",
    t: "░",
    tr: "░",
    l: "░",
    r: "░",
    bl: "░",
    b: "░",
    br: "░",
  },
  [BoxType.medium]: {
    tl: "▒",
    t: "▒",
    tr: "▒",
    l: "▒",
    r: "▒",
    bl: "▒",
    b: "▒",
    br: "▒",
  },
  [BoxType.heavy]: {
    tl: "▓",
    t: "▓",
    tr: "▓",
    l: "▓",
    r: "▓",
    bl: "▓",
    b: "▓",
    br: "▓",
  },
  [BoxType.bold]: {
    tl: "█",
    t: "█",
    tr: "█",
    l: "█",
    r: "█",
    bl: "█",
    b: "█",
    br: "█",
  },
  [BoxType.half]: {
    tl: "▄",
    t: "▄",
    tr: "▄",
    l: "█",
    r: "█",
    bl: "▀",
    b: "▀",
    br: "▀",
  },
  [BoxType.star]: {
    tl: "*",
    t: "*",
    tr: "*",
    l: "*",
    r: "*",
    bl: "*",
    b: "*",
    br: "*",
  },
  [BoxType.circle]: {
    tl: "●",
    t: "●",
    tr: "●",
    l: "●",
    r: "●",
    bl: "●",
    b: "●",
    br: "●",
  },
  [BoxType.square]: {
    tl: "■",
    t: "■",
    tr: "■",
    l: "■",
    r: "■",
    bl: "■",
    b: "■",
    br: "■",
  },
  [BoxType.hash]: {
    tl: "#",
    t: "#",
    tr: "#",
    l: "#",
    r: "#",
    bl: "#",
    b: "#",
    br: "#",
  },
} as const;

/**
 * @constant THEMES
 * @description Predefined themes for PrintLine.
 */
export const Themes: Record<string, Theme> = {
  Success: { color: "green", line: LineType.default, styles: ["bold"] },
  Error: { color: "red", line: LineType.boldBlock },
  Warning: { color: "yellow", line: LineType.dashed },
  Info: { color: "cyan", line: LineType.default },
} as const;

/**
 * Description placeholder
 *
 * @type {{ readonly default: 80; readonly tight: "tight"; readonly max: "max"; }}
 */
export const Width = {
  default: 80,
  tight: "tight",
  max: "max",
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
  // Remove any existing styling for accurate length calculation
  const ansiRegex = new RegExp("\\x1b\\[[0-9;]*m", "g");
  const unstyledText = text.replace(ansiRegex, "");
  const padding = Math.max(0, Math.floor((width - unstyledText.length) / 2));
  return `${Spacer(padding)}${text}`;
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
    .split("\n")
    .map((line) => CenterText(line, width))
    .join("\n");
};

/**
 * @function PrintLine
 * @description Outputs a styled horizontal line to the console.
 * @param {PrintLineOptions} [options={}] - Configuration options for the line.
 * @returns {string}
 */
export const PrintLine = (options: PrintLineOptions = {}): string => {
  /**
   * @description Default options object for the printLine function.
   */
  const defaultOptions: PrintLineOptions = {
    preNewLine: false,
    postNewLine: false,
    width: MAX_WIDTH,
    lineType: LineType.double,
    color: [Color.gray, Style.bold],
    textAlign: Align.center,
  } as const;

  const themeOptions = options.theme ? (Themes as unknown)[options.theme] : {};
  const mergedOptions = {
    ...defaultOptions,
    ...themeOptions,
    ...options,
  };
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
  }: PrintLineOptions = mergedOptions;

  const colorStyles = color ? (Array.isArray(color) ? color : [color]) : [];
  const bgColorStyles = bgColor
    ? Array.isArray(bgColor)
      ? bgColor
      : [bgColor]
    : [];
  const otherStyles = styles ?? [];
  // eslint-disable-next-line @typescript-eslint/no-misused-spread
  const lineStyles = [...colorStyles, ...bgColorStyles, ...otherStyles];
  const textStyles = textColor
    ? Array.isArray(textColor)
      ? textColor
      : [textColor]
    : lineStyles;
  const pre = preNewLine ? "\n" : "";
  const post = postNewLine ? "\n" : "";
  let finalOutput: string;

  if (gradient) {
    const [startColor, endColor] = gradient;
    const halfWidth = Math.floor(width / 2);

    const startSegment = styleText([startColor], lineType?.repeat(halfWidth));
    const endSegment = styleText(
      [endColor],
      lineType?.repeat(width - halfWidth),
    );

    const styledDivider = startSegment + endSegment;

    const result = `${pre}${styledDivider}${post}`;
    console.log(result);
    return result;
  }

  if (!text) {
    // Simple case: No text, just style the whole line as before.
    finalOutput = styleText(lineStyles, lineType?.repeat(width));
  } else {
    // Advanced case: Text exists, so build the line in pieces.
    const paddedText = ` ${text} `; // Add padding

    // Style the text separately
    const styledText = styleText(textStyles, paddedText);

    const lineCharCount = width - paddedText.length;
    if (lineCharCount < 0) {
      // If the text is too long, just print the styled text.
      finalOutput = styledText;
    } else {
      // Otherwise, calculate and style the line segments.
      switch (textAlign) {
        case "left": {
          const rightLine = styleText(
            lineStyles,
            lineType?.repeat(lineCharCount),
          );
          finalOutput = styledText + rightLine;
          break;
        }
        case "right": {
          const leftLine = styleText(
            lineStyles,
            lineType?.repeat(lineCharCount),
          );
          finalOutput = leftLine + styledText;
          break;
        }
        case "center":
        default: {
          const leftCount = Math.floor(lineCharCount / 2);
          const rightCount = lineCharCount - leftCount;
          const leftLine = styleText(lineStyles, lineType?.repeat(leftCount));
          const rightLine = styleText(lineStyles, lineType?.repeat(rightCount));
          finalOutput = leftLine + styledText + rightLine;
          break;
        }
      }
    }
  }

  // 5. Log the final constructed string
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
  /**
   * @description Default options object for the printLine function.
   */
  const defaultOptions: BoxTextOptions = {
    width: Width.tight,
    preNewLine: false,
    postNewLine: false,
    boxType: BoxType.single,
    boxAlign: Align.center,
    color: [Color.gray, Style.bold],
    textColor: Color.white,
  } as const;

  const themeOptions = options.theme ? (Themes as unknown)[options.theme] : {};
  const mergedOptions = {
    ...defaultOptions,
    ...themeOptions,
    ...options,
  };
  const {
    width,
    preNewLine,
    postNewLine,
    boxType,
    boxAlign,
    color,
    bgColor,
    textColor,
    textBgColor,
    styles,
  }: BoxTextOptions = mergedOptions;

  const boxChars = BoxStyles[boxType] as BoxParts;

  // Prepare Separate Styles for Box and Text
  const boxFinalStyles = [
    ...(color ? (Array.isArray(color) ? color : [color]) : []),
    ...(bgColor ? (Array.isArray(bgColor) ? bgColor : [bgColor]) : []),
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    ...(styles ?? []),
  ];

  // If text styles aren't provided, they default to the box styles
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
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    ...(styles ?? []),
  ];

  // Calculate Content Width and Wrap Text
  let contentWidth: number;
  let textLines: string[];

  // Add this helper inside BoxText, right after the options destructuring
  const stripAnsi = (str: string): string => str.replace(/\x1b\[[0-9;]*m/g, "");

  if (Array.isArray(text)) {
    textLines = text;
    contentWidth = Math.max(...textLines.map((line) => stripAnsi(line).length));

    // If a fixed width is requested, we use it instead of the longest line
    if (typeof width === "number") {
      contentWidth = width - 4;
    } else if (width === Width.max) {
      contentWidth = MAX_WIDTH - 4;
    }
  } else {
    if (width === "max") {
      contentWidth = MAX_WIDTH - 4;
    } else if (typeof width === "number") {
      if (width <= 4) throw new Error("Custom width must be greater than 4.");
      contentWidth = width - 4;
    } else {
      textLines = text.split("\n");
      contentWidth = Math.max(...textLines.map((line) => line.length));
    }

    if (width !== "tight") {
      const words: string[] = text.split(/\s+/);
      textLines = words.reduce<string[]>((lines: string[], word: string) => {
        if (lines.length === 0) return [word];
        const lastLine: number = lines[lines.length - 1];
        const lastLineLength: number = lastLine.length;
        const wordLength: number = word.length;
        if (lastLineLength + wordLength + 1 > contentWidth) {
          lines.push(word);
        } else {
          lines[lines.length - 1] = lastLine.toString() + " " + word;
        }
        return lines;
      }, []);
    } else {
      textLines = text.split("\n");
    }
  }

  // Calculate Outer Alignment Padding
  const fullBoxWidth = contentWidth + 4; // Border(1) + Space(1) + Content + Space(1) + Border(1)
  let leftPaddingAmount = 0;

  if (boxAlign === "center") {
    leftPaddingAmount = Math.max(0, Math.floor((MAX_WIDTH - fullBoxWidth) / 2));
  } else if (boxAlign === "right") {
    leftPaddingAmount = Math.max(0, MAX_WIDTH - fullBoxWidth);
  }

  const outerPadding = " ".repeat(leftPaddingAmount);

  // Build Box Components
  const centerAlign = (str: string, width: number): string => {
    const padding = Math.floor((width - str.length) / 2);
    return " ".repeat(padding) + str + " ".repeat(width - str.length - padding);
  };

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const styledTop = styleText(
    boxFinalStyles,
    boxChars.tl + boxChars.t.repeat(contentWidth + 2) + boxChars.tr,
  );
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const styledBottom = styleText(
    boxFinalStyles,
    boxChars.bl + boxChars.b.repeat(contentWidth + 2) + boxChars.br,
  );
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const styledLeftBorder = styleText(boxFinalStyles, boxChars.l + " ");
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const styledRightBorder = styleText(boxFinalStyles, " " + boxChars.r);

  // Assemble lines with outer padding
  const styledContentLines = textLines.map((line) => {
    const centeredText = centerAlign(line, contentWidth);
    const styledText = styleText(textFinalStyles, centeredText);
    return outerPadding + styledLeftBorder + styledText + styledRightBorder;
  });

  const fullBoxString = [
    outerPadding + styledTop,
    ...styledContentLines,
    outerPadding + styledBottom,
  ].join("\n");

  const pre = preNewLine ? "\n" : "";
  const post = postNewLine ? "\n" : "";
  console.log(`${pre}${fullBoxString}${post}`);
};

/**
 * @function CenteredText
 * @description Outputs centered text to the console.
 * @param {string} text - The text to center and print.
 */
export const CenteredText = (text: string): void => {
  console.log(CenterText(text));
};
