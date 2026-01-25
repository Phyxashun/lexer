// src/lexer/LexerError.ts

import { styleText } from 'node:util';
import { formatSourceError } from '../utils/ErrorFormatter';
import { Span } from './Span';

export class LexerError extends Error {
    constructor(
        public message: string,
        public span: Span,
        public source: string,
    ) {
        super(message);
        this.name = 'LexerError';

        // This line is crucial for ensuring `instanceof ParseError` works correctly
        Object.setPrototypeOf(this, LexerError.prototype);

        // This keeps the stack trace clean
        Error.captureStackTrace(this, this.constructor);
    }

    public override toString(): string {
        return formatSourceError(
            'Lexer Error',
            this.message,
            this.span,
            this.source,
        );
    }

    public getDetailedMessage(): string {
        const lineStr = this.source.split('\n')[this.span.line - 1];
        const padding = ' '.repeat(this.span.column - 1);
        const underline = styleText(
            'red',
            '^'.repeat(Math.max(1, this.span.end - this.span.start)),
        );

        return [
            styleText('red', `Lexer Error: ${this.message}`),
            `At line ${this.span.line}, column ${this.span.column}:`,
            '',
            `  ${lineStr}`,
            `  ${padding}${underline}`,
            '',
        ].join('\n');
    }
}
