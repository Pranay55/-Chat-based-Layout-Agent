# Chat-Based Layout Agent

A chat-driven AI layout transformation tool built for the Compra AI Engineer Intern assignment.  
The application allows users to modify a design layout JSON using natural language instructions such as:

- "Convert this design to 9:16"
- "Move the headline to the top"
- "Make the headline smaller"
- "Keep the product large"

The agent updates the layout JSON dynamically and reflects the changes in a visual wireframe preview.

---

# Features

- Chat-based UI for natural language layout editing
- LLM-powered layout reasoning using Claude/OpenAI
- Dynamic JSON transformations
- Aspect ratio conversion support (1:1 → 9:16, etc.)
- Wireframe layout preview
- Conversation context handling for follow-up instructions
- Safe JSON validation before applying updates

---

# Tech Stack

## Frontend
- React + Vite
- Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js
- Anthropic Claude API / OpenAI API

---

# Project Structure

```bash
layout-agent/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── prompts/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── README.md
├── APPROACH.md
└── .gitignore
```

---

# How It Works

The application uses an LLM-powered layout agent to interpret user instructions and modify the layout JSON accordingly.

Each layout node contains:
- Absolute coordinates (`x`, `y`, `width`, `height`)
- Normalized coordinates (`nx`, `ny`, `nw`, `nh`)

Normalized coordinates allow responsive resizing and aspect ratio transformations while preserving layout structure.

The backend:
1. Receives the current layout JSON and user instruction
2. Builds a structured system prompt
3. Sends the prompt to the LLM
4. Validates the returned JSON
5. Returns the updated layout to the frontend

---

# Setup Instructions

## Prerequisites

- Node.js v18+
- npm
- Anthropic or OpenAI API key
- Git

---

# 1. Clone Repository

```bash
git clone <YOUR_REPO_URL>
cd layout-agent
```

---

# 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

# 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

# 4. Create Environment Variables

Create a `.env` file inside `server/`

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

---

# 5. Run Backend

```bash
cd server
npm run dev
```

---

# 6. Run Frontend

```bash
cd client
npm run dev
```

---

# Example Prompts

Try the following instructions:

```text
Convert this design to 9:16
Move the headline to the top
Make the headline smaller
Center the product
Move the offer badge higher
Make the discount badge bigger
Change headline color to red
```

---

# Core Functionalities

## Layout Transformations
- Resize artboard
- Move elements
- Resize nodes
- Update typography
- Maintain normalized coordinates

## LLM Reasoning
The agent identifies semantic roles such as:
- Headline
- Product image
- Offer badge
- CTA text
- Background

and applies transformations intelligently.

---

# Wireframe Preview

The application includes a responsive wireframe preview that:
- Renders text, image, and shape nodes
- Uses normalized coordinates
- Updates live after each transformation

---

# JSON Validation

The backend validates all returned JSON before applying updates to prevent malformed layouts from breaking the application.

Validation checks:
- rootNodes existence
- nodes structure
- valid node references
- required properties

---

# Conversation Context

The last few chat messages are passed to the LLM to support follow-up instructions like:

```text
Make it smaller
Move it higher
Keep it centered
```

This allows the agent to understand contextual references.

---

# Future Improvements

- Real image rendering
- Drag-and-drop editing
- Multi-artboard support
- Undo/redo history
- Tool calling for safer transformations
- Advanced semantic layout reasoning
- Export to PNG/SVG

---

# Approach Summary

This project combines:
- deterministic layout transformation logic
- normalized coordinate math
- LLM-based semantic reasoning

The LLM handles understanding user intent, while the backend ensures layout transformations remain safe and structured.

---

# Submission

Deliverables included:
- GitHub repository
- README
- Layout transformation system
- Chat interface
- JSON update handling
- Wireframe preview

---

# Author

Pranay Paratwar