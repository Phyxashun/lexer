// ./src/parser/Validation.ts

import type { CstNode } from './Node';
import { NodeType } from './Node';
import { ParseError, ParseErrorCode } from './ParseError';

type NodeValidator = (n: CstNode) => boolean;

interface ColorFunctionSpec {
    channels: ChannelSpec[];
    alpha?: boolean;
}

type ChannelSpec = {
    name: string;
    baseValidator: NodeValidator;
};

// ============================================================================
// Base Validators (for absolute color values)
// ============================================================================

const isNumber: NodeValidator = (n: CstNode) => n.type === NodeType.Number;

const isPercentage: NodeValidator = (n: CstNode) =>
    n.type === NodeType.Percentage;

const isAngle: NodeValidator = (n: CstNode) =>
    n.type === NodeType.Dimension &&
    ['deg', 'rad', 'grad', 'turn'].includes(n.unit);

const isHue: NodeValidator = (n: CstNode) => isAngle(n) || isNumber(n);

const isAlpha: NodeValidator = (n: CstNode) => isNumber(n) || isPercentage(n);

const isColorSource: NodeValidator = (n: CstNode) =>
    n.type === NodeType.NamedColor ||
    n.type === NodeType.HexColor ||
    n.type === NodeType.Function;

const isIdentifier = (n: CstNode) =>
    n.type === NodeType.Identifier || n.type === NodeType.Keyword;

const isCalcFunction = (n: CstNode) =>
    n.type === NodeType.Function && n.name === 'calc';

// ============================================================================
// Channel Reference Detection
// ============================================================================

// Valid channel names for each color space
const CHANNEL_NAMES: Record<string, string[]> = {
    rgb: ['r', 'g', 'b', 'alpha'],
    rgba: ['r', 'g', 'b', 'alpha'],
    hsl: ['h', 's', 'l', 'alpha'],
    hsla: ['h', 's', 'l', 'alpha'],
    hwb: ['h', 'w', 'b', 'alpha'],
    lab: ['l', 'a', 'b', 'alpha'],
    lch: ['l', 'c', 'h', 'alpha'],
    oklab: ['l', 'a', 'b', 'alpha'],
    oklch: ['l', 'c', 'h', 'alpha'],
};

/**
 * Check if a node is a channel reference (identifier matching a valid channel name)
 */
const isChannelReference = (n: CstNode, functionName: string): boolean => {
    if (!isIdentifier(n)) return false;
    const validChannels = CHANNEL_NAMES[functionName] || [];
    return validChannels.includes(n.value);
};

/**
 * Create a validator that accepts either:
 * - Base type (number, percentage, etc.)
 * - Channel reference (r, g, b, h, s, l, etc.)
 * - calc() function
 */
const createRelativeValidator = (
    baseValidator: NodeValidator,
    functionName: string,
): NodeValidator => {
    return (n: CstNode) => {
        return (
            baseValidator(n) ||
            isChannelReference(n, functionName) ||
            isCalcFunction(n)
        );
    };
};

// ============================================================================
// Color Function Specifications
// ============================================================================

