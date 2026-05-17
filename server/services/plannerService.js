import { callLLM } from "./llmService.js";
import { buildPlannerPrompt } from "../prompts/plannerPrompt.js";
import { normalizeActionPlan } from "./actionPlanner.js";
import { validateActionPlan } from "../utils/actionValidator.js";
import { rewriteMessageWithResolvedNodes } from "../utils/nodeResolver.js";

const MAX_LLM_HISTORY = 6;

function detectUndoIntent(message, history) {
  const lower = message.toLowerCase().trim();

  const undoPatterns = [
    "undo",
    "go back",
    "revert",
    "undo last change",
    "undo last action"
  ];

  const isUndo = undoPatterns.some((pattern) =>
    lower.includes(pattern)
  );

  if (!isUndo) {
    return null;
  }

  const numberMatch = lower.match(/(\d+)/);

  const requestedSteps = numberMatch
    ? parseInt(numberMatch[1], 10)
    : 1;

  if (requestedSteps > history.length) {
    throw new Error(
      `Cannot undo ${requestedSteps} step(s). Only ${history.length} step(s) available.`
    );
  }

  return {
    intent: `Undo ${requestedSteps} step(s)`,
    actions: [
      {
        type: "undo",
        params: {
          stepsBack: requestedSteps
        }
      }
    ]
  };
}

function detectRedoIntent(message, redoHistory) {
  const lower = message.toLowerCase().trim();

  const redoPatterns = [
    "redo",
    "redo last action",
    "go forward"
  ];

  const isRedo = redoPatterns.some((pattern) =>
    lower.includes(pattern)
  );

  if (!isRedo) {
    return null;
  }

  const numberMatch = lower.match(/(\d+)/);

  const requestedSteps = numberMatch
    ? parseInt(numberMatch[1], 10)
    : 1;

  if (requestedSteps > redoHistory.length) {
    throw new Error(
      `Cannot redo ${requestedSteps} step(s). Only ${redoHistory.length} step(s) available.`
    );
  }

  return {
    intent: `Redo ${requestedSteps} step(s)`,
    actions: [
      {
        type: "redo",
        params: {
          stepsForward: requestedSteps
        }
      }
    ]
  };
}

export async function generateActionPlan({
  message,
  layout,
  history = [],
  redoHistory = []
}) {
  if (!message || typeof message !== "string") {
    throw new Error("Invalid message");
  }

  if (!layout || typeof layout !== "object") {
    throw new Error("Invalid layout");
  }

  if (!Array.isArray(history)) {
    throw new Error("History must be an array");
  }

  if (!Array.isArray(redoHistory)) {
    throw new Error("Redo history must be an array");
  }

  const undoPlan = detectUndoIntent(
    message,
    history
  );

  if (undoPlan) {
    validateActionPlan(undoPlan.actions);
    return undoPlan;
  }

  const redoPlan = detectRedoIntent(
    message,
    redoHistory
  );

  if (redoPlan) {
    validateActionPlan(redoPlan.actions);
    return redoPlan;
  }

  const resolvedMessage = rewriteMessageWithResolvedNodes(
    message,
    layout,
    history
  );

  /**
   * Only recent history goes to LLM
   * Full history remains available for undo/redo.
   */
  const llmHistory = history.slice(-MAX_LLM_HISTORY);
  const llmRedoHistory = redoHistory.slice(-MAX_LLM_HISTORY);

  const systemPrompt = buildPlannerPrompt(layout);

  const userPrompt = `
Resolved request:
${resolvedMessage}

Original request:
${message}

Recent history:
${JSON.stringify(llmHistory)}

Redo history:
${JSON.stringify(llmRedoHistory)}
`;

  const response = await callLLM({
    systemPrompt,
    userPrompt
  });

  if (!response || typeof response !== "object") {
    throw new Error("Invalid planner response");
  }

  if (
    !response.actions ||
    !Array.isArray(response.actions) ||
    response.actions.length === 0
  ) {
    throw new Error(
      "Planner could not generate actions for this request"
    );
  }

  const executableActions = normalizeActionPlan(
    layout,
    response.actions
  );

  validateActionPlan(executableActions);

  return {
    intent: response.intent || message,
    actions: executableActions
  };
}