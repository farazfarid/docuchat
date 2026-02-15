import Tesseract from 'tesseract.js';
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MARKDOWN_MIME = "text/markdown";

const detectMimeType = (file: File): string => {
    if (file.type) return file.type;

    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "application/pdf";
    if (name.endsWith(".txt")) return "text/plain";
    if (name.endsWith(".md")) return MARKDOWN_MIME;
    if (name.endsWith(".docx")) return DOCX_MIME;
    if (name.match(/\.(png|jpe?g|webp|bmp|gif|tiff?)$/)) return "image/*";

    return "application/octet-stream";
};

const ensureText = (text: string, fileType: string): string => {
    const normalized = text.trim();
    if (!normalized) {
        throw new Error(`No readable text found in ${fileType} file`);
    }
    return normalized;
};

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(
        buffer,
        "eng"
    );
    return ensureText(text, "image");
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return ensureText(data.text, "PDF");
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    const { value } = await mammoth.extractRawText({ buffer });
    return ensureText(value, "DOCX");
}

export async function processFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const type = detectMimeType(file);

    if (type === "application/pdf") {
        return extractTextFromPdf(buffer);
    } else if (type === DOCX_MIME) {
        return extractTextFromDocx(buffer);
    } else if (type.startsWith("image/") || type === "image/*") {
        return extractTextFromImage(buffer);
    } else if (type === "text/plain" || type === MARKDOWN_MIME) {
        return ensureText(buffer.toString("utf-8"), type);
    } else {
        throw new Error(`Unsupported file type: ${type}`);
    }
}
