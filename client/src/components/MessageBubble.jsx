import "./MessageBubble.css";

export default function MessageBubble({ role, content }) {
  return (
    <div className={`message-row ${role}`}>
      <div className={`message-bubble ${role}`}>
        {content}
      </div>
    </div>
  );
}