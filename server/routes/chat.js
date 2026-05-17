import express from "express";
import { z } from "zod";

import { generateActionPlan } from "../services/plannerService.js";
import { executeActionPlan } from "../services/actionExecutor.js";
import { validateFinalLayout } from "../utils/jsonValidator.js";

const router = express.Router();

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),

  layout: z.object({
    rootNodes: z.array(z.string()).min(1, "At least one root node required"),
    nodes: z.record(z.any())
  }),

  history: z.array(z.any()).optional().default([]),

  redoHistory: z.array(z.any()).optional().default([])
});

router.post("/", async (req, res) => {
  try {
    const parsed = chatRequestSchema.parse(req.body);

    const {
      message,
      layout,
      history,
      redoHistory
    } = parsed;

    const plan = await generateActionPlan({
      message,
      layout,
      history,
      redoHistory
    });

    const updatedLayout = executeActionPlan(
      layout,
      plan.actions,
      history,
      redoHistory
    );

    validateFinalLayout(updatedLayout);

    const containsUndo = plan.actions.some(
      (action) => action.type === "undo"
    );

    const containsRedo = plan.actions.some(
      (action) => action.type === "redo"
    );

    let updatedHistory = history;
    let updatedRedoHistory = redoHistory;

    /**
     * UNDO
     *
     * current layout -> redo stack
     * restore from history
     * consume history
     */
    if (containsUndo) {
      const steps =
        plan.actions[0].params?.stepsBack || 1;

      updatedHistory = history.slice(
        0,
        Math.max(0, history.length - steps)
      );

      updatedRedoHistory = [
        ...redoHistory,
        {
          timestamp: Date.now(),
          intent: plan.intent,
          actions: plan.actions,
          layout
        }
      ];
    }

    /**
     * REDO
     *
     * current layout -> history
     * restore from redo
     * consume redo
     */
    else if (containsRedo) {
      const steps =
        plan.actions[0].params?.stepsForward || 1;

      updatedHistory = [
        ...history,
        {
          timestamp: Date.now(),
          intent: plan.intent,
          actions: plan.actions,
          layout
        }
      ];

      updatedRedoHistory = redoHistory.slice(
        0,
        Math.max(0, redoHistory.length - steps)
      );
    }

    /**
     * NORMAL ACTION
     *
     * current layout -> history
     * clear redo branch
     */
    else {
      updatedHistory = [
        ...history,
        {
          timestamp: Date.now(),
          intent: plan.intent,
          actions: plan.actions,
          layout
        }
      ];

      updatedRedoHistory = [];
    }

    return res.status(200).json({
      success: true,
      intent: plan.intent,
      actions: plan.actions,
      layout: updatedLayout,
      history: updatedHistory,
      redoHistory: updatedRedoHistory
    });

  } catch (error) {
    console.error("Chat route error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request payload",
        details: error.issues
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message || "Unknown error"
    });
  }
});

export default router;