# DocuChat

DocuChat is a Next.js app for document-grounded chat. Upload files, index them in Pinecone, and ask questions against retrieved context.

## What We Built

- Upload flow for PDF, DOCX, TXT, MD, and image files (PNG/JPG/JPEG)
- Text extraction pipeline:
  - PDF via `pdf-parse`
  - DOCX via `mammoth`
  - Images via `tesseract.js` OCR
  - TXT/MD as UTF-8 text
- Chunking and embedding pipeline with LangChain
- Pinecone-backed vector retrieval
- Chat endpoint grounded in retrieved chunks with source metadata
- Sources panel in the UI showing file + chunk provenance
- BYOK (Bring Your Own Key) in the UI via local storage

## Stack

- Next.js (App Router) + React + TypeScript
- LangChain
- Pinecone
- OpenAI chat + embeddings
- Tailwind CSS + Framer Motion

## Requirements

- Node.js 20+
- A Pinecone project and index
- OpenAI API key (server key and/or BYOK key in the UI)

## Environment Variables

Create `.env.local` in the project root:

```bash
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=docuchat-index
PINECONE_NAMESPACE=optional_namespace

OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSION=1536
```

Notes:

- `PINECONE_API_KEY` is required.
- If `OPENAI_API_KEY` is not set on the server, users must set a BYOK key in the app before upload/chat will work.
- `OPENAI_EMBEDDING_DIMENSION` should match your Pinecone index dimension when needed.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Open the `Upload` view and import a document.
2. Wait for processing + indexing to complete.
3. Open `Chat` and ask questions about the uploaded content.
4. Optional: use the `BYOK` button in the header to store your OpenAI key in your browser.

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
