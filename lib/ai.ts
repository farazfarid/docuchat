import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const resolveApiKey = (apiKey?: string): string => {
  const resolved = apiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!resolved) {
    throw new Error("Missing OPENAI_API_KEY. Provide BYOK key or set OPENAI_API_KEY on the server.");
  }
  return resolved;
};

export const getChatModel = (apiKey?: string) =>
  new ChatOpenAI({
    model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
    temperature: 0,
    apiKey: resolveApiKey(apiKey),
  });

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const embeddingClients = new Map<string, OpenAIEmbeddings>();

export const getEmbeddings = (dimensions?: number, apiKey?: string) => {
  const resolvedApiKey = resolveApiKey(apiKey);
  const key = `${embeddingModel}:${dimensions ?? "default"}:${resolvedApiKey}`;
  const cached = embeddingClients.get(key);
  if (cached) {
    return cached;
  }

  const client = new OpenAIEmbeddings({
    apiKey: resolvedApiKey,
    model: embeddingModel,
    ...(dimensions && dimensions > 0 ? { dimensions } : {}),
  });
  embeddingClients.set(key, client);
  return client;
};
