import { inspect, InspectOptions } from 'util';

export enum CharType {
    // CharacterStream Control
    EOF = 'EOF',
    Error = 'Error',
    Other = 'Other',
    Undefined = 'Undefined',

    // Whitespace & Formatting
    Whitespace = 'Whitespace',
    NewLine = 'NewLine',

    // Primary Literals
    Letter = 'Letter',
    Number = 'Number',
    Hex = 'Hex',

    // Quotes & Strings
    SingleQuote = 'SingleQuote',
    DoubleQuote = 'DoubleQuote',
    Backtick = 'Backtick',

    // Brackets & Enclosures
    LParen = 'LParen',
    RParen = 'RParen',
    LBracket = 'LBracket',
    RBracket = 'RBracket',
    LBrace = 'LBrace',
    RBrace = 'RBrace',

    // Common Operators & Mathematical
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Slash = 'Slash',
    BackSlash = 'BackSlash',
    EqualSign = 'EqualSign',
    Percent = 'Percent',
    Caret = 'Caret',
    Tilde = 'Tilde',
    Pipe = 'Pipe',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',

    // Punctuation & Delimiters
    Dot = 'Dot',
    Comma = 'Comma',
    Colon = 'Colon',
    SemiColon = 'SemiColon',
    Exclamation = 'Exclamation',
    Question = 'Question',
    Punctuation = 'Punctuation',

    // Special Symbols & Identifiers
    Hash = 'Hash',
    At = 'At',
    Ampersand = 'Ampersand',
    Dollar = 'Dollar',
    Underscore = 'Underscore',
    Currency = 'Currency',
    Symbol = 'Symbol',

    // International / Multi-byte
    Emoji = 'Emoji',
    Unicode = 'Unicode',
}

export const CharSpec = new Map<CharType, ( char: string ) => boolean>( [
    [ CharType.EOF, ( char: string ) => char === EOF_STRING ],
    [ CharType.NewLine, ( char: string ) => /[\n\r\u2028\u2029]/u.test( char ) ],
    [ CharType.Whitespace, ( char: string ) => /[ \t\f\v\u2020]/u.test( char ) ],
    [ CharType.Hash, ( char: string ) => char === '#' ],
    [ CharType.Percent, ( char: string ) => char === '%' ],
    [ CharType.Slash, ( char: string ) => char === '/' ],
    [ CharType.Comma, ( char: string ) => char === ',' ],
    [ CharType.LParen, ( char: string ) => char === '(' ],
    [ CharType.RParen, ( char: string ) => char === ')' ],
    [ CharType.Plus, ( char: string ) => char === '+' ],
    [ CharType.Minus, ( char: string ) => char === '-' ],
    [ CharType.Star, ( char: string ) => char === '*' ],
    [ CharType.Dot, ( char: string ) => char === '.' ],
    [ CharType.Backtick, ( char: string ) => char === '`' ],
    [ CharType.SingleQuote, ( char: string ) => char === '\'' ],
    [ CharType.DoubleQuote, ( char: string ) => char === '"' ],
    [ CharType.BackSlash, ( char: string ) => char === '\\' ],
    [ CharType.Tilde, ( char: string ) => char === '~' ],
    [ CharType.Exclamation, ( char: string ) => char === '!' ],
    [ CharType.At, ( char: string ) => char === '@' ],
    [ CharType.Dollar, ( char: string ) => char === '$' ],
    [ CharType.Question, ( char: string ) => char === '?' ],
    [ CharType.Caret, ( char: string ) => char === '^' ],
    [ CharType.Ampersand, ( char: string ) => char === '&' ],
    [ CharType.LessThan, ( char: string ) => char === '<' ],
    [ CharType.GreaterThan, ( char: string ) => char === '>' ],
    [ CharType.Underscore, ( char: string ) => char === '_' ],
    [ CharType.EqualSign, ( char: string ) => char === '=' ],
    [ CharType.LBracket, ( char: string ) => char === '[' ],
    [ CharType.RBracket, ( char: string ) => char === ']' ],
    [ CharType.LBrace, ( char: string ) => char === '{' ],
    [ CharType.RBrace, ( char: string ) => char === '}' ],
    [ CharType.SemiColon, ( char: string ) => char === ';' ],
    [ CharType.Colon, ( char: string ) => char === ':' ],
    [ CharType.Pipe, ( char: string ) => char === '|' ],
    [ CharType.Letter, ( char: string ) => /\p{L}/v.test( char ) ],
    [ CharType.Number, ( char: string ) => /\p{N}/v.test( char ) ],
    [ CharType.Emoji, ( char: string ) => /\p{Emoji}/v.test( char ) ],
    [ CharType.Currency, ( char: string ) => /\p{Sc}/v.test( char ) ],
    [ CharType.Punctuation, ( char: string ) => /\p{P}/v.test( char ) ],
    [ CharType.Symbol, ( char: string ) => /\p{S}/v.test( char ) ],
    [ CharType.Unicode, ( char: string ) => /\P{ASCII}/v.test( char ) ],
] );

