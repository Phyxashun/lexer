// ./src/logger/logger.d.ts

declare module 'figlet/fonts/*' {
    const value: string;
    export default value;
}

/**
 * @type AlignType
 * @description Type defining text alignment options.
 */
type AlignType = 'left' | 'center' | 'right';

/**
 * @type StyleType
 * @description Type defining available text styles.
 */
type StyleType =
    | 'bold'
    | 'reset'
    | 'dim'
    | 'italic'
    | 'underline'
    | 'blink'
    | 'inverse'
    | 'hidden'
    | 'strikethrough'
    | 'doubleunderline';

/**
 * @type ColorType
 * @description Type defining available text colors.
 */
type ColorType =
    | 'green'
    | 'red'
    | 'yellow'
    | 'cyan'
    | 'black'
    | 'blue'
    | 'magenta'
    | 'white'
    | 'gray'
    | 'redBright'
    | 'greenBright'
    | 'yellowBright'
    | 'blueBright'
    | 'magentaBright'
    | 'cyanBright'
    | 'whiteBright';

/**
 * @type BackgroundColorType
 * @description Type defining available background colors.
 */
type BackgroundColorType =
    | 'bgGreen'
    | 'bgRed'
    | 'bgYellow'
    | 'bgCyan'
    | 'bgBlack'
    | 'bgBlue'
    | 'bgMagenta'
    | 'bgWhite'
    | 'bgGray'
    | 'bgRedBright'
    | 'bgGreenBright'
    | 'bgYellowBright'
    | 'bgBlueBright'
    | 'bgMagentaBright'
    | 'bgCyanBright'
    | 'bgWhiteBright';

/**
 * @type InspectColor
 * @description Type defining available inspect colors.
 */
type InspectColor = StyleType | ColorType | BackgroundColorType; // From 'node:util'

/**
 * @type BoxParts
 * @description Type defining the structure for box parts.
 */
type BoxParts = { [k in keyof typeof BoxPart]: string };

/**
 * @interface Theme
 * @description Defines the structure for a theme object.
 * @property {InspectColor | InspectColor[]} color - The color(s) associated with the theme.
 * @property {LineType} line - The line type associated with the theme.
 * @property {(StyleType)[]} [styles] - Optional styles associated with the theme.
 */
interface Theme {
    /**
     * Description placeholder
     *
     * @type {(InspectColor | InspectColor[])}
     */
    color: InspectColor | InspectColor[];
    /**
     * Description placeholder
     *
     * @type {LineType}
     */
    line: LineType;
    /**
     * Description placeholder
     *
     * @type {?StyleType[]}
     */
    styles?: StyleType[];
}

/**
 * @interface PrintLineOptions
 * @description Defines the structure for a PrintLine options object.
 * @property {number} width - The width of the line.
 * @property {boolean} preNewLine - If true, adds a newline before the line.
 * @property {boolean} postNewLine - If true, adds a newline after the line.
 * @property {LineType} lineType - The style of the line.
 * @property {AlignType} textAlign - The alignment of the text.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The color of the line.
 * @property {InspectColor | InspectColor[]} bgColor - The background color of the line.
 * @property {StyleType | StyleType[]} styles - The styles applied to the line.
 * @property {string} text - The text to display on the line.
 */
interface PrintLineOptions {
    // Alignment options
    /**
     * Description placeholder
     *
     * @type {?number}
     */
    width?: number;
    /**
     * Description placeholder
     *
     * @type {?boolean}
     */
    preNewLine?: boolean;
    /**
     * Description placeholder
     *
     * @type {?boolean}
     */
    postNewLine?: boolean;

    // Line options
    /**
     * Description placeholder
     *
     * @type {?LineType}
     */
    lineType?: LineType;
    /**
     * Description placeholder
     *
     * @type {?keyof typeof Themes}
     */
    theme?: keyof typeof Themes;
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    color?: InspectColor | InspectColor[];
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    bgColor?: InspectColor | InspectColor[];
    /**
     * Description placeholder
     *
     * @type {?[InspectColor, InspectColor]}
     */
    gradient?: [InspectColor, InspectColor];
    /**
     * Description placeholder
     *
     * @type {?(StyleType | StyleType[])}
     */
    styles?: StyleType | StyleType[];

    // Text options
    /**
     * Description placeholder
     *
     * @type {?string}
     */
    text?: string;
    /**
     * Description placeholder
     *
     * @type {?AlignType}
     */
    textAlign?: AlignType;
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    textColor?: InspectColor | InspectColor[];
}

/**
 * @type BoxWidth
 * @description Type defining box width options.
 * 'tight' - Width adjusts to fit the text content.
 * 'max'   - Width spans the maximum allowed width.
 * number  - Specific numeric width.
 */
type BoxWidth = 'tight' | 'max' | number;

/**
 * @interface BoxTextOptions
 * @description Defines the structure for a BoxText options object.
 * @property {BoxWidth} width - The width of the box.
 * @property {boolean} preNewLine - If true, adds a newline before the box.
 * @property {boolean} postNewLine - If true, adds a newline after the box.
 * @property {BoxType} boxType - The style of the box.
 * @property {AlignType} boxAlign - The alignment of the box.
 * @property {keyof typeof THEMES} theme - Apply a predefined theme.
 * @property {InspectColor | InspectColor[]} color - The default foreground color of the box.
 * @property {InspectColor | InspectColor[]} bgColor - The default backgound color of the box.
 * @property {StyleType | StyleType[]} styles - The styles of the box.
 * @property {InspectColor | InspectColor[]} textColor - The text color inside the box.
 * @property {InspectColor | InspectColor[]} textBgColor - The text background color inside the box.
 */
interface BoxTextOptions {
    // Alignment options
    /**
     * Description placeholder
     *
     * @type {?BoxWidth}
     */
    width?: BoxWidth;
    /**
     * Description placeholder
     *
     * @type {?boolean}
     */
    preNewLine?: boolean;
    /**
     * Description placeholder
     *
     * @type {?boolean}
     */
    postNewLine?: boolean;

    // Box options
    /**
     * Description placeholder
     *
     * @type {?BoxType}
     */
    boxType?: BoxType;
    /**
     * Description placeholder
     *
     * @type {?AlignType}
     */
    boxAlign?: AlignType;
    /**
     * Description placeholder
     *
     * @type {?keyof typeof Themes}
     */
    theme?: keyof typeof Themes;
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    color?: InspectColor | InspectColor[];
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    bgColor?: InspectColor | InspectColor[];
    /**
     * Description placeholder
     *
     * @type {?(StyleType | StyleType[])}
     */
    styles?: StyleType | StyleType[];

    // Text options
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    textColor?: InspectColor | InspectColor[];
    /**
     * Description placeholder
     *
     * @type {?(InspectColor | InspectColor[])}
     */
    textBgColor?: InspectColor | InspectColor[];
}
