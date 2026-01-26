// ./src/parser/ParserActions.ts

// parserActions.ts
import { type Parser } from './Parser';
import { TokenType, type Token } from '../lexer/Token';
import { NodeType } from './Node';
import type { CstNode } from './Node';
import { ParserState } from './ParserState';
import { ParseError, ParseErrorCode } from './ParseError';

const currentFunc = (parser: Parser, token: Token): FunctionNode => {
    const node = parser.stack[parser.stack.length - 1];

    if (!node) {
        throw new ParseError(
            `Found '${token.value}' outside of a function context.`,
            ParseErrorCode.UNEXPECTED_TOKEN,
            ParserState[parser.state],
            token,
            parser.rawSource,
        );
    }

    if (node.type !== NodeType.Function) {
        throw new ParseError(
            `Internal Parser Error: Expected a FunctionNode on the stack but found ${node.type}.`,
            ParseErrorCode.UNEXPECTED_TOKEN,
            ParserState[parser.state],
            token,
            parser.rawSource,
        );
    }

    return node as FunctionNode;
};

export const createIdentifier: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.Identifier,
        name: token.value,
        span: token.span,
    };
    parser.cst = node;
    console.log('INSIDE PARSER ACTIONS, NODE:', node);
};

export const createHexColor: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.HexColor,
        value: token.value.slice(1),
        span: token.span,
    };
    parser.cst = node;
};

export const startFunction: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.Function,
        name: token.value.toLowerCase(),
        span: token.span,
        children: [],
    };
    if (parser.stack.length > 0) {
        currentFunc(parser).children.push(node);
    }
    parser.stack.push(node);
};

export const finishFunction: Action = (parser: Parser, token: Token) => {
    const finishedNode = parser.stack.pop() as FunctionNode;
    if (!finishedNode) throw new Error('Stack was empty.');

    if (finishedNode.span) {
        finishedNode.span = {
            ...finishedNode.span,
            length: token.span.end - finishedNode.span.start,
        };
    }

    if (parser.stack.length === 0) {
        parser.cst = finishedNode;
        parser.state = ParserState.Complete;
    }
};

export const nodeHandlers: Partial<
    Record<TokenType, (token: Token) => object>
> = {
    [TokenType.NUMBER]: token => ({
        type: NodeType.Number,
        value: token.value,
    }),

    [TokenType.PERCENTAGE]: token => ({
        type: NodeType.Percentage,
        value: token.value.replace(/%/g, ''),
    }),

    [TokenType.DIMENSION]: token => {
        const [, value = '', unit = token.value] =
            /^(-?\d*\.?\d+)(.*)$/.exec(token.value) ?? [];
        return {
            type: NodeType.Dimension,
            value,
            unit,
        };
    },

    [TokenType.IDENTIFIER]: token => ({
        type: NodeType.Identifier,
        name: token.value,
    }),

    [TokenType.WHITESPACE]: () => ({
        type: NodeType.WhiteSpace,
        value: ' ',
    }),

    [TokenType.SLASH]: token => ({
        type: NodeType.Operator,
        value: token.value as '/',
    }),

    [TokenType.COMMA]: token => ({
        type: NodeType.Operator,
        value: token.value as ',',
    }),
};

const createNode = (token: Token, parser: Parser): CstNode => {
    const nodeHandler = nodeHandlers[token.type];

    if (!nodeHandler) {
        throw new ParseError(
            `Cannot use token of type '${token.type}' as a function argument`,
            ParseErrorCode.INVALID_ARGUMENT,
            ParserState[parser.state],
            token,
            parser.rawSource,
        );
    }

    return {
        span: token.span,
        ...nodeHandler(token),
    };
};

export const createAndPushArgument: Action = (parser: Parser, token: Token) => {
    const node: CstNode = createNode(token, parser);
    currentFunc(parser, token).children.push(node);
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} token
 */
export const createAndPushOperator: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.Operator,
        value: token.value as ',' | '/',
        span: token.span,
    };
    currentFunc(parser, token).children.push(node);
};

/**
 * Description placeholder
 *
 * @param {Parser} _parser
 * @param {Token} _token
 */
export const consumeToken: Action = (_parser: Parser, _token: Token) => {
    // This action does nothing but allow the state transition.
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} token
 * @returns {never}
 */
export const reportError: Action = (parser: Parser, token: Token) => {
    throw new Error(
        `Parse Error: Unexpected token '${token.value}' (${token.type}) in state ${ParserState[parser.state]}`,
    );
};
