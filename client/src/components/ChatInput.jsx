import { useState } from "react";
import "./ChatInput.css";

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    onSend(input);
    setInput("");
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ask to modify the layout..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "..." : "Send"}
      </button>
    </form>
  );
}