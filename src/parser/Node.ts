// ./src/parser/Node.ts

import { Span } from '../lexer/Token';

export enum NodeType {
    Function = 'Function',
    Identifier = 'Identifier',
    HexColor = 'HexColor',
    Number = 'Number',
    Percentage = 'Percentage',
    Dimension = 'Dimension',
    Operator = 'Operator',
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

export type ColorNode = IdentifierNode | HexColorNode | FunctionNode;

export type ChildNode =
    | IdentifierNode
    | NumberNode
    | PercentageNode
    | DimensionNode
    | FunctionNode
    | OperatorNode
    | WhiteSpaceNode;
