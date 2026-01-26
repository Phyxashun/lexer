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
        this.rawSource = rawSource;
        this.table = CSSColorParserTable;
    }

    private isEOF(): boolean {
        return (
            this.pos >= this.tokens.length ||
            this.tokens[this.pos]?.type === TokenType.EOF
        );
    }

    private peek(): Token {
        if (this.isEOF()) {
            return this.tokens[this.tokens.length - 1];
        }
        return this.tokens[this.pos];
    }

    private consume(): Token {
        const token = this.peek();
        if (token.type !== TokenType.EOF) {
            this.pos++;
        }
        return token;
    }

    public Oparse(): CstNode {
        while (!this.isEOF()) {
            const token = this.peek();
            if (!token || token.type === TokenType.EOF) break;

            const transition = this.table[this.state]?.[token.type];

            if (!transition) {
                throw new ParseError(
                    `Unknown or unexpected identifier '${token.value}'.`,
                    ParseErrorCode.UNEXPECTED_TOKEN,
                    ParserState[this.state],
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
                this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1];

            if (this.stack.length > 0) {
                const openFunc: FunctionNode = this.stack[0] as FunctionNode;
                throw new ParseError(
                    `Function '${openFunc.name}' was not closed with a ')'`,
                    ParseErrorCode.UNCLOSED_FUNCTION,
                    this.state,
                    errorToken,
                    this.rawSource,
                );
            } else {
                throw new ParseError(
                    'Parsing finished without finding a valid CSS color.',
                    ParseErrorCode.UNEXPECTED_EOF,
                    ParserState[this.state],
                    errorToken,
                    this.rawSource,
                );
            }
        }

        validate(this.cst, this.rawSource);
        return this.cst;
    }

    public parse(): CstNode {
        const node = this.Color();
        validate(node, this.rawSource);
        return node;
    }

    private Color(): CstNode {
        const token = this.peek();

        switch (token.type) {
            case TokenType.HEX_COLOR:
                return this.HexColor();

            case TokenType.COLOR:
                return this.NamedColor();

            case TokenType.FUNCTION:
                return this.Function();

            default:
                throw this.unexpected(token);
        }
    }

    private HexColor(): HexColorNode {
        const token = this.consume();
        return {
            type: NodeType.HexColor,
            value: token.value.slice(1),
            span: token.span,
        };
    }

    private NamedColor(): NamedColorNode {
        const token = this.consume();
        return {
            type: NodeType.NamedColor,
            name: token.value,
            span: token.span,
        };
    }

    private Function(): FunctionNode {
        const nameToken = this.consume();
        const node: FunctionNode = {
            type: NodeType.Function,
            name: nameToken.value.toLowerCase(),
            span: nameToken.span,
            children: [],
        };

        this.expect(TokenType.LPAREN);

        if (!this.match(TokenType.RPAREN)) {
            this.Arguments(node);
            this.expect(TokenType.RPAREN);
        }

        node.span = {
            ...node.span,
            length: this.peekPrev().span.end - node.span.start,
        };

        return node;
    }

    private Arguments(func: FunctionNode): void {
        while (!this.match(TokenType.RPAREN)) {
            func.children.push(this.Argument());

            if (this.match(TokenType.COMMA) || this.match(TokenType.SLASH)) {
                const op = this.consume();
                func.children.push({
                    type: NodeType.Operator,
                    value: op.value as ',' | '/',
                    span: op.span,
                });
                continue;
            }

            if (this.match(TokenType.WHITESPACE)) {
                func.children.push(this.parseWhitespace());
                continue;
            }

            break;
        }
    }

    private Argument(): CstNode {
        const token = this.peek();

        switch (token.type) {
            case TokenType.NUMBER:
                return this.Number();

            case TokenType.PERCENTAGE:
                return this.Percentage();

            case TokenType.DIMENSION:
                return this.Dimension();

            case TokenType.IDENTIFIER:
                return this.Identifier();

            case TokenType.FUNCTION:
                return this.Function();

            default:
                throw this.unexpected(token);
        }
    }
}