export const COLOR_FUNCTIONS: Record<string, ColorFunctionSpec> = {
    rgb: {
        channels: [
            { name: 'r', baseValidator: isNumber },
            { name: 'g', baseValidator: isNumber },
            { name: 'b', baseValidator: isNumber },
        ],
        alpha: true,
    },
    rgba: {
        channels: [
            { name: 'r', baseValidator: isNumber },
            { name: 'g', baseValidator: isNumber },
            { name: 'b', baseValidator: isNumber },
        ],
        alpha: true,
    },
    hsl: {
        channels: [
            { name: 'h', baseValidator: isHue },
            { name: 's', baseValidator: isPercentage },
            { name: 'l', baseValidator: isPercentage },
        ],
        alpha: true,
    },
    hsla: {
        channels: [
            { name: 'h', baseValidator: isHue },
            { name: 's', baseValidator: isPercentage },
            { name: 'l', baseValidator: isPercentage },
        ],
        alpha: true,
    },
    hwb: {
        channels: [
            { name: 'h', baseValidator: isHue },
            { name: 'w', baseValidator: isPercentage },
            { name: 'b', baseValidator: isPercentage },
        ],
        alpha: true,
    },
    lab: {
        channels: [
            { name: 'l', baseValidator: isPercentage },
            { name: 'a', baseValidator: isNumber },
            { name: 'b', baseValidator: isNumber },
        ],
        alpha: true,
    },
    lch: {
        channels: [
            { name: 'l', baseValidator: isPercentage },
            { name: 'c', baseValidator: isNumber },
            { name: 'h', baseValidator: isHue },
        ],
        alpha: true,
    },
    oklab: {
        channels: [
            { name: 'l', baseValidator: isPercentage },
            { name: 'a', baseValidator: isNumber },
            { name: 'b', baseValidator: isNumber },
        ],
        alpha: true,
    },
    oklch: {
        channels: [
            { name: 'l', baseValidator: isPercentage },
            { name: 'c', baseValidator: isNumber },
            { name: 'h', baseValidator: isHue },
        ],
        alpha: true,
    },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get meaningful children (filter out whitespace and operators)
 */
export const meaningfulChildren = (node: CstNode): CstNode[] => {
    if (!node.children) return [];
    return node.children.filter(
        n => n.type !== NodeType.WhiteSpace && n.type !== NodeType.Operator,
    );
};

/**
 * Check if a node is the 'from' keyword
 */
const isFromKeyword = (n: CstNode): boolean => {
    return isIdentifier(n) && n.value === 'from';
};

/**
 * Detect if this is a relative color (starts with "from")
 */
const isRelativeColor = (node: CstNode): boolean => {
    const items = meaningfulChildren(node);
    return items.length > 0 && isFromKeyword(items[0]);
};

/**
 * Split arguments before and after slash (for alpha channel)
 */
const splitAtSlash = (
    items: CstNode[],
): { args: CstNode[]; alpha: CstNode | null } => {
    const slashIndex = items.findIndex(n => n.type === NodeType.Slash);

    if (slashIndex === -1) {
        return { args: items, alpha: null };
    }

    return {
        args: items.slice(0, slashIndex),
        alpha: items[slashIndex + 1] || null,
    };
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate relative color syntax: rgb(from red r g b)
 */
const validateRelativeColor = (
    node: CstNode,
    spec: ColorFunctionSpec,
    rawSource: string,
): CstNode => {
    const items = meaningfulChildren(node);

    // Must start with 'from'
    if (!isFromKeyword(items[0])) {
        throw new ParseError(
            `Relative color must start with 'from'`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            node,
            rawSource,
        );
    }

    // Must have a color source
    const source = items[1];
    if (!source || !isColorSource(source)) {
        throw new ParseError(
            `Invalid relative color source`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            source || node,
            rawSource,
        );
    }

    // Get channel values and alpha
    const rest = items.slice(2);
    const { args, alpha } = splitAtSlash(rest);

    // Validate argument count
    if (args.length !== spec.channels.length) {
        throw new ParseError(
            `Function '${node.name}' expects ${spec.channels.length} channels`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            node,
            rawSource,
        );
    }

    // Validate each channel (allowing channel references and calc)
    args.forEach((arg, i) => {
        const channel = spec.channels[i];
        const validator = createRelativeValidator(
            channel.baseValidator,
            node.name,
        );

        if (!validator(arg)) {
            throw new ParseError(
                `Invalid value for channel '${channel.name}'`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                arg,
                rawSource,
            );
        }
    });

    // Validate alpha if present (can also be a channel reference like 'alpha')
    if (alpha !== null) {
        if (!spec.alpha) {
            throw new ParseError(
                `Function '${node.name}' does not support alpha channel`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                node,
                rawSource,
            );
        }

        const alphaValidator = createRelativeValidator(isAlpha, node.name);
        if (!alphaValidator(alpha)) {
            throw new ParseError(
                `Invalid alpha value`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                alpha,
                rawSource,
            );
        }
    }
    return node;
};

/**
 * Validate absolute color syntax: rgb(255, 100, 0)
 */
const validateAbsoluteColor = (
    node: CstNode,
    spec: ColorFunctionSpec,
    rawSource: string,
): CstNode => {
    const items = meaningfulChildren(node);
    const { args, alpha } = splitAtSlash(items);

    // Validate argument count
    if (args.length !== spec.channels.length) {
        throw new ParseError(
            `Function '${node.name}' expected ${spec.channels.length} arguments`,
            ParseErrorCode.INVALID_ARGUMENT,
            'Validation',
            node,
            rawSource,
        );
    }

    // Validate each channel
    args.forEach((arg, i) => {
        const channel = spec.channels[i];
        if (!channel.baseValidator(arg)) {
            throw new ParseError(
                `Invalid value for ${channel.name}`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                arg,
                rawSource,
            );
        }
    });

    // Validate alpha if present
    if (alpha !== null) {
        if (!spec.alpha) {
            throw new ParseError(
                `Function '${node.name}' does not support alpha channel`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                node,
                rawSource,
            );
        }

        if (!isAlpha(alpha)) {
            throw new ParseError(
                `Invalid alpha value`,
                ParseErrorCode.INVALID_ARGUMENT,
                'Validation',
                alpha,
                rawSource,
            );
        }
    }
    return node;
};

/**
 * Main validation entry point for color functions
 */
export const validateColorFunction = (
    node: CstNode,
    rawSource: string,
): CstNode => {
    const spec = COLOR_FUNCTIONS[node.name];

    if (!spec) return;

    if (isRelativeColor(node)) {
        return validateRelativeColor(node, spec, rawSource);
    } else {
        return validateAbsoluteColor(node, spec, rawSource);
    }
};

/**
 * Validate hex color format
 */
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

    return node;
};
