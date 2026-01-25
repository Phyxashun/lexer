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

        // In TypeScript, 'public' in the constructor arguments automatically
        // assigns the properties. We just need to fix the prototype.
        Object.setPrototypeOf(this, ParseError.prototype);
    }

    public override toString(): string {
        if (!this.token?.span) {
            return `[${this.stateName}] ${this.message}`;
        }

        const title = `Parse Error [${this.stateName}]`;
        return formatSourceError(
            title,
            this.message,
            this.token.span,
            this.source,
        );
    }

    public getDetailedMessage(): string {
        let details = `${this.name} (${this.code}) in state '${this.stateName}': ${this.message}`;
        if (this.token && this.token.span) {
            details += `\n  - Offending Token: '${this.token.value}' (Type: ${this.token.type})`;
            details += `\n  - Position: Start ${this.token.span.start}, End ${this.token.span.end}`;
        }
        return details;
    }
}
