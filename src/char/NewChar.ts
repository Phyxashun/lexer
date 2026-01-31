class Char {
    // Java chars are 16-bit unsigned (0 to 65,535)
    private _value: number;

    constructor( initial: string | number = 0 ) {
        if ( typeof initial === 'string' ) {
            // Get code point of first character
            this._value = initial.charCodeAt( 0 ) & 0xffff;
        } else {
            // Ensure value stays within 16-bit range (0-65535)
            this._value = initial & 0xffff;
        }
    }

    /** Returns the numeric Unicode value (e.g., 65 for 'A') */
    get value(): number {
        return this._value;
    }

    /** Sets the value, enforcing 16-bit constraints */
    set value( val: number ) {
        this._value = val & 0xffff;
    }

    /** Returns the string representation of the character */
    toString(): string {
        return String.fromCharCode( this._value );
    }

    /** Simulation of Java's Character.isLetter() */
    isLetter(): boolean {
        return /[a-zA-Z]/.test( this.toString() );
    }

    /** Arithmetic simulation (e.g., char1++) */
    increment(): void {
        this._value = ( this._value + 1 ) & 0xffff;
    }
}

// Usage examples
const c1 = new Char( 'A' );
console.log( c1.value ); // 65
c1.increment();
console.log( c1.toString() ); // "B"

const c2 = new Char( 65535 ); // Max 16-bit value
c2.increment();
console.log( c2.value ); // 0 (simulates overflow)

// Assuming your CharType and CharSpec are imported or defined above
export class Char {
    private _value: number;
    private _type: CharType;

    constructor( initial: string | number = 0 ) {
        if ( typeof initial === 'string' ) {
            this._value =
                ( initial.length > 0 ? initial.charCodeAt( 0 ) : 0 ) & 0xffff;
        } else {
            this._value = initial & 0xffff;
        }
        // Determine type immediately on instantiation
        this._type = this.determineType();
    }

    /**
     * Iterates through the CharSpec map to find the first matching category.
     * Returns CharType.Undefined if no specification matches.
     */
    private determineType(): CharType {
        const charStr = this.toString();
        for ( const [ type, isMatch ] of CharSpec ) {
            if ( isMatch( charStr ) ) {
                return type;
            }
        }
        return CharType.Undefined;
    }

    /** Returns the detected CharType category */
    get type(): CharType {
        return this._type;
    }

    /** Returns the numeric Unicode value */
    get value(): number {
        return this._value;
    }

    /** Updates value and re-evaluates the character type */
    set value( val: number ) {
        this._value = val & 0xffff;
        this._type = this.determineType();
    }

    toString(): string {
        // Handle EOF specifically if it's outside standard 16-bit range
        if ( this._value === 0xffff ) return 'EOF';
        return String.fromCharCode( this._value );
    }
}

// Example usage
const digit = new Char( '5' );
console.log( digit.type ); // CharType.Number

const brace = new Char( '{' );
console.log( brace.type ); // CharType.LBrace

export class Char {
    private static readonly CACHE = new Map<number, Char>();

    private readonly _value: number;
    private readonly _type: CharType;

    // Private constructor to force use of Char.valueOf()
    private constructor( val: number ) {
        this._value = val & 0xffff;
        this._type = this.determineType();
    }

    /**
     * Static Factory Method (similar to Java's Character.valueOf)
     * Reuses instances for values 0-255 (ASCII/Latin-1) and common operators.
     */
    public static valueOf( input: string | number ): Char {
        const val =
            ( typeof input === 'string' ? input.charCodeAt( 0 ) : input ) & 0xffff;

        // Cache common range (0-255) to save memory
        if ( val <= 255 ) {
            let cached = Char.CACHE.get( val );
            if ( !cached ) {
                cached = new Char( val );
                Char.CACHE.set( val, cached );
            }
            return cached;
        }

        return new Char( val );
    }

