// src/lexer/LexerError.ts

import { formatSourceError } from '../utils/ErrorFormatter';
import { Token } from './Token';

export class LexerError extends Error {
    constructor(
        public message: string,
        public token: Token,
        public source: string,
    ) {
        super(message);
        this.name = 'LexerError';
        Object.setPrototypeOf(this, LexerError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    public override toString(): string {
        return formatSourceError(
            'Lexer Error',
            this.message,
            this.token.span,
            this.source,
        );
    }
}