import { NextRequest, NextResponse } from "next/server";
import { processFile } from "@/lib/ocr";
import { getVectorStore } from "@/lib/vector-store";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        let text = "";
        try {
            console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);
            text = await processFile(file);
            console.log("Text extracted length:", text.length);
        } catch (ocrError) {
            console.error("OCR/Parsing Error:", ocrError);
            return NextResponse.json(
                { error: `Failed to parse file: ${(ocrError as Error).message}` },
                { status: 500 }
            );
        }

        // Split text into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const output = await splitter.createDocuments([text]);

        // Add metadata
        const docs = output.map((doc) => ({
            ...doc,
            metadata: {
                source: file.name,
                type: file.type,
            },
        }));

        // Store in Pinecone
        try {
            const vectorStore = await getVectorStore();
            await vectorStore.addDocuments(docs);
        } catch (e) {
            console.error("Vector store error:", e);
            return NextResponse.json(
                { error: "Failed to store embeddings. Check Pinecone configuration." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "File processed and stored successfully",
            filename: file.name,
            chunks: docs.length,
        });

    } catch (error) {
        console.error("Upload processing error:", error);
        return NextResponse.json(
            { error: "Internal server error processing file" },
            { status: 500 }
        );
    }
}
