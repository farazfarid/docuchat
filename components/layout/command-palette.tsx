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
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "w-full max-w-[750px] h-[550px] bg-[#161616]/15 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative ring-1 ring-white/5 font-sans",
                    className
                )}
            >
                {children}
            </motion.div>
        </div>
    );
}
