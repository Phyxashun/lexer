// ./src/parser/Parser.ts

import { TokenType, type Token } from '../lexer/Token';
import { ParserState, type TransitionTable } from './ParserState';
import { ParseError, ParseErrorCode } from './ParseError';
import { CSSColorParserTable } from './TransitionTable';
import type { CstNode, FunctionNode } from './Node';
import { validate } from './Validation';

export class Parser {
    private readonly tokens: Token[];
    private pos = 0;
    public readonly rawSource: string;

    private readonly table: TransitionTable;
    public state: ParserState = ParserState.Initial;
    public stack: CstNode[] = [];
    public cst: CstNode | null = null;

    constructor(tokens: Token[], rawSource?: string) {
        this.tokens = tokens;
        this.rawSource = rawSource ?? '';
        this.table = CSSColorParserTable;
    }

    private peek(): Token | null {
        return this.tokens[this.pos] ?? null;
    }

    private consume(): Token {
        return this.tokens[this.pos++];
    }

    public parse(): CstNode {
        while (true) {
            const token = this.peek();

            while (this.pos < this.tokens.length) {
                if (!token || token.type === TokenType.EOF) break;

                const transition = this.table[this.state]?.[token.type];

                if (!transition) {
                    throw new ParseError(
                        `Unexpected token '${token.value}'`,
                        ParseErrorCode.UNEXPECTED_TOKEN,
                        this.state,
                        token,
                        this.rawSource,
                    );
                }
                this.consume();
                transition.action(this, token);
                this.state = transition.nextState;

                if (this.state === ParserState.Complete) break;
            }

            if (this.cst === null) {
                const errorToken =
                    this.tokens[this.pos] ||
                    this.tokens[this.tokens.length - 1];

                if (this.stack.length > 0) {
                    const openFunc: FunctionNode = this
                        .stack[0] as FunctionNode;
                    throw new ParseError(
                        `Function '${openFunc.name}' was not closed with a ')'`,
                        ParseErrorCode.UNCLOSED_FUNCTION,
                        this.state,
                        errorToken,
                        this.rawSource,
                    );
                }

                throw new ParseError(
                    'Parsing did not produce a result (Unexpected EOF).',
                    ParseErrorCode.UNEXPECTED_EOF,
                    this.state,
                    errorToken,
                    this.rawSource,
                );
            }
            validate(this.cst);
            break;
        }
        return this.cst;
    }
}
