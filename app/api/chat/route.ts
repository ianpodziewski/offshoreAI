import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import pdfParse from "pdf-parse";
import { PassThrough } from "stream";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { AIProviders } from "@/types";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";

// Temporary in-memory storage for user-uploaded embeddings
const tempUserEmbeddings: { [key: string]: number[] } = {};

const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!pineconeApiKey) throw new Error("PINECONE_API_KEY is not set");
if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set");

const pineconeClient = new Pinecone({ apiKey: pineconeApiKey });
const pineconeIndex = pineconeClient.Index(PINECONE_INDEX_NAME);
const openaiClient = new OpenAI({ apiKey: openaiApiKey });

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "GET requests are not supported on this endpoint" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  console.log("📩 Incoming request with headers:", req.headers);

  // Handle JSON Requests
  if (req.headers.get("content-type")?.includes("application/json")) {
    try {
      const jsonData = await req.json();
      console.log("📝 Received JSON Data:", jsonData);

      // Process JSON data...
      return resolve(NextResponse.json({ message: "JSON processed successfully" }));
    } catch (error) {
      console.error("🚨 Failed to process JSON:", error);
      return resolve(NextResponse.json({ error: "Invalid JSON request" }, { status: 400 }));
    }
  }

  // Handle FormData Requests (Current Logic)
  return new Promise<NextResponse>((resolve, reject) => {
    try {
      if (!req.body) {
        console.error("❌ No request body found.");
        return resolve(NextResponse.json({ error: "Empty request body" }, { status: 400 }));
      }

      console.log("🔍 Parsing form data with Busboy...");
      const busboyHeaders: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        busboyHeaders[key.toLowerCase()] = value;
      });

      const busboy = Busboy({ headers: busboyHeaders });
      let userMessage = "";
      let tmpFilePath: string | null = null;

      busboy.on("field", (fieldname, val) => {
        console.log(`📩 Received field: ${fieldname} = ${val}`);
        if (fieldname === "message") {
          userMessage = val;
        }
      });

      busboy.on("file", (_fieldname, fileStream, info) => {
        const effectiveFilename = `${randomUUID()}.pdf`;
        tmpFilePath = path.join(process.cwd(), "uploads", effectiveFilename);
        console.log(`📂 Uploading file: '${info.filename}' as '${effectiveFilename}'`);
        const writeStream = fs.createWriteStream(tmpFilePath);
        fileStream.pipe(writeStream);
      });

      busboy.on("finish", async () => {
        console.log("✅ Form processing complete.");
        resolve(NextResponse.json({ message: "Form data received" }));
      });

      const nodeStream = ReadableStreamToNodeStream(req.body);
      nodeStream.pipe(busboy);
    } catch (error: any) {
      console.error("🚨 Server error:", error.message);
      reject(NextResponse.json({ error: error.message }, { status: 500 }));
    }
  });
}


        let pdfText = "";
        let userFileEmbedding: number[] | null = null;

        if (tmpFilePath) {
          try {
            console.log("📖 Reading uploaded PDF...");
            const dataBuffer = fs.readFileSync(tmpFilePath);
            const pdfData = await pdfParse(dataBuffer);
            pdfText = pdfData.text;
            fs.unlinkSync(tmpFilePath);
            console.log(`✅ PDF text extracted. Length: ${pdfText.length} characters.`);

            console.log("🔍 Generating embedding for uploaded PDF...");
            const embeddingResponse = await openaiClient.embeddings.create({
              model: "text-embedding-ada-002",
              input: pdfText,
            });
            userFileEmbedding = embeddingResponse.data[0].embedding;
            console.log("✅ PDF embedding generated.");

            const userSessionId = randomUUID();
            tempUserEmbeddings[userSessionId] = userFileEmbedding;
            console.log("🔐 Stored userFileEmbedding in temp memory.");
          } catch (error: any) {
            console.error("❌ Failed to process PDF:", error.message);
            return resolve(NextResponse.json({ error: "Failed to process PDF", details: error.message }, { status: 500 }));
          }
        }

        console.log("🔍 Generating embedding for user message...");
        const queryEmbeddingResponse = await openaiClient.embeddings.create({
          model: "text-embedding-ada-002",
          input: userMessage,
        });
        const queryEmbedding = queryEmbeddingResponse.data[0].embedding;
        console.log("✅ userMessage embedding generated.");

        console.log("🔎 Querying Pinecone for relevant context...");
        const pineconeResults = await pineconeIndex.query({
          vector: queryEmbedding,
          topK: 5,
          includeMetadata: true,
        });
        console.log("✅ Pinecone query complete. Matches found:", pineconeResults.matches.length);

        const pineconeContext = pineconeResults.matches.map((match) => match.metadata?.text || "").join("\n\n");

        let userFileContext = "";
        if (userFileEmbedding) {
          const userFileSimilarity = cosineSimilarity(queryEmbedding, userFileEmbedding);
          console.log(`🔎 File similarity score: ${userFileSimilarity.toFixed(3)}`);
          if (userFileSimilarity > 0.7) {
            userFileContext = `\n\nUser-Uploaded Document Context:\n${pdfText}`;
          }
        }

        const finalPrompt = `
Context from Database:
${pineconeContext}

${userFileContext}

User Input:
${userMessage}
        `;
        console.log("📝 Final prompt constructed. Sending to OpenAI...");

        const stream = new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "loading", indicator: { status: "Generating answer...", icon: "thinking" } }) + "\n"));
              const streamedResponse = await openaiClient.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: finalPrompt }],
                stream: true,
                temperature: 0.7,
              });

              let responseBuffer = "";
              for await (const chunk of streamedResponse) {
                responseBuffer += chunk.choices[0]?.delta.content ?? "";
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "message", message: { role: "assistant", content: responseBuffer, citations: [] } }) + "\n"));
              }

              console.log("✅ OpenAI response streamed successfully.");
              controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "done", final_message: responseBuffer }) + "\n"));
              controller.close();
            } catch (error: any) {
              console.error("🚨 OpenAI API error:", error.message);
              controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "error", indicator: { status: error.message, icon: "error" } }) + "\n"));
              controller.close();
            }
          },
        });

        resolve(new NextResponse(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } }));
      });

      const readable = req.body;
      if (!readable) {
        console.warn("⚠️ No readable body found.");
        return resolve(NextResponse.json({ error: "No form data", pdfText: "", userMessage: "" }));
      }

      const nodeStream = ReadableStreamToNodeStream(readable);
      nodeStream.pipe(busboy);
    } catch (error: any) {
      console.error("🚨 Fatal server error:", error.message);
      reject(NextResponse.json({ error: error.message }, { status: 500 }));
    }
  });
}


