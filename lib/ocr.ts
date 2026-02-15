import Tesseract from 'tesseract.js';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(
        buffer,
        'eng',
        { logger: m => console.log(m) }
    );
    return text;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    console.log("Starting PDF extraction with pdf-parse v1...");
    try {
        const data = await pdfParse(buffer);
        console.log("PDF extraction successful");
        return data.text;
    } catch (error) {
        console.error("PDF extraction failed:", error);
        throw error;
    }
}

export async function processFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const type = file.type;

    if (type === 'application/pdf') {
        return extractTextFromPdf(buffer);
    } else if (type.startsWith('image/')) {
        return extractTextFromImage(buffer);
    } else if (type === 'text/plain') {
        return buffer.toString('utf-8');
    } else {
        throw new Error(`Unsupported file type: ${type}`);
    }
}