    private determineType(): CharType {
        const charStr = String.fromCharCode( this._value );
        for ( const [ type, isMatch ] of CharSpec ) {
            if ( isMatch( charStr ) ) return type;
        }
        return CharType.Undefined;
    }

    get type(): CharType {
        return this._type;
    }
    get value(): number {
        return this._value;
    }

    toString(): string {
        return String.fromCharCode( this._value );
    }
}

// Usage
const a1 = Char.valueOf( 'A' );
const a2 = Char.valueOf( 65 );

console.log( a1 === a2 ); // true (referenced from cache)
console.log( a1.type ); // CharType.Letter

export class Char {
    // Java-style cache for the standard ASCII/Latin-1 range (0-255)
    private static readonly CACHE: Char[] = new Array( 256 );

    private readonly _value: number;
    private readonly _type: CharType;

    private constructor( val: number ) {
        this._value = val & 0xffff;
        this._type = this.determineType();
    }

    /**
     * Factory method mimicking Java's Character.valueOf().
     * Returns a cached instance for values 0-255.
     */
    public static valueOf( input: string | number ): Char {
        const val =
            ( typeof input === 'string' ? input.charCodeAt( 0 ) : input ) & 0xffff;

        if ( val >= 0 && val <= 255 ) {
            if ( !Char.CACHE[val] ) {
                Char.CACHE[val] = new Char( val );
            }
            return Char.CACHE[val];
        }

        return new Char( val );
    }

    private determineType(): CharType {
        const charStr = this.toString();
        for ( const [ type, isMatch ] of CharSpec ) {
            if ( isMatch( charStr ) ) return type;
        }
        return CharType.Undefined;
    }

    get value(): number {
        return this._value;
    }
    get type(): CharType {
        return this._type;
    }

    public toString(): string {
        return String.fromCharCode( this._value );
    }

    /** Helper for equality checks */
    public equals( other: Char ): boolean {
        return this._value === other.value;
    }
}

// Logic check
const charA1 = Char.valueOf( 'A' );
const charA2 = Char.valueOf( 65 );
const charB = Char.valueOf( 'B' );

console.log( charA1 === charA2 ); // true (same reference from cache)
console.log( charA1 === charB ); // false
console.log( charA1.type ); // CharType.Letter

export class CharacterStream {
    private position: number = 0;
    private readonly input: string;

    constructor( input: string ) {
        this.input = input;
    }

    /**
     * Returns the next Char and advances the stream position.
     * Returns a special EOF Char if at the end of the input.
     */
    public next(): Char {
        if ( this.isEOF() ) {
            return Char.valueOf( 0xffff ); // Represent EOF as 65535
        }
        return Char.valueOf( this.input[this.position++] );
    }

    /**
     * Returns the Char at a specific offset from the current position
     * without advancing the stream (defaults to 0 for current char).
     */
    public peek( offset: number = 0 ): Char {
        const index = this.position + offset;
        if ( index >= this.input.length || index < 0 ) {
            return Char.valueOf( 0xffff );
        }
        return Char.valueOf( this.input[index] );
    }

    /** Checks if the stream has reached the end */
    public isEOF(): boolean {
        return this.position >= this.input.length;
    }

    /** Returns current index in the input string */
    public getIndex(): number {
        return this.position;
    }

    /** Resets the stream to the beginning or a specific point */
    public seek( position: number ): void {
        this.position = Math.max( 0, Math.min( position, this.input.length ) );
    }
}

import { inspect, InspectOptions } from 'util';

export class Lexer {
    public readonly [Symbol.toStringTag] = 'Token';
    public readonly tokens: Token[] = [];
    private pos = 0;
    private start = 0;
    private state: State = State.InitialState;
    private buffer = '';

    constructor(
        private chars: Char[],
        private rawSource: string,
    ) {
        this.tokenize();
    }

