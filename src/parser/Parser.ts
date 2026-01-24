// ./src/parser/Parser.ts

import { TokenType, type Token } from "../lexer/Token";
import { ParserState, type TransitionTable } from "./ParserState";
import { ParseError, ParseErrorCode } from "./ParseError";
import { CSSColorParserTable } from "./TransitionTable";
import type { AstNode, FunctionNode } from "./Node";
import { validate } from "./Validation";

/**
 * Description placeholder
 *
 * @export
 * @class Parser
 * @typedef {Parser}
 */
export class Parser {
  /**
   * Description placeholder
   *
   * @private
   * @readonly
   * @type {Token[]}
   */
  private readonly tokens: Token[];
  /**
   * Description placeholder
   *
   * @private
   * @readonly
   * @type {TransitionTable}
   */
  private readonly table: TransitionTable;
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
   * @public
   * @type {ParserState}
   */
  public state: ParserState = ParserState.Initial;
  /**
   * Description placeholder
   *
   * @public
   * @type {AstNode[]}
   */
  public stack: AstNode[] = [];
  /**
   * Description placeholder
   *
   * @public
   * @type {(AstNode | null)}
   */
  public ast: AstNode | null = null;

  /**
   * Creates an instance of Parser.
   *
   * @constructor
   * @param {Token[]} tokens
   * @param {TransitionTable} table
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.table = CSSColorParserTable;
  }

  /**
   * Description placeholder
   *
   * @private
   * @returns {(Token | null)}
   */
  private peek(): Token | null {
    return this.tokens[this.pos] ?? null;
  }

  /**
   * Description placeholder
   *
   * @private
   * @returns {Token}
   */
  private consume(): Token {
    return this.tokens[this.pos++];
  }

  /**
   * Description placeholder
   *
   * @public
   * @returns {AstNode}
   */
  public parse(): AstNode {
    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (!token || token.type === TokenType.EOF) break;

      const transition = this.table[this.state]?.[token.type];

      if (!transition) {
        throw new ParseError(
          `Unexpected token '${token.value}'`,
          ParseErrorCode.UNEXPECTED_TOKEN,
          this.state,
          token,
        );
      }

      this.consume();

      transition.action(this, token);
      this.state = transition.nextState;

      if (this.state === ParserState.Complete) break;
    }

    if (this.ast === null) {
      if (this.stack.length > 0) {
        const openFunc: FunctionNode = this.stack[0];
        throw new ParseError(
          `Function '${openFunc.name}' was not closed with a ')'`,
          ParseErrorCode.UNCLOSED_FUNCTION,
          this.state,
        );
      }
      throw new ParseError(
        "Parsing did not produce a result.",
        ParseErrorCode.UNEXPECTED_EOF,
        this.state,
      );
    }

    validate(this.ast);

    return this.ast;
  }
}
