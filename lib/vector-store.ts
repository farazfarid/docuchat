import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { getEmbeddings } from "./ai";

if (!process.env.PINECONE_API_KEY) {
    throw new Error("Missing PINECONE_API_KEY environment variable");
}

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX || "docuchat-index";
const namespace = process.env.PINECONE_NAMESPACE;
let vectorStorePromise: Promise<PineconeStore> | null = null;

const getConfiguredEmbeddingDimension = async (): Promise<number | undefined> => {
    const envDimension = Number(process.env.OPENAI_EMBEDDING_DIMENSION);
    if (Number.isFinite(envDimension) && envDimension > 0) {
        return envDimension;
    }

    try {
        const description = await pinecone.describeIndex(indexName);
        if (typeof description.dimension === "number" && description.dimension > 0) {
            return description.dimension;
        }
    } catch (error) {
        console.warn("Failed to read Pinecone index dimension; using default embedding size.", error);
    }

    return undefined;
};

export const getVectorStore = async () => {
    if (vectorStorePromise) {
        return vectorStorePromise;
    }

    vectorStorePromise = (async () => {
        const index = pinecone.Index(indexName);
        const dimension = await getConfiguredEmbeddingDimension();
        const embeddings = getEmbeddings(dimension);

        return PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            ...(namespace ? { namespace } : {}),
        });
    })();

    return vectorStorePromise;
};
