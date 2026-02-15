"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
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
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 1,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 outline-none",
                isDragActive
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-border/50 hover:border-primary/50 hover:bg-secondary/20",
                uploadStatus === "success" && "border-green-500/50 bg-green-500/5"
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
                        <CheckCircle2 className="w-10 h-10 mb-2" />
                        <span className="font-medium">Imported {fileName}</span>
                    </motion.div>
                ) : isUploading ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-primary"
                    >
                        <Loader2 className="w-10 h-10 mb-2 animate-spin" />
                        <span className="font-medium">Processing...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-muted-foreground"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <Upload className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-lg text-foreground">Drop File Here</span>
                        <span className="text-sm mt-1">PDF, TXT, MD, Images</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
