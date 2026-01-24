// ./src/char/Char.ts

import { inspect, type InspectOptions } from "node:util";

/*
interface InspectOptions {
    // The length at which input values are split across multiple lines. Set to Infinity to format the input as a single line (in combination with compact set to true or any number >= 1).
    breakLength?: number;

    // If true, the output is styled with ANSI color codes. Colors are customizable.
    colors?: boolean;

    // Setting this to false causes each object key to be displayed on a new line. It will also add new lines to text that is longer than breakLength. If set to a number, the most n inner elements are united on a single line as long as all properties fit into breakLength. Short array elements are also grouped together. Note that no text will be reduced below 16 characters, no matter the breakLength size. For more information, see the example below.
    compact?: number | boolean;

    // If false, [util.inspect.custom](depth, opts, inspect) functions are not invoked.
    customInspect?: boolean;

    // Specifies the number of times to recurse while formatting object. This is useful for inspecting large objects. To recurse up to the maximum call stack size pass Infinity or null.
    depth?: null | number;

    // If set to true, getters are going to be inspected as well. If set to 'get' only getters without setter are going to be inspected. If set to 'set' only getters having a corresponding setter are going to be inspected. This might cause side effects depending on the getter function.
    getters?: boolean | 'get' | 'set';

    // Specifies the maximum number of Array, TypedArray, WeakMap, and WeakSet elements to include when formatting. Set to null or Infinity to show all elements. Set to 0 or negative to show no elements.
    maxArrayLength?: null | number;

    // Specifies the maximum number of characters to include when formatting. Set to null or Infinity to show all elements. Set to 0 or negative to show no characters.
    maxStringLength?: null | number;

    // If set to true, an underscore is used to separate every three digits in all bigints and numbers.
    numericSeparator?: boolean;

    // If true, object's non-enumerable symbols and properties are included in the formatted result. WeakMap and WeakSet entries are also included as well as user defined prototype properties (excluding method properties).
    showHidden?: boolean;

    // If true, Proxy inspection includes the target and handler objects.
    showProxy?: boolean;

    // If set to true or a function, all properties of an object, and Set and Map entries are sorted in the resulting string. If set to true the default sort is used. If set to a function, it is used as a compare function.
    sorted?: boolean | ((a: string, b: string) => number);
}//*/

/**
 * Description placeholder
 *
 * @typedef {InspectStylizeFn}
 */
type InspectStylizeFn = (text: string, styleType: string) => string;

// Σ (Sigma) - the set of allowed characters
/**
 * Description placeholder
 *
 * @export
 * @enum {number}
 */
export enum CharType {
  // CharacterStream Control
  EOF = "EOF",
  Error = "Error",
  Other = "Other",
  Undefined = "Undefined",

  // Whitespace & Formatting
  Whitespace = "Whitespace",
  NewLine = "NewLine",

  // Primary Literals
  Letter = "Letter",
  Number = "Number",
  Hex = "Hex",

  // Quotes & Strings
  SingleQuote = "SingleQuote",
  DoubleQuote = "DoubleQuote",
  Backtick = "Backtick",

  // Brackets & Enclosures
  LParen = "LParen",
  RParen = "RParen",
  LBracket = "LBracket",
  RBracket = "RBracket",
  LBrace = "LBrace",
  RBrace = "RBrace",

  // Common Operators & Mathematical
  Plus = "Plus",
  Minus = "Minus",
  Star = "Star",
  Slash = "Slash",
  BackSlash = "BackSlash",
  EqualSign = "EqualSign",
  Percent = "Percent",
  Caret = "Caret",
  Tilde = "Tilde",
  Pipe = "Pipe",
  LessThan = "LessThan",
  GreaterThan = "GreaterThan",

  // Punctuation & Delimiters
  Dot = "Dot",
  Comma = "Comma",
  Colon = "Colon",
  SemiColon = "SemiColon",
  Exclamation = "Exclamation",
  Question = "Question",
  Punctuation = "Punctuation",

  // Special Symbols & Identifiers
  Hash = "Hash",
  At = "At",
  Ampersand = "Ampersand",
  Dollar = "Dollar",
  Underscore = "Underscore",
  Currency = "Currency",
  Symbol = "Symbol",

  // International / Multi-byte
  Emoji = "Emoji",
  Unicode = "Unicode",
}

/**
 * Description placeholder
 *
 * @typedef {CharSpecFn}
 */
type CharSpecFn = (char: string) => boolean;

/**
 * Description placeholder
 *
 * @type {*}
 */
