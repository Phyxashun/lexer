// ./src/lexer/Lexer.ts

import { TokenType, type Token, type Span } from './Token';
import { State, DFA, ACCEPT, foldIdentifierToken } from './State';
import { Char } from '../char/Char';

const typesToSkip = new Set([]);

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
                // No transition found: Attempt to accept what we have
                const accept = ACCEPT[this.state];
                if (accept !== undefined) {
                    this.emit(accept, `Accepted at ${this.state}`);
                    // Note: We do NOT advance here; we re-evaluate 'ch' in InitialState
                } else if (
                    this.state >= State.Hex1 &&
                    this.state <= State.Hex8
                ) {
                    this.emit(TokenType.ERROR, 'Invalid hex color');
                } else {
                    // Total failure: consume the "bad" char and move on
                    this.advance();
                    this.emit(TokenType.ERROR, 'Unexpected character');
                }
            } else {
                // Transition found!
                this.state = nextState;
                this.advance();

                // Check if we hit a terminal state
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

        // Safety check: if for some reason the loop ended without an EOF token, add it.
        const lastToken = this.tokens[this.tokens.length - 1];
        if (!lastToken || lastToken.type !== TokenType.EOF) {
            this.emit(TokenType.EOF, 'Manual EOF');
        }
    }
}
