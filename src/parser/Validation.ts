// ./src/parser/Validation.ts

import type { CstNode } from './Node';
import { NodeType } from './Node';
import { ParseError, ParseErrorCode } from './ParseError';
import { inspect, inspectOptions } from '../utils/InspectOptions';

type NodeValidator = (n: CstNode) => boolean;

interface FunctionSpec {
    args: NodeValidator[];
    alpha: boolean;
}

type ChannelSpec = {
    name: string;
    accepts: (n: CstNode) => boolean;
};

interface ColorFunctionSpec {
    channels: ChannelSpec[];
    alpha?: boolean;
    relative?: boolean;
}

// Individual Validators
const isIdentifier = (n: CstNode) => n.type === NodeType.Identifier;
const isNumber: NodeValidator = (n: CstNode) => n.type === NodeType.Number;
const isPercentage: NodeValidator = (n: CstNode) =>
    n.type === NodeType.Percentage;
const isAngle: NodeValidator = (n: CstNode) =>
    n.type === NodeType.Dimension &&
    ['deg', 'rad', 'grad', 'turn'].includes(n.unit);
const isAlpha: NodeValidator = (n: CstNode) => isNumber(n) || isPercentage(n);
const isColorSource: NodeValidator = (n: CstNode) =>
    n.type === NodeType.NamedColor ||
    n.type === NodeType.HexColor ||
    n.type === NodeType.Function;
const isHue: NodeValidator = (n: CstNode) => isAngle(n) || isNumber(n);
const isChannelReference =
    (name: string): NodeValidator =>
    (n: CstNode) =>
        isIdentifier(n) && n.value === name;
const acceptsRelative =
    (base: NodeValidator, name: string): NodeValidator =>
    (n: CstNode) =>
        base(n) || isChannelReference(name)(n) || n.type === NodeType.Function;
const isFrom = (n: CstNode) =>
    (n.type === NodeType.Keyword || n.type === NodeType.Identifier) &&
    n.value === 'from';
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

export const meaningfulChildren = (node: CstNode): CstNode[] => {
    if (!node.children) return [];
    return node.children.filter(
        n => n.type !== NodeType.WhiteSpace && n.type !== NodeType.Operator,
    );
};

export const COLOR_FUNCTIONS: Record<string, ColorFunctionSpec> = {
    rgb: {
        channels: [
            { name: 'r', accepts: acceptsRelative(isNumber, 'r') },
            { name: 'g', accepts: acceptsRelative(isNumber, 'g') },
            { name: 'b', accepts: acceptsRelative(isNumber, 'b') },
        ],
        alpha: true,
        relative: true,
    },

    hsl: {
        channels: [
            { name: 'h', accepts: acceptsRelative(isHue, 'h') },
            { name: 's', accepts: acceptsRelative(isPercentage, 's') },
            { name: 'l', accepts: acceptsRelative(isPercentage, 'l') },
        ],
        alpha: true,
        relative: true,
    },

    hwb: {
        channels: [
            { name: 'h', accepts: acceptsRelative(isHue, 'h') },
            { name: 'w', accepts: acceptsRelative(isPercentage, 'w') },
            { name: 'b', accepts: acceptsRelative(isPercentage, 'b') },
        ],
        alpha: true,
        relative: true,
    },

    lab: {
        channels: [
            { name: 'l', accepts: acceptsRelative(isPercentage, 'l') },
            { name: 'a', accepts: acceptsRelative(isNumber, 'a') },
            { name: 'b', accepts: acceptsRelative(isNumber, 'b') },
        ],
        alpha: true,
        relative: true,
    },

    lch: {
        channels: [
            { name: 'l', accepts: acceptsRelative(isPercentage, 'l') },
            { name: 'c', accepts: acceptsRelative(isNumber, 'c') },
            { name: 'h', accepts: acceptsRelative(isHue, 'h') },
        ],
        alpha: true,
        relative: true,
    },

    oklab: {
        channels: [
            { name: 'l', accepts: acceptsRelative(isPercentage, 'l') },
            { name: 'a', accepts: acceptsRelative(isNumber, 'a') },
            { name: 'b', accepts: acceptsRelative(isNumber, 'b') },
        ],
        alpha: true,
        relative: true,
    },

    oklch: {
        channels: [
            { name: 'l', accepts: acceptsRelative(isPercentage, 'l') },
            { name: 'c', accepts: acceptsRelative(isNumber, 'c') },
            { name: 'h', accepts: acceptsRelative(isHue, 'h') },
        ],
        alpha: true,
        relative: true,
    },
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

export const validateRelativeColor = (
    node: CstNode,
    spec: ColorFunctionSpec,
    rawSource: string,
) => {
    const items = meaningfulChildren(node);

    if (!isFrom(items[0])) {
        throw new ParseError(
            `Relative color must start with 'from'`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            node,
            rawSource,
        );
    }

    const source = items[1];
    if (!isColorSource(source)) {
        throw new ParseError(
            `Invalid relative color source`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            source,
            rawSource,
        );
    }

    let args = items.slice(2);
    let alpha: CstNode | null = null;

    const slash = args.findIndex(n => n.type === NodeType.Slash);
    if (slash !== -1) {
        alpha = args[slash + 1];
        args = args.slice(0, slash);

        if (!alpha || !isAlpha(alpha)) {
            throw new ParseError(
                `Invalid alpha value`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                alpha ?? node,
                rawSource,
            );
        }
    }

    if (args.length !== spec.channels.length) {
        throw new ParseError(
            `Function '${node.name}' expects ${spec.channels.length} channels`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            node,
            rawSource,
        );
    }

    args.forEach((arg, i) => {
        if (!spec.channels[i].accepts(arg)) {
            throw new ParseError(
                `Invalid value for channel '${spec.channels[i].name}'`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                arg,
                rawSource,
            );
        }
    });
};

export const validateAbsoluteColor = (
    node: CstNode,
    spec: ColorFunctionSpec,
    rawSource: string,
) => {
    const items = meaningfulChildren(node);

    let args = items;
    let alpha: CstNode | null = null;

    const slash = items.findIndex(n => n.type === NodeType.Slash);
    if (slash !== -1) {
        args = items.slice(0, slash);
        alpha = items[slash + 1];

        if (!spec.alpha || !alpha || !isAlpha(alpha)) {
            throw new ParseError(
                `Invalid alpha value`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                alpha ?? node,
                rawSource,
            );
        }
    }

    if (args.length !== spec.channels.length) {
        throw new ParseError(
            `Function '${node.name}' expected ${spec.channels.length} arguments`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            node,
            rawSource,
        );
    }

    args.forEach((arg, i) => {
        if (!spec.channels[i].accepts(arg)) {
            throw new ParseError(
                `Invalid value for ${spec.channels[i].name}`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                arg,
                rawSource,
            );
        }
    });
};

export const validateHexColor = (node: CstNode, rawSource: string): CstNode => {
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

export const validate = (node: CstNode, rawSource: string): void => {
    if (node.type === NodeType.HexColor) {
        validateHexColor(node, rawSource);
        return;
    }

    if (node.type !== NodeType.Function) return;

    const spec = COLOR_FUNCTIONS[node.name];
    if (!spec) return;

    const hasFrom = meaningfulChildren(node).some(isFrom);

    if (hasFrom && spec.relative) {
        validateRelativeColor(node, spec, rawSource);
    } else {
        validateAbsoluteColor(node, spec, rawSource);
    }
};
