// ./src/char/Char.ts

//import { inspect, type InspectOptions } from 'node:util';

//type InspectStylizeFn = ( text: string, styleType: string ) => string;

const EOF_STRING = '\u2404'; //'␄';
//const WS_STRING = '\u0020'; //' ';

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

type CharSpecFn = ( char: string ) => boolean;

export const CharSpec = new Map<CharType, CharSpecFn>( [
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