    /** Custom inspection for Node.js console.log */
    [inspect.custom] = ( depth: number, options: InspectOptions ): string => {
        const stylize = options.stylize;
        if ( depth < 0 ) return stylize( this[Symbol.toStringTag], 'special' );

        let output = `TOKENS (${this.tokens.length}):\n`;
        this.tokens.forEach( ( token, i ) => {
            const idx = stylize( `[${i.toString().padStart( 3, ' ' )}]`, 'number' );
            const val = stylize(
                `'${token.value.replace( /\n/g, '\\n' )}'`,
                'string',
            );
            const type = stylize( `TokenType.${token.type}`, 'special' );
            const span = token.span
                ? stylize(
                    `[L:${token.span.line}, C:${token.span.column}, len:${token.span.length}]`,
                    'number',
                )
                : '';
            output += ` ${idx} ${val.padEnd( 20 )} ${type.padEnd( 30 )} ${span}\n`;
        } );
        return output;
    };

    private isEOF(): boolean {
        return this.pos >= this.chars.length;
    }

    private reset(): void {
        this.buffer = '';
        this.start = this.pos;
        this.state = State.InitialState;
    }

    private peek(): Char {
        // Return an EOF Char if out of bounds
        return this.chars[this.pos] || Char.valueOf( 0xffff );
    }

    private advance(): Char {
        const char = this.peek();
        if ( !this.isEOF() ) {
            this.buffer += char.toString();
            this.pos++;
        }
        return char;
    }

    private createSpan( startPos: number, endPos: number ): Span {
        const startChar = this.chars[startPos];
        // Using the .span property we added to the Char class in the previous step
        if ( !startChar || !startChar.span ) {
            return {
                start: startPos,
                end: endPos,
                line: 1,
                column: 1,
                length: endPos - startPos,
            };
        }

        return {
            ...startChar.span,
            end: endPos,
            length: endPos - startPos,
        };
    }

    private createToken( type: TokenType, message?: string ): Token {
        return {
            value: this.buffer,
            type,
            span: this.createSpan( this.start, this.pos ),
            message,
        };
    }

    private emit( type: TokenType, message?: string ): void {
        let token: Token = this.createToken( type, message );

        // Custom fold logic (e.g., distinguishing 'function' keyword from identifiers)
        if ( token.type === TokenType.IDENTIFIER ) {
            token = foldIdentifierToken( token );
        }

        // Skip tokens like WHITESPACE if configured
        if ( typesToSkip.has( token.type ) ) {
            this.reset();
            return;
        }

        if ( this.buffer.length > 0 || type === TokenType.EOF ) {
            this.tokens.push( token );
        }

        this.reset();
    }

    private tokenize(): void {
        while ( !this.isEOF() ) {
            const ch = this.peek();
            const nextState = DFA[this.state]?.[ch.type];

            if ( nextState === undefined ) {
                const accept = ACCEPT[this.state];
                if ( accept !== undefined ) {
                    this.emit( accept, `Accepted at ${this.state}` );
                } else if (
                    this.state >= State.Hex1 &&
                    this.state <= State.Hex8
                ) {
                    this.emit( TokenType.ERROR, 'Invalid hex color' );
                } else {
                    this.advance(); // Consume the invalid character
                    this.emit( TokenType.ERROR, 'Unexpected character' );
                }
            } else {
                this.state = nextState;
                this.advance();

                if ( this.state === State.EOF ) {
                    this.emit( TokenType.EOF, 'End of input' );
                    break;
                }

                if ( this.state === State.SYNC ) {
                    // mapCharToToken handles symbols like '(', '+', etc.
                    this.emit( mapCharToToken( ch.type ), 'Sync symbol' );
                }
            }
        }

        // Ensure stream always ends with EOF
        if (
            this.tokens.length === 0 ||
            this.tokens[this.tokens.length - 1].type !== TokenType.EOF
        ) {
            this.emit( TokenType.EOF, 'Manual EOF' );
        }
    }
}

export class Lexer {
    public readonly [Symbol.toStringTag] = 'Token';
    public readonly tokens: Token[] = [];

