"use client";

import { useState, useRef, useEffect } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { ActionBar } from "@/components/layout/action-bar";
import { RaycastInput } from "@/components/ui/raycast-input";
import { RaycastListItem } from "@/components/ui/raycast-list";
import { UploadZone } from "@/components/upload-zone";
import { ChatInterface } from "@/components/chat-interface";
import { FileText, MessageSquare, ArrowRight, Upload, Sparkles, Command } from "lucide-react";

export default function Home() {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [mode, setMode] = useState<"search" | "chat" | "upload" | "features">("search");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState<any>(null); // State for selected feature detail

  const featuresList = [
    {
      title: "Vector Embeddings & Semantic Search",
      shortDesc: "Powered by Pinecone",
      date: "Nov 2024",
      description: "We use high-dimensional vector embeddings to understand the semantic meaning of your documents, not just keyword matching.",
      details: [
        { title: "OpenAI Embeddings", content: "1536-dimensional vectors using text-embedding-3-small model." },
        { title: "Pinecone Index", content: "Serverless vector database for millisecond-latency retrieval." }
      ]
    },
    {
      title: "Real-time OCR Engine",
      shortDesc: "Tesseract.js integration",
      date: "Oct 2024",
      description: "Upload any scanned PDF or image. Our optimized OCR pipeline extracts text on-the-fly without server persistence.",
      details: [
        { title: "PDF Parsing", content: "Structure-aware parsing for complex documents." },
        { title: "Image Support", content: "Drag and drop PNG/JPG support." }
      ]
    },
    {
      title: "Contextual AI Chat",
      shortDesc: "GPT-4 Turbo",
      date: "Sep 2024",
      description: "Chat naturally with your documents. The AI remembers previous context and citations.",
      details: [
        { title: "Memory", content: "Full conversation history included in prompt window." },
        { title: "Citations", content: "Answers are grounded in specific document chunks." }
      ]
    }
  ];

  const menuItems = [
    { id: "chat", title: "Chat with Documents", icon: <MessageSquare className="w-4 h-4" />, subtitle: "Ask questions about your files", shortcut: ["↵"] },
    { id: "upload", title: "Upload New File", icon: <Upload className="w-4 h-4" />, subtitle: "Import PDF, Text, or Images", shortcut: ["⌘", "U"] },
    { id: "features", title: "View Features", icon: <Sparkles className="w-4 h-4" />, subtitle: "Explore capabilities", shortcut: [] },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      const max = mode === "features" && !activeFeature ? featuresList.length : menuItems.length;
      setActiveIndex((prev) => (prev + 1) % max);
    } else if (e.key === "ArrowUp") {
      const max = mode === "features" && !activeFeature ? featuresList.length : menuItems.length;
      setActiveIndex((prev) => (prev - 1 + max) % max);
    } else if (e.key === "Enter" && mode === "search") {
      const selected = menuItems[activeIndex];
      if (selected.id === "upload") setMode("upload");
      if (selected.id === "chat") setMode("chat");
    } else if (e.key === "Escape") {
      setMode("search");
      if (mode === "search") setQuery("");
    } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setMode("search");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  });

  const actions = mode === "search"
    ? [
      { label: "Open", shortcut: ["↵"], primary: true },
      { label: "Actions", shortcut: ["⌘", "K"] },
    ]
    : mode === "chat"
      ? [
        { label: "Back", shortcut: ["Esc"], primary: false },
        { label: "Clear Chat", shortcut: ["⌘", "⌫"] },
      ]
      : mode === "features"
        ? activeFeature
          ? [{ label: "Back", shortcut: ["Esc"], primary: false }]
          : [{ label: "Open Details", shortcut: ["↵"], primary: true }, { label: "Back", shortcut: ["Esc"] }]
        : [
          { label: "Back", shortcut: ["Esc"], primary: false },
        ];

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <CommandPalette>
        {/* Top Input Bar */}
        <div className="flex items-center gap-2 px-4 border-b border-white/5 bg-transparent">
          <RaycastInput
            placeholder={mode === "chat" ? "Ask a question..." : "Search commands..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={mode === "chat"} // Chat has its own input
            className={mode === "chat" ? "hidden" : ""}
          />
          {mode === "chat" && (
            <div className="h-14 flex items-center px-4 w-full gap-2 text-lg text-foreground">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">Chat</span>
              <span className="text-muted-foreground text-sm flex-1 truncate">{activeDocument || "No document loaded"}</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">

          {/* SEARCH MODE */}
          {mode === "search" && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Suggestions</div>
              {menuItems.map((item, index) => (
                <RaycastListItem
                  key={item.id}
                  active={index === activeIndex}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  meta={item.id === "chat" || item.id === "upload" ? "Command" : "Application"}
                  onSelect={() => {
                    if (item.id === "upload") setMode("upload");
                    if (item.id === "chat") setMode("chat");
                    if (item.id === "features") setMode("features");
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </div>
          )}

          {/* UPLOAD MODE */}
          {mode === "upload" && (
            <div className="h-full flex flex-col items-center justify-center p-8 animated fade-in">
              <UploadZone onUploadComplete={(filename) => {
                setActiveDocument(filename);
                setMode("chat");
              }} />
            </div>
          )}

          {/* CHAT MODE */}
          {mode === "chat" && (
            <div className="h-full flex flex-col animated fade-in">
              <ChatInterface />
            </div>
          )}

          {/* FEATURES MODE */}
          {mode === "features" && (
            <div className="flex-1 flex flex-col h-full animated fade-in">
              {activeFeature ? (
                // DETAIL VIEW
                <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {menuItems.find(i => i.id === "features")?.icon || <Sparkles className="w-6 h-6" />}
                    </div>
                    <h2 className="text-xl font-semibold text-white">{activeFeature.title}</h2>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p className="text-base text-white/90">{activeFeature.description}</p>

                    <div className="grid gap-4 mt-6">
                      {activeFeature.details && activeFeature.details.map((detail: any, i: number) => (
                        <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            {detail.title}
                          </h4>
                          <p className="text-muted-foreground/80 pl-3.5">{detail.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // LIST VIEW
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Feature Changelog</div>
                  {featuresList.map((feature, index) => (
                    <RaycastListItem
                      key={index}
                      active={index === activeIndex}
                      title={feature.title}
                      subtitle={feature.shortDesc}
                      meta={feature.date}
                      onSelect={() => setActiveFeature(feature)}
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Bar Footer */}
        <ActionBar actions={actions} />
      </CommandPalette>

      {/* Wallpaper Credit */}
      <a href="https://www.raycast.com" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 flex items-center gap-2 text-[10px] text-white/30 font-medium z-10 hover:text-white/50 transition-colors cursor-pointer">
        <span>Wallpaper by Raycast</span>
        <img src="/raycast.svg" alt="Raycast" className="w-3.5 h-3.5 opacity-40 ml-1" />
      </a>
    </div>
  );
}
