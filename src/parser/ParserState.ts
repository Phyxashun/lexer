// ./src/parser/ParserState.ts

import { type TokenType } from "../lexer/Token";

/** The states our parser can be in. */
export enum ParserState {
  // Initial and Final States
  Initial = "Initial", // Waiting for any color token
  Complete = "Complete", // Successfully parsed a complete color
  Error = "Error", // A non-recoverable error occurred

  // Function Parsing States
  AwaitLeftParen = "AwaitLeftParen", // Just saw a FUNCTION token, expecting '('
  AwaitArgument = "AwaitArgument", // Inside a function, expecting an argument or ')'
  AwaitSeparator = "AwaitSeparator", // Just saw an argument, expecting a separator (',' or '/') or ')'
}

/**
 * An Action is a function that executes during a state transition.
 * It's what allows our DFA-like machine to use a stack and build the AST.
 */
export type Action = (parser: Parser, token: Token) => void;

/**
 * A Transition defines what to do when a token is seen in a given state.
 * It specifies the action to take and the next state to move to.
 */
export interface Transition {
  /**
   * Description placeholder
   *
   * @type {Action}
   */
  action: Action;
  /**
   * Description placeholder
   *
   * @type {ParserState}
   */
  nextState: ParserState;
}

/**
 * The master transition table for our parser.
 * It maps [CurrentState] -> [InputToken] -> { action, nextState }.
 */
export type TransitionTable = Partial<
  Record<ParserState, Partial<Record<TokenType, Transition>>>
>;