export class Char {
    private static readonly CACHE = new Map<number, Char>();

    private readonly _value: number;
    private readonly _type: CharType;

    // Private constructor to force use of Char.valueOf()
    private constructor ( val: number ) {
        this._value = val & 0xffff;
        this._type = this.determineType();
    }

    /**
     * Static Factory Method (similar to Java's Character.valueOf)
     * Reuses instances for values 0-255 (ASCII/Latin-1) and common operators.
     */
    public static valueOf ( input: string | number ): Char {
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

    private determineType (): CharType {
        const char = this.toString();
        if ( char === undefined ) return CharType.Undefined;
        if ( char === null ) return CharType.Error;
        for ( const [ type, predicate ] of CharSpec ) {
            if ( predicate( char ) ) return type;
        }
        return CharType.Undefined;
    }

    get value (): number {
        return this._value;
    }
    get type (): CharType {
        return this._type;
    }

    public toString (): string {
        return String.fromCharCode( this._value );
    }

    public equals ( other: Char ): boolean {
        if ( this._value === 0xffff ) return 'EOF';
        return this._value === other.value;
    }

    /** Simulation of Java's Character.isLetter() */
    isLetter (): boolean {
        return /[a-zA-Z]/.test( this.toString() );
    }

    /** Arithmetic simulation (e.g., char1++) */
    increment (): void {
        this._value = ( this._value + 1 ) & 0xffff;
    }
}

export class CharArray extends Float32Array {

    public static fromString ( source: string ): CharArray {
        const charArray = new CharArray( source.length );
        for ( let i = 0; i < source.length; i++ ) {
            // Populate buffer with ASCII/Unicode values
            charArray[ i ] = source.charCodeAt( i ) & 0xffff;
        }
        return charArray;
    }

    public getChar ( index: number ): Char {
        if ( index < 0 || index >= this.length ) {
            return Char.valueOf( 0xffff ); // Return EOF for out-of-bounds
        }
        // valueOf handles caching for ASCII (0-255)
        return Char.valueOf( this[ index ] );
    }

    public toString (): string {
        return Array.from( this )
            .map( code => String.fromCharCode( code ) )
            .join( '' );
    }

    public indexOfPattern ( pattern: string | CharArray ): number {
        const patternArr =
            typeof pattern === 'string'
                ? CharArray.fromString( pattern )
                : pattern;

        if ( patternArr.length === 0 ) return 0;

        const lps = this.computeLPSArray( patternArr );
        let i = 0; // index for this (text)
        let j = 0; // index for patternArr

        while ( i < this.length ) {
            if ( patternArr[ j ] === this[ i ] ) {
                i++;
                j++;
            }

            if ( j === patternArr.length ) {
                return i - j; // Match found
            } else if ( i < this.length && patternArr[ j ] !== this[ i ] ) {
                if ( j !== 0 ) {
                    j = lps[ j - 1 ];
                } else {
                    i++;
                }
            }
        }

        return -1; // No match
    }

    private computeLPSArray ( pattern: CharArray ): Int32Array {
        const lps = new Int32Array( pattern.length );
        let len = 0;
        let i = 1;

        while ( i < pattern.length ) {
            if ( pattern[ i ] === pattern[ len ] ) {
                len++;
                lps[ i ] = len;
                i++;
            } else {
                if ( len !== 0 ) {
                    len = lps[ len - 1 ];
                } else {
                    lps[ i ] = 0;
                    i++;
                }
            }
        }
        return lps;
    }
}

export class CharacterStream {
    private position: number = 0;
    private buffer: CharArray;

    constructor ( input: string ) {
        this.buffer = CharArray.fromString( input );
    }

    public next (): Char {
        if ( this.isEOF() ) return Char.valueOf( 0xffff );
        return this.buffer.getChar( this.position++ );
    }

    public peek ( offset: number = 0 ): Char {
        const index = this.position + offset;
        if ( index >= this.input.length || index < 0 ) {
            return Char.valueOf( 0xffff );
        }
        return this.buffer.getChar( index );
    }

    public seek ( position: number ): void {
        this.position = Math.max( 0, Math.min( position, this.buffer.length ) );
    }

    public getIndex (): number {
        return this.position;
    }