    private stream: CharacterStream;
    private state: State = State.InitialState;
    private buffer = '';

    // Store the start of the current token attempt
    private startState = { pos: 0, line: 1, col: 1 };

    constructor( input: string ) {
        this.stream = new CharacterStream( input );
        this.tokenize();
    }

    private reset(): void {
        this.buffer = '';
        this.state = State.InitialState;
        this.stream.mark(); // Mark current position for the next token's span
        this.startState = {
            pos: this.stream.pos,
            line: this.stream.curLine,
            col: this.stream.curCol,
        };
    }

    private emit( type: TokenType, message?: string ): void {
        const span = this.stream.captureFromMark();
        let token: Token = {
            value: this.buffer,
            type,
            span,
            message,
        };

        if ( token.type === TokenType.IDENTIFIER ) {
            token = foldIdentifierToken( token );
        }

        // Skip tokens like WHITESPACE if they are in the skip set
        if ( !typesToSkip.has( token.type ) ) {
            if ( this.buffer.length > 0 || type === TokenType.EOF ) {
                this.tokens.push( token );
            }
        }

        this.stream.release(); // Clean up the mark
        this.reset();
    }

    private tokenize(): void {
        this.reset(); // Initialize the first mark

        while ( !this.stream.isEOF() ) {
            const ch = this.stream.peek();
            const nextState = DFA[this.state]?.[ch.type];

            if ( nextState === undefined ) {
                const accept = ACCEPT[this.state];
                if ( accept !== undefined ) {
                    this.emit( accept, `Accepted at ${this.state}` );
                } else if (
                    this.state >= State.Hex1 &&
                    this.state <= State.Hex8
                ) {
                    this.emit( TokenType.ERROR, 'Invalid hex color' );
                } else {
                    // Unexpected char: consume it and emit error
                    this.buffer += this.stream.next().toString();
                    this.emit( TokenType.ERROR, 'Unexpected character' );
                }
            } else {
                this.state = nextState;
                const consumed = this.stream.next();
                this.buffer += consumed.toString();

                if ( this.state === State.EOF ) {
                    this.emit( TokenType.EOF, 'End of input' );
                    break;
                }

                if ( this.state === State.SYNC ) {
                    this.emit(
                        charTokenMap[consumed.toString()] ?? TokenType.ERROR,
                        'Sync symbol',
                    );
                }
            }
        }

        // Finalize with EOF if necessary
        if (
            this.tokens.length === 0 ||
            this.tokens[this.tokens.length - 1].type !== TokenType.EOF
        ) {
            this.emit( TokenType.EOF, 'Manual EOF' );
        }
    }
}

export class ColorEvaluator {
    /** Main evaluation entry point */
    public evaluate( node: ASTNode ): string {
        switch ( node.type ) {
            case 'ColorFunction':
                return this.evaluateFunction( node );
            case 'HexColor':
                return node.value; // Return hex as-is
            case 'Keyword':
                return node.value; // Return keyword as-is
            default:
                throw new Error(
                    `Cannot evaluate standalone numeric node: ${node.type}`,
                );
        }
    }

