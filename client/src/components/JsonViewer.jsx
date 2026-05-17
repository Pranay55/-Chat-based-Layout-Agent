function JsonViewer({ layout }) {
  return (
    <div className="json-panel">
      <pre className="json-viewer">
        {JSON.stringify(layout, null, 2)}
      </pre>
    </div>
  );
}

export default JsonViewer;