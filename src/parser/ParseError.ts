// src/parser/ParseError.ts

import { type Token } from "../lexer/Token";
import { type ParserState } from "./ParserState";

/**
 * A set of specific, categorized error codes for our parser.
 */
export enum ParseErrorCode {
  UNEXPECTED_TOKEN = "UNEXPECTED_TOKEN",
  UNEXPECTED_EOF = "UNEXPECTED_EOF",
  UNCLOSED_FUNCTION = "UNCLOSED_FUNCTION",
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
}

/**
 * A custom error class that provides detailed context about a parsing failure.
 */
export class ParseError extends Error {
  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {ParseErrorCode}
   */
  public readonly code: ParseErrorCode;
  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {?Token}
   */
  public readonly token?: Token;
  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {ParserState}
   */
  public readonly state: ParserState;

  /**
   * Creates an instance of ParseError.
   *
   * @constructor
   * @param {string} message
   * @param {ParseErrorCode} code
   * @param {ParserState} state
   * @param {?Token} [token]
   */
  constructor(
    message: string,
    code: ParseErrorCode,
    state: ParserState,
    token?: Token,
  ) {
    // Call the parent constructor (Error)
    super(message);

    // Set the error name to our custom class name
    this.name = "ParseError";

    // Assign our custom properties
    this.code = code;
    this.token = token;
    this.state = state;

    // This line is crucial for ensuring `instanceof ParseError` works correctly
    Object.setPrototypeOf(this, ParseError.prototype);
  }

  /**
   * A helper method to generate a more detailed error string.
   */
  public getDetailedMessage(): string {
    let details = `${this.name} (${this.code}) in state '${this.state}': ${this.message}`;
    if (this.token) {
      details += `\n  - Offending Token: '${this.token.value}' (Type: ${this.token.type})`;
      details += `\n  - Position: Start ${this.token.start.toFixed()}, End ${this.token.end.toFixed()}`;
    }
    return details;
  }
}
