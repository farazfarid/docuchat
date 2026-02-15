"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CommandPalette } from "@/components/layout/command-palette";
import { ActionBar } from "@/components/layout/action-bar";
import { RaycastInput } from "@/components/ui/raycast-input";
import { RaycastListItem } from "@/components/ui/raycast-list";
import { UploadZone } from "@/components/upload-zone";
import { ChatInterface } from "@/components/chat-interface";
import { MessageSquare, Search, Sparkles, Upload } from "lucide-react";

type Mode = "search" | "chat" | "upload" | "features";

interface Feature {
  title: string;
  shortDesc: string;
  date: string;
  description: string;
  details: Array<{ title: string; content: string }>;
}

interface MenuItem {
  id: Exclude<Mode, "search">;
  title: string;
  subtitle: string;
  icon: ReactNode;
  meta: string;
}

const featuresList: Feature[] = [
  {
    title: "Vector Embeddings & Semantic Search",
    shortDesc: "Powered by Pinecone",
    date: "Nov 2024",
    description:
      "High-dimensional vector embeddings understand semantic meaning in your docs, not just exact keyword matching.",
    details: [
      { title: "OpenAI Embeddings", content: "1536-dimensional vectors using the text-embedding-3-small model." },
      { title: "Pinecone Index", content: "Serverless vector database for low-latency retrieval." },
    ],
  },
  {
    title: "Real-time OCR Engine",
    shortDesc: "Tesseract.js integration",
    date: "Oct 2024",
    description:
      "Upload scanned PDFs or images and extract text in real time with an optimized OCR pipeline.",
    details: [
      { title: "PDF Parsing", content: "Structure-aware parsing for dense document layouts." },
      { title: "Image Support", content: "Drag-and-drop support for PNG and JPG input." },
    ],
  },
  {
    title: "Contextual AI Chat",
    shortDesc: "GPT-4 Turbo",
    date: "Sep 2024",
    description:
      "Chat naturally with your documents and keep context across prompts for grounded answers.",
    details: [
      { title: "Memory", content: "Conversation history stays in the active prompt window." },
      { title: "Citations", content: "Responses stay grounded in specific document chunks." },
    ],
  },
];

const menuItems: MenuItem[] = [
  {
    id: "chat",
    title: "Chat with Documents",
    icon: <MessageSquare className="h-4 w-4" />,
    subtitle: "Ask questions about your files",
    meta: "Command",
  },
  {
    id: "upload",
    title: "Upload New File",
    icon: <Upload className="h-4 w-4" />,
    subtitle: "Import PDF, text, or images",
    meta: "Command",
  },
  {
    id: "features",
    title: "View Features",
    icon: <Sparkles className="h-4 w-4" />,
    subtitle: "Explore capabilities",
    meta: "Application",
  },
];

