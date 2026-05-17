import {
  cloneLayout,
  getArtboard,
  getChildren,
  getNode,
  getNodesByType,
  isEditableNode,
  updateAbsolute,
  updateNormalized
} from "../utils/layoutHelpers.js";

const DEFAULT_PADDING = 40;
const DEFAULT_RELATION_GAP = 20;

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function validateScale(scale) {
  if (
    typeof scale !== "number" ||
    !Number.isFinite(scale)
  ) {
    throw new Error("Scale must be a valid number");
  }

  if (scale <= 0) {
    throw new Error("Scale must be greater than zero");
  }
}

function validateDimensions(newWidth, newHeight) {
  if (
    typeof newWidth !== "number" ||
    typeof newHeight !== "number" ||
    !Number.isFinite(newWidth) ||
    !Number.isFinite(newHeight)
  ) {
    throw new Error("Artboard dimensions must be valid numbers");
  }

  if (newWidth <= 0 || newHeight <= 0) {
    throw new Error("Artboard dimensions must be greater than zero");
  }
}

function validateOffset(dx, dy) {
  if (
    typeof dx !== "number" ||
    typeof dy !== "number" ||
    !Number.isFinite(dx) ||
    !Number.isFinite(dy)
  ) {
    throw new Error("Offset values must be valid numbers");
  }
}

function validateGap(gap) {
  if (
    typeof gap !== "number" ||
    !Number.isFinite(gap) ||
    gap < 0
  ) {
    throw new Error("Gap must be a valid non-negative number");
  }
}

function calculatePosition(artboard, node, position) {
  const centerX = (artboard.width - node.width) / 2;
  const centerY = (artboard.height - node.height) / 2;

  switch (position) {
    case "top":
      return {
        x: centerX,
        y: DEFAULT_PADDING
      };

    case "bottom":
      return {
        x: centerX,
        y: artboard.height - node.height - DEFAULT_PADDING
      };

    case "left":
      return {
        x: DEFAULT_PADDING,
        y: centerY
      };

    case "right":
      return {
        x: artboard.width - node.width - DEFAULT_PADDING,
        y: centerY
      };

    case "center":
      return {
        x: centerX,
        y: centerY
      };

    case "top_left":
      return {
        x: DEFAULT_PADDING,
        y: DEFAULT_PADDING
      };

    case "top_right":
      return {
        x: artboard.width - node.width - DEFAULT_PADDING,
        y: DEFAULT_PADDING
      };

    case "bottom_left":
      return {
        x: DEFAULT_PADDING,
        y: artboard.height - node.height - DEFAULT_PADDING
      };

    case "bottom_right":
      return {
        x: artboard.width - node.width - DEFAULT_PADDING,
        y: artboard.height - node.height - DEFAULT_PADDING
      };

    default:
      throw new Error(`Unsupported position: ${position}`);
  }
}

function calculateRelativePosition(
  movingNode,
  referenceNode,
  relation,
  gap
) {
  switch (relation) {
    case "above":
      return {
        x: referenceNode.x,
        y: referenceNode.y - movingNode.height - gap
      };

    case "below":
      return {
        x: referenceNode.x,
        y: referenceNode.y + referenceNode.height + gap
      };

    case "left_of":
      return {
        x: referenceNode.x - movingNode.width - gap,
        y: referenceNode.y
      };

    case "right_of":
      return {
        x: referenceNode.x + referenceNode.width + gap,
        y: referenceNode.y
      };

    case "centered_above":
      return {
        x:
          referenceNode.x +
          (referenceNode.width - movingNode.width) / 2,
        y: referenceNode.y - movingNode.height - gap
      };

    case "centered_below":
      return {
        x:
          referenceNode.x +
          (referenceNode.width - movingNode.width) / 2,
        y: referenceNode.y + referenceNode.height + gap
      };

    default:
      throw new Error(`Unsupported relation: ${relation}`);
  }
}

export function resizeArtboard(layout, newWidth, newHeight) {
  validateDimensions(newWidth, newHeight);

  const workingLayout = cloneLayout(layout);
  const artboard = getArtboard(workingLayout);

  artboard.width = newWidth;
  artboard.height = newHeight;

  const children = getChildren(workingLayout);

  for (const child of children) {
    updateAbsolute(workingLayout, child);
  }

  return workingLayout;
}

export function moveNode(layout, nodeId, position) {
  const workingLayout = cloneLayout(layout);
  const artboard = getArtboard(workingLayout);
  const node = getNode(workingLayout, nodeId);

  if (!isEditableNode(node)) {
    throw new Error(`Node type cannot be moved: ${node.type}`);
  }

  const newPosition = calculatePosition(
    artboard,
    node,
    position
  );

  node.x = newPosition.x;
  node.y = newPosition.y;

  updateNormalized(workingLayout, node);

  return workingLayout;
}

export function moveNodeByOffset(layout, nodeId, dx, dy) {
  validateOffset(dx, dy);

  const workingLayout = cloneLayout(layout);
  const artboard = getArtboard(workingLayout);
  const node = getNode(workingLayout, nodeId);

  if (!isEditableNode(node)) {
    throw new Error(`Node type cannot be moved: ${node.type}`);
  }

  node.x = clamp(
    node.x + dx,
    0,
    artboard.width - node.width
  );

  node.y = clamp(
    node.y + dy,
    0,
    artboard.height - node.height
  );

  updateNormalized(workingLayout, node);

  return workingLayout;
}

