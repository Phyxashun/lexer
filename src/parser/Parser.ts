// ./src/parser/Parser.ts

import { TokenType, type Token } from '../lexer/Token';
import { ParseError, ParseErrorCode } from './ParseError';
import type { CstNode, FunctionNode } from './Node';
import { NodeType } from './Node';
import { validate } from './Validation';

export class Parser {
    private pos = 0;

    constructor(
        public readonly tokens: Token[],
        public readonly rawSource?: string,
    ) {}

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

    private expect(type: TokenType): Token {
        const token = this.peek();

        if (token.type !== type) {
            throw new ParseError(
                `Expected token '${type}', but found '${token.value}'.`,
                ParseErrorCode.UNEXPECTED_TOKEN,
                'Parser',
                token,
                this.rawSource,
            );
        }

        return this.consume();
    }

    private match(type: TokenType): boolean {
        return this.peek().type === type;
    }

    private peekPrev(): Token {
        return this.tokens[this.pos - 1] ?? this.tokens[0];
    }

    public parse(): CstNode {
        const node = this.Color();
        validate(node, this.rawSource);
        return node;
    }

    private Color(): CstNode {
        const token = this.peek();

        switch (token.type) {
            case TokenType.COLOR:
                return this.NamedColor();

            case TokenType.HEX_COLOR:
                return this.HexColor();

            case TokenType.FUNCTION:
                return this.Function();

            default:
                throw this.unexpected(token);
        }
    }

    private HexColor(): HexColorNode {
        const token = this.expect(TokenType.HEX_COLOR);
        return {
            type: NodeType.HexColor,
            value: token.value.slice(1),
            span: token.span,
        };
    }

    private NamedColor(): NamedColorNode {
        const token = this.expect(TokenType.COLOR);
        return {
            type: NodeType.NamedColor,
            name: token.value,
            span: token.span,
        };
    }

    private Function(): FunctionNode {
        const nameToken = this.expect(TokenType.FUNCTION);

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
            while (this.match(TokenType.WHITESPACE)) {
                func.children.push(this.Whitespace());
            }

            if (this.match(TokenType.RPAREN)) break;

            if (this.match(TokenType.COMMA)) {
                func.children.push(this.Comma());
                continue;
            }

            if (this.match(TokenType.SLASH)) {
                func.children.push(this.Slash());
                continue;
            }

            func.children.push(this.Argument());
        }
    }

    private Argument(): CstNode {
        const token = this.peek();

        switch (token.type) {
            case TokenType.COLOR:
                return this.NamedColor();

            case TokenType.HEX_COLOR:
                return this.HexColor();

            case TokenType.NUMBER:
                return this.NumericLiteral();

            case TokenType.PERCENTAGE:
                return this.Percentage();

            case TokenType.DIMENSION:
                return this.Dimension();

            case TokenType.IDENTIFIER:
                return this.Identifier();

            case TokenType.KEYWORD:
                return this.Keyword();

            case TokenType.CHANNEL:
                return this.Channel();

            case TokenType.FUNCTION:
                return this.Function();

            default:
                throw this.unexpected(token);
        }
    }

    private Whitespace(): CstNode {
        const token = this.expect(TokenType.WHITESPACE);
        return {
            type: NodeType.WhiteSpace,
            value: ' ',
            span: token.span,
        };
    }

    private Comma(): CstNode {
        const token = this.expect(TokenType.COMMA);
        return {
            type: NodeType.Operator,
            value: ',',
            span: token.span,
        };
    }

    private Slash(): CstNode {
        const token = this.expect(TokenType.SLASH);
        return {
            type: NodeType.Slash,
            value: '/',
            span: token.span,
        };
    }

    private NumericLiteral(): CstNode {
        const token = this.expect(TokenType.NUMBER);
        return {
            type: NodeType.Number,
            value: token.value,
            span: token.span,
        };
    }

    private Percentage(): CstNode {
        const token = this.expect(TokenType.PERCENTAGE);
        return {
            type: NodeType.Percentage,
            value: token.value.replace(/%/g, ''),
            span: token.span,
        };
    }

    private Dimension(): CstNode {
        const token = this.expect(TokenType.DIMENSION);
        const [, value = '', unit = token.value] =
            /^(-?\d*\.?\d+)(.*)$/.exec(token.value) ?? [];
        return {
            type: NodeType.Dimension,
            value,
            unit,
            span: token.span,
        };
    }

    private Identifier(): CstNode {
        const token = this.expect(TokenType.IDENTIFIER);
        return {
            type: NodeType.Identifier,
            value: token.value,
            span: token.span,
        };
    }

    private Keyword(): CstNode {
        const token = this.expect(TokenType.KEYWORD);
        return {
            type: NodeType.Keyword,
            value: token.value,
            span: token.span,
        };
    }

    private Channel(): CstNode {
        const token = this.expect(TokenType.CHANNEL);
        return {
            type: NodeType.Channel,
            value: token.value,
            span: token.span,
        };
    }

    private unexpected(token: Token): never {
        throw new ParseError(
            `Unexpected token type: '${token.type}' with value: '${token.value}'.`,
            ParseErrorCode.UNEXPECTED_TOKEN,
            'Parser',
            token,
            this.rawSource,
        );
    }
}