const floatingNavItems: Array<{ id: Mode; label: string; icon: ReactNode }> = [
  { id: "search", label: "Home", icon: <Search className="h-3.5 w-3.5" /> },
  { id: "chat", label: "Chat", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: "upload", label: "Upload", icon: <Upload className="h-3.5 w-3.5" /> },
  { id: "features", label: "Features", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

export default function Home() {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  const filteredMenuItems = useMemo(() => {
    if (!query) return menuItems;
    const normalizedQuery = query.toLowerCase();

    return menuItems.filter((item) =>
      [item.title, item.subtitle, item.meta].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [query]);

  const filteredFeatures = useMemo(() => {
    if (!query) return featuresList;
    const normalizedQuery = query.toLowerCase();

    return featuresList.filter((feature) =>
      [feature.title, feature.shortDesc, feature.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query]);

  const isFeatureListMode = mode === "features" && !activeFeature;
  const activeCollectionLength = isFeatureListMode ? filteredFeatures.length : filteredMenuItems.length;
  const safeActiveIndex =
    activeCollectionLength === 0 ? 0 : Math.min(activeIndex, activeCollectionLength - 1);

  const openMode = useCallback((nextMode: Mode) => {
    setMode(nextMode);
    setActiveIndex(0);
    if (nextMode !== "features") {
      setActiveFeature(null);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isCommandPaletteShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
    const target = e.target as HTMLElement | null;
    const isTextInput =
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.isContentEditable;

    if (isCommandPaletteShortcut) {
      e.preventDefault();
      openMode("search");
      return;
    }

    if (e.key === "Escape") {
      if (mode === "features" && activeFeature) {
        setActiveFeature(null);
        setActiveIndex(0);
        return;
      }

      if (mode !== "search") {
        openMode("search");
        return;
      }

      setQuery("");
      return;
    }

    const shouldHandleListNavigation = mode === "search" || isFeatureListMode;

    if (isTextInput || !shouldHandleListNavigation || activeCollectionLength === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % activeCollectionLength);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + activeCollectionLength) % activeCollectionLength);
    } else if (e.key === "Enter" && mode === "search") {
      const selected = filteredMenuItems[safeActiveIndex];
      if (!selected) return;
      if (selected.id === "upload") openMode("upload");
      if (selected.id === "chat") openMode("chat");
      if (selected.id === "features") {
        setActiveFeature(null);
        openMode("features");
      }
    } else if (e.key === "Enter" && isFeatureListMode) {
      const selectedFeature = filteredFeatures[safeActiveIndex];
      if (selectedFeature) {
        setActiveFeature(selectedFeature);
      }
    }
  }, [
    activeCollectionLength,
    activeFeature,
    filteredFeatures,
    filteredMenuItems,
    isFeatureListMode,
    mode,
    openMode,
    safeActiveIndex,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const actions = mode === "search"
    ? [
      { label: "Open", shortcut: ["↵"], primary: true },
      { label: "Command Palette", shortcut: ["⌘", "K"] },
    ]
    : mode === "chat"
      ? [
        { label: "Back", shortcut: ["Esc"], primary: false },
        { label: "New Search", shortcut: ["⌘", "K"] },
      ]
      : mode === "features"
        ? activeFeature
          ? [{ label: "Back", shortcut: ["Esc"], primary: false }]
          : [{ label: "Open Details", shortcut: ["↵"], primary: true }, { label: "Back", shortcut: ["Esc"] }]
        : [
          { label: "Back", shortcut: ["Esc"], primary: false },
        ];

  return (
    <div className="min-h-dvh font-sans text-foreground">
      <header className="fixed left-1/2 top-3 z-20 w-[calc(100%-1.5rem)] max-w-[900px] -translate-x-1/2 sm:top-6 sm:w-[calc(100%-3rem)]">
        <div className="surface-glass flex items-center gap-2 rounded-2xl border border-border px-3 py-2 shadow-[0_12px_34px_rgba(0,0,0,0.35)] ring-1 ring-border/60 sm:gap-4 sm:px-4">
          <div className="flex min-w-fit items-center gap-2 rounded-xl border border-border bg-card/88 px-2.5 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary">
              <Image src="/icon.png" alt="Logo" width={24} height={24} />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold tracking-[0.08em] text-foreground">DOCUCHAT</p>
              <p className="hidden text-[10px] text-muted-foreground sm:block">Context-native document AI</p>
            </div>
          </div>

          <nav className="no-scrollbar flex flex-1 items-center justify-end gap-1 overflow-x-auto">
            {floatingNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "features") {
                    setActiveFeature(null);
                  }
                  openMode(item.id);
                }}
                className={[
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:px-3",
                  mode === item.id
                    ? "border-primary/45 bg-primary/18 text-foreground shadow-[0_8px_18px_rgba(44,191,112,0.22)]"
                    : "border-border bg-card/85 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <CommandPalette>
        <div className="flex items-center gap-2 border-b soft-divider bg-transparent px-4 sm:px-6">
          {mode !== "chat" && (
            <RaycastInput
              placeholder={
                mode === "features"
                  ? "Search features..."
                  : "Search commands..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          {mode === "chat" && (
            <div className="flex h-16 w-full items-center gap-2 text-foreground sm:h-[68px] sm:gap-3">
              <span className="rounded-md border border-primary/30 bg-primary/15 px-2.5 py-1 text-xs font-semibold tracking-[0.06em] text-primary">
                CHAT
              </span>
              <span className="flex-1 truncate text-sm text-muted-foreground">
                {activeDocument || "No document loaded"}
              </span>
              <button
                type="button"
                onClick={() => openMode("search")}
                className="rounded-md border border-border bg-card/88 px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
              >
                Back
              </button>
            </div>
          )}
        </div>

        <div className="scrollbar-hide relative flex-1 overflow-x-hidden overflow-y-auto">
          {mode === "search" && (
            <div className="py-3">
              <div className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Suggestions
              </div>
              {filteredMenuItems.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No commands found.</div>
              ) : (
                filteredMenuItems.map((item, index) => (
                  <RaycastListItem
                    key={item.id}
                    active={index === safeActiveIndex}
                    icon={item.icon}
                    title={item.title}
                    subtitle={item.subtitle}
                    meta={item.meta}
                    onSelect={() => {
                      if (item.id === "upload") openMode("upload");
                      if (item.id === "chat") openMode("chat");
                      if (item.id === "features") {
                        setActiveFeature(null);
                        openMode("features");
                      }
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))
              )}
            </div>
          )}

          {mode === "upload" && (
            <div className="flex h-full flex-col items-center justify-center p-5 sm:p-8">
              <div className="w-full max-w-[780px] space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">Import a document</h2>
                  <p className="mt-1 text-sm text-muted-foreground">One file at a time. Extraction and indexing starts instantly.</p>
                </div>
                <UploadZone
                  onUploadComplete={(filename) => {
                    setActiveDocument(filename);
                    openMode("chat");
                  }}
                />
              </div>
            </div>
          )}

          {mode === "chat" && (
            <div className="flex h-full flex-col">
              <ChatInterface />
            </div>
          )}

          {mode === "features" && (
            <div className="flex h-full flex-1 flex-col">
              {activeFeature ? (
                <div className="scrollbar-hide flex h-full flex-col gap-5 overflow-y-auto p-5 sm:p-6">
                  <div className="flex items-start gap-3 border-b soft-divider pb-4">
                    <div className="rounded-xl border border-border bg-card/88 p-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">{activeFeature.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{activeFeature.shortDesc}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p className="text-sm text-foreground sm:text-base">{activeFeature.description}</p>

                    <div className="mt-6 grid gap-3 sm:gap-4">
                      {activeFeature.details.map((detail, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card/88 p-4">
                          <h4 className="mb-1 flex items-center gap-2 font-medium text-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {detail.title}
                          </h4>
                          <p className="pl-3.5 text-muted-foreground">{detail.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  <div className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Feature Changelog
                  </div>
                  {filteredFeatures.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No features match this search.</div>
                  ) : (
                    filteredFeatures.map((feature, index) => (
                      <RaycastListItem
                        key={feature.title}
                        active={index === safeActiveIndex}
                        title={feature.title}
                        subtitle={feature.shortDesc}
                        meta={feature.date}
                        onSelect={() => setActiveFeature(feature)}
                        onMouseEnter={() => setActiveIndex(index)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <ActionBar actions={actions} />
      </CommandPalette>

      <a
        href="https://www.raycast.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-20 hidden items-center gap-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        <span>Inspired by Raycast</span>
        <Image src="/raycast.svg" alt="Raycast" width={14} height={14} className="ml-1 h-3.5 w-3.5 opacity-40" />
      </a>
    </div>
  );
}
