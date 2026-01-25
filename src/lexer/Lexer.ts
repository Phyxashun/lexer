// ./src/lexer/Lexer.ts

import { TokenType, type Token, type Span } from './Token';
import { State, DFA, ACCEPT, foldIdentifierToken } from './State';
import { LexerError } from './LexerError';
import { Char } from '../char/Char';

const typesToSkip = new Set([TokenType.ERROR]);

const charTokenMap: Record<string, TokenType> = {
    '(': TokenType.LPAREN,
    ')': TokenType.RPAREN,
    ',': TokenType.COMMA,
    '/': TokenType.SLASH,
    '%': TokenType.PERCENTAGE,
};

export class Lexer {
    private pos = 0;
    public readonly tokens: Token[] = [];

    private start = 0;
    private state: State = State.InitialState;
    private buffer = '';

    constructor(
        private chars: Char[],
        private rawSource: string,
    ) {
        this.tokenize();
    }

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

        if (
            token.type === TokenType.ERROR &&
            message === 'Unexpected character'
        ) {
            throw new LexerError(message, token.span, this.rawSource);
        }

        if (this.buffer.length > 0 || type === TokenType.EOF) {
            this.tokens.push(token);
        }

        this.reset();
        return token;
    }

    private tokenize(): void {
        while (true) {
            const ch = this.peek();

            if (this.isEOF()) {
                if (this.buffer.length > 0) {
                    const acceptType = ACCEPT[this.state];
                    if (acceptType !== undefined) {
                        this.emit(acceptType, this.state.toString());
                    } else {
                        this.emit(
                            TokenType.ERROR,
                            'Incomplete token at end of input',
                        );
                    }
                }
                this.emit(TokenType.EOF, 'EOF');
                break;
            }

            const nextState = DFA[this.state]?.[ch.type];

            if (nextState === undefined) {
                const accept = ACCEPT[this.state];
                if (accept !== undefined) {
                    this.emit(accept, this.state.toString());
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
