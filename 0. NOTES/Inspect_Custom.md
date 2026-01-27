Of course. That's a crucial and excellent question. It's not immediately obvious because you don't call it yourself.

The `[inspect.custom]` method is called **automatically by Node.js** whenever it needs to create a string representation of your object for display.

### The Triggers

This automatic call happens in several common debugging scenarios:

1.  **`console.log()`**: This is the most frequent trigger. When you pass an object instance to `console.log()`, Node.js's `util.inspect` logic runs behind the scenes to format the object for the console. It specifically looks for a `[inspect.custom]` method on the object.

    ```typescript
    const myLexer = new Lexer(chars, source);
    const myParser = new Parser(myLexer.tokens);
    myParser.parse();

    // THIS is where [inspect.custom] is automatically called on the myParser instance.
    console.log(myParser);
    ```

2.  **The Node.js REPL**: When you are in the Node.js interactive shell (the REPL, which you start by just typing `node` in your terminal) and you type the name of a variable and press Enter, the REPL uses `util.inspect` to print the value of that variable.

    ```sh
    > const parser = new Parser(...);
    > parser.parse();
    > parser  // <-- Pressing Enter here calls [inspect.custom]
    Parser {
      Function { name: 'rgb', ... }
      ...
    }
    ```

3.  **`util.inspect()`**: You can also trigger it directly by using the `inspect` function from Node's built-in `util` module. This is what `console.log` does internally.

    ```typescript
    import { inspect } from 'node:util';

    const myParser = new Parser(...);
    myParser.parse();

    const formattedString = inspect(myParser, { colors: true });
    console.log(formattedString); // Prints the string returned by [inspect.custom]
    ```

### Why it Works This Way

Think of `[inspect.custom]` as a special "hook" that you can provide to Node.js.

*   `[inspect.custom]` is a well-known `Symbol` (`Symbol.for('nodejs.util.inspect.custom')`). When `util.inspect` gets an object, its first step is to check, "Does this object have a method with the key `[inspect.custom]`?"
*   **If YES:** It calls that method, passing in the current inspection `depth` and `options` (like `stylize` for colors). It then uses the string that your method returns as the definitive representation of the object.
*   **If NO:** It falls back to its default behavior of listing the object's properties in a generic way (e.g., `{ prop1: 'value1', prop2: [Array] }`).

This mechanism allows you, the author of the class, to have complete control over how your objects are displayed during debugging, without changing how developers *use* your class. They can just `console.log` it, and it will "just work" beautifully.
