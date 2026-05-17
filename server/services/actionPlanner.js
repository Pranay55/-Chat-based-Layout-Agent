import {
  MOVEMENT_INTENTS,
  SCALE_INTENTS,
  SIZE_PRESETS
} from "../constants/plannerDefaults.js";

import { getArtboard } from "../utils/layoutHelpers.js";

function resolveRelativeMove(word, artboard) {
  const base = artboard.width;

  switch (word) {
    case "tiny":
      return base * MOVEMENT_INTENTS.tiny;

    case "slightly":
    case "little":
    case "bit":
    case "nudge":
    case "small":
      return base * MOVEMENT_INTENTS.small;

    case "move":
    case "medium":
      return base * MOVEMENT_INTENTS.medium;

    case "significantly":
    case "large":
      return base * MOVEMENT_INTENTS.large;

    default:
      return base * MOVEMENT_INTENTS.small;
  }
}

function resolveScale(intent) {
  switch (intent) {
    case "tiny_grow":
      return SCALE_INTENTS.tiny_grow;

    case "small_grow":
    case "grow":
    case "bigger":
      return SCALE_INTENTS.small_grow;

    case "medium_grow":
      return SCALE_INTENTS.medium_grow;

    case "large_grow":
      return SCALE_INTENTS.large_grow;

    case "tiny_shrink":
      return SCALE_INTENTS.tiny_shrink;

    case "small_shrink":
    case "shrink":
    case "smaller":
      return SCALE_INTENTS.small_shrink;

    case "medium_shrink":
      return SCALE_INTENTS.medium_shrink;

    default:
      return SCALE_INTENTS.small_grow;
  }
}

function resolvePreset(preset) {
  const key = preset?.toLowerCase()?.replace(/\s+/g, "_");

  if (!SIZE_PRESETS[key]) {
    throw new Error(`Unsupported size preset: ${preset}`);
  }

  return SIZE_PRESETS[key];
}

function normalizeSemanticMove(action, artboard) {
  const distance = resolveRelativeMove(
    action.magnitude,
    artboard
  );

  let dx = 0;
  let dy = 0;

  switch (action.direction) {
    case "up":
      dy = -distance;
      break;

    case "down":
      dy = distance;
      break;

    case "left":
      dx = -distance;
      break;

    case "right":
      dx = distance;
      break;

    default:
      throw new Error(
        `Unsupported semantic direction: ${action.direction}`
      );
  }

  return {
    type: "move_node_offset",
    nodeId: action.nodeId,
    params: {
      dx,
      dy
    }
  };
}

function normalizeSemanticResize(action) {
  return {
    type: "resize_node",
    nodeId: action.nodeId,
    params: {
      scale: resolveScale(action.intent)
    }
  };
}

function normalizeSemanticResizeArtboard(action) {
  const preset = resolvePreset(action.preset);

  return {
    type: "resize_artboard",
    params: {
      width: preset.width,
      height: preset.height
    }
  };
}

function normalizeSemanticDelete(action) {
  return {
    type: "delete_node",
    nodeId: action.nodeId
  };
}

function normalizeSemanticAnchorMove(action) {
  return {
    type: "move_node",
    nodeId: action.nodeId,
    params: {
      position: action.position
    }
  };
}

function normalizeSemanticRelativeMove(action) {
  return {
    type: "move_node_relative",
    movingNodeId: action.movingNodeId,
    referenceNodeId: action.referenceNodeId,
    params: {
      relation: action.relation,
      gap: action.gap ?? 20
    }
  };
}

/**
 * BULK
 */

function normalizeSemanticBulkResize(action) {
  return {
    type: "resize_nodes",
    target: {
      selectionType: "type",
      nodeType: action.nodeType
    },
    params: {
      scale: resolveScale(action.intent)
    }
  };
}

function normalizeSemanticBulkMove(action, artboard) {
  const distance = resolveRelativeMove(
    action.magnitude,
    artboard
  );

  let dx = 0;
  let dy = 0;

  switch (action.direction) {
    case "up":
      dy = -distance;
      break;

    case "down":
      dy = distance;
      break;

    case "left":
      dx = -distance;
      break;

    case "right":
      dx = distance;
      break;

    default:
      throw new Error(
        `Unsupported bulk direction: ${action.direction}`
      );
  }

  return {
    type: "move_nodes_offset_bulk",
    target: {
      selectionType: "type",
      nodeType: action.nodeType
    },
    params: {
      dx,
      dy
    }
  };
}

function normalizeSemanticBulkDelete(action) {
  return {
    type: "delete_nodes",
    target: {
      selectionType: "type",
      nodeType: action.nodeType
    }
  };
}

function normalizeSemanticBulkAlign(action) {
  return {
    type: "align_nodes",
    target: {
      selectionType: "type",
      nodeType: action.nodeType
    },
    params: {
      alignment: action.alignment
    }
  };
}

function normalizeAction(action, artboard) {
  switch (action.type) {
    case "semantic_move":
      return normalizeSemanticMove(action, artboard);

    case "semantic_resize":
      return normalizeSemanticResize(action);

    case "semantic_resize_artboard":
      return normalizeSemanticResizeArtboard(action);

    case "semantic_delete":
      return normalizeSemanticDelete(action);

    case "semantic_anchor_move":
      return normalizeSemanticAnchorMove(action);

    case "semantic_relative_move":
      return normalizeSemanticRelativeMove(action);

    /**
     * BULK
     */
    case "semantic_bulk_resize":
      return normalizeSemanticBulkResize(action);

    case "semantic_bulk_move":
      return normalizeSemanticBulkMove(action, artboard);

    case "semantic_bulk_delete":
      return normalizeSemanticBulkDelete(action);

    case "semantic_bulk_align":
      return normalizeSemanticBulkAlign(action);

    default:
      return action;
  }
}

export function normalizeActionPlan(layout, actions) {
  if (!Array.isArray(actions)) {
    throw new Error("Action plan must be an array");
  }

  const artboard = getArtboard(layout);

  return actions.map((action) =>
    normalizeAction(action, artboard)
  );
}