export const CharSpec = new Map<CharType, CharSpecFn>([
  [CharType.EOF, (char: string) => char === ""],
  //[CharType.NewLine, (char: string) => /[\n\r]/.test(char)],
  [CharType.NewLine, (char: string) => /[\n\r\u2028\u2029]/u.test(char)],
  [CharType.Whitespace, (char: string) => /[ \t\f\v]/.test(char)],
  [CharType.Hash, (char: string) => char === "#"],
  [CharType.Percent, (char: string) => char === "%"],
  [CharType.Slash, (char: string) => char === "/"],
  [CharType.Comma, (char: string) => char === ","],
  [CharType.LParen, (char: string) => char === "("],
  [CharType.RParen, (char: string) => char === ")"],
  [CharType.Plus, (char: string) => char === "+"],
  [CharType.Minus, (char: string) => char === "-"],
  [CharType.Star, (char: string) => char === "*"],
  [CharType.Dot, (char: string) => char === "."],
  [CharType.Backtick, (char: string) => char === "`"],
  [CharType.SingleQuote, (char: string) => char === "'"],
  [CharType.DoubleQuote, (char: string) => char === '"'],
  [CharType.BackSlash, (char: string) => char === "\\"],
  [CharType.Tilde, (char: string) => char === "~"],
  [CharType.Exclamation, (char: string) => char === "!"],
  [CharType.At, (char: string) => char === "@"],
  [CharType.Dollar, (char: string) => char === "$"],
  [CharType.Question, (char: string) => char === "?"],
  [CharType.Caret, (char: string) => char === "^"],
  [CharType.Ampersand, (char: string) => char === "&"],
  [CharType.LessThan, (char: string) => char === "<"],
  [CharType.GreaterThan, (char: string) => char === ">"],
  [CharType.Underscore, (char: string) => char === "_"],
  [CharType.EqualSign, (char: string) => char === "="],
  [CharType.LBracket, (char: string) => char === "["],
  [CharType.RBracket, (char: string) => char === "]"],
  [CharType.LBrace, (char: string) => char === "{"],
  [CharType.RBrace, (char: string) => char === "}"],
  [CharType.SemiColon, (char: string) => char === ";"],
  [CharType.Colon, (char: string) => char === ":"],
  [CharType.Pipe, (char: string) => char === "|"],
  [CharType.Letter, (char: string) => /\p{L}/v.test(char)],
  [CharType.Number, (char: string) => /\p{N}/v.test(char)],
  [CharType.Emoji, (char: string) => /\p{Emoji}/v.test(char)],
  [CharType.Currency, (char: string) => /\p{Sc}/v.test(char)],
  [CharType.Punctuation, (char: string) => /\p{P}/v.test(char)],
  [CharType.Symbol, (char: string) => /\p{S}/v.test(char)],
  [CharType.Unicode, (char: string) => /\P{ASCII}/v.test(char)],
]);

/**
 * Constants
 */
const TARGET_CHAR_DISPLAY_WIDTH = 8;
/**
 * Description placeholder
 *
 * @type {-1}
 */
const IS_UNDEFINED = -1;
/**
 * Description placeholder
 *
 * @type {0}
 */
const IS_NULL = 0;
/**
 * Description placeholder
 *
 * @type {1}
 */
const SINGLE_WIDTH = 1;
/**
 * Description placeholder
 *
 * @type {2}
 */
const DOUBLE_WIDTH = 2;
/**
 * Description placeholder
 *
 * @type {Record<string, string>}
 */
const COMMON_ESCAPES: Record<string, string> = {
  "\n": "\\n",
  "\r": "\\r",
  "\r\n": "\\r\\n", // Standard CRLF segment
  "\t": "\\t",
  "\v": "\\v",
  "\f": "\\f",
  "\0": "\\0",
  "\\": "\\\\",
} as const;
/**
 * Description placeholder
 *
 * @type {Record<string, number>}
 */
const NUMERAL_MAP: Record<string, number> = {
  Ⅰ: 1,
  Ⅱ: 2,
  Ⅲ: 3,
  Ⅳ: 4,
  Ⅴ: 5,
  Ⅵ: 6,
  Ⅶ: 7,
  Ⅷ: 8,
  Ⅸ: 9,
  Ⅹ: 10,
  Ⅺ: 11,
  Ⅻ: 12,
  Ⅼ: 50,
  Ⅽ: 100,
  Ⅾ: 500,
  Ⅿ: 1000,
  // Add other numeral systems here
  "①": 1,
  "②": 2,
  "③": 3,
  "④": 4,
  "⑤": 5,
  "⑥": 6,
  "⑦": 7,
  "⑧": 8,
  "⑨": 9,
  "⑩": 10,
} as const;

/**
 * Description placeholder
 *
 * @export
 * @class Position
 * @typedef {Position}
 */
export class Position {
  /**
   * Creates an instance of Position.
   *
   * @constructor
   * @param {number} [index=IS_UNDEFINED]
   * @param {number} [line=IS_UNDEFINED]
   * @param {number} [column=IS_UNDEFINED]
   */
  constructor(
    public index: number = IS_UNDEFINED,
    public line: number = IS_UNDEFINED,
    public column: number = IS_UNDEFINED,
  ) {}
}

/**
 * Description placeholder
 *
 * @export
 * @class IChar
 * @typedef {IChar}
 */
export class IChar {
  /**
   * Description placeholder
   *
   * @public
   * @type {CharType}
   */
  public type: CharType;
  /**
   * Description placeholder
   *
   * @protected
   * @type {Uint32Array}
   */
  protected _value: Uint32Array;
  /**
   * Description placeholder
   *
   * @protected
   * @type {boolean}
   */
  protected _isSubstring: boolean;
  /**
   * Description placeholder
   *
   * @public
   * @type {number}
   */
  public maxWidth: number;
  /**
   * Description placeholder
   *
   * @public
   * @type {Position}
   */
  public position: Position;

  /**
   * Creates an instance of IChar.
   *
   * @constructor
   * @param {?CharType} [type]
   * @param {?string} [value]
   * @param {?boolean} [isSubstring]
   * @param {?Position} [position]
   */
  constructor(
    type?: CharType,
    value?: string,
    isSubstring?: boolean,
    position?: Position,
  ) {
    this.type = type ?? CharType.Undefined;
    this._value = new Uint32Array(0);
    this.value = value ?? " ";
    this._isSubstring = isSubstring ?? false;
    this.maxWidth = 0;
    this.position = position ?? new Position();
  }

  /**
   * Description placeholder
   *
   * @public
   * @type {boolean}
   */
  public get isSubstring(): boolean {
    return this._isSubstring && this.position.index !== IS_UNDEFINED;
  }

  /**
   * Description placeholder
   *
   * @public
   * @type {boolean}
   */
  public set isSubstring(value: boolean) {
    this._isSubstring = value;
  }

  /**
   * Description placeholder
   *
   * @public
   * @type {string}
   */
  public get value(): string {
    return Array.from(this._value)
      .map((codePoint) => String.fromCodePoint(codePoint))
      .join("");
  }

  /**
   * Description placeholder
   *
   * @public
   * @type {string}
   */
  public set value(character: string) {
    const codePoints = Array.from(character).map((c) => c.codePointAt(0));
    if (codePoints.some((cp) => cp > 0x10ffff)) {
      throw new Error("Invalid Unicode code point detected.");
    }
    this._value = new Uint32Array(codePoints);
  }
}

/**
 * Description placeholder
 *
 * @export
 * @class Char
 * @typedef {Char}
 * @extends {IChar}
 */
export class Char extends IChar {
  /**
   * Description placeholder
   *
   * @private
   * @readonly
   * @type {string}
   */
  private readonly raw: string;

  /**
   * Creates an instance of Char.
   *
   * @constructor
   * @param {string} character
   * @param {{
   *             isSubstring?: boolean;
   *             position?: Position;
   *         }} [options={}]
   */
  constructor(
    character: string,
    options: {
      isSubstring?: boolean;
      position?: Position;
    } = {},
  ) {
    if (character === "") {
      super(CharType.EOF, "", false, options.position);
      this.raw = "";
      return;
    }

    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const segments = Array.from(segmenter.segment(character));
    if (segments.length !== 1) {
      throw new Error("Input must be a single visual character (grapheme).");
    }
    const isSubstring = options.isSubstring ?? false;
    const position = options.position;
    const validatedChar = segments[0].segment;
    super(Char.getType(validatedChar), validatedChar, isSubstring, position);
    this.raw = validatedChar;
  }

