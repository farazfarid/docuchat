import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const chatModel = new ChatOpenAI({
  model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
  temperature: 0,
});

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const embeddingClients = new Map<string, OpenAIEmbeddings>();

export const getEmbeddings = (dimensions?: number) => {
  const key = `${embeddingModel}:${dimensions ?? "default"}`;
  const cached = embeddingClients.get(key);
  if (cached) {
    return cached;
  }

  const client = new OpenAIEmbeddings({
    model: embeddingModel,
    ...(dimensions && dimensions > 0 ? { dimensions } : {}),
  });
  embeddingClients.set(key, client);
  return client;
};
