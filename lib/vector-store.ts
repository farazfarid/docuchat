import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "./ai";

if (!process.env.PINECONE_API_KEY) {
    throw new Error("Missing PINECONE_API_KEY environment variable");
}

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX || "docuchat-index";

export const getVectorStore = async () => {
    const index = pinecone.Index(indexName);

    return await PineconeStore.fromExistingIndex(
        embeddings,
        { pineconeIndex: index }
    );
};
