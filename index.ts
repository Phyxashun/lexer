// ./index.ts

import { inspect } from "node:util";
import { Char } from "./src/char/Char";
import { Lexer } from "./src/lexer/Lexer";
import { Parser } from "./src/parser/Parser";
import { ParseError } from "./src/parser/ParseError";

/**
 * Description placeholder
 *
 * @type {{ InspectOptions}}
 */
const data = {
  inspectOptions: {
    showHidden: false,
    depth: null,
    colors: true,
    customInspect: true,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 80,
    compact: true,
    sorted: false,
    getters: false,
    numericSeparator: true,
  },
  tests: [
    "red",
    "#ff00aa",
    "#f0c",
    "rgb(255, 100, 0)",
    "rgba(0 100 200 / 0.5)",
    "hsl(120deg, 100%, 50%)",
    // Good error cases to test:
    "rgb(255, 100,)", // Unexpected ')'
    "lch(50% 100)", // Unclosed function
    "#badcolor", // Invalid hex length
  ],
};

/** Description placeholder */
const test = () => {
  console.log(`\n--- PARSER TESTING ---\n`);

  data.tests.forEach((str) => {
    try {
      console.log(`\n\n--- Testing Input: "${str}" ---`);

      // Get Character Array from string input
      const chars: Char[] = [...Char.fromString(str), new Char("", {})];

      // Get Lexer and create tokens from the the Char[]
      const lexer = new Lexer(chars);
      const tokens: Token[] = lexer.tokens;

      // Optional: Output the tokens to the console
      console.log("Tokens:");
      console.log(
        inspect(
          tokens.filter((t) => t.type !== "EOF"),
          data.inspectOptions,
        ),
      );

      // Parse the token array into a concrete systax tree (CST)
      const parser = new Parser(tokens);
      const cst = parser.parse();

      // Optional: Output the tokens to the console
      console.log("Concrete Syntax Tree (CST):");
      console.log(inspect(cst, { ...data.inspectOptions, breakLength: 80 }));
    } catch (error) {
      console.error("--- PARSE FAILED ---");
      // Check if the error is an instance of our custom class
      if (error instanceof ParseError) {
        // Now we can safely access its custom properties!
        console.error(error.getDetailedMessage());
      } else {
        // It was a different, unexpected kind of error
        console.error("An unknown error occurred:", error);
      }
    }
  });
};

test();
