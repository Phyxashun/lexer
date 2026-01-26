// ./src/parser/Validation.ts

import type { CstNode } from './Node';
import { NodeType } from './Node';
import { ParseError, ParseErrorCode } from './ParseError';

// A generic function that validates a single argument node.
type ArgumentValidator = (arg: CstNode) => boolean;

// A specification for how to validate a function's arguments.
interface FunctionSpec {
    args: ArgumentValidator[];
    alpha: boolean;
}

// Individual Argument Validators
const isNumber = (n: CstNode) => n.type === NodeType.Number;
const isPercentage = (n: CstNode) => n.type === NodeType.Percentage;
const isAngle = (n: CstNode) =>
    n.type === NodeType.Dimension &&
    ['deg', 'rad', 'grad', 'turn'].includes(n.unit);
const hasKeyword = (node: CstNode, value: string): boolean => {
    return (
        node.type === NodeType.Function &&
        node.children.some(
            n => n.type === NodeType.Keyword && n.value === value,
        )
    );
};

const relativeChannels: Record<string, string[]> = {
    rgb: ['r', 'g', 'b'],
    rgba: ['r', 'g', 'b'],
    hsl: ['h', 's', 'l'],
    hwb: ['h', 'w', 'b'],
    lab: ['l', 'a', 'b'],
    lch: ['l', 'c', 'h'],
    oklab: ['l', 'a', 'b'],
    oklch: ['l', 'c', 'h'],
};

const stripTrivial = (node: CstNode): CstNode => {
    return node.children.filter(
        n => n.type !== NodeType.WhiteSpace && n.type !== NodeType.Operator,
    );
};

// The Master Validation Table
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

export const validateRelativeColor = (node: CstNode): CstNode => {
    if (node.type !== NodeType.Function) return;

    const meaningful = node.children.filter(
        n => n.type !== NodeType.WhiteSpace && n.type !== NodeType.Operator,
    );

    // Expect: from <color> <channels> [/ alpha]
    if (
        meaningful.length < 3 ||
        meaningful[0].type !== NodeType.Keyword ||
        meaningful[0].value !== 'from'
    ) {
        throw new ParseError(
            `Relative color must begin with 'from'`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            { span: node.span },
            '',
        );
    }

    const source = meaningful[1];

    if (
        source.type !== NodeType.NamedColor &&
        source.type !== NodeType.HexColor &&
        source.type !== NodeType.Function
    ) {
        throw new ParseError(
            `Invalid source color for relative color`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            { span: source.span },
            '',
        );
    }

    let rest = meaningful.slice(2);

    // Split channels / alpha
    let alpha: CstNode | null = null;
    const slashIndex = rest.findIndex(n => n.type === NodeType.Slash);

    if (slashIndex !== -1) {
        alpha = rest[slashIndex + 1] ?? null;
        rest = rest.slice(0, slashIndex);

        if (
            !alpha ||
            (alpha.type !== NodeType.Number &&
                alpha.type !== NodeType.Percentage)
        ) {
            throw new ParseError(
                `Invalid alpha value in relative color`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                { span: alpha?.span ?? node.span },
                '',
            );
        }
    }

    // Channel validation
    const allowed = relativeChannels[node.name];
    if (!allowed) return;

    const channels = rest.filter(n => n.type === NodeType.Identifier);

    if (channels.length !== allowed.length) {
        throw new ParseError(
            `Function '${node.name}' expects ${allowed.length} channels`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            { span: node.span },
            '',
        );
    }

    for (const ch of channels) {
        if (!allowed.includes(ch.value)) {
            throw new ParseError(
                `Invalid channel '${ch.value}' for ${node.name}()`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                { span: ch.span },
                '',
            );
        }
    }
    return node;
};

export const validateHexColor = (node: CstNode): CstNode => {
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

    return hex;
};

export const validate = (node: CstNode, rawSource: string): CstNode => {
    // Hex
    if (node.type === NodeType.HexColor) {
        return validateHexColor(node);
    }

    // Relative Colors
    if (node.type === NodeType.Function && hasKeyword(node, 'from')) {
        return validateRelativeColor(node);
    }

    // Non-functions
    if (node.type !== NodeType.Function) return;

    const spec = validationTable[node.name];
    if (!spec) return;

    // Strip trivial
    const meaningful = stripTrivial(node);

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
};
