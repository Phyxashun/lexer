// src/utils/ErrorFormatter.ts

import { styleText } from 'node:util';
import { type Span } from '../lexer/Token';

export function formatSourceError(
    title: string,
    message: string,
    span: Span | undefined | null, // Allow span to be optional
    source: string = '',
): string {
    const header = [
        '',
        `${styleText('bgRed', styleText('white', ` ${title} `))}`,
        message,
    ];

    // If there's no span or no source, just return the header block
    if (!span || !source) {
        return [...header, ''].join('\n');
    }

    const lines = source.split(/\r?\n/);
    const lineContent = lines[span.line - 1] || '';

    // Create the gutter/margin
    const lineNum = span.line.toString();
    const margin = styleText('dim', `${lineNum} | `);
    const spacer = ' '.repeat(lineNum.length) + styleText('dim', ' | ');

    // Create the underline (caret)
    const indent = ' '.repeat(Math.max(0, span.column - 1));
    const caret = styleText('red', '^'.repeat(Math.max(1, span.length)));

    return [
        ...header,
        `${margin}${lineContent}`,
        `${spacer}${indent}${caret}`,
        '',
    ].join('\n');
}
