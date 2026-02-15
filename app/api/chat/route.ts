import { NextRequest, NextResponse } from "next/server";
import { getChatModel } from "@/lib/ai";
import { getVectorStore } from "@/lib/vector-store";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

export const runtime = "nodejs";

interface SourceCitation {
    source: string;
    chunk: number;
    type: string;
}

const formatContext = (docs: Document[]): string =>
    docs
        .map((doc, index) => {
            const source = typeof doc.metadata?.source === "string" ? doc.metadata.source : "unknown";
            const chunk = typeof doc.metadata?.chunk === "number" ? doc.metadata.chunk : index;
            return `Source: ${source} | Chunk: ${chunk}\n${doc.pageContent}`;
        })
        .join("\n\n---\n\n");

const stripInlineCitations = (text: string): string =>
    text
        .replace(/\[source:\s*[^,\]]+,\s*chunk:\s*\d+\]/gi, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

const extractSources = (docs: Document[]): SourceCitation[] => {
    const seen = new Set<string>();
    const sources: SourceCitation[] = [];

    for (let index = 0; index < docs.length; index += 1) {
        const doc = docs[index];
        const source = typeof doc.metadata?.source === "string" ? doc.metadata.source : "Unknown file";
        const chunk = typeof doc.metadata?.chunk === "number" ? doc.metadata.chunk : index;
        const type = typeof doc.metadata?.type === "string" ? doc.metadata.type : "application/octet-stream";
        const key = `${source}:${chunk}`;

        if (seen.has(key)) continue;
        seen.add(key);
        sources.push({ source, chunk, type });
    }

    return sources;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { message?: string };
        const question = body.message?.trim();
        const requestApiKey = req.headers.get("x-openai-api-key")?.trim() || undefined;

        if (!question) {
            return NextResponse.json(
                { error: "No message provided" },
                { status: 400 }
            );
        }

        const vectorStore = await getVectorStore(requestApiKey);
        const retriever = vectorStore.asRetriever({ k: 6 });
        const relevantDocs = await retriever.invoke(question);

        if (relevantDocs.length === 0) {
            return new Response(
                "I couldn't find any indexed document context yet. Upload a document first and try again.",
                {
                    status: 200,
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                }
            );
        }

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                [
                    "You are a document assistant.",
                    "Answer only using the provided context.",
                    "If the context is insufficient, say you don't know.",
                    "Do not include inline citations or bracketed source labels in the response.",
                    "",
                    "Context:",
                    "{context}",
                ].join("\n"),
            ],
            ["human", "{question}"],
        ]);

        const chain = prompt.pipe(getChatModel(requestApiKey)).pipe(new StringOutputParser());
        const rawAnswer = await chain.invoke({
            context: formatContext(relevantDocs),
            question,
        });
        const answer = stripInlineCitations(rawAnswer);
        const output =
            answer ||
            "I found relevant context but couldn't generate a clean response. Please ask a more specific question.";

        const headers = new Headers({
            "Content-Type": "text/plain; charset=utf-8",
            "X-Doc-Sources": encodeURIComponent(JSON.stringify(extractSources(relevantDocs))),
        });

        return new Response(output, {
            headers,
        });
    } catch (error) {
        console.error("Chat processing error:", error);
        if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
            return NextResponse.json(
                { error: "OpenAI key required. Set BYOK in the app or configure OPENAI_API_KEY on the server." },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
