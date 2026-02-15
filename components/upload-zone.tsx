"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
    onUploadComplete?: (filename: string) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        setFileName(file.name);
        setUploadStatus("idle");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Server Error Response:", errorData);
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            setUploadStatus("success");

            // Delay to show success animation before callback
            setTimeout(() => {
                onUploadComplete?.(data.filename);
            }, 800);

        } catch (error) {
            console.error(error);
            setUploadStatus("error");
        } finally {
            setIsUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt', '.md'],
            'text/markdown': ['.md'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 1,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition-all duration-200 outline-none sm:h-72",
                isDragActive
                    ? "scale-[0.995] border-primary/70 bg-primary/8 shadow-[0_8px_24px_rgba(40,178,106,0.24)]"
                    : "border-border/70 bg-card/35 hover:border-primary/55 hover:bg-card/55",
                uploadStatus === "success" && "border-green-500/45 bg-green-500/8"
            )}
        >
            <input {...getInputProps()} />

            <AnimatePresence mode="wait">
                {uploadStatus === "success" ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center text-green-500"
                    >
                        <CheckCircle2 className="mb-2 h-10 w-10" />
                        <span className="max-w-full truncate text-sm font-semibold sm:text-base">Imported {fileName}</span>
                    </motion.div>
                ) : isUploading ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-primary"
                    >
                        <Loader2 className="mb-2 h-10 w-10 animate-spin" />
                        <span className="text-sm font-semibold sm:text-base">Processing...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-muted-foreground"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-card/55">
                            <Upload className="h-6 w-6" />
                        </div>
                        <span className="text-base font-semibold text-foreground sm:text-lg">Drop File Here</span>
                        <span className="mt-1 text-xs sm:text-sm">PDF, DOCX, TXT, MD, Images</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
