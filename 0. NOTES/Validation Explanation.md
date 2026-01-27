# Validation Refactoring Guide

## Problem Summary

Your parser was failing to validate relative CSS colors like `rgb(from red r g b)` because:

1. **Channel identifiers** (`r`, `g`, `b`, `h`, `s`, `l`, etc.) weren't being recognized as valid values
2. **Complex validation logic** with multiple overlapping validators made debugging difficult
3. **Type detection** wasn't distinguishing between absolute and relative color syntax

## Key Changes

### 1. Simplified Validator Architecture

**Before:**

```typescript
const acceptsRelative = (base: NodeValidator, name: string): NodeValidator =>
    (n: CstNode) =>
        base(n) || isChannelReference(name)(n) || n.type === NodeType.Function;
```

**After:**

```typescript
const createRelativeValidator = (
    baseValidator: NodeValidator,
    functionName: string
): NodeValidator => {
    return (n: CstNode) => {
        return (
            baseValidator(n) ||
            isChannelReference(n, functionName) ||
            isCalcFunction(n)
        );
    };
};
```

**Why?** The new approach:

- Takes the function name as a parameter to validate channel names in context
- More explicit about what it accepts
- Easier to debug and extend

### 2. Context-Aware Channel Reference Checking

**New approach:**

```typescript
const CHANNEL_NAMES: Record<string, string[]> = {
    rgb: ['r', 'g', 'b', 'alpha'],
    hsl: ['h', 's', 'l', 'alpha'],
    // etc...
};

const isChannelReference = (n: CstNode, functionName: string): boolean => {
    if (!isIdentifier(n)) return false;
    const validChannels = CHANNEL_NAMES[functionName] || [];
    return validChannels.includes(n.value);
};
```

**Why?** This ensures:

- `r` is only valid in `rgb()` context, not in `hsl()`
- `h` is only valid in `hsl()`, `hwb()`, `lch()`, `oklch()`, not in `rgb()`
- Prevents cross-contamination between color spaces

### 3. Clear Separation of Absolute vs Relative Validation

**New structure:**

```typescript
export const validateColorFunction = (node: CstNode, rawSource: string): void => {
    const spec = COLOR_FUNCTIONS[node.name];
    
    if (!spec) return; // Not a color function we validate

    if (isRelativeColor(node)) {
        validateRelativeColor(node, spec, rawSource);
    } else {
        validateAbsoluteColor(node, spec, rawSource);
    }
};
```

**Why?**

- **Single entry point** for all color validation
- **Automatic detection** of relative vs absolute syntax
- **Different validation rules** applied based on context

### 4. Unified Channel Specification

**New approach:**

```typescript
interface ColorFunctionSpec {
    channels: ChannelSpec[];
    alpha?: boolean;
}

type ChannelSpec = {
    name: string;
    baseValidator: NodeValidator;  // Only the base type, NOT relative forms
};
```

**Why?**

- Store only the **base validator** (what's valid in absolute syntax)
- **Relative validators** are created on-demand using `createRelativeValidator()`
- Eliminates duplication and confusion

### 5. Improved Identifier Detection

```typescript
const isIdentifier = (n: CstNode) => 
    n.type === NodeType.Identifier || 
    n.type === NodeType.Keyword;
```

**Why?** Your lexer might tokenize `from` and channel names differently depending on context. This ensures we catch both.

## How to Integrate

### Step 1: Update your Parser.ts

Replace the validation call in your `parseFunction()` method:

```typescript
// In Parser.ts, inside parseFunction()

// After creating the function node:
const node: CstNode = {
    type: NodeType.Function,
    name: funcName,
    children: args,
    span: { start, end, line, column },
};

// REPLACE your current validation with:
import { validateColorFunction } from './Validation-refactored';

validateColorFunction(node, this.rawSource);

return node;
```

### Step 2: Update hex color validation

```typescript
// In Parser.ts, inside parseHexColor()

import { validateHexColor } from './Validation-refactored';

const node: CstNode = {
    type: NodeType.HexColor,
    value: hexValue,
    span: token.span,
};

return validateHexColor(node, this.rawSource);
```

### Step 3: Remove old validation code

You can now remove or deprecate:

- The old `validationTable`
- `validateRelativeColor()` (old version)
- `validateAbsoluteColor()` (old version)
- Complex `acceptsRelative()` chains

## Expected Results

After integration, these should all work:

✅ `rgb(from red r g b)` - Channel references
✅ `rgb(from red 255 g b)` - Mixed absolute and relative
✅ `rgb(from red r g b / alpha)` - Alpha channel reference
✅ `hsl(from red h s l)` - Different color space channels
✅ `rgb(from red r g b / 0.5)` - Alpha as number
✅ `lch(from blue calc(l + 20) c h)` - calc() functions

## Testing Checklist

Run your test suite and verify:

- [ ] Basic colors still work: `red`, `#ff0000`, `rgb(255, 0, 0)`
- [ ] Absolute colors work: `rgb(255 100 0)`, `hsl(120deg 100% 50%)`
- [ ] Relative colors work: `rgb(from red r g b)`
- [ ] Mixed values work: `rgb(from red 255 g b)`
- [ ] Channel references work: `r`, `g`, `b`, `h`, `s`, `l`, etc.
- [ ] Alpha references work: `rgb(from red r g b / alpha)`
- [ ] calc() works: `lch(from blue calc(l + 20) c h)`
- [ ] Invalid channels are rejected: `rgb(from red h s l)` ❌
- [ ] Errors are clear and helpful

## Debugging Tips

If you still get errors:

1. **Check your lexer** - Make sure single letters like `r`, `g`, `b` are tokenized as `IDENTIFIER` or `KEYWORD`
2. **Add logging** - Log the node type and value in `isChannelReference()`
3. **Verify function names** - Ensure `node.name` matches exactly (`rgb` not `RGB`)
4. **Check node structure** - Use `console.log(meaningfulChildren(node))` to see what the validator sees

## Additional Features

The refactored code also handles:

- **Type safety** - Clear interfaces prevent type confusion
- **Extensibility** - Easy to add new color functions
- **Error messages** - Specific, actionable error messages
- **Performance** - Validators created on-demand, not stored

## Migration Path

1. Copy `Validation-refactored.ts` to your `src/parser/` directory
2. Update imports in `Parser.ts`
3. Run your test suite
4. Fix any remaining lexer/tokenization issues
5. Remove old validation code once tests pass
