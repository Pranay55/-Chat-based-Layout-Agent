# Approach Note

## Overview

The goal of this project was to build a chat-based layout editing system that allows users to modify a visual design using natural language instead of directly editing JSON coordinates or using a traditional design tool interface.

The implementation combines an LLM-powered planning layer with a deterministic execution engine. The LLM interprets user intent and produces structured layout actions, while the backend validates and executes those actions safely against the layout JSON.

This hybrid design provides flexibility in language understanding while preserving predictable and controlled layout behavior.

---

# 1. LLM Prompt Structure

The prompt was designed with a strict schema-driven approach rather than relying on free-form LLM reasoning.

## Design Principles

The planner prompt explicitly defines:

- supported action types
- exact JSON schemas
- allowed parameter values
- examples for each action
- layout context
- behavioral constraints

Example instruction pattern:

```json
{
  "type": "semantic_move",
  "nodeId": "headline",
  "direction": "up",
  "magnitude": "slightly"
}
```

Rather than asking the LLM to directly modify layout JSON, the model is asked to generate a structured action plan.

This provides a clean separation between:

- **intent understanding (LLM responsibility)**
- **layout execution (deterministic backend responsibility)**

---

## Prompt Sections

The prompt is organized into multiple logical sections:

### System Rules

Defines strict constraints:

- return valid JSON only
- no markdown
- no prose
- no invented action types
- no missing required fields

This reduces parsing ambiguity.

---

### Semantic Actions

Higher-level user intent is represented using semantic actions.

Examples:

- `semantic_move`
- `semantic_resize`
- `semantic_anchor_move`
- `semantic_relative_move`
- `semantic_resize_artboard`
- `semantic_delete`

This allows natural commands like:

```text
move headline slightly upward
make the product bigger
move CTA below headline
convert to instagram story
```

without forcing the LLM to compute raw pixel coordinates.

---

### Direct Executable Actions

For precise numeric commands:

Examples:

- `move_node_offset`
- `resize_node`
- `resize_artboard`
- `change_node_style`

This supports prompts like:

```text
move headline 50px right
set font size to 36
```

---

### Layout Context Injection

The current layout JSON is included in the prompt.

This gives the LLM awareness of:

- node IDs
- node types
- dimensions
- text content
- parent-child structure

This helps resolve prompts such as:

```text
move the buy button below the headline
```

---

### Examples

Few-shot examples were included to improve reliability for:

- semantic resizing
- artboard presets
- style updates
- relative movement
- bulk actions

Examples significantly improved consistency.

---

# 2. Safe JSON Transformations

A major design priority was preventing malformed or unsafe JSON mutations.

Instead of letting the LLM directly rewrite layout JSON, the system uses a controlled transformation pipeline.

---

## Transformation Pipeline

```text
User Prompt
   ↓
Planner Service (LLM)
   ↓
Structured Action Plan
   ↓
Action Normalization
   ↓
Validation
   ↓
Deterministic Execution
   ↓
Updated Layout JSON
```

---

## Why Not Direct JSON Editing?

Direct LLM JSON editing introduces several risks:

- invalid JSON
- corrupted node structures
- missing required properties
- broken normalized coordinates
- accidental deletion of unrelated nodes
- inconsistent state

By restricting the LLM to action generation only, these risks are avoided.

---

## Validation Layer

Before execution, every action is validated.

Checks include:

- supported action type
- required parameters
- allowed style properties
- valid node selection
- supported bulk node types
- valid undo/redo step counts

Examples:

```text
Unsupported action type
Invalid scale
Missing nodeId
Unsupported style property
```

This ensures unsafe actions never reach execution.

---

## Immutable Transformations

Layout transformations are applied using cloned layout objects instead of mutating original state directly.

This improves:

- predictability
- debugging
- undo/redo support
- frontend consistency

Example operations:

- move node
- resize node
- delete node
- bulk move
- style update
- restore previous layout snapshot

---

