import { useState } from "react";
import initialLayoutData from "../data/initialLayout.json";
import { sendChatMessage } from "../utils/api";

export default function useLayoutAgent() {
  const [initialLayout] = useState(initialLayoutData);

  const [layout, setLayout] = useState(initialLayoutData);

  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Tell me how you'd like to modify the layout."
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || isLoading) {
      return;
    }

    const lowerMsg = userMessage.toLowerCase();

    /**
     * deterministic reset
     */
    if (
      lowerMsg.includes("reset") ||
      lowerMsg.includes("original layout") ||
      lowerMsg.includes("start over")
    ) {
      setLayout(initialLayout);
      setHistory([]);
      setRedoHistory([]);

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage
        },
        {
          role: "assistant",
          content: "Layout reset to the original version."
        }
      ]);

      return;
    }

    /**
     * optimistic user message
     */
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage
      }
    ]);

    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: userMessage,
        layout,
        history,
        redoHistory
      });

      setLayout(response.layout);
      setHistory(response.history || []);
      setRedoHistory(response.redoHistory || []);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.intent || "Layout updated."
        }
      ]);
    } catch (error) {
      console.error(error);

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Something went wrong while updating the layout.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    layout,
    messages,
    history,
    redoHistory,
    isLoading,
    sendMessage
  };
}