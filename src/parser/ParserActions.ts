// ./src/parser/ParserActions.ts

// parserActions.ts
import { type Parser } from './Parser';
import { TokenType, type Token } from '../lexer/Token';
import { NodeType } from './Node';
import type { CstNode } from './Node';
import { ParserState } from './ParserState';
import { ParseError, ParseErrorCode } from './ParseError';

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @returns {CstNode}
 */
const currentFunc = (parser: Parser): CstNode => {
    const node = parser.stack[parser.stack.length - 1];
    if (node.type !== NodeType.Function)
        throw new Error('Parser error: Expected a FunctionNode on the stack.');
    return node;
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} token
 */
export const createIdentifier: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.Identifier,
        name: token.value,
    };
    parser.ast = node;
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} token
 */
export const createHexColor: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.HexColor,
        value: token.value.slice(1),
    };
    parser.ast = node;
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} token
 */
export const startFunction: Action = (parser: Parser, token: Token) => {
    const node: CstNode = {
        type: NodeType.Function,
        name: token.value.toLowerCase(),
        children: [],
    };
    if (parser.stack.length > 0) {
        currentFunc(parser).children.push(node);
    }
    parser.stack.push(node);
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} _token
 */
export const finishFunction: Action = (parser: Parser, _token: Token) => {
    const finishedNode = parser.stack.pop();
    if (!finishedNode) throw new Error('Stack was empty on finishFunction.');
    if (parser.stack.length === 0) {
        parser.ast = finishedNode;
        parser.state = ParserState.Complete;
    }
};

/**
 * Description placeholder
 *
 * @param {Parser} parser
 * @param {Token} token
 */
export const createAndPushArgument: Action = (parser: Parser, token: Token) => {
    let node: CstNode;

    switch (token.type) {
        case TokenType.NUMBER:
            node = {
                type: NodeType.Number,
                value: token.value,
            };
            break;
        case TokenType.PERCENTAGE:
            node = {
                type: NodeType.Percentage,
                value: token.value.replace(/%/g, ''),
            };
            break;
        case TokenType.DIMENSION: {
            const dimensionPattern = new RegExp(/^(-?\d*\.?\d+)(.*)$/);
            const match = dimensionPattern.exec(token.value);
            node = {
                type: NodeType.Dimension,
                value: match ? match[1] : '',
                unit: match ? match[2] : token.value,
            };
            break;
        }
        case TokenType.IDENTIFIER:
            node = {
                type: NodeType.Identifier,
                name: token.value,
            };
            break;
        case TokenType.WHITESPACE:
            node = {
                type: NodeType.WhiteSpace,
                value: ' ',
            };
            break;
        case TokenType.SLASH:
        case TokenType.COMMA:
            node = {
                type: NodeType.Operator,
                value: token.value as ',' | '/',
            };
            break;
        default:
            throw new ParseError(
                `Cannot use token of type '${token.type}' as a function argument`,
                ParseErrorCode.INVALID_ARGUMENT,
                parser.state,
                token,
            );
    }

    currentFunc(parser).children.push(node);
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
    };
    currentFunc(parser).arguments.push(node);
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
