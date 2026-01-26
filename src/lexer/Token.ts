// src/lexer/Token.ts

export enum TokenType {
    WHITESPACE = 'WHITESPACE',
    IDENTIFIER = 'IDENTIFIER',
    FUNCTION = 'FUNCTION',
    KEYWORD = 'KEYWORD',
    COLOR = 'COLOR',
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

export interface Span {
    start: number; // Absolute index in the source
    end: number; // Absolute index end
    line: number; // Line number (1-based)
    column: number; // Column number (1-based)
}

export interface Token {
    type: string;
    span: Span;
    value?: string;
}
