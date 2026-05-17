# Layout Agent AI

Layout Agent AI is a chat-based layout editing application that enables users to modify visual layouts using natural language instructions. Instead of manually editing JSON or design coordinates, users can type commands like **"move headline up"**, **"make all text smaller"**, or **"change the headline color to red"**, and the system automatically interprets and applies the changes.

The application combines an LLM-powered planning layer with a deterministic layout execution engine, providing flexible semantic editing while maintaining predictable and safe layout transformations.

---

# Features

- Natural language layout editing
- Semantic command understanding
- Relative node positioning
- Bulk node operations
- Text styling updates
- Artboard resizing
- Undo / Redo support
- Pronoun resolution
- Live wireframe preview
- JSON-driven rendering

---

# Project Description

This project demonstrates an AI-powered layout editing workflow where users interact with a design through chat instead of manual editing tools. The system converts natural language instructions into structured layout actions, validates them, executes deterministic transformations, and updates both the layout JSON and visual preview in real time.

---

# Prerequisites

Before running the project, ensure the following are installed:

- **Node.js** v18 or higher (recommended: v20+)
- **npm**
- **OpenAI API Key** (or API key for your configured LLM provider)

Check versions:

```bash
node -v
npm -v
```

---

# Setup

## 1. Clone Repository

```bash
git clone https://github.com/Pranay55/-Chat-based-Layout-Agent layout-agent
cd layout-agent
```

---

## 2. Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd ../client
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
OPENAI_API_KEY=your_api_key_here
PORT=3001
```

If using another provider, configure the corresponding API key inside `llmService.js`.

---

# Running the Project

## Start Backend

From `server/`:

```bash
npm run dev
```

Backend runs at:

```bash
http://localhost:3001
```

---

## Start Frontend

From `client/`:

```bash
npm run dev
```

Frontend usually runs at:

```bash
http://localhost:5173
```

---

# How to Use

Open the frontend in your browser and interact with the chat interface.

The layout preview updates automatically whenever the JSON layout changes.

---

# Example Prompts

## Single Node Operations

```text
move headline up
move badge right
make headline bigger
delete the discount badge
move buy button below headline
```

---

## Bulk Operations

```text
make all text smaller
make all shapes bigger
move all images left
delete all shapes
center all text
```

---

## Style Editing

```text
change the headline color to red
make headline bold
make headline italic
change font to Helvetica
set headline font size to 36
```

Supported style properties:

- color
- fontSize
- fontWeight
- fontFamily
- fontStyle

---

## Artboard Resizing

```text
convert this design to 9:16
make this 16:9
change canvas to 1:1
convert to instagram story
```

Supported presets:

- Instagram Post (1:1)
- Instagram Story (9:16)
- YouTube (16:9)
- Instagram Portrait (4:5)

---

## Conversational Editing

The system supports context-aware follow-up commands.

Example:

```text
move headline up
make it bigger
change its color to blue
move buy button below it
```

Pronouns supported:

- it
- this
- that
- them
- these
- those

---

## Undo / Redo

```text
undo
undo 2
redo
redo last action
go forward
```

---

# Tech Stack Overview

## Frontend

- React
- Vite
- Axios

Responsibilities:

- Chat interface
- Request handling
- Live layout visualization
- Rendering layout preview

---

## Backend

- Node.js
- Express
- Zod

Responsibilities:

- API routing
- Request validation
- Action execution
- History management
- Undo/redo state management

---

## AI Layer

- OpenAI API (LLM)

Responsibilities:

- Intent understanding
- Natural language parsing
- Action plan generation
- Semantic interpretation

Examples:

```text
move slightly upward
keep the product large
make headline bigger
```

---

## Layout Engine

Custom deterministic transformation engine.

Supports:

- Node movement
- Relative placement
- Semantic anchor positioning
- Node resizing
- Text style updates
- Node deletion
- Bulk transformations
- Artboard resizing
- Undo / redo restoration

---

# Architecture Overview

## System Flow

```text
User Prompt
   ↓
Planner Service (LLM)
   ↓
Structured JSON Action Plan
   ↓
Action Normalization
   ↓
Validation Layer
   ↓
Execution Engine
   ↓
Updated Layout JSON
   ↓
Frontend Preview Update
```

---

# Project Structure

```text
layout-agent/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx
│   │   │   └── WireframePreview.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── prompts/
│   │   └── plannerPrompt.js
│   │
│   ├── routes/
│   │   └── chat.js
│   │
│   ├── services/
│   │   ├── llmService.js
│   │   ├── plannerService.js
│   │   ├── actionPlanner.js
│   │   ├── actionExecutor.js
│   │   └── layoutTransforms.js
│   │
│   ├── utils/
│   │   ├── actionValidator.js
│   │   ├── layoutHelpers.js
│   │   ├── nodeResolver.js
│   │   ├── semanticMappings.js
│   │   └── jsonValidator.js
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# Layout Preview Approach

Goal: show a visual approximation of the layout.

Implementation:

- Uses absolute-positioned `<div>` elements
- Scales elements using normalized coordinates:
  - `nx`
  - `ny`
  - `nw`
  - `nh`
- Renders:
  - styled text nodes
  - image placeholders
  - shape rectangles
- Automatically updates when layout JSON changes

This provides fast wireframe feedback without needing a full design renderer.

---

# Example JSON Action

Example planner output:

```json
{
  "intent": "Move headline to top",
  "actions": [
    {
      "type": "move_node",
      "nodeId": "headline",
      "params": {
        "position": "top"
      }
    }
  ]
}
```

---

# Future Improvements

Potential enhancements:

- Multi-node selection by semantic grouping
- Rich image rendering instead of placeholders
- Snap alignment tools
- Layer ordering controls
- Rotation / transforms
- More advanced styling controls
- Layout constraints
- Export to design formats

---

# Notes

- Current styling support is focused on text nodes
- Preview is a wireframe approximation, not pixel-perfect rendering
- LLM output is validated before execution for safety
- Deterministic transforms ensure predictable behavior

---

# License

Add your preferred license here.