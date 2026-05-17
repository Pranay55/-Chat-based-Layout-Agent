function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
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

  /**
   * Heuristic aliases
   */
  if (node.type === "text") {
    if (node.id.includes("headline")) {
      aliases.add("headline");
      aliases.add("title");
      aliases.add("main heading");
      aliases.add("heading");
    }

    if (node.id.includes("subtitle")) {
      aliases.add("subtitle");
      aliases.add("subheading");
      aliases.add("caption");
    }

    if (node.id.includes("cta")) {
      aliases.add("cta");
      aliases.add("button");
      aliases.add("call to action");
      aliases.add("buy button");
    }
  }

  if (node.type === "image") {
    if (node.id.includes("product")) {
      aliases.add("product");
      aliases.add("product image");
      aliases.add("hero image");
    }

    if (node.id.includes("logo")) {
      aliases.add("logo");
      aliases.add("brand logo");
    }

    if (node.id.includes("background")) {
      aliases.add("background");
      aliases.add("background image");
    }
  }

  if (node.type === "shape") {
    if (node.id.includes("badge")) {
      aliases.add("badge");
      aliases.add("discount badge");
      aliases.add("sticker");
    }
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

export function rewriteMessageWithResolvedNodes(
  message,
  layout
) {
  if (!message || typeof message !== "string") {
    return message;
  }

  let rewritten = message;

  const nodes = getAllEditableNodes(layout);

  for (const node of nodes) {
    const aliases = getNodeAliases(node);

    for (const alias of aliases) {
      if (!alias || alias === node.id.toLowerCase()) {
        continue;
      }

      const regex = new RegExp(
        `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
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