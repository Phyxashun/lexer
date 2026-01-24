// src/lexer/LexerError.ts

import { styleText } from 'node:util';
import { Span } from './Span';

export class LexerError extends Error {
    constructor(
        public message: string,
        public span: Span,
        public source: string,
    ) {
        super(message);
        this.name = 'LexerError';
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
