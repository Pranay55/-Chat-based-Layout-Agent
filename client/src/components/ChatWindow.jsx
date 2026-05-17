import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatWindow.css";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          role={msg.role}
          content={msg.content}
        />
      ))}

      {isLoading && (
        <MessageBubble
          role="assistant"
          content="Thinking..."
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}