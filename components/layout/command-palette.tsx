"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
    children: ReactNode;
    className?: string;
}

export function CommandPalette({ children, className }: CommandPaletteProps) {
    return (
        <div className="relative mx-auto flex w-full items-start justify-center px-3 pb-4 pt-[4.85rem] sm:px-6 sm:pb-8 sm:pt-24">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "surface-glass relative flex h-[calc(100dvh-6.85rem)] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl border border-border ring-1 ring-border/60 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:h-[calc(100dvh-9rem)] sm:rounded-[26px] md:h-[700px]",
                    className
                )}
            >
                {children}
            </motion.div>
        </div>
    );
}
