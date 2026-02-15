import { NextRequest, NextResponse } from "next/server";
import { chatModel } from "@/lib/ai";
import { getVectorStore } from "@/lib/vector-store";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableParallel } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json(
                { error: "No message provided" },
                { status: 400 }
            );
        }

        const vectorStore = await getVectorStore();
        const retriever = vectorStore.asRetriever();

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Use the following context to answer the user's question. If you don't know the answer, just say that you don't know. \n\nContext:\n{context}"],
            ["human", "{question}"],
        ]);

        const chain = RunnableParallel.from({
            context: async (input: { question: string }) => {
                const relevantDocs = await retriever.invoke(input.question);
                return relevantDocs.map((doc: any) => doc.pageContent).join("\n\n");
            },
            question: (input: { question: string }) => input.question,
        })
            .pipe(prompt)
            .pipe(chatModel as any)
            .pipe(new StringOutputParser() as any);

        const stream = await chain.stream({
            question: message,
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.error("Chat processing error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
