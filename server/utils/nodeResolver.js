function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAllEditableNodes(layout) {
  return Object.values(layout.nodes || {}).filter(
    (node) =>
      node &&
      ["text", "image", "shape"].includes(node.type)
  );
}

function getTextContent(node) {
  return normalizeText(
    node?.data?.content ||
    node?.content ||
    ""
  );
}

function getNodeAliases(node) {
  const aliases = new Set();

  aliases.add(normalizeText(node.id));

  const content = getTextContent(node);

  if (content) {
    aliases.add(content);
  }

  if (node.type === "text") {
    /**
     * semantic headline detection
     */
    if (
      content.includes("luxury") ||
      content.includes("headline") ||
      content.includes("title") ||
      content.includes("comfort")
    ) {
      aliases.add("headline");
      aliases.add("title");
      aliases.add("main heading");
      aliases.add("heading");
    }

    /**
     * semantic subtitle detection
     */
    if (
      content.includes("subtitle") ||
      content.includes("subheading") ||
      content.includes("description") ||
      content.includes("affordable") ||
      content.includes("surprisingly")
    ) {
      aliases.add("subtitle");
      aliases.add("subheading");
      aliases.add("caption");
      aliases.add("description");
    }

    /**
     * CTA detection
     */
    if (
      content.includes("buy") ||
      content.includes("shop") ||
      content.includes("order") ||
      content.includes("cta")
    ) {
      aliases.add("cta");
      aliases.add("button");
      aliases.add("call to action");
      aliases.add("buy button");
    }

    /**
     * generic aliases
     */
    aliases.add("text");
    aliases.add("text node");
  }

  if (node.type === "image") {
    aliases.add("image");
    aliases.add("image node");

    const imageName = normalizeText(
      node?.name || ""
    );

    const imageSource = normalizeText(
      node?.data?.sourceUrl ||
      node?.data?.src ||
      ""
    );

    if (
      node.id.includes("product") ||
      imageName.includes("product") ||
      imageSource.includes("product")
    ) {
      aliases.add("product");
      aliases.add("product image");
      aliases.add("hero image");
    }

    if (
      node.id.includes("logo") ||
      imageName.includes("logo") ||
      imageSource.includes("logo")
    ) {
      aliases.add("logo");
      aliases.add("brand logo");
    }

    if (
      node.id.includes("background") ||
      imageName.includes("background") ||
      imageSource.includes("background")
    ) {
      aliases.add("background");
      aliases.add("background image");
    }
  }

  if (node.type === "shape") {
    const shapeName = normalizeText(
      node?.name || ""
    );

    if (
      node.id.includes("badge") ||
      shapeName.includes("badge") ||
      shapeName.includes("offer")
    ) {
      aliases.add("badge");
      aliases.add("discount badge");
      aliases.add("sticker");
      aliases.add("offer shape");
    }

    aliases.add("shape");
    aliases.add("shape node");
  }

  return [...aliases];
}

function resolveSingleReference(layout, phrase) {
  const target = normalizeText(phrase);

  const nodes = getAllEditableNodes(layout);

  for (const node of nodes) {
    const aliases = getNodeAliases(node);

    if (aliases.includes(target)) {
      return node.id;
    }
  }

  return null;
}

function extractLastReferencedTarget(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];

    if (!entry?.actions || !Array.isArray(entry.actions)) {
      continue;
    }

    for (let j = entry.actions.length - 1; j >= 0; j--) {
      const action = entry.actions[j];

      if (action.nodeId) {
        return {
          mode: "single",
          nodeId: action.nodeId
        };
      }

      if (action.movingNodeId) {
        return {
          mode: "single",
          nodeId: action.movingNodeId
        };
      }

      if (action.target?.nodeType) {
        return {
          mode: "group",
          nodeType: action.target.nodeType
        };
      }
    }
  }

  return null;
}

function resolvePronouns(message, history) {
  const lastTarget = extractLastReferencedTarget(history);

  if (!lastTarget) {
    return message;
  }

  let rewritten = message;

  if (lastTarget.mode === "single") {
    rewritten = rewritten.replace(
      /\b(it|this|that)\b/gi,
      lastTarget.nodeId
    );
  }

  if (lastTarget.mode === "group") {
    rewritten = rewritten.replace(
      /\ball of them\b/gi,
      `all ${lastTarget.nodeType}`
    );

    rewritten = rewritten.replace(
      /\b(them|these|those)\b/gi,
      lastTarget.nodeType
    );
  }

  return rewritten;
}

export function rewriteMessageWithResolvedNodes(
  message,
  layout,
  history = []
) {
  if (!message || typeof message !== "string") {
    return message;
  }

  let rewritten = message;

  rewritten = resolvePronouns(
    rewritten,
    history
  );

  const nodes = getAllEditableNodes(layout);

  for (const node of nodes) {
    const aliases = getNodeAliases(node);

    for (const alias of aliases) {
      if (!alias || alias === node.id.toLowerCase()) {
        continue;
      }

      const regex = new RegExp(
        `\\b${escapeRegex(alias)}\\b`,
        "gi"
      );

      rewritten = rewritten.replace(regex, node.id);
    }
  }

  return rewritten;
}

export function resolveNodeReference(
  layout,
  phrase
) {
  return resolveSingleReference(layout, phrase);
}