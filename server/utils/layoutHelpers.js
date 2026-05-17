export function cloneLayout(layout) {
  if (!layout || typeof layout !== "object") {
    throw new Error("Invalid layout object");
  }

  return structuredClone(layout);
}

export function getArtboard(layout) {
  if (!layout?.rootNodes || !Array.isArray(layout.rootNodes)) {
    throw new Error("Layout missing rootNodes");
  }

  if (layout.rootNodes.length === 0) {
    throw new Error("Layout has no root nodes");
  }

  if (!layout?.nodes || typeof layout.nodes !== "object") {
    throw new Error("Layout missing nodes");
  }

  const rootId = layout.rootNodes[0];
  const artboard = layout.nodes[rootId];

  if (!artboard) {
    throw new Error("Artboard node not found");
  }

  if (artboard.type !== "artboard") {
    throw new Error("Root node is not an artboard");
  }

  if (
    typeof artboard.width !== "number" ||
    typeof artboard.height !== "number" ||
    artboard.width <= 0 ||
    artboard.height <= 0
  ) {
    throw new Error("Invalid artboard dimensions");
  }

  return artboard;
}

export function getNode(layout, nodeId) {
  if (!layout?.nodes || typeof layout.nodes !== "object") {
    throw new Error("Layout missing nodes");
  }

  if (!nodeId || typeof nodeId !== "string") {
    throw new Error("Invalid nodeId");
  }

  const node = layout.nodes[nodeId];

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  return node;
}

export function isEditableNode(node) {
  if (!node || typeof node !== "object") {
    return false;
  }

  return ["text", "image", "shape"].includes(node.type);
}

export function getChildren(layout) {
  const artboard = getArtboard(layout);

  if (!Array.isArray(artboard.children)) {
    return [];
  }

  return artboard.children
    .map((childId) => layout.nodes[childId])
    .filter(Boolean);
}

/**
 * Convert absolute geometry -> normalized geometry
 *
 * Used by:
 * - moveNode()
 * - moveNodeByOffset()
 * - moveNodeRelativeToNode()
 * - resizeNode()
 */
export function updateNormalized(layout, node) {
  const artboard = getArtboard(layout);

  if (!isEditableNode(node)) {
    throw new Error("Node type cannot be normalized");
  }

  validateNumericNodeGeometry(node);

  node.nx = node.x / artboard.width;
  node.ny = node.y / artboard.height;
  node.nw = node.width / artboard.width;
  node.nh = node.height / artboard.height;

  return node;
}

/**
 * Convert normalized geometry -> absolute geometry
 *
 * Used by:
 * - resizeArtboard()
 * - aspect ratio conversion
 */
export function updateAbsolute(layout, node) {
  const artboard = getArtboard(layout);

  if (!isEditableNode(node)) {
    throw new Error("Node type cannot be converted to absolute");
  }

  validateNormalizedGeometry(node);

  node.x = node.nx * artboard.width;
  node.y = node.ny * artboard.height;
  node.width = node.nw * artboard.width;
  node.height = node.nh * artboard.height;

  /**
   * Text resize driven by stored semantic ratio
   */
  if (
    node.type === "text" &&
    typeof node.fontSizeRatio === "number" &&
    node.style?.visual
  ) {
    node.style.visual.fontSize = Math.round(
      node.fontSizeRatio * artboard.width
    );
  }

  return node;
}

function validateNumericNodeGeometry(node) {
  const fields = ["x", "y", "width", "height"];

  for (const field of fields) {
    if (
      typeof node[field] !== "number" ||
      !Number.isFinite(node[field])
    ) {
      throw new Error(`Invalid numeric geometry: ${field}`);
    }
  }
}

function validateNormalizedGeometry(node) {
  const fields = ["nx", "ny", "nw", "nh"];

  for (const field of fields) {
    if (
      typeof node[field] !== "number" ||
      !Number.isFinite(node[field])
    ) {
      throw new Error(`Invalid normalized geometry: ${field}`);
    }
  }
}

export function getNodesByType(layout, nodeType) {
  if (!layout?.nodes || typeof layout.nodes !== "object") {
    throw new Error("Layout missing nodes");
  }

  if (!nodeType || typeof nodeType !== "string") {
    throw new Error("Invalid nodeType");
  }

  return Object.values(layout.nodes).filter(
    (node) =>
      node &&
      node.type === nodeType &&
      node.type !== "artboard"
  );
}