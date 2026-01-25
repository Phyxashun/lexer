// ./src/parser/TransitionTable.ts

// transitionTable.ts
import { ParserState, type TransitionTable } from './ParserState';
import { TokenType } from '../lexer/Token';
import * as actions from './ParserActions';

export const CSSColorParserTable: TransitionTable = {
    // State: Initial
    [ParserState.Initial]: {
        [TokenType.IDENTIFIER]: {
            action: actions.createIdentifier,
            nextState: ParserState.Complete,
        },
        [TokenType.HEX_COLOR]: {
            action: actions.createHexColor,
            nextState: ParserState.Complete,
        },
        [TokenType.FUNCTION]: {
            action: actions.startFunction,
            nextState: ParserState.AwaitLeftParen,
        },
    },

    // State: AwaitLeftParen
    // (Just saw 'rgb', expecting '(')
    [ParserState.AwaitLeftParen]: {
        [TokenType.LPAREN]: {
            action: actions.consumeToken,
            nextState: ParserState.AwaitArgument,
        },
    },

    // State: AwaitArgument
    // (Inside a function, expecting a value or a closing paren)
    [ParserState.AwaitArgument]: {
        // These are the actual values
        [TokenType.NUMBER]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.PERCENTAGE]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.DIMENSION]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.IDENTIFIER]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },

        // Handle nested functions (like `var()`)
        [TokenType.FUNCTION]: {
            action: actions.startFunction,
            nextState: ParserState.AwaitLeftParen,
        },

        // These are the syntactic separators
        [TokenType.WHITESPACE]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.COMMA]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.SLASH]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitArgument,
        },

        // This ends the current function parsing
        [TokenType.RPAREN]: {
            action: actions.finishFunction,
            nextState: ParserState.Complete,
        },
    },

    // State: AwaitSeparator
    // (Just saw an argument, expecting a delimiter or closing paren)
    [ParserState.AwaitSeparator]: {
        [TokenType.COMMA]: {
            action: actions.createAndPushOperator,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.SLASH]: {
            action: actions.createAndPushOperator,
            nextState: ParserState.AwaitArgument,
        },
        [TokenType.RPAREN]: {
            action: actions.finishFunction,
            nextState: ParserState.Complete,
        },
        // Implicit space separator
        // (if we get another argument, we transition back)
        [TokenType.NUMBER]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitSeparator,
        },
        [TokenType.PERCENTAGE]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitSeparator,
        },
        [TokenType.DIMENSION]: {
            action: actions.createAndPushArgument,
            nextState: ParserState.AwaitSeparator,
        },
    },
};
