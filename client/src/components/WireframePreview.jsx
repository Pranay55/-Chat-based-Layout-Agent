export default function WireframePreview({ layout }) {
  if (!layout?.rootNodes?.length) {
    return null;
  }

  const rootId = layout.rootNodes[0];
  const artboard = layout.nodes[rootId];

  if (!artboard) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px",
        overflow: "auto"
      }}
    >
      <div
        style={{
          position: "relative",
          width: "420px",
          aspectRatio: `${artboard.width} / ${artboard.height}`,
          background:
            artboard.data?.backgroundColor || "#f8fafc",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          flexShrink: 0
        }}
      >
        {artboard.children?.map((id) => {
          const node = layout.nodes[id];

          if (!node) return null;

          return (
            <NodePreview
              key={id}
              node={node}
            />
          );
        })}
      </div>
    </div>
  );
}

function NodePreview({ node }) {
  const baseStyle = {
    position: "absolute",
    left: `${node.nx * 100}%`,
    top: `${node.ny * 100}%`,
    width: `${node.nw * 100}%`,
    height: `${node.nh * 100}%`,
    boxSizing: "border-box",
    overflow: "hidden"
  };

  if (node.type === "text") {
    const visual = node.style?.visual || {};

    const previewFontSize = Math.max(
      8,
      (visual.fontSize || 16) * 0.22
    );

    return (
      <div
        style={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px",
          background: "rgba(245, 158, 11, 0.15)",
          border: "1px dashed rgba(245, 158, 11, 0.45)",

          color:
            visual.color?.value || "#111827",

          fontWeight:
            visual.fontWeight || 500,

          fontStyle:
            visual.fontStyle || "normal",

          fontFamily:
            visual.fontFamily || "Arial",

          fontSize: `${previewFontSize}px`,

          textAlign: "center",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis"
        }}
      >
        {node.data?.content || node.name || "Text"}
      </div>
    );
  }

  if (node.type === "image") {
    return (
      <div
        style={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(59, 130, 246, 0.14)",
          border: "1px solid rgba(59, 130, 246, 0.35)",
          color: "#1d4ed8",
          fontSize: "8px",
          textAlign: "center",
          padding: "2px"
        }}
      >
        🖼
      </div>
    );
  }

  if (node.type === "shape") {
    return (
      <div
        style={{
          ...baseStyle,
          background: "rgba(239, 68, 68, 0.18)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: "4px"
        }}
      />
    );
  }

  return null;
}