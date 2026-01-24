// src/lexer/Token.ts

/**
 * Description placeholder
 *
 * @export
 * @enum {number}
 */
export enum TokenType {
  WHITESPACE = "WHITESPACE",
  IDENTIFIER = "IDENTIFIER",
  FUNCTION = "FUNCTION",
  KEYWORD = "KEYWORD",
  PROPERTY = "PROPERTY",

  NUMBER = "NUMBER",
  PERCENTAGE = "PERCENTAGE",
  DIMENSION = "DIMENSION",

  HEX_COLOR = "HEX_COLOR",

  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  COMMA = "COMMA",
  SLASH = "SLASH",

  ERROR = "ERROR",
  EOF = "EOF",
}

/**
 * Description placeholder
 *
 * @export
 * @interface Token
 * @typedef {Token}
 */
export interface Token {
  /**
   * Description placeholder
   *
   * @type {string}
   */
  value: string;
  /**
   * Description placeholder
   *
   * @type {TokenType}
   */
  type: TokenType;
  /**
   * Description placeholder
   *
   * @type {number}
   */
  start: number;
  /**
   * Description placeholder
   *
   * @type {number}
   */
  end: number;
  /**
   * Description placeholder
   *
   * @type {?string}
   */
  message?: string;
}
