// ./src/parser/ParseError.ts

import { formatSourceError } from '../utils/ErrorFormatter';
import { type Token } from '../lexer/Token';

export enum ParseErrorCode {
    UNEXPECTED_TOKEN = 'UNEXPECTED_TOKEN',
    UNEXPECTED_EOF = 'UNEXPECTED_EOF',
    UNCLOSED_FUNCTION = 'UNCLOSED_FUNCTION',
    INVALID_ARGUMENT = 'INVALID_ARGUMENT',
}

export class ParseError extends Error {
    constructor(
        public override message: string,
        public code: ParseErrorCode,
        public stateName: string,
        public token: Token,
        public source: string,
    ) {
        super(message);
        this.name = 'ParseError';
        Object.setPrototypeOf(this, ParseError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    public override toString(): string {
        const title = `Parse Error [${this.stateName}]`;
        return formatSourceError(
            title,
            this.message,
            this.token.span,
            this.source,
        );
    }
}
