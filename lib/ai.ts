import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const chatModel = new ChatOpenAI({
  modelName: "gpt-4-turbo",
  temperature: 0,
});

export const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
});