  /**
   * @inheritdoc
   *
   * @public
   * @returns {string}
   */
  public override toString(): string {
    const value = Char.handleEscape(this.value);

    // If handleEscape already returned an escaped representation (like '\\n'),
    // we can return it directly. Otherwise, check for other control characters.
    if (value !== this.value) return value;

    // Check for other unprintable or special Unicode characters
    // Using \p{Control} and \p{Unassigned} to identify characters that should be escaped
    if (/\p{Control}/u.test(value)) {
      return Array.from(value)
        .map((cp) => {
          const code = cp.codePointAt(0);
          if (code === undefined) return "";
          return `\\u{${code.toString(16).toUpperCase()}}`;
        })
        .join("");
    }

    // Return the character as-is if it's a standard printable character
    return value;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {string}
   */
  public getRawString(): string {
    return this.raw;
  }

  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {"Char"}
   */
  public readonly [Symbol.toStringTag] = "Char";

  /**
   * Description placeholder
   *
   * @param {number} depth
   * @param {InspectOptions} options
   * @returns {string}
   */
  [inspect.custom] = (depth: number, options: InspectOptions): string => {
    // Get the private stylize function from node:util.inspect
    const stylize: InspectStylizeFn = options.stylize as InspectStylizeFn;

    // If recursion depth is exhausted, show a placeholder.
    if (depth < 0) return stylize(`[Char]`, "special");

    // Get the class name and stylize it.
    const CLASSNAME = stylize(this.constructor.name, "special");

    // The character string to be displayed, including escapes for things like newlines.
    const charString = this.toString();

    // Calculate the visual width of the character.
    const visualWidth = Char.calculateVisualWidth(this.value);

    // The total width of the content inside the padding, including the quotes
    // +2 for the single quotes
    const contentWidth = visualWidth + 2;

    // Define a target total visual width for this section of the output. Let's use 8 for good spacing.
    const targetWidth = TARGET_CHAR_DISPLAY_WIDTH;

    // Calculate how many spaces are needed for padding based on visual width.
    // We subtract the width of the (character + 2) for the single quotes.
    const totalPadding = Math.max(0, targetWidth - contentWidth);
    const paddingStart = Math.floor(totalPadding / 2);
    const paddingEnd = Math.ceil(totalPadding / 2);

    // Construct the final padded string.
    const charPadded =
      " ".repeat(paddingStart) + `'${charString}'` + " ".repeat(paddingEnd);
    const CHAR = stylize(charPadded, "date");

    // Handle the position info if it exists.
    let IDX = "",
      POS = "";
    if (this.isSubstring) {
      // Stylize the index, line and column numbers.
      const idxPadStart = this.position.index.toFixed().padStart(2, " ");
      const linPadStart = this.position.line.toFixed().padStart(2, " ");
      const colPadStart = this.position.column.toFixed().padStart(2, " ");
      const linColInfo = `[ ${linPadStart} : ${colPadStart} ]`;
      const posInfo = stylize(linColInfo, "number");
      IDX = stylize(`[${idxPadStart}]`, "number");
      POS = `, pos: ${posInfo}`;
    }

    // Get the type and stylize it.
    const typeChar = this.type;
    const typePadEnd = typeChar.padEnd(11, " ");
    const typeInfo = stylize(typePadEnd, "string");
    const charType = stylize(`CharType.`, "special");
    const TYPE = `type: ${charType}${typeInfo}${POS}`;

    // Combine everything into the final string.
    return `${CLASSNAME}${IDX}: ${CHAR}: { ${TYPE} }`;
  };

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isEOF(): boolean {
    return this.type === CharType.EOF;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isHexValue(): boolean {
    // The 'u' flag enables Unicode support, required for \p{} property escapes.
    return /^\p{ASCII_Hex_Digit}$/u.test(this.getRawString());
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isNumber(): boolean {
    return this.type === CharType.Number;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isLetter(): boolean {
    return this.type === CharType.Letter;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isLetterOrNumber(): boolean {
    // Matches any letter or number in any script
    return this.isLetter() || this.isNumber();
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isNewLine(): boolean {
    return this.type === CharType.NewLine;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isWhitespace(): boolean {
    return this.type === CharType.Whitespace;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isEmoji(): boolean {
    return this.type === CharType.Emoji;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isCurrency(): boolean {
    return this.type === CharType.Currency;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isPunctuation(): boolean {
    return this.type === CharType.Punctuation;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isSymbol(): boolean {
    return this.type === CharType.Symbol;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isUnicode(): boolean {
    return this.type === CharType.Unicode;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isUndefined(): boolean {
    return this.type === CharType.Undefined;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isUpperCase(): boolean {
    // \p{Lu} = Unicode Uppercase Letter
    return /\p{Lu}/u.test(this.value);
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {boolean}
   */
  public isLowerCase(): boolean {
    // \p{Ll} = Unicode Lowercase Letter
    return /\p{Ll}/u.test(this.value);
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {number}
   */
  public getNumericValue(): number {
    const val = this.value;

    // Check if the value is a non-digit value
    const nonDigit = Char.handleNonDigit(val);
    if (nonDigit !== IS_UNDEFINED) return nonDigit;

    // Normalize the string. NFKD compatibility decomposition is a good choice.
    const normalizedVal = val.normalize("NFKD");

    // Use a regex to filter for standard digits after normalization
    const digits = normalizedVal.replace(/[^0-9]/g, "");

    // Basic check for standard digits 0-9
    if (digits) return parseInt(digits, 10);

    // For other Unicode numbers, you might return the code point
    // or use a library to get the actual decimal value
    return IS_UNDEFINED;
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {Uint32Array}
   */
  public getValue(): Uint32Array {
    return this._value;
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {string} str
   * @returns {Char[]}
   */
  public static fromString(str: string): Char[] {
    const chars: Char[] = [];
    let maxWidth = 0;

    const lines = str.split(/\r?\n/);
    for (const line of lines) {
      const currentLineWidth = Char.calculateVisualWidth(line);
      if (currentLineWidth > maxWidth) maxWidth = currentLineWidth;
    }

    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const segments = segmenter.segment(str);

    for (const { segment, index } of segments) {
      const position = Char.calculatePosition(str, index);

      chars.push(
        new Char(segment, {
          isSubstring: true,
          position: position,
        }),
      );
    }

    for (const c of chars) {
      c.maxWidth = maxWidth;
    }

    return chars;
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {string} text
   * @param {number} targetIndex
   * @returns {Position}
   */
  public static calculatePosition(text: string, targetIndex: number): Position {
    let line = 1;
    let column = 1;

    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const segments = segmenter.segment(text);

    for (const { segment, index } of segments) {
      if (index >= targetIndex) break;
      if (segment === "\n" || segment === "\r\n" || segment === "\r") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return new Position(targetIndex, line, column);
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {string} str
   * @returns {number}
   */
  public static calculateVisualWidth(str: string): number {
    const escaped = Char.handleEscape(str);
    if (escaped !== str) return escaped.length;
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const segments = Array.from(segmenter.segment(str));
    if (segments.length === 0) return IS_NULL;
    const char = segments[0].segment;
    if (char.includes("\uFE0F")) return DOUBLE_WIDTH;
    if (/\p{Emoji_Presentation}/v.test(char)) return DOUBLE_WIDTH;
    const codePoint = char.codePointAt(0);
    if (codePoint && this.isDoubleWidth(codePoint)) return DOUBLE_WIDTH;
    return SINGLE_WIDTH;
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {string} str
   * @returns {boolean}
   */
  public static isMultiCharacter(str: string): boolean {
    return (
      str === "\\n" ||
      str === "\\t" ||
      str === "\\r" ||
      str === "\\v" ||
      str === "\\f"
    );
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {number} code
   * @returns {boolean}
   */
  public static isZeroWidth(code: number): boolean {
    return (
      code <= 0x1f || // C0 controls
      (code >= 0x7f && code <= 0x9f) || // C1 controls
      (code >= 0x300 && code <= 0x36f) || // Combining Diacritical Marks
      (code >= 0x200b && code <= 0x200f) || // Zero-width spaces
      (code >= 0xfe00 && code <= 0xfe0f) || // Variation Selectors block
      (code >= 0xfeff && code <= 0xfeff)
    ); // Zero-width no-break space
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {number} code
   * @returns {boolean}
   */
  public static isDoubleWidth(code: number): boolean {
    return (
      (code >= 0x1100 && code <= 0x115f) || // Hangul Jamo
      (code >= 0x2329 && code <= 0x232a) || // Left/Right Angle Bracket
      (code >= 0x3040 && code <= 0x309f) || // Hiragana
      (code >= 0x30a0 && code <= 0x30ff) || // Katakana
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
      (code >= 0xfe10 && code <= 0xfe19) || // Vertical Forms
      (code >= 0xfe30 && code <= 0xfe6f) || // CJK Compatibility Forms
      (code >= 0xff00 && code <= 0xffef) || // Halfwidth and Fullwidth Forms
      code >= 0x1f300
    );
  }

  /**
   * Description placeholder
   *
   * @param {string} char
   * @returns {CharType}
   */
  public static getType = (char: string): CharType => {
    if (char === undefined) return CharType.Undefined; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    if (char === null) return CharType.Error; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    for (const [type, predicate] of CharSpec) {
      if (predicate(char)) return type;
    }
    return CharType.Undefined;
  };

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {string} value
   * @returns {string}
   */
  public static handleEscape(value: string): string {
    if (COMMON_ESCAPES[value]) return COMMON_ESCAPES[value];
    return value;
  }

  /**
   * Description placeholder
   *
   * @public
   * @static
   * @param {string} value
   * @returns {number}
   */
  public static handleNonDigit(value: string): number {
    if (NUMERAL_MAP[value] !== undefined) {
      return NUMERAL_MAP[value];
    }

    return IS_UNDEFINED;
  }
}
