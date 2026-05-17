function WireframePreview({ layout }) {
  if (!layout?.nodes || !layout?.rootNodes?.length) {
    return <div>No layout data available</div>;
  }

  const artboardId = layout.rootNodes[0];
  const artboard = layout.nodes[artboardId];

  if (!artboard) {
    return <div>Invalid layout data</div>;
  }

  const childNodes = artboard.children
    .map((id) => layout.nodes[id])
    .filter((node) => node.name !== 'Background.png');

  const scale = 0.25; // Adjust scale for better visibility

  return (
    <div className="wireframe-wrapper">
      <div
        className="wireframe-preview"
        style={{
          width: `${artboard.width * scale}px`,
          height: `${artboard.height * scale}px`,
          background: artboard.data?.backgroundColor || '#fff',
        }}
      >
        {childNodes.map((node) => (
          <div
            key={node.id}
            className="wireframe-node"
            style={{
              left: `${node.x * scale}px`,
              top: `${node.y * scale}px`,
              width: `${node.width * scale}px`,
              height: `${node.height * scale}px`,
              background:
                node.type === 'shape'
                  ? node.style?.visual?.fill?.value || '#ddd'
                  : node.type === 'image'
                  ? '#dbeafe'
                  : 'transparent',
              borderRadius:
                node.data?.shapeType === 'circle' ? '50%' : '4px',
            }}
          >
            {node.type === 'text' ? (
              <div
                style={{
                  fontSize: `${Math.max(
                    (node.style?.visual?.fontSize || 16) * scale,
                    8
                  )}px`,
                  fontWeight: node.style?.visual?.fontWeight || 400,
                  fontStyle: node.style?.visual?.fontStyle || 'normal',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  width: '100%',
                  lineHeight: 1.2,
                  padding: '2px',
                }}
              >
                {node.data?.content}
              </div>
            ) : node.type === 'image' ? (
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#555',
                }}
              >
                IMG
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WireframePreview;