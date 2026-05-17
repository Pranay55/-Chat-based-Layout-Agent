import OpenAI from "openai";

let client = null;

function getClient() {
  if (client) {
    return client;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
}

export async function callLLM({
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  model = "gpt-4o",
}) {
  if (!systemPrompt || typeof systemPrompt !== "string") {
    throw new Error("systemPrompt is required");
  }

  if (!userPrompt || typeof userPrompt !== "string") {
    throw new Error("userPrompt is required");
  }

  const openai = getClient();

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty LLM response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("LLM service error:", error);

    if (error instanceof SyntaxError) {
      throw new Error("LLM returned invalid JSON");
    }

    throw new Error("Failed to get LLM response");
  }
}