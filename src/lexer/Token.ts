// src/lexer/Token.ts

/**
 * Description placeholder
 *
 * @export
 * @enum {number}
 */
export enum TokenType {
    WHITESPACE = 'WHITESPACE',
    IDENTIFIER = 'IDENTIFIER',
    FUNCTION = 'FUNCTION',
    KEYWORD = 'KEYWORD',
    PROPERTY = 'PROPERTY',

    NUMBER = 'NUMBER',
    PERCENTAGE = 'PERCENTAGE',
    DIMENSION = 'DIMENSION',

    HEX_COLOR = 'HEX_COLOR',

    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    COMMA = 'COMMA',
    SLASH = 'SLASH',

    ERROR = 'ERROR',
    EOF = 'EOF',
}

/**
 * Description
 *
 * @interface
 * @name Span
 * @kind interface
 * @exports
 */
export interface Span {
    start: number; // Absolute index in the source
    end: number; // Absolute index end
    line: number; // Line number (1-based)
    column: number; // Column number (1-based)
}

/**
 * Description
 *
 * @interface
 * @name Token
 * @kind interface
 * @exports
 */
export interface Token {
    type: string;
    span: Span;
    // We only compute 'value' if we actually need it (e.g. for identifiers/numbers)
    value?: string;
}
