// ./src/parser/Node.ts

import { Span } from '../lexer/Token';
import { FUNCTIONS } from '../lexer/State';

export enum NodeType {
    Function = 'Function',
    Identifier = 'Identifier',
    Keyword = 'Keyword',
    NamedColor = 'NamedColor',
    RelativeColor = 'RelativeColor',
    Channel = 'Channel',
    Alpha = 'Alpha',
    HexColor = 'HexColor',
    Number = 'Number',
    Percentage = 'Percentage',
    Dimension = 'Dimension',
    Operator = 'Operator',
    Slash = 'Slash',
    WhiteSpace = 'WhiteSpace',
}

export enum DimensionKind {
    deg = 'deg',
    grad = 'grad',
    rad = 'rad',
    turn = 'turn',
}

export interface CstNode {
    type: NodeType;
    span?: Span;
}

export interface FunctionNode extends CstNode {
    type: NodeType.Function;
    name: string;
    children: CstNode[];
}

export interface IdentifierNode extends CstNode {
    type: NodeType.Identifier;
    name: string;
}

export interface KeywordNode extends CstNode {
    type: NodeType.Keyword;
    name: string;
}

export interface NamedColorNode extends CstNode {
    type: NodeType.NamedColor;
    name: string;
}

export interface HexColorNode extends CstNode {
    type: NodeType.HexColor;
    value: string;
}

export interface NumberNode extends CstNode {
    type: NodeType.Number;
    value: string;
}

export interface PercentageNode extends CstNode {
    type: NodeType.Percentage;
    value: string;
}

export interface DimensionNode extends CstNode {
    type: NodeType.Dimension;
    value: string;
    unit: DimensionKind;
}

export interface OperatorNode extends CstNode {
    type: NodeType.Operator;
    value: ',' | '/';
}

export interface WhiteSpaceNode extends CstNode {
    type: NodeType.WhiteSpace;
    value: ' ';
}

export interface RelativeColorNode extends CstNode {
    type: NodeType.RelativeColor;
    function: typeof FUNCTIONS;
    source: CstNode;
    channels: CstNode;
    alpha?: CstNode;
}

export type ColorNode = IdentifierNode | HexColorNode | FunctionNode;

export type ChildNode =
    | FunctionNode
    | IdentifierNode
    | KeywordNode
    | NamedColorNode
    | HexColorNode
    | NumberNode
    | PercentageNode
    | DimensionNode
    | OperatorNode
    | WhiteSpaceNode
    | RelativeColorNode;
