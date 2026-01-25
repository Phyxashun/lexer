// ./src/parser/Validation.ts

import type { CstNode, FunctionNode } from './Node';
import { NodeType } from './Node';
import { ParseError, ParseErrorCode } from './ParseError';

// A generic function that validates a single argument node.
type ArgumentValidator = (arg: CstNode) => boolean;

// A specification for how to validate a function's arguments.
interface FunctionSpec {
    // A list of validator functions. The length of this list is the expected number of arguments.
    args: ArgumentValidator[];
    // Can this function have an optional alpha value at the end?
    alpha: boolean;
}

// --- Individual Argument Validators ---
const isNumber = (n: CstNode) => n.type === NodeType.Number;
const isPercentage = (n: CstNode) => n.type === NodeType.Percentage;
const isAngle = (n: CstNode) =>
    n.type === NodeType.Dimension &&
    ['deg', 'rad', 'grad', 'turn'].includes(n.unit);

// --- The Master Validation Table ---
export const validationTable: Record<string, FunctionSpec> = {
    rgb: {
        args: [isNumber, isNumber, isNumber],
        alpha: true,
    },
    rgba: {
        args: [isNumber, isNumber, isNumber],
        alpha: true,
    },
    hsl: {
        args: [isAngle, isPercentage, isPercentage],
        alpha: true,
    },
    hsla: {
        args: [isAngle, isPercentage, isPercentage],
        alpha: true,
    },
    lch: {
        args: [isPercentage, isNumber, isNumber],
        alpha: true,
    },
    // Add other functions like oklch, hwb, etc. here following the same pattern
};

/**
 * The main validation function. It takes a completed CST node and checks it for semantic correctness.
 * It throws a ParseError if validation fails.
 */
export function validate(node: CstNode, _rawSource: string): void {
    if (node.type !== NodeType.Function) {
        // Hex colors and identifiers are considered valid by default if they were parsed.
        return;
    }

    // It's a function, find its specification.
    const spec = validationTable[node.name];
    if (!spec) {
        // If the function is not in our table, we can either ignore it or error.
        // For now, let's assume unknown functions are valid.
        return;
    }

    // Filter out whitespace and operators to get the actual semantic arguments.
    const semanticArgs: [] = node.children.filter(
        child =>
            child.type !== NodeType.WhiteSpace &&
            child.type !== NodeType.Operator,
    );

    // Check for alpha value
    const expectedArgCount: number = spec.args.length;
    if (spec.alpha && semanticArgs.length === expectedArgCount + 1) {
        const alphaArg = semanticArgs[semanticArgs.length - 1];
        if (!isNumber(alphaArg) && !isPercentage(alphaArg)) {
            throw new ParseError(
                `Invalid alpha value for function '${(node as FunctionNode).name}'`,
                ParseErrorCode.INVALID_ARGUMENT,
                null,
                null,
            );
        }
        // If alpha is valid, we don't include it in the main argument check.
        semanticArgs.pop();
    }

    // Now, check if the number of arguments matches the spec.
    if (semanticArgs.length !== expectedArgCount) {
        throw new ParseError(
            `Function '${(node as FunctionNode).name}' expected ${expectedArgCount.toFixed()} arguments, but received ${semanticArgs.length}`,
            ParseErrorCode.INVALID_ARGUMENT,
            null, // State is less relevant here
            null, // Token is less relevant here
        );
    }

    // Finally, check if each argument has the correct type.
    for (let i = 0; i < expectedArgCount; i++) {
        const arg = semanticArgs[i];
        const validator = spec.args[i];
        if (!validator(arg)) {
            throw new ParseError(
                `Argument ${i + 1} of function '${node.name}' is invalid. Expected ${spec.args[i].name} but got ${arg.type}.`,
                ParseErrorCode.INVALID_ARGUMENT,
                null,
                null,
            );
        }
    }
}
