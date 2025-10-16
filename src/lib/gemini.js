import { GoogleGenerativeAI } from "@google/generative-ai";

// Directly hardcode your API key here
const apiKey = "AIzaSyCf0GLHKLsgX6HD7fpoKkzn9AF0gZ-DszI";

// Pass the API key explicitly to the SDK
export const genAI = new GoogleGenerativeAI(apiKey);

const MODEL = "gemini-2.5-flash";

export async function uploadPdf(file) {
  console.log("Uploading PDF:", file);
  return {
    fileData: {
      file: file,
      mimeType: "application/pdf"
    }
  };
}

export async function generateChat({ prompt, fileParts = [], signal, onChunk }) {
  console.log("generateChat called with:", { prompt, fileParts, signal });
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    console.log("Model instance:", model);

    const contents = [
      { role: "user", parts: [{ text: prompt }, ...fileParts] }
    ];
    console.log("Contents for request:", contents);

    const stream = await model.generateContentStream({ contents }, { signal });
    console.log("Stream object:", stream);

    for await (const chunk of stream.stream) {
      const t = chunk.text();
      console.log("Chunk received:", t);
      if (t && onChunk) onChunk(t);
    }
    const final = await stream.response;
    console.log("Final response object:", final);
    return final.text();
  } catch (e) {
    console.error("Error in generateChat:", e);
    throw e;
  }
}

export function toFilePart(part) {
  console.log("toFilePart called with:", part);
  return part;
}
