// ./src/parser/Node.ts

/**
 * Description placeholder
 *
 * @export
 * @enum {number}
 */
export enum NodeType {
  Function = "Function",
  Identifier = "Identifier",
  HexColor = "HexColor",
  Number = "Number",
  Percentage = "Percentage",
  Dimension = "Dimension",
  Operator = "Operator",
  WhiteSpace = "WhiteSpace",
}

/**
 * Description placeholder
 *
 * @export
 * @enum {number}
 */
export enum DimensionKind {
  deg = "deg",
  grad = "grad",
  rad = "rad",
  turn = "turn",
}

// === Base Nodes ===

/** The base for all nodes in our color AST. */
export interface AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType}
   */
  type: NodeType;
}

/** Represents a function call, like `rgb(...)`. It contains other nodes as arguments. */
export interface FunctionNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.Function}
   */
  type: NodeType.Function;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  name: string;
  /**
   * Description placeholder
   *
   * @type {AstNode[]}
   */
  arguments: AstNode[];
}

// === Leaf Nodes (Terminals) ===

/** Represents a named color keyword, like `red` or `transparent`. */
export interface IdentifierNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.Identifier}
   */
  type: NodeType.Identifier;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  name: string;
}

/** Represents a hex color value. The value stored is the raw hex string without the '#'. */
export interface HexColorNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.HexColor}
   */
  type: NodeType.HexColor;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  value: string;
}

/** Represents a plain number, with no unit. */
export interface NumberNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.Number}
   */
  type: NodeType.Number;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  value: string;
}

/** Represents a number with a '%' unit. */
export interface PercentageNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.Percentage}
   */
  type: NodeType.Percentage;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  value: string;
}

/** Represents a number with a unit, like `120deg` or `1.5rad`. */
export interface DimensionNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.Dimension}
   */
  type: NodeType.Dimension;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  value: string;
  /**
   * Description placeholder
   *
   * @type {DimensionKind}
   */
  unit: DimensionKind;
}

/** Represents a syntactic operator, like `,` or `/`. */
export interface OperatorNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.Operator}
   */
  type: NodeType.Operator;
  /**
   * Description placeholder
   *
   * @type {(',' | '/')}
   */
  value: "," | "/";
}

/**
 * Description placeholder
 *
 * @export
 * @interface WhiteSpaceNode
 * @typedef {WhiteSpaceNode}
 * @extends {AstNode}
 */
export interface WhiteSpaceNode extends AstNode {
  /**
   * Description placeholder
   *
   * @type {NodeType.WhiteSpace}
   */
  type: NodeType.WhiteSpace;
  /**
   * Description placeholder
   *
   * @type {' '}
   */
  value: " ";
}

// === Union Types for Type-Safety ===

/** A union of all possible top-level color nodes. */
export type ColorNode = IdentifierNode | HexColorNode | FunctionNode;

/** A union of all nodes that can appear as an argument inside a function. */
export type ChildNode =
  | IdentifierNode
  | NumberNode
  | PercentageNode
  | DimensionNode
  | FunctionNode
  | OperatorNode
  | WhiteSpaceNode;
