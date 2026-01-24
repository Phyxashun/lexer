// ./src/lexer/Lexer.ts

import type { Char } from "../char/Char";
import { TokenType, type Token } from "./Token";
import { State, DFA, ACCEPT, foldIdentifierToken } from "./State";

/**
 * Description placeholder
 *
 * @type {*}
 */
const typesToSkip = new Set([TokenType.ERROR]);

/**
 * Description placeholder
 *
 * @type {Record<string, TokenType>}
 */
const charTokenMap: Record<string, TokenType> = {
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
  ",": TokenType.COMMA,
  "/": TokenType.SLASH,
  "%": TokenType.PERCENTAGE,
};

/**
 * Description placeholder
 *
 * @export
 * @class Lexer
 * @typedef {Lexer}
 */
export class Lexer {
  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {Token[]}
   */
  public readonly tokens: Token[] = [];

  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {"Token"}
   */
  public readonly [Symbol.toStringTag] = "Token";

  /**
   * Description placeholder
   *
   * @public
   * @readonly
   * @type {readonly Char[]}
   */
  public readonly chars: readonly Char[];

  /**
   * Description placeholder
   *
   * @private
   * @type {number}
   */
  private pos = 0;

  /**
   * Description placeholder
   *
   * @private
   * @type {number}
   */
  private start = 0;

  /**
   * Description placeholder
   *
   * @private
   * @type {State}
   */
  private state: State = State.InitialState;

  /**
   * Description placeholder
   *
   * @private
   * @type {string}
   */
  private buffer = "";

  /**
   * Creates an instance of Lexer.
   *
   * @constructor
   * @param {Char[]} input
   */
  constructor(input: Char[]) {
    this.chars = input;
    this.tokenize();
  }

  /**
   * Description placeholder
   *
   * @private
   */
  private reset(): void {
    this.buffer = "";
    this.start = this.pos;
    this.state = State.InitialState;
  }

  /**
   * Description placeholder
   *
   * @private
   * @returns {Char}
   */
  private peek(): Char {
    return this.chars[this.pos];
  }

  /**
   * Description placeholder
   *
   * @private
   * @returns {Char}
   */
  private advance(): Char {
    const char = this.peek();
    if (!char.isEOF()) {
      this.buffer += char.value;
      this.pos++;
    }
    return char;
  }

  /**
   * Description placeholder
   *
   * @private
   * @param {TokenType} type
   * @param {?string} [message]
   * @returns {Token}
   */
  private createToken(type: TokenType, message?: string): Token {
    return {
      value: this.buffer,
      type,
      start: this.start,
      end: this.pos,
      message,
    };
  }

  /**
   * Description placeholder
   *
   * @private
   * @param {TokenType} type
   * @param {?string} [message]
   * @returns {Token}
   */
  private emit(type: TokenType, message?: string): Token {
    let token: Token = this.createToken(type, message);

    if (token.type === TokenType.IDENTIFIER) {
      token = foldIdentifierToken(token);
    }

    if (typesToSkip.has(token.type)) {
      this.reset();
      return;
    }

    if (this.buffer.length > 0 || type === TokenType.EOF) {
      this.tokens.push(token);
    }

    this.reset();
    return token;
  }

  /**
   * Description placeholder
   *
   * @private
   */
  private tokenize(): void {
    // eslint-disable-next-line
    while (true) {
      const ch = this.peek();

      if (ch.isEOF()) {
        if (this.buffer.length > 0 && ACCEPT[this.state]) {
          this.emit(ACCEPT[this.state], this.state.toString());
        } else if (this.buffer.length > 0) {
          this.emit(TokenType.ERROR, "Incomplete token at end of input");
        }
        this.emit(TokenType.EOF, TokenType.EOF);
        break;
      }

      const nextState = DFA[this.state]?.[ch.type];

      if (nextState === undefined) {
        const accept = ACCEPT[this.state];
        if (accept !== undefined) {
          this.emit(accept, this.state.toString());
        } else if (this.state >= State.Hex1 && this.state <= State.Hex8) {
          this.emit(TokenType.ERROR, "Invalid hex color");
        } else {
          this.advance();
          this.emit(TokenType.ERROR, "Unexpected character");
        }
      } else {
        this.state = nextState;

        if (nextState === State.SYNC) {
          this.advance();
          this.emit(
            charTokenMap[ch.value] ?? TokenType.ERROR,
            this.state.toString(),
          );
        } else {
          this.advance();
        }
      }
    }
  }
}
