import { readFile } from "fs/promises";
import path from "path";
import os from "os";

export async function extractText(filePath: string, mime: string): Promise<string> {
  const buf = await readFile(filePath);
  if (mime === "application/pdf") {
    // @ts-ignore
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buf);
    return data.text || "";
  }
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ buffer: buf });
    return res.value || "";
  }
  // text/* or markdown
  return buf.toString("utf8");
}

export function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Serverless platforms (Vercel etc.) have a read-only project dir; /tmp is writable
export const UPLOAD_DIR = path.join(process.env.VERCEL ? os.tmpdir() : process.cwd(), "uploads");
