"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error("Failed to send message");
            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-40">
                        <Sparkles className="w-16 h-16" />
                        <p className="text-sm font-medium">Ask anything about your document</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex flex-col gap-1 max-w-[85%]",
                                message.role === "user" ? "self-end items-end" : "self-start items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-4 py-2 text-sm shadow-sm",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                        : "bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm"
                                )}
                            >
                                {message.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground opacity-50 px-1">
                                {message.role === "user" ? "You" : "AI"}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex self-start items-center gap-2 p-2 rounded-lg bg-secondary/50">
                        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background/50 border-t border-border mt-auto">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        ref={inputRef}
                        className="w-full bg-secondary/50 text-foreground px-4 py-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground text-sm"
                        placeholder="Type query..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-medium">
                        ↵ to send
                    </div>
                </form>
            </div>
        </div>
    );
}