## Normalized Coordinate Consistency

The layout uses:

- `x`, `y`, `width`, `height`
- `nx`, `ny`, `nw`, `nh`

After every transformation:

- absolute coordinates are updated
- normalized values are recalculated

This ensures preview rendering remains accurate regardless of artboard size.

---

# 3. Conversation Context Handling

A conversational editing workflow requires remembering prior interactions.

Example:

```text
move headline up
make it bigger
change its color to red
```

The system supports this through explicit history management.

---

## History Tracking

Each successful action stores:

- timestamp
- intent
- actions
- previous layout snapshot

Example:

```json
{
  "intent": "Move headline up",
  "actions": [...],
  "layout": {...}
}
```

This enables state restoration and contextual reasoning.

---

## Pronoun Resolution

The planner does not reliably infer ambiguous references like:

```text
it
this
that
them
those
```

So pronoun resolution is handled deterministically before prompting the LLM.

Examples:

```text
move headline up
make it bigger
```

becomes:

```text
make headline bigger
```

Similarly:

```text
make all text smaller
move them left
```

becomes:

```text
move all text left
```

This improves conversational consistency.

---

## Undo / Redo

Undo/redo is intentionally deterministic and bypasses the LLM entirely.

Examples:

```text
undo
undo 2
redo
redo last action
```

Behavior:

- undo restores prior history snapshots
- redo restores redo snapshots
- redo history clears after new actions

This prevents ambiguous LLM behavior for state restoration.

---

# 4. Trade-offs and Improvements

## Trade-offs Made

---

### Hybrid Instead of Fully AI-Driven Editing

Decision:

LLM handles intent understanding only.

Execution is deterministic.

Why:

A fully AI-driven JSON editor would be more flexible but significantly less reliable.

Trade-off:

Less generative freedom, much higher safety.

---

### Limited Styling Support

Current support:

- color
- fontSize
- fontWeight
- fontFamily
- fontStyle

Excluded:

- gradients
- shadows
- border styling
- image filters
- transforms

Reason:

Focused MVP scope with native JSON compatibility.

---

### Wireframe Approximation Instead of Full Renderer

The frontend preview intentionally uses lightweight absolute-positioned divs.

Advantages:

- fast rendering
- simple implementation
- JSON-driven visualization
- immediate feedback

Trade-off:

Preview is approximate, not pixel-perfect.

Images are placeholders instead of actual assets.

---

### Type-Based Bulk Selection Only

Current bulk operations support:

```text
all text
all images
all shapes
```

Not:

```text
all headlines
all red elements
all CTA buttons
```

Reason:

Simple deterministic targeting.

---

## Improvements with More Time

### Semantic Multi-Node Selection

Support richer grouping:

```text
all headlines
all buttons
all promotional text
all product images
```

Would require stronger semantic node classification.

---

### Rich Preview Rendering

Instead of wireframes:

- actual images
- full typography rendering
- realistic colors
- shadows
- spacing fidelity

This would make the preview much closer to a real design tool.

---

### Constraint-Based Layout Logic

Current positioning is coordinate-based.

Future support:

- alignment constraints
- snapping
- distribution
- padding systems
- responsive layout rules

---

### Better Context Memory

Current context is session history only.

Future improvements:

- stronger conversational grounding
- semantic action memory
- node role memory

Example:

```text
keep using the same headline
```

---

### More Style Controls

Potential additions:

- background color
- opacity
- border radius
- gradients
- shadows
- text alignment
- letter spacing
- line height

---

### Better LLM Guardrails

Possible upgrades:

- JSON schema constrained generation
- function calling
- tool invocation instead of free JSON

This would improve planner reliability further.

---

# Final Design Philosophy

The system intentionally uses:

**AI for interpretation + deterministic code for execution**

rather than:

**AI for everything**

This hybrid approach balances:

- flexibility
- safety
- predictability
- conversational usability

and makes the system practical for real layout editing workflows.