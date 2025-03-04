import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import pdfParse from "pdf-parse";
import { PassThrough } from "stream";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { AIProviders, Chat, Intention } from "@/types";
import { IntentionModule } from "@/modules/intention";
import { ResponseModule } from "@/modules/response";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// API Keys
const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const fireworksApiKey = process.env.FIREWORKS_API_KEY;

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
const openaiClient = new OpenAI({ apiKey: openaiApiKey });
const anthropicClient = new Anthropic({ apiKey: anthropicApiKey });
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

/**
 * We must disable the default Next.js body parsing
 * and let busboy handle the raw body stream.
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // We will parse the form data manually using Busboy
  return new Promise<NextResponse>((resolve, reject) => {
    try {
      // Convert NextRequest headers to a plain object
      const busboyHeaders: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        busboyHeaders[key.toLowerCase()] = value;
      });

      const busboy = Busboy({ headers: busboyHeaders });
      let tmpFilePath: string | null = null;

      // Create an "uploads" directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // When busboy finds a file...
      busboy.on("file", (_fieldname, fileStream, filename) => {
        // Use effectiveFilename to avoid modifying the readonly filename parameter
        const effectiveFilename = filename || `${randomUUID()}.pdf`;
        tmpFilePath = path.join(uploadsDir, effectiveFilename);
        const writeStream = fs.createWriteStream(tmpFilePath);
        fileStream.pipe(writeStream);

        fileStream.on("error", (err) => {
          reject(
            NextResponse.json({ error: err.message }, { status: 500 })
          );
        });
      });

      // When busboy is done parsing the form data...
      busboy.on("finish", async () => {
        if (!tmpFilePath) {
          // No file was uploaded
          resolve(
            NextResponse.json({ error: "No file uploaded" }, { status: 400 })
          );
          return;
        }

        try {
          // Parse the PDF using pdf-parse
          const dataBuffer = fs.readFileSync(tmpFilePath);
          const pdfData = await pdfParse(dataBuffer);

          // Cleanup: remove the file
          fs.unlinkSync(tmpFilePath);

          // Return the extracted text
          resolve(
            NextResponse.json({ text: pdfData.text }, { status: 200 })
          );
        } catch (error: any) {
          reject(
            NextResponse.json(
              { error: "Failed to parse PDF", details: error.message },
              { status: 500 }
            )
          );
        }
      });

      busboy.on("error", (err) => {
        reject(
          NextResponse.json({ error: err.message }, { status: 500 })
        );
      });

      // Pipe the request's body to busboy
      const readable = req.body;
      if (!readable) {
        resolve(
          NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        );
      } else {
        // Convert the ReadableStream to a Node.js stream
        const nodeStream = ReadableStreamToNodeStream(readable);
        nodeStream.pipe(busboy);
      }
    } catch (error: any) {
      reject(
        NextResponse.json({ error: error.message }, { status: 500 })
      );
    }
  });
}

/**
 * Helper function to convert a Web ReadableStream (from Next.js) to a Node.js stream
 */
function ReadableStreamToNodeStream(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const passThrough = new PassThrough();

  function push() {
    reader.read().then(({ done, value }) => {
      if (done) {
        passThrough.end();
        return;
      }
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