export function resizeNode(layout, nodeId, scale) {
  validateScale(scale);

  const workingLayout = cloneLayout(layout);
  const artboard = getArtboard(workingLayout);
  const node = getNode(workingLayout, nodeId);

  if (!isEditableNode(node)) {
    throw new Error(`Node type cannot be resized: ${node.type}`);
  }

  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;

  node.width *= scale;
  node.height *= scale;

  node.x = centerX - node.width / 2;
  node.y = centerY - node.height / 2;

  node.x = clamp(
    node.x,
    0,
    artboard.width - node.width
  );

  node.y = clamp(
    node.y,
    0,
    artboard.height - node.height
  );

  /**
   * Explicit text resize:
   * update actual font size + semantic ratio
   */
  if (
    node.type === "text" &&
    node.style?.visual?.fontSize
  ) {
    const newFontSize = Math.round(
      node.style.visual.fontSize * scale
    );

    node.style.visual.fontSize = newFontSize;

    node.fontSizeRatio =
      newFontSize / artboard.width;
  }

  updateNormalized(workingLayout, node);

  return workingLayout;
}

export function moveNodeRelativeToNode(
  layout,
  movingNodeId,
  referenceNodeId,
  relation,
  gap = DEFAULT_RELATION_GAP
) {
  validateGap(gap);

  const workingLayout = cloneLayout(layout);
  const artboard = getArtboard(workingLayout);

  const movingNode = getNode(workingLayout, movingNodeId);
  const referenceNode = getNode(
    workingLayout,
    referenceNodeId
  );

  if (!isEditableNode(movingNode)) {
    throw new Error(
      `Moving node cannot be repositioned: ${movingNode.type}`
    );
  }

  const target = calculateRelativePosition(
    movingNode,
    referenceNode,
    relation,
    gap
  );

  movingNode.x = clamp(
    target.x,
    0,
    artboard.width - movingNode.width
  );

  movingNode.y = clamp(
    target.y,
    0,
    artboard.height - movingNode.height
  );

  updateNormalized(workingLayout, movingNode);

  return workingLayout;
}

export function deleteNode(layout, nodeId) {
  const workingLayout = cloneLayout(layout);
  const node = getNode(workingLayout, nodeId);

  if (node.type === "artboard") {
    throw new Error("Artboard cannot be deleted");
  }

  const parent = getNode(
    workingLayout,
    node.parentId
  );

  parent.children = parent.children.filter(
    (childId) => childId !== nodeId
  );

  delete workingLayout.nodes[nodeId];

  return workingLayout;
}

export function restoreLayoutFromHistory(
  history,
  stepsBack = 1
) {
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error("No history available");
  }

  if (
    typeof stepsBack !== "number" ||
    !Number.isInteger(stepsBack) ||
    stepsBack <= 0
  ) {
    throw new Error("stepsBack must be a positive integer");
  }

  const targetIndex = history.length - stepsBack;

  if (targetIndex < 0) {
    throw new Error("Undo exceeds available history");
  }

  const snapshot = history[targetIndex];

  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Invalid history snapshot");
  }

  if (!snapshot.layout) {
    throw new Error("History snapshot missing layout");
  }

  return cloneLayout(snapshot.layout);
}

export function restoreLayoutFromRedoHistory(
  redoHistory,
  stepsForward = 1
) {
  if (!Array.isArray(redoHistory) || redoHistory.length === 0) {
    throw new Error("No redo history available");
  }

  if (
    typeof stepsForward !== "number" ||
    !Number.isInteger(stepsForward) ||
    stepsForward <= 0
  ) {
    throw new Error("stepsForward must be a positive integer");
  }

  const targetIndex = redoHistory.length - stepsForward;

  if (targetIndex < 0) {
    throw new Error("Redo exceeds available history");
  }

  const snapshot = redoHistory[targetIndex];

  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Invalid redo snapshot");
  }

  if (!snapshot.layout) {
    throw new Error("Redo snapshot missing layout");
  }

  return cloneLayout(snapshot.layout);
}

export function resizeNodesByType(
  layout,
  nodeType,
  scale
) {
  validateScale(scale);

  const nodes = getNodesByType(layout, nodeType);

  if (nodes.length === 0) {
    throw new Error(`No nodes found for type: ${nodeType}`);
  }

  let workingLayout = cloneLayout(layout);

  for (const node of nodes) {
    workingLayout = resizeNode(
      workingLayout,
      node.id,
      scale
    );
  }

  return workingLayout;
}

export function moveNodesByTypeOffset(
  layout,
  nodeType,
  dx,
  dy
) {
  validateOffset(dx, dy);

  const nodes = getNodesByType(layout, nodeType);

  if (nodes.length === 0) {
    throw new Error(`No nodes found for type: ${nodeType}`);
  }

  let workingLayout = cloneLayout(layout);

  for (const node of nodes) {
    workingLayout = moveNodeByOffset(
      workingLayout,
      node.id,
      dx,
      dy
    );
  }

  return workingLayout;
}

export function deleteNodesByType(
  layout,
  nodeType
) {
  const nodes = getNodesByType(layout, nodeType);

  if (nodes.length === 0) {
    throw new Error(`No nodes found for type: ${nodeType}`);
  }

  let workingLayout = cloneLayout(layout);

  for (const node of nodes) {
    workingLayout = deleteNode(
      workingLayout,
      node.id
    );
  }

  return workingLayout;
}

export function alignNodesByType(
  layout,
  nodeType,
  alignment
) {
  const nodes = getNodesByType(layout, nodeType);

  if (nodes.length === 0) {
    throw new Error(`No nodes found for type: ${nodeType}`);
  }

  let workingLayout = cloneLayout(layout);

  for (const node of nodes) {
    workingLayout = moveNode(
      workingLayout,
      node.id,
      alignment
    );
  }

  return workingLayout;
}