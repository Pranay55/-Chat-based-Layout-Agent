const SUPPORTED_ACTIONS = new Set([
  "resize_artboard",
  "move_node",
  "move_node_offset",
  "resize_node",
  "move_node_relative",
  "delete_node",
  "change_node_style",
  "update_node_style",

  /**
   * BULK
   */
  "resize_nodes",
  "move_nodes_offset_bulk",
  "delete_nodes",
  "align_nodes",

  /**
   * HISTORY
   */
  "undo",
  "redo"
]);

const SUPPORTED_POSITIONS = new Set([
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "top_left",
  "top_right",
  "bottom_left",
  "bottom_right"
]);

const SUPPORTED_RELATIONS = new Set([
  "above",
  "below",
  "left_of",
  "right_of",
  "centered_above",
  "centered_below"
]);

const SUPPORTED_NODE_TYPES = new Set([
  "text",
  "image",
  "shape"
]);

const SUPPORTED_STYLE_PROPERTIES = new Set([
  "color",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "fontStyle"
]);

export function validateAction(action) {
  if (!action || typeof action !== "object") {
    throw new Error("Action must be an object");
  }

  if (!SUPPORTED_ACTIONS.has(action.type)) {
    throw new Error(`Unsupported action type: ${action.type}`);
  }

  switch (action.type) {
    case "resize_artboard":
      validateResizeArtboard(action);
      break;

    case "move_node":
      validateMoveNode(action);
      break;

    case "move_node_offset":
      validateMoveNodeOffset(action);
      break;

    case "resize_node":
      validateResizeNode(action);
      break;

    case "move_node_relative":
      validateMoveNodeRelative(action);
      break;

    case "delete_node":
      validateDeleteNode(action);
      break;

    case "change_node_style":
    case "update_node_style":
      validateChangeNodeStyle(action);
      break;

    /**
     * BULK
     */
    case "resize_nodes":
      validateResizeNodes(action);
      break;

    case "move_nodes_offset_bulk":
      validateMoveNodesOffsetBulk(action);
      break;

    case "delete_nodes":
      validateDeleteNodes(action);
      break;

    case "align_nodes":
      validateAlignNodes(action);
      break;

    /**
     * HISTORY
     */
    case "undo":
      validateUndo(action);
      break;

    case "redo":
      validateRedo(action);
      break;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }

  return true;
}

export function validateActionPlan(actions) {
  if (!Array.isArray(actions)) {
    throw new Error("Action plan must be an array");
  }

  if (actions.length === 0) {
    throw new Error("Action plan cannot be empty");
  }

  for (const action of actions) {
    validateAction(action);
  }

  return true;
}

function validateTarget(target) {
  if (!target || typeof target !== "object") {
    throw new Error("Bulk action requires target");
  }

  if (target.selectionType !== "type") {
    throw new Error("Only type-based selection is supported");
  }

  if (!SUPPORTED_NODE_TYPES.has(target.nodeType)) {
    throw new Error(
      `Unsupported node type: ${target.nodeType}`
    );
  }
}

function validateResizeArtboard(action) {
  const { width, height } = action.params || {};

  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error("resize_artboard requires valid width/height");
  }
}

function validateMoveNode(action) {
  if (!action.nodeId || typeof action.nodeId !== "string") {
    throw new Error("move_node requires nodeId");
  }

  if (!SUPPORTED_POSITIONS.has(action.params?.position)) {
    throw new Error(
      `Unsupported move position: ${action.params?.position}`
    );
  }
}

function validateMoveNodeOffset(action) {
  if (!action.nodeId || typeof action.nodeId !== "string") {
    throw new Error("move_node_offset requires nodeId");
  }

  const { dx, dy } = action.params || {};

  if (
    typeof dx !== "number" ||
    typeof dy !== "number"
  ) {
    throw new Error("move_node_offset requires numeric dx/dy");
  }
}

function validateResizeNode(action) {
  if (!action.nodeId || typeof action.nodeId !== "string") {
    throw new Error("resize_node requires nodeId");
  }

  if (
    typeof action.params?.scale !== "number" ||
    action.params.scale <= 0
  ) {
    throw new Error("resize_node requires valid scale");
  }
}

function validateMoveNodeRelative(action) {
  if (!action.movingNodeId || typeof action.movingNodeId !== "string") {
    throw new Error("move_node_relative requires movingNodeId");
  }

  if (!action.referenceNodeId || typeof action.referenceNodeId !== "string") {
    throw new Error("move_node_relative requires referenceNodeId");
  }

  if (!SUPPORTED_RELATIONS.has(action.params?.relation)) {
    throw new Error(
      `Unsupported relation: ${action.params?.relation}`
    );
  }
}

function validateDeleteNode(action) {
  if (!action.nodeId || typeof action.nodeId !== "string") {
    throw new Error("delete_node requires nodeId");
  }
}

function validateChangeNodeStyle(action) {
  if (!action.nodeId || typeof action.nodeId !== "string") {
    throw new Error("change_node_style requires nodeId");
  }

  const property = action.params?.property;
  const value = action.params?.value;

  if (!SUPPORTED_STYLE_PROPERTIES.has(property)) {
    throw new Error(
      `Unsupported style property: ${property}`
    );
  }

  if (
    value === undefined ||
    value === null
  ) {
    throw new Error(
      "change_node_style requires style value"
    );
  }
}

/**
 * BULK
 */

function validateResizeNodes(action) {
  validateTarget(action.target);

  if (
    typeof action.params?.scale !== "number" ||
    action.params.scale <= 0
  ) {
    throw new Error("resize_nodes requires valid scale");
  }
}

function validateMoveNodesOffsetBulk(action) {
  validateTarget(action.target);

  const { dx, dy } = action.params || {};

  if (
    typeof dx !== "number" ||
    typeof dy !== "number"
  ) {
    throw new Error(
      "move_nodes_offset_bulk requires numeric dx/dy"
    );
  }
}

function validateDeleteNodes(action) {
  validateTarget(action.target);
}

function validateAlignNodes(action) {
  validateTarget(action.target);

  if (!SUPPORTED_POSITIONS.has(action.params?.alignment)) {
    throw new Error(
      `Unsupported alignment: ${action.params?.alignment}`
    );
  }
}

/**
 * HISTORY
 */

function validateUndo(action) {
  const stepsBack = action.params?.stepsBack;

  if (
    stepsBack !== undefined &&
    (
      !Number.isInteger(stepsBack) ||
      stepsBack <= 0
    )
  ) {
    throw new Error("undo requires positive integer stepsBack");
  }
}

function validateRedo(action) {
  const stepsForward = action.params?.stepsForward;

  if (
    stepsForward !== undefined &&
    (
      !Number.isInteger(stepsForward) ||
      stepsForward <= 0
    )
  ) {
    throw new Error("redo requires positive integer stepsForward");
  }
}