    private evaluateFunction( node: ColorFunctionNode ): string {
        // Evaluate the main color channels (R, G, B)
        const r = this.getNumericValue( node.args[0], 255 );
        const g = this.getNumericValue( node.args[1], 255 );
        const b = this.getNumericValue( node.args[2], 255 );

        // Evaluate alpha (default to 1 if not present)
        const a = node.alpha ? this.getNumericValue( node.alpha, 1 ) : 1;

        // Return a standard browser-compatible string
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    /** Helper to normalize and clamp values from the AST */
    private getNumericValue( node: ASTNode, max: number ): number {
        if ( node.type === 'Number' ) {
            return this.clamp( node.value, 0, max );
        }
        if ( node.type === 'Percentage' ) {
            // Convert 100% to 'max' (e.g., 255 for RGB, 1 for Alpha)
            return this.clamp( ( node.value / 100 ) * max, 0, max );
        }
        return 0;
    }

    private clamp( val: number, min: number, max: number ): number {
        return Math.min( Math.max( val, min ), max );
    }

    /** Transpiles the AST to an 8-digit Hex value (#rrggbbaa) */
    public toHex( node: ASTNode ): string {
        if ( node.type === 'HexColor' ) return node.value;

        // For functions, evaluate to RGBA first
        if ( node.type === 'ColorFunction' ) {
            const r = Math.round( this.getNumericValue( node.args[0], 255 ) );
            const g = Math.round( this.getNumericValue( node.args[1], 255 ) );
            const b = Math.round( this.getNumericValue( node.args[2], 255 ) );
            const a = Math.round(
                ( node.alpha ? this.getNumericValue( node.alpha, 1 ) : 1 ) * 255,
            );

            const toHex = ( n: number ) => n.toString( 16 ).padStart( 2, '0' );
            return `#${toHex( r )}${toHex( g )}${toHex( b )}${toHex( a )}`;
        }

        return '#000000ff'; // Fallback
    }
}

export class CharArray extends Float32Array {
    /**
     * Factory method to create a CharArray from a string.
     * Each float in the underlying buffer stores a 16-bit character code.
     */
    public static fromString( source: string ): CharArray {
        const charArray = new CharArray( source.length );
        for ( let i = 0; i < source.length; i++ ) {
            // Populate buffer with ASCII/Unicode values
            charArray[i] = source.charCodeAt( i ) & 0xffff;
        }
        return charArray;
    }

    /**
     * Returns the Char object at a specific index.
     * This bridges the raw buffer back to your Char class logic.
     */
    public getChar( index: number ): Char {
        if ( index < 0 || index >= this.length ) {
            return Char.valueOf( 0xffff ); // Return EOF for out-of-bounds
        }
        // valueOf handles caching for ASCII (0-255)
        return Char.valueOf( this[index] );
    }

    /** Utility to convert the buffer back to a standard string */
    public toString(): string {
        return Array.from( this )
            .map( code => String.fromCharCode( code ) )
            .join( '' );
    }
}

export class CharacterStream {
    private position: number = 0;
    private buffer: CharArray;

    constructor( input: string ) {
        this.buffer = CharArray.fromString( input );
    }

    public next(): Char {
        if ( this.isEOF() ) return Char.valueOf( 0xffff );
        return this.buffer.getChar( this.position++ );
    }

    public peek( offset: number = 0 ): Char {
        return this.buffer.getChar( this.position + offset );
    }

    public isEOF(): boolean {
        return this.position >= this.buffer.length;
    }
}

export class CharArray extends Float32Array {
    // ... existing methods (fromString, getChar) ...

    /**
     * Finds the first occurrence of a pattern within the CharArray.
     * @returns The starting index, or -1 if not found.
     */
    public indexOfPattern( pattern: string | CharArray ): number {
        const patternArr =
            typeof pattern === 'string'
                ? CharArray.fromString( pattern )
                : pattern;

        if ( patternArr.length === 0 ) return 0;

        const lps = this.computeLPSArray( patternArr );
        let i = 0; // index for this (text)
        let j = 0; // index for patternArr

        while ( i < this.length ) {
            if ( patternArr[j] === this[i] ) {
                i++;
                j++;
            }

            if ( j === patternArr.length ) {
                return i - j; // Match found
            } else if ( i < this.length && patternArr[j] !== this[i] ) {
                if ( j !== 0 ) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }

        return -1; // No match
    }

    /**
     * Preprocesses the pattern to create the Longest Prefix Suffix (LPS) array.
     * This table tells us how many characters we can skip after a mismatch.
     */
    private computeLPSArray( pattern: CharArray ): Int32Array {
        const lps = new Int32Array( pattern.length );
        let len = 0;
        let i = 1;

        while ( i < pattern.length ) {
            if ( pattern[i] === pattern[len] ) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if ( len !== 0 ) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }
}
