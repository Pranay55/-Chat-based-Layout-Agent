import { useState } from "react";
import initialLayoutData from "../data/initialLayout.json";
import { sendChatMessage } from "../utils/api";

export default function useLayoutAgent() {
  const [initialLayout] = useState(initialLayoutData);
  const [layout, setLayout] = useState(initialLayoutData);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Tell me how you'd like to modify the layout.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  function buildHistoryContext(messages) {
    if (messages.length <= 6) {
      return messages;
    }

    const firstMessages = messages.slice(0, 2);
    const recentMessages = messages.slice(-5);

    return [...firstMessages, ...recentMessages];
  }

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const lowerMsg = userMessage.toLowerCase();

    // deterministic reset
    if (
      lowerMsg.includes("reset") ||
      lowerMsg.includes("original layout") ||
      lowerMsg.includes("start over")
    ) {
      setLayout(initialLayout);

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content: "Layout reset to the original version.",
        },
      ]);

      return;
    }

    const userChatMessage = {
      role: "user",
      content: userMessage,
    };

    const updatedMessages = [...messages, userChatMessage];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const historyForLLM = buildHistoryContext(updatedMessages);

      const response = await sendChatMessage({
        message: userMessage,
        layout,
        initialLayout,
        history: historyForLLM,
      });

      setLayout(response.updatedLayout);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.assistantMessage,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong while updating the layout.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    layout,
    messages,
    loading,
    sendMessage,
  };
}