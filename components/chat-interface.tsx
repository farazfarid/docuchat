"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileText, PanelRight, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SourceCitation {
    source: string;
    chunk: number;
    type: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: SourceCitation[];
}

interface ChatInterfaceProps {
    openAIApiKey?: string | null;
}

export function ChatInterface({ openAIApiKey }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSourcesOpen, setIsSourcesOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const latestSources = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i -= 1) {
            const message = messages[i];
            if (message.role === "assistant" && message.sources && message.sources.length > 0) {
                return message.sources;
            }
        }
        return [] as SourceCitation[];
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        inputRef.current?.focus();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const headers: HeadersInit = { "Content-Type": "application/json" };
            if (openAIApiKey) {
                headers["x-openai-api-key"] = openAIApiKey;
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers,
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                const errorPayload = await response.json().catch(() => null);
                const errorMessage =
                    (errorPayload && typeof errorPayload.error === "string" && errorPayload.error) ||
                    "Failed to send message";
                throw new Error(errorMessage);
            }
            const sourcesHeader = response.headers.get("x-doc-sources");
            let sources: SourceCitation[] = [];
            if (sourcesHeader) {
                try {
                    sources = JSON.parse(decodeURIComponent(sourcesHeader)) as SourceCitation[];
                } catch (parseError) {
                    console.warn("Failed to parse sources header", parseError);
                }
            }

            if (!response.body) {
                const fallbackText = await response.text();
                setMessages((prev) => [...prev, { role: "assistant", content: fallbackText, sources }]);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            setMessages((prev) => [...prev, { role: "assistant", content: "", sources }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                assistantMessage += chunk;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                        lastMessage.content = assistantMessage;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            const errorMessage =
                error instanceof Error && error.message
                    ? error.message
                    : "Sorry, I encountered an error. Please try again.";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: errorMessage },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const sourceCounterLabel = latestSources.length > 0 ? `(${latestSources.length})` : "";

    const renderSources = () => {
        if (latestSources.length === 0) {
            return (
                <div className="rounded-lg border border-border bg-card/88 p-3 text-xs text-muted-foreground">
                    Sources will appear here after the next answer.
                </div>
            );
        }

        return (
            <ul className="space-y-2">
                {latestSources.map((source, index) => (
                    <li key={`${source.source}-${source.chunk}-${index}`} className="rounded-lg border border-border bg-card/88 p-2.5">
                        <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-foreground">{source.source}</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">Chunk {source.chunk}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-transparent">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 sm:px-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Conversation</span>
                <button
                    type="button"
                    onClick={() => setIsSourcesOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/88 px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <PanelRight className="h-3.5 w-3.5" />
                    <span>Sources {sourceCounterLabel}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isSourcesOpen && "rotate-180")} />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
                <motion.div
                    layout
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="scrollbar-hide flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="mx-auto w-full max-w-3xl space-y-5">
                            {messages.length === 0 && (
                                <div className="flex min-h-[44dvh] flex-col items-center justify-center space-y-3 text-muted-foreground">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card/88">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <p className="text-center text-sm font-medium text-foreground">Ask the chat about Faraz, your resume, or your projects.</p>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex max-w-[88%] flex-col gap-1.5 sm:max-w-[76%]",
                                            message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-full overflow-hidden rounded-2xl px-4 py-2.5 text-sm shadow-sm [overflow-wrap:anywhere]",
                                                message.role === "user"
                                                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                                                    : "rounded-tl-sm border border-border bg-card/88 text-foreground"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        <span className="px-1 text-[10px] text-muted-foreground">
                                            {message.role === "user" ? "You" : "AI"}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mr-auto flex items-center gap-2 rounded-lg border border-border bg-card/88 px-3 py-2"
                                >
                                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="mt-auto border-t border-border bg-card/76 p-3 sm:p-4">
                        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                                    placeholder="Type query..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium text-muted-foreground sm:block">
                                    ↵ to send
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>

                <motion.aside
                    initial={false}
                    animate={{ width: isSourcesOpen ? 248 : 0 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    style={{ pointerEvents: isSourcesOpen ? "auto" : "none" }}
                    className="hidden shrink-0 overflow-hidden md:block"
                >
                    <motion.div
                        initial={false}
                        animate={{ opacity: isSourcesOpen ? 1 : 0, x: isSourcesOpen ? 0 : 10 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="flex h-full w-[248px] flex-col border-l border-border bg-card/82 p-3"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Sources</p>
                        </div>
                        <div className="scrollbar-hide flex-1 overflow-y-auto pr-1">
                            {renderSources()}
                        </div>
                    </motion.div>
                </motion.aside>
            </div>

            <AnimatePresence initial={false}>
                {isSourcesOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="border-t border-border bg-card/82 p-3 md:hidden"
                    >
                        <div className="scrollbar-hide max-h-44 overflow-y-auto pr-1">
                            {renderSources()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
