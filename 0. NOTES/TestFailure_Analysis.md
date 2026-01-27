# Test Failure Analysis

## Currently Failing Tests (and Why)

### Test[27]: `hsl(from red 240deg s l)` ❌

**Error:** `Invalid value for channel 's'`

**Root Cause:**
- Your validator expects `s` to be a **Percentage** in absolute mode
- But in relative mode, `s` is a **channel reference** to the source color's saturation
- Old validator: `isPercentage(n)` only
- New validator: `isPercentage(n) || isChannelReference(n, 'hsl') || isCalcFunction(n)`

**Fix:** The refactored validator allows identifiers matching channel names

---

### Test[28]: `hwb(from green h w b / 0.5)` ❌

**Error:** `Invalid value for channel 'h'`

**Root Cause:**
- Same as above - `h` is a channel reference, not an angle value
- Old validator only accepted angles/numbers
- New validator accepts `h` as a valid identifier in `hwb()` context

---

### Test[29]: `lch(from blue calc(l + 20) c h)` ❌

**Error:** `Unexpected token type: 'ERROR' with value: '+'`

**Root Cause:**
- **This is a LEXER issue**, not a validation issue
- The `+` inside `calc()` is being tokenized as ERROR
- Your lexer doesn't properly handle operators inside function calls

**Fix Options:**
1. Update lexer to recognize `+`, `-`, `*`, `/` as valid tokens
2. Parse `calc()` as a complete sub-expression
3. For now, the validator accepts `calc()` functions as-is without validating internals

---

### Test[37]: `rgb(from red 255 g b)` ❌

**Error:** `Invalid value for channel 'g'`

**Why it should work:**
- `255` is absolute value for R ✓
- `g` is channel reference for G ✓
- `b` is channel reference for B ✓

**Root Cause:**
- Old validator doesn't accept mixing absolute and relative values
- New validator allows both: `isNumber(n) || isChannelReference(n, 'rgb')`

---

### Test[38]: `rgb(from red r 0 0)` ❌

**Error:** `Invalid value for channel 'r'`

**Root Cause:**
- Same issue - `r` is a valid channel reference
- Should be accepted in relative color syntax

---

### Test[39-41]: `rgb(from red r g b / 1)`, etc. ❌

**Error:** `Invalid value for channel 'r'`

**Root Cause:**
- All channel references (`r`, `g`, `b`) are being rejected
- This confirms the validator isn't recognizing them as valid identifiers

---

### Test[42]: `rgb(from red r g b / alpha)` ❌

**Error:** `Invalid alpha value`

**Why it should work:**
- `alpha` is a special channel reference for the alpha channel
- Should be valid in relative colors

**Root Cause:**
- Alpha validator only checks `isNumber(n) || isPercentage(n)`
- New validator: `isNumber(n) || isPercentage(n) || isChannelReference(n, 'rgb')`

---

### Test[43-46]: `rgb(from red r g g)`, `rgb(from red r b b)`, etc. ❌

**Error:** `Invalid value for channel 'r'` or `'g'`

**Why these ARE valid:**
- CSS allows using any channel from the source color in any position
- `rgb(from red r g g)` means: R stays, G stays, B uses G value
- This is intentional CSS feature for color manipulation

**Example:**
```css
/* Make red more cyan by setting B = G */
rgb(from red r g g)

/* Swap G and B channels */
rgb(from red r b g)
```

---

## The Core Problem

Your old validation logic had this flow:

```typescript
// Old approach
const acceptsRelative = (base, name) => (n) =>
    base(n) || isChannelReference(name)(n) || ...;

// But isChannelReference was defined as:
const isChannelReference = (name: string): NodeValidator =>
    (n: CstNode) => isIdentifier(n) && n.value === name;
```

**Problem:** `isChannelReference('r')` creates a validator that checks `n.value === 'r'`

This means:
- ✅ Checks if the value is literally 'r'
- ❌ But doesn't verify it's actually an identifier
- ❌ And 'r' might be tokenized as KEYWORD, not IDENTIFIER

## The Fix

New approach is context-aware:

```typescript
const isChannelReference = (n: CstNode, functionName: string): boolean => {
    // 1. Must be an identifier-like token
    if (!isIdentifier(n)) return false;
    
    // 2. Must match a valid channel for this function
    const validChannels = CHANNEL_NAMES[functionName] || [];
    return validChannels.includes(n.value);
};
```

This means:
- ✅ Checks token type first
- ✅ Validates channel name is appropriate for color space
- ✅ Works regardless of whether lexer calls it IDENTIFIER or KEYWORD

## Lexer Check

Your lexer might be tokenizing channel references incorrectly. Check:

```typescript
// In your lexer output for "rgb(from red r g b)":
{ type: undefined, value: 'from' }  // ❌ Should be KEYWORD or IDENTIFIER
{ type: 'NamedColor', name: 'red' } // ✓ Correct
{ type: ???, value: 'r' }            // Should be IDENTIFIER or KEYWORD
{ type: ???, value: 'g' }            // Should be IDENTIFIER or KEYWORD
{ type: ???, value: 'b' }            // Should be IDENTIFIER or KEYWORD
```

If you see `type: undefined`, that's your immediate problem - the lexer isn't tokenizing these correctly.

## Quick Fix for Lexer

In your lexer's token classification:

```typescript
// Make sure single-letter identifiers are classified correctly
if (state === State.Identifier) {
    const value = /* ... extracted value ... */;
    
    // Don't classify 'r', 'g', 'b', etc. as anything special
    // Just make them IDENTIFIER tokens
    return {
        type: TokenType.IDENTIFIER,
        value: value,
        span: /* ... */
    };
}
```

## Summary

| Test   | Issue                       | Fix Location                        |
| ------ | --------------------------- | ----------------------------------- |
| 27, 28 | Channel refs not recognized | Validator ✓ (fixed in refactor)     |
| 29     | Calc parsing                | **Lexer** (needs '+' token support) |
| 37-46  | Channel refs not recognized | Validator ✓ (fixed in refactor)     |
| 42     | Alpha channel ref           | Validator ✓ (fixed in refactor)     |

**Priority:**
1. Fix lexer to properly tokenize `r`, `g`, `b`, `h`, `s`, `l`, `alpha` as IDENTIFIER
2. Integrate refactored validator
3. Add '+', '-', '*', '/' token support for calc()