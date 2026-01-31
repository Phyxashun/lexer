// ./src/lexer/Lexer.ts

import { inspect, type InspectOptions, type InspectStylizeFn } from 'node:util';
import { TokenType, type Token, type Span } from './Token';
import { State, DFA, ACCEPT, foldIdentifierToken } from './State';
import { Char } from '../char/Char';

const SPACER = (n: number = 1): string => ' '.repeat(n);

const typesToSkip = new Set([]);

const charTokenMap: Record<string, TokenType> = {
    '(': TokenType.LPAREN,
    ')': TokenType.RPAREN,
    ',': TokenType.COMMA,
    '/': TokenType.SLASH,
    '%': TokenType.PERCENTAGE,
};

export class Lexer {
    public readonly [Symbol.toStringTag] = 'Token';
    public readonly tokens: Token[] = [];
    private pos = 0;

    private start = 0;
    private state: State = State.InitialState;
    private buffer = '';

    constructor(
        private chars: Char[],
        private rawSource: string,
    ) {
        this.tokenize();
    }

    [inspect.custom] = (depth: number, options: InspectOptions): string => {
        // Get the stylize function from inspect options for coloring.
        const stylize = options.stylize as InspectStylizeFn;

        // If recursion depth is exhausted, return a simple placeholder.
        if (depth < 0) return stylize(this[Symbol.toStringTag], 'special');

        const className = stylize(`LEXER:`, 'special');
        let output = `${className}\n${SPACER(2)}[\n`;

        if (this.tokens.length === 0) {
            output += `${SPACER(4)}// No tokens were generated.\n`;
        } else {
            let maxValueWidth = 0;
            let maxTypeNameWidth = 0;

            for (const token of this.tokens) {
                const valueStr = `'${token.value.replace(/\n/g, '\\n')}'`;
                if (valueStr.length > maxValueWidth) {
                    maxValueWidth = valueStr.length + 1;
                }

                const typeName = TokenType[token.type];
                if (typeName.length > maxTypeNameWidth) {
                    maxTypeNameWidth = typeName.length + 1;
                }
            }

            for (let i = 0; i < this.tokens.length; i++) {
                const token = this.tokens[i];
                const TOKEN_CLASSNAME = stylize(
                    this[Symbol.toStringTag],
                    'special',
                );

                // Index
                const idxPadStart = i.toFixed().padStart(3, SPACER());
                const IDX = stylize(`[${idxPadStart}]`, 'number');

                // Value
                const tokenValueString = `'${token.value.replace(/\n/g, '\\n')}'`;
                const paddedValue = tokenValueString.padEnd(
                    maxValueWidth,
                    SPACER(),
                );
                const stylizedValue = stylize(paddedValue, 'date');
                const VAL = `value: ${stylizedValue}`;

                // Type
                const typeName = TokenType[token.type];
                const paddedTypeName = typeName.padEnd(
                    maxTypeNameWidth,
                    SPACER(),
                );
                const TYPE_INFO = stylize(paddedTypeName, 'string');
                const TOKEN_TYPE_LABEL = stylize('TokenType.', 'special');
                const TYPE = `type: ${TOKEN_TYPE_LABEL}${TYPE_INFO}`;

                output += `${SPACER(4)}${TOKEN_CLASSNAME}${IDX}: ${VAL}, ${TYPE}`;

                // Position
                if (options.showSpan && token.span) {
                    const span = token.span;
                    const start = span.start.toFixed().padStart(2, SPACER());
                    const end = span.end.toFixed().padStart(2, SPACER());
                    const line = span.line.toFixed().padStart(2, SPACER());
                    const column = span.column.toFixed().padStart(2, SPACER());
                    const length = span.length.toFixed().padStart(3, SPACER());
                    const spanInfo = `[S:${start}, E:${end}, L:${line}, C:${column}, len:${length}]`;
                    output += `, span: ${stylize(spanInfo, 'number')}`;
                }

                // Append the message if it exists.
                if (options.showMessage && token.message) {
                    output += `, msg: '${stylize(token.message, 'regexp')}'`;
                }
                output += ',\n';
            }
        }
        output += `${SPACER(2)}]\n`;
        //output += `}`;
        return output;
    };

    private isEOF(): boolean {
        return this.pos >= this.chars.length;
    }

    private reset(): void {
        this.buffer = '';
        this.start = this.pos;
        this.state = State.InitialState;
    }

    private peek(): string {
        return this.chars[this.pos];
    }

    private advance(): string {
        const char = this.peek();
        if (!this.isEOF()) {
            this.buffer += char;
            this.pos++;
        }
        return char;
    }

    private createSpan(startPos: number, endPos: number): Span {
        const startChar = this.chars[startPos];

        // Check if startChar exists and has the position object
        if (!startChar || !startChar.position) {
            return {
                start: startPos,
                end: endPos,
                line: 1,
                column: 1,
                length: endPos - startPos,
            };
        }

        return {
            start: startPos,
            end: endPos,
            line: startChar.position.line,
            column: startChar.position.column,
            length: endPos - startPos,
        };
    }

    private createToken(type: TokenType, message?: string): Token {
        return {
            value: this.buffer,
            type,
            span: this.createSpan(this.start, this.pos),
            message,
        };
    }

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

    private tokenize(): void {
        while (!this.isEOF()) {
            const ch = this.peek();
            const nextState = DFA[this.state]?.[ch.type];

            if (nextState === undefined) {
                const accept = ACCEPT[this.state];
                if (accept !== undefined) {
                    this.emit(accept, `Accepted at ${this.state}`);
                } else if (
                    this.state >= State.Hex1 &&
                    this.state <= State.Hex8
                ) {
                    this.emit(TokenType.ERROR, 'Invalid hex color');
                } else {
                    this.advance();
                    this.emit(TokenType.ERROR, 'Unexpected character');
                }
            } else {
                this.state = nextState;
                this.advance();

                if (this.state === State.EOF) {
                    this.emit(TokenType.EOF, 'End of input');
                    break;
                }

                if (this.state === State.SYNC) {
                    this.emit(
                        charTokenMap[ch.value] ?? TokenType.ERROR,
                        'Sync symbol',
                    );
                }
            }
        }
        const lastToken = this.tokens[this.tokens.length - 1];
        if (!lastToken || lastToken.type !== TokenType.EOF) {
            this.emit(TokenType.EOF, 'Manual EOF');
        }
    }
}
