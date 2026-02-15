import { NextRequest, NextResponse } from "next/server";
import { processFile } from "@/lib/ocr";
import { getVectorStore } from "@/lib/vector-store";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const maybeFile = formData.get("file");
        if (!(maybeFile instanceof File)) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const file = maybeFile;
        if (file.size === 0) {
            return NextResponse.json(
                { error: "Uploaded file is empty" },
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

        const normalizedText = text.trim();
        if (!normalizedText) {
            return NextResponse.json(
                { error: "No readable text detected in the uploaded file." },
                { status: 422 }
            );
        }

        // Split text into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 150,
            separators: ["\n\n", "\n", ". ", " ", ""],
        });

        const chunks = await splitter.splitText(normalizedText);
        if (chunks.length === 0) {
            return NextResponse.json(
                { error: "No processable chunks generated from file content." },
                { status: 422 }
            );
        }

        const uploadedAt = new Date().toISOString();
        const docs = chunks.map(
            (chunk, index) =>
                new Document({
                    pageContent: chunk,
                    metadata: {
                        source: file.name,
                        type: file.type || "application/octet-stream",
                        chunk: index,
                        uploadedAt,
                    },
                })
        );

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
            chunks: chunks.length,
        });

    } catch (error) {
        console.error("Upload processing error:", error);
        return NextResponse.json(
            { error: "Internal server error processing file" },
            { status: 500 }
        );
    }
}
