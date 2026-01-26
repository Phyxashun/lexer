// ./src/parser/Validation.ts

import type { CstNode } from './Node';
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
export function validate(node: CstNode, rawSource: string): void {
    // Hex
    if (node.type === NodeType.HexColor) {
        const hex = node.value;

        if (!/^[0-9a-fA-F]+$/.test(hex)) {
            throw new ParseError(
                'Hex color contains invalid characters',
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                node,
                rawSource,
            );
        }

        if (![3, 4, 6, 8].includes(hex.length)) {
            throw new ParseError(
                `Invalid hex length ${hex.length}`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                node,
                rawSource,
            );
        }

        return;
    }

    // Non-functions
    if (node.type !== NodeType.Function) return;

    const spec = validationTable[node.name];
    if (!spec) return;

    // Strip trivia
    const meaningful = node.children.filter(
        n => n.type !== NodeType.WhiteSpace && n.type !== NodeType.Operator,
    );

    // Split on slash
    const slashIndex = meaningful.findIndex(n => n.type === NodeType.Slash);

    let args: CstNode[];
    let alpha: CstNode | null = null;

    if (slashIndex !== -1) {
        args = meaningful.slice(0, slashIndex);
        alpha = meaningful[slashIndex + 1] ?? null;

        if (!spec.alpha) {
            throw new ParseError(
                `Function '${node.name}' does not accept alpha`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                { span: node.span },
                rawSource,
            );
        }

        if (!alpha || (!isNumber(alpha) && !isPercentage(alpha))) {
            throw new ParseError(
                `Invalid alpha value`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                { span: alpha?.span ?? node.span },
                rawSource,
            );
        }
    } else {
        args = meaningful;
    }

    //  Arity
    if (args.length !== spec.args.length) {
        throw new ParseError(
            `Function '${node.name}' expected ${spec.args.length} arguments, but received ${args.length}`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            { span: node.span },
            rawSource,
        );
    }

    //  Type checking
    for (let i = 0; i < spec.args.length; i++) {
        if (!spec.args[i](args[i])) {
            throw new ParseError(
                `Argument ${i + 1} of '${node.name}' is invalid`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                { span: args[i].span },
                rawSource,
            );
        }
    }
}
