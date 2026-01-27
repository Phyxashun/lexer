// ./src/utils/InspectOptions.ts

import { inspect } from 'node:util';
import type { InspectOptions } from 'node:util';

const inspectOptions: InspectOptions = {
    showHidden: false,
    depth: null,
    colors: true,
    customInspect: true,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 80,
    compact: true,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

export { inspect, inspectOptions };

/*
[inspect.custom] = (depth: number, options: InspectOptions): string => {
    // Get the stylize function from inspect options for coloring.
    const stylize = options.stylize as InspectStylizeFn;

    // If recursion depth is exhausted, return a simple placeholder.
    if (depth < 0) return stylize(this[Symbol.toStringTag], 'special');

    let output = `CONCRETE SYNTAX TREE (CST):\n`;

    if (Object.keys(this.node).length === 0) {
        output += `${SPACER(4)}// No syntax tree generated.\n`;
    } else {
        let maxValueWidth = 0;
        let maxTypeNameWidth = 0;

        for (const token of this.tokens) {
            const valueStr = `'${token.value.replace(/\n/g, '\\n')}'`;
            if (valueStr.length > maxValueWidth) {
                maxValueWidth = valueStr.length + 1;
            }

            const typeName = TokenType[token.type] || `UNKNOWN(${token.type})`;
            if (typeName.length > maxTypeNameWidth) {
                maxTypeNameWidth = typeName.length + 1;
            }
        }

        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            const TOKEN_CLASSNAME = stylize('Token', 'special');

            // Index
            const idxPadStart = i.toFixed().padStart(3, ' ');
            const IDX = stylize(`[${idxPadStart}]`, 'number');

            // Value
            const tokenValueString = `'${token.value.replace(/\n/g, '\\n')}'`;
            const paddedValue = tokenValueString.padEnd(maxValueWidth, ' ');
            const VAL = stylize(paddedValue, 'string');

            // Type
            const typeName = TokenType[token.type] || `UNKNOWN(${token.type})`;
            const paddedTypeName = typeName.padEnd(maxTypeNameWidth, ' ');
            const TYPE_INFO = stylize(paddedTypeName, 'string');
            const TOKEN_TYPE_LABEL = stylize('TokenType.', 'special');
            const TYPE = `type: ${TOKEN_TYPE_LABEL}${TYPE_INFO}`;

            output += `${SPACER(2)}${TOKEN_CLASSNAME}${IDX}: ${VAL}, ${TYPE}`;

            // Position
            if (token.span) {
                const span = token.span;
                const linPadStart = span.line.toFixed().padStart(2, ' ');
                const colPadStart = span.column.toFixed().padStart(2, ' ');
                const lenPad = span.length.toFixed().padStart(3, ' ');
                const spanInfo = `[L:${linPadStart}, C:${colPadStart}, len:${lenPad}]`;
                output += `, span: ${stylize(spanInfo, 'number')}`;
            }

            // Append the message if it exists.
            if (token.message) {
                output += `, msg: '${stylize(token.message, 'regexp')}'`;
            }
            output += '\n';
        }
    }
    //output += `  ]\n`;
    //output += `}`;
    return output;
}; //*/
