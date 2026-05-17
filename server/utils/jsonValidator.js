export function validateFinalLayout(layout) {
  if (!layout || typeof layout !== "object") {
    throw new Error("Final layout must be an object");
  }

  if (!Array.isArray(layout.rootNodes)) {
    throw new Error("Layout rootNodes must be an array");
  }

  if (!layout.nodes || typeof layout.nodes !== "object") {
    throw new Error("Layout nodes must be an object");
  }

  if (layout.rootNodes.length === 0) {
    throw new Error("Layout must contain at least one root node");
  }

  for (const rootId of layout.rootNodes) {
    if (!layout.nodes[rootId]) {
      throw new Error(`Missing root node: ${rootId}`);
    }

    if (layout.nodes[rootId].type !== "artboard") {
      throw new Error(`Root node must be artboard: ${rootId}`);
    }
  }

  for (const [nodeId, node] of Object.entries(layout.nodes)) {
    validateNode(nodeId, node, layout);
  }

  return true;
}

function validateNode(nodeId, node, layout) {
  if (!node || typeof node !== "object") {
    throw new Error(`Invalid node object: ${nodeId}`);
  }

  if (!node.id || node.id !== nodeId) {
    throw new Error(`Node id mismatch: ${nodeId}`);
  }

  if (!node.type || typeof node.type !== "string") {
    throw new Error(`Node missing type: ${nodeId}`);
  }

  if (
    typeof node.width !== "number" &&
    node.type !== "artboard"
  ) {
    throw new Error(`Node missing width: ${nodeId}`);
  }

  if (
    typeof node.height !== "number" &&
    node.type !== "artboard"
  ) {
    throw new Error(`Node missing height: ${nodeId}`);
  }

  if (node.type !== "artboard") {
    if (typeof node.x !== "number") {
      throw new Error(`Node missing x: ${nodeId}`);
    }

    if (typeof node.y !== "number") {
      throw new Error(`Node missing y: ${nodeId}`);
    }
  }

  if (node.parentId && !layout.nodes[node.parentId]) {
    throw new Error(
      `Missing parent for node: ${nodeId}`
    );
  }

  if (
    node.type === "artboard" &&
    Array.isArray(node.children)
  ) {
    for (const childId of node.children) {
      if (!layout.nodes[childId]) {
        throw new Error(
          `Missing artboard child: ${childId}`
        );
      }
    }
  }
}