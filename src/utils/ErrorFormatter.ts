// src/utils/ErrorFormatter.ts
import { styleText } from 'node:util';
import { type Span } from '../lexer/Token';

export function formatSourceError(
    title: string,
    message: string,
    span: Span,
    source: string,
): string {
    const lines = source.split(/\r?\n/);
    const lineContent = lines[span.line - 1] || '';

    // Create the gutter/margin (e.g., " 1 | ")
    const lineNum = span.line.toString();
    const margin = styleText('dim', `${lineNum} | `);
    const spacer = ' '.repeat(lineNum.length) + styleText('dim', ' | ');

    // Create the underline (caret)
    const indent = ' '.repeat(span.column - 1);
    const caret = styleText('red', '^'.repeat(Math.max(1, span.length)));

    return [
        '',
        `${styleText('bgRed', styleText('white', ` ${title} `))}\n${message}`,
        `${margin}${lineContent}`,
        `${spacer}${indent}${caret}`,
        '',
    ].join('\n');
}