    public isEOF (): boolean {
        return this.position >= this.buffer.length;
    }
}

export class Lexer {
    public readonly [ Symbol.toStringTag ] = 'Token';
    public readonly tokens: Token[] = [];
    private pos = 0;
    private start = 0;
    private state: State = State.InitialState;
    private buffer = '';

    constructor ( private chars: Char[], private rawSource: string ) {
        this.tokenize();
    }

    private isEOF (): boolean {
        return this.pos >= this.chars.length;
    }

    private reset (): void {
        this.buffer = '';
        this.start = this.pos;
        this.state = State.InitialState;
    }

    private peek (): Char {
        // Return an EOF Char if out of bounds
        return this.chars[ this.pos ] || Char.valueOf( 0xffff );
    }

    private advance (): Char {
        const char = this.peek();
        if ( !this.isEOF() ) {
            this.buffer += char.toString();
            this.pos++;
        }
        return char;
    }

    private createSpan ( startPos: number, endPos: number ): Span {
        const startChar = this.chars[ startPos ];
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

    private createToken ( type: TokenType, message?: string ): Token {
        return {
            value: this.buffer,
            type,
            span: this.createSpan( this.start, this.pos ),
            message,
        };
    }

    private emit ( type: TokenType, message?: string ): void {
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

    private tokenize (): void {
        while ( !this.isEOF() ) {
            const ch = this.peek();
            const nextState = DFA[ this.state ]?.[ ch.type ];

            if ( nextState === undefined ) {
                const accept = ACCEPT[ this.state ];
                if ( accept !== undefined ) {
                    this.emit( accept, `Accepted at ${ this.state }` );
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
            this.tokens[ this.tokens.length - 1 ].type !== TokenType.EOF
        ) {
            this.emit( TokenType.EOF, 'Manual EOF' );
        }
    }
}

export class Lexer {
    private readonly message = {
        accepted: `Accepted at ${ this.state }`,
        sync: 'Sync symbol',
        invalidHex: 'Invalid hex color',
        unexpectedChar: 'Unexpected character',
        manualEOF: 'Manual EOF',
        EOF: 'End of input',
    };

    public readonly [ Symbol.toStringTag ] = 'Token';
    public readonly tokens: Token[] = [];

    private stream: CharacterStream;
    private state: State = State.InitialState;
    private buffer = '';

    private startState = { pos: 0, line: 1, col: 1 };

    constructor ( input: string ) {
        this.stream = new CharacterStream( input );
        this.tokenize();
    }

    /** Custom inspection for Node.js console.log */
    [ inspect.custom ] = ( depth: number, options: InspectOptions ): string => {
        const stylize = options.stylize;
        if ( depth < 0 ) return stylize( this[ Symbol.toStringTag ], 'special' );

        let output = `TOKENS (${ this.tokens.length }):\n`;
        this.tokens.forEach( ( token, i ) => {
            const idx = stylize( `[${ i.toString().padStart( 3, ' ' ) }]`, 'number' );
            const val = stylize(
                `'${ token.value.replace( /\n/g, '\\n' ) }'`,
                'string',
            );
            const type = stylize( `TokenType.${ token.type }`, 'special' );
            const span = token.span
                ? stylize(
                    `[L:${ token.span.line }, C:${ token.span.column }, len:${ token.span.length }]`,
                    'number',
                )
                : '';
            output += ` ${ idx } ${ val.padEnd( 20 ) } ${ type.padEnd( 30 ) } ${ span }\n`;
        } );
        return output;
    };

    private reset (): void {
        this.buffer = '';
        this.state = State.InitialState;
        this.stream.mark();
        this.startState = {
            pos: this.stream.pos,
            line: this.stream.curLine,
            col: this.stream.curCol,
        };
    }

    private emit ( type: TokenType, message?: string ): void {
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

        if ( !typesToSkip.has( token.type ) ) {
            if ( this.buffer.length > 0 || type === TokenType.EOF ) {
                this.tokens.push( token );
            }
        }

        this.stream.release();
        this.reset();
    }

    private emitEOF (): void {
        if ( this.state === State.EOF ) {
            this.emit( TokenType.EOF, this.message.EOF );
            return;
        }

        if (
            this.tokens.length === 0 ||
            this.tokens[ this.tokens.length - 1 ].type !== TokenType.EOF
        ) {
            this.emit( TokenType.EOF, this.message.manualEOF );
            return;
        }
    }

    private getNextState = ( type: CharType ): State => {
        return DFA[ this.state ]?.[ type ];
    };

    private tokenize (): void {
        this.reset();

        while ( !this.stream.isEOF() ) {
            const ch: Char = this.stream.peek();
            const nextState = this.getNextState( ch.type );

            if ( nextState === undefined ) {
                const accept = ACCEPT[ this.state ];
                if ( accept !== undefined ) {
                    this.emit( accept, this.message.accepted );
                } else if ( this.state >= State.Hex1 && this.state <= State.Hex8 ) {
                    this.emit( TokenType.ERROR, this.message.invalidHex );
                } else {
                    this.buffer += this.stream.next().toString();
                    this.emit( TokenType.ERROR, this.message.unexpectedChar );
                }
            } else {
                this.state = nextState;
                const consumed = this.stream.next();
                this.buffer += consumed.toString();

                if ( this.state === State.EOF ) {
                    this.emitEOF();
                    break;
                }

                if ( this.state === State.SYNC ) {
                    this.emit(
                        charTokenMap[ consumed.toString() ] ?? TokenType.ERROR,
                        this.message.sync,
                    );
                }
            }
        }

        this.emitEOF();
    }
}

export class ColorEvaluator {
    /** Main evaluation entry point */
    public evaluate ( node: ASTNode ): string {
        switch ( node.type ) {
            case 'ColorFunction':
                return this.evaluateFunction( node );
            case 'HexColor':
                return node.value; // Return hex as-is
            case 'Keyword':
                return node.value; // Return keyword as-is
            default:
                throw new Error(
                    `Cannot evaluate standalone numeric node: ${ node.type }`,
                );
        }
    }

    private evaluateFunction ( node: ColorFunctionNode ): string {
        // Evaluate the main color channels (R, G, B)
        const r = this.getNumericValue( node.args[ 0 ], 255 );
        const g = this.getNumericValue( node.args[ 1 ], 255 );
        const b = this.getNumericValue( node.args[ 2 ], 255 );

        // Evaluate alpha (default to 1 if not present)
        const a = node.alpha ? this.getNumericValue( node.alpha, 1 ) : 1;

        // Return a standard browser-compatible string
        return `rgba(${ r }, ${ g }, ${ b }, ${ a })`;
    }

    /** Helper to normalize and clamp values from the AST */
    private getNumericValue ( node: ASTNode, max: number ): number {
        if ( node.type === 'Number' ) {
            return this.clamp( node.value, 0, max );
        }
        if ( node.type === 'Percentage' ) {
            // Convert 100% to 'max' (e.g., 255 for RGB, 1 for Alpha)
            return this.clamp( ( node.value / 100 ) * max, 0, max );
        }
        return 0;
    }

    private clamp ( val: number, min: number, max: number ): number {
        return Math.min( Math.max( val, min ), max );
    }

    /** Transpiles the AST to an 8-digit Hex value (#rrggbbaa) */
    public toHex ( node: ASTNode ): string {
        if ( node.type === 'HexColor' ) return node.value;

        // For functions, evaluate to RGBA first
        if ( node.type === 'ColorFunction' ) {
            const r = Math.round( this.getNumericValue( node.args[ 0 ], 255 ) );
            const g = Math.round( this.getNumericValue( node.args[ 1 ], 255 ) );
            const b = Math.round( this.getNumericValue( node.args[ 2 ], 255 ) );
            const a = Math.round(
                ( node.alpha ? this.getNumericValue( node.alpha, 1 ) : 1 ) * 255,
            );

            const toHex = ( n: number ) => n.toString( 16 ).padStart( 2, '0' );
            return `#${ toHex( r ) }${ toHex( g ) }${ toHex( b ) }${ toHex( a ) }`;
        }

        return '#000000ff'; // Fallback
    }
}

export const charTesting = () => {
    // Usage examples
    const a1 = Char.valueOf( 'A' );
    const a2 = Char.valueOf( 65 );
    const charA1 = Char.valueOf( 'A' );
    const charA2 = Char.valueOf( 65 );
    const charB = Char.valueOf( 'B' );
    const c1 = Char.valueOf( 'A' );
    const c2 = Char.valueOf( 65535 ); // Max 16-bit value
    const digit = Char.valueOf( '5' );
    const brace = Char.valueOf( '{' );

    console.log( 'a1 === a2:', a1 === a2 );                 // true (referenced from cache)
    console.log( 'a1.type:', a1.type );                     // CharType.Letter

    console.log( 'charA1 === charA2:', charA1 === charA2 ); // true (same reference from cache)
    console.log( 'charA1 === charB:', charA1 === charB );   // false
    console.log( 'charA1.type:', charA1.type );             // CharType.Letter

    console.log( 'c1.value:', c1.value );                   // 65
    c1.increment();
    console.log( 'c1.toString():', c1.toString() );         // "B"

    c2.increment();
    console.log( 'c2.value:', c2.value );                   // 0 (simulates overflow)

    console.log( 'digit.type:', digit.type );               // CharType.Number
    console.log( 'brace.type:', brace.type );               // CharType.LBrace
};