// Utility function to compute cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

function ReadableStreamToNodeStream(readable: ReadableStream<Uint8Array>) {
  console.log("🔄 Converting ReadableStream to Node Stream...");
  const reader = readable.getReader();
  const passThrough = new PassThrough();

  function push() {
    reader.read().then(({ done, value }) => {
      if (done) {
        console.log("✅ Stream reading complete.");
        passThrough.end();
        return;
      }
      console.log(`📦 Read ${value.length} bytes`);
      passThrough.write(value);
      push();
    });
  }

  push();
  return passThrough;
}


















/*
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { AIProviders, Chat, Intention } from "@/types";
import { IntentionModule } from "@/modules/intention";
import { ResponseModule } from "@/modules/response";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// Get API keys
const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const fireworksApiKey = process.env.FIREWORKS_API_KEY;

// Check if API keys are set
if (!pineconeApiKey) {
  throw new Error("PINECONE_API_KEY is not set");
}
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

// Initialize Pinecone
const pineconeClient = new Pinecone({
  apiKey: pineconeApiKey,
});
const pineconeIndex = pineconeClient.Index(PINECONE_INDEX_NAME);

// Initialize Providers
const openaiClient = new OpenAI({
  apiKey: openaiApiKey,
});
const anthropicClient = new Anthropic({
  apiKey: anthropicApiKey,
});
const fireworksClient = new OpenAI({
  baseURL: "https://api.fireworks.ai/inference/v1",
  apiKey: fireworksApiKey,
});
const providers: AIProviders = {
  openai: openaiClient,
  anthropic: anthropicClient,
  fireworks: fireworksClient,
};

async function determineIntention(chat: Chat): Promise<Intention> {
  return await IntentionModule.detectIntention({
    chat: chat,
    openai: providers.openai,
  });
}

export async function POST(req: Request) {
  const { chat } = await req.json();

  const intention: Intention = await determineIntention(chat);

  if (intention.type === "question") {
    return ResponseModule.respondToQuestion(chat, providers, pineconeIndex);
  } else if (intention.type === "hostile_message") {
    return ResponseModule.respondToHostileMessage(chat, providers);
  } else {
    return ResponseModule.respondToRandomMessage(chat, providers);
  }
}
*/
