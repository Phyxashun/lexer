// ./src/parser/Parser.ts

import { inspect, type InspectOptions, type InspectStylizeFn } from 'node:util';
import { TokenType, type Token } from '../lexer/Token';
import { ParseError, ParseErrorCode } from './ParseError';
import type { CstNode, FunctionNode } from './Node';
import { NodeType } from './Node';
import { validateColorFunction, validateHexColor } from './Validation';

const SPACER = (n: number = 1): string => ' '.repeat(n);

export class Parser {
    public readonly [Symbol.toStringTag] = 'Parser';
    public readonly node: CstNode = {};
    private pos = 0;

    constructor(
        public readonly tokens: Token[],
        public readonly rawSource?: string,
    ) {}

    [inspect.custom] = (depth: number, options: InspectOptions): string => {
        const stylize = options.stylize as InspectStylizeFn;

        if (depth < 0 || !this.node || Object.keys(this.node).length === 0) {
            return stylize(
                this.node ? this[Symbol.toStringTag] : '// Empty Parse Result',
                'special',
            );
        }

        // This object will store the maximum widths found in the tree.
        const widths = {
            maxTypeWidth: 0,
            maxPropsWidth: 0,
        };

        /**
         * Recursively traverses the CST to calculate the maximum width needed
         * for the type and properties columns.
         * @param node The current node in the tree.
         */
        const calculateNodeWidths = (node: CstNode): void => {
            if (!node) return;

            // NodeType
            const type = 'NodeType.';
            const stylizedType = stylize(type, 'special');
            const typeValue = NodeType[node.type];
            const stylizedTypeValue = stylize(typeValue, 'string');
            const nodeTypeString = stylizedType + stylizedTypeValue;
            const formattedType = `type: ${nodeTypeString}`;
            widths.maxTypeWidth = Math.max(
                widths.maxTypeWidth,
                formattedType.length,
            );

            // Properties (e.g., "name: 'rgb'")
            const props = [];
            if ('name' in node) {
                const propName = `name: '${node.name}'`;
                props.push(propName);
            }
            if ('value' in node) {
                const propValue = `value: '${String(node.value)}'`;
                props.push(propValue);
            }
            if ('unit' in node) {
                const propUnit = `unit: '${node.unit}'`;
                props.push(propUnit);
            }
            const propsString = props.join(', ');
            widths.maxPropsWidth = Math.max(
                widths.maxPropsWidth,
                propsString.length,
            );

            // Recurse into children
            if ('children' in node && node.children) {
                for (const child of node.children) {
                    calculateNodeWidths(child);
                }
            }
        };

        /**
         * Recursively traverses the CST to render a formatted string representation,
         * using the pre-calculated maximum widths for padding.
         * @param node The current node to render.
         * @param indent The number of spaces to move right for the current level.
         * @returns A string representation of the node tree.
         */
        const renderNode = (node: CstNode, indent: number): string => {
            let output = SPACER(indent);

            // Properties
            const props = [];
            if ('name' in node)
                props.push(`name: '${stylize(node.name, 'number')}'`);

            if ('value' in node) {
                const value =
                    node.type === NodeType.WhiteSpace ? '\u0020' : node.value;
                const displayValue = `'${value.toString()}'`;
                props.push(`value: ${stylize(displayValue, 'date')}`);
            }

            if ('unit' in node)
                props.push(`unit: '${stylize(node.unit, 'string')}'`);

            const propsString = props.join(', ');
            const helperRegex = new RegExp(/\u001b\[\d+m/, 'g');
            const visualLength = propsString.replace(helperRegex, '').length;
            const maxProp = widths.maxPropsWidth - visualLength;
            const maxPropLength = Math.max(0, maxProp);
            const propsPadding = SPACER(maxPropLength);
            output += `${propsString}${propsPadding}`;

            // Add a comma if there were properties
            if (props.length > 0) output += ', ';

            // NodeType
            const type = 'NodeType.';
            const stylizedType = stylize(type, 'special');
            const typeValue = NodeType[node.type];
            const stylizedTypeValue = stylize(typeValue, 'string');
            const nodeTypeString = stylizedType + stylizedTypeValue;
            const styledType = `type: ${nodeTypeString}`;
            output += styledType.padEnd(widths.maxTypeWidth, SPACER(1));
            output += ' , ';

            // Span
            if (options.showSpan && node.span) {
                const span = node.span;
                const start = span.start.toFixed().padStart(2, ' ');
                const end = span.end.toFixed().padStart(2, ' ');
                const line = span.line.toFixed().padStart(2, ' ');
                const column = span.column.toFixed().padStart(2, ' ');
                const length = span.length.toFixed().padStart(3, ' ');
                const spanInfo = `[S:${start}, E:${end}, L:${line}, C:${column}, len:${length}]`;
                output += `span: ${stylize(spanInfo, 'number')}`;
            }
            output += '\n';

            // Recurse into children
            const childIndent = indent;
            if (
                'children' in node &&
                node.children &&
                node.children.length > 0
            ) {
                output += `${SPACER(childIndent)}CHILDREN:\n${SPACER(childIndent)}[\n`;
                for (const child of node.children) {
                    output += renderNode(child, childIndent + indent);
                }
                output += `${SPACER(childIndent)}]\n`;
            }
            return output;
        };

        // --- Execution ---
        // First pass: Calculate all widths
        calculateNodeWidths(this.node);

        // Second pass: Render the tree with alignment
        const treeOutput = renderNode(this.node, 2);

        const name = this.constructor.name.toUpperCase();
        const className = stylize(name + ': ', 'special');
        return `${className}\n{\n${treeOutput}}}`;
    };

    private isEOF(): boolean {
        return (
            this.pos >= this.tokens.length ||
            this.tokens[this.pos]?.type === TokenType.EOF
        );
    }

    private peek(): Token {
        if (this.isEOF()) {
            return this.tokens[this.tokens.length - 1];
        }
        return this.tokens[this.pos];
    }

    private consume(): Token {
        const token = this.peek();
        if (token.type !== TokenType.EOF) {
            this.pos++;
        }
        return token;
    }

    private expect(type: TokenType): Token {
        const token = this.peek();

        if (token.type !== type) {
            throw new ParseError(
                `Expected token '${type}', but found '${token.value}'.`,
                ParseErrorCode.UNEXPECTED_TOKEN,
                'Parser',
                token,
                this.rawSource,
            );
        }

        return this.consume();
    }

    private match(type: TokenType): boolean {
        return this.peek().type === type;
    }

    private peekPrev(): Token {
        return this.tokens[this.pos - 1] ?? this.tokens[0];
    }

    public parse(): CstNode {
        this.node = this.parseColor();
        return this.node;
    }

    private parseColor(): CstNode {
        const token = this.peek();

        switch (token.type) {
            case TokenType.COLOR:
                return this.parseNamedColor();

            case TokenType.HEX_COLOR:
                return this.parseHexColor();

            case TokenType.FUNCTION:
                return this.parseFunction();

            default:
                throw this.unexpected(token);
        }
    }

    private parseHexColor(): HexColorNode {
        const token = this.expect(TokenType.HEX_COLOR);
        const node = {
            type: NodeType.HexColor,
            value: token.value.slice(1),
            span: token.span,
        };
        return validateHexColor(node, this.rawSource);
    }

    private parseNamedColor(): NamedColorNode {
        const token = this.expect(TokenType.COLOR);
        return {
            type: NodeType.NamedColor,
            name: token.value,
            span: token.span,
        };
    }

    private parseFunction(): FunctionNode {
        const nameToken = this.expect(TokenType.FUNCTION);

        const node: FunctionNode = {
            type: NodeType.Function,
            name: nameToken.value.toLowerCase(),
            span: nameToken.span,
            children: [],
        };

        this.expect(TokenType.LPAREN);

        if (!this.match(TokenType.RPAREN)) {
            this.parseArguments(node);
            this.expect(TokenType.RPAREN);
        }

        node.span = {
            ...node.span,
            length: this.peekPrev().span.end - node.span.start,
        };

        return validateColorFunction(node, this.rawSource);
    }

    private parseArguments(func: FunctionNode): void {
        while (!this.match(TokenType.RPAREN)) {
            while (this.match(TokenType.WHITESPACE)) {
                func.children.push(this.parseWhitespace());
            }

            if (this.match(TokenType.RPAREN)) break;

            if (this.match(TokenType.COMMA)) {
                func.children.push(this.parseComma());
                continue;
            }

            if (this.match(TokenType.SLASH)) {
                func.children.push(this.parseSlash());
                continue;
            }

            func.children.push(this.parseArgument());
        }
    }

    private parseArgument(): CstNode {
        const token = this.peek();

        switch (token.type) {
            case TokenType.COLOR:
                return this.parseNamedColor();

            case TokenType.HEX_COLOR:
                return this.parseHexColor();

            case TokenType.NUMBER:
                return this.parseNumericLiteral();

            case TokenType.PERCENTAGE:
                return this.parsePercentage();

            case TokenType.DIMENSION:
                return this.parseDimension();

            case TokenType.IDENTIFIER:
                return this.parseIdentifier();

            case TokenType.KEYWORD:
                return this.parseKeyword();

            case TokenType.CHANNEL:
                return this.parseChannel();

            case TokenType.FUNCTION:
                return this.parseFunction();

            default:
                throw this.unexpected(token);
        }
    }

    private parseWhitespace(): CstNode {
        const token = this.expect(TokenType.WHITESPACE);
        return {
            type: NodeType.WhiteSpace,
            value: ' ',
            span: token.span,
        };
    }

    private parseComma(): CstNode {
        const token = this.expect(TokenType.COMMA);
        return {
            type: NodeType.Operator,
            value: ',',
            span: token.span,
        };
    }

    private parseSlash(): CstNode {
        const token = this.expect(TokenType.SLASH);
        return {
            type: NodeType.Slash,
            value: '/',
            span: token.span,
        };
    }

    private parseNumericLiteral(): CstNode {
        const token = this.expect(TokenType.NUMBER);
        return {
            type: NodeType.Number,
            value: token.value,
            span: token.span,
        };
    }

    private parsePercentage(): CstNode {
        const token = this.expect(TokenType.PERCENTAGE);
        return {
            type: NodeType.Percentage,
            value: token.value.replace(/%/g, ''),
            span: token.span,
        };
    }

    private parseDimension(): CstNode {
        const token = this.expect(TokenType.DIMENSION);
        const [, value = '', unit = token.value] =
            /^(-?\d*\.?\d+)(.*)$/.exec(token.value) ?? [];
        return {
            type: NodeType.Dimension,
            value,
            unit,
            span: token.span,
        };
    }

    private parseIdentifier(): CstNode {
        const token = this.expect(TokenType.IDENTIFIER);
        return {
            type: NodeType.Identifier,
            value: token.value,
            span: token.span,
        };
    }

    private parseKeyword(): CstNode {
        const token = this.expect(TokenType.KEYWORD);
        return {
            type: NodeType.Keyword,
            value: token.value,
            span: token.span,
        };
    }

    private parseChannel(): CstNode {
        const token = this.expect(TokenType.CHANNEL);
        return {
            type: NodeType.Channel,
            value: token.value,
            span: token.span,
        };
    }

    private unexpected(token: Token): never {
        throw new ParseError(
            `Unexpected token type: '${token.type}' with value: '${token.value}'.`,
            ParseErrorCode.UNEXPECTED_TOKEN,
            'Parser',
            token,
            this.rawSource,
        );
    }
}