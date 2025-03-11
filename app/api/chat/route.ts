import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import pdfParse from "pdf-parse";
import { PassThrough } from "stream";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

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
  return NextResponse.json(
    { message: "GET requests are not supported on this endpoint" },
    { status: 405 }
  );
}

export async function POST(req: NextRequest) {
  console.log("📩 Incoming request with headers:", req.headers);

  return new Promise<NextResponse>(async (resolve, reject) => {
    try {
      if (!req.body) {
        console.error("❌ No request body found.");
        return resolve(
          NextResponse.json({ error: "Empty request body" }, { status: 400 })
        );
      }

      console.log("🔍 Parsing form data with Busboy...");
      const busboyHeaders: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        busboyHeaders[key.toLowerCase()] = value;
      });

      const busboy = Busboy({ headers: busboyHeaders });
      let userMessage = "";
      let tmpFilePath: string | null = null;
      let fileName: string | null = null;

      busboy.on("field", (fieldname, val) => {
        console.log(`📩 Received field: ${fieldname} = ${val}`);
        if (fieldname === "message") {
          userMessage = val;
        }
        // Check if we have a previously uploaded file reference
        if (fieldname === "fileName") {
          fileName = val;
        }
      });

      busboy.on("file", (_fieldname, fileStream, info) => {
        const effectiveFilename = `${randomUUID()}.pdf`;
        fileName = info.filename; // Store the original filename
        tmpFilePath = path.join("/tmp", effectiveFilename);
        console.log(`📂 Uploading file: '${info.filename}' as '${effectiveFilename}'`);
        const writeStream = fs.createWriteStream(tmpFilePath);

        // Create a promise that resolves when writing is complete
        const fileWritePromise = new Promise<void>((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        fileStream.pipe(writeStream);

        // Attach the promise to the fileStream event so we can await later.
        fileStream.on("end", () => {
          console.log("✅ File stream ended.");
        });

        // Store the promise so that it can be awaited in the "finish" event of Busboy.
        (req as any).fileWritePromise = fileWritePromise;
      });

      busboy.on("finish", async () => {
        console.log("✅ Form processing complete.");
        console.log("📝 userMessage:", userMessage);
        console.log("🔗 tmpFilePath:", tmpFilePath || "No file uploaded.");
        console.log("📄 fileName:", fileName || "No file name provided.");

        // Initialize variables for file processing
        let pdfText = "";
        let userFileEmbedding: number[] | null = null;

        // If a file was uploaded, process it
        if (tmpFilePath && (req as any).fileWritePromise) {
          try {
            await (req as any).fileWritePromise;
            console.log("✅ File writing completed.");
            
            console.log("📖 Reading uploaded PDF...");
            const dataBuffer = fs.readFileSync(tmpFilePath);
            const pdfData = await pdfParse(dataBuffer);
            pdfText = pdfData.text;
            fs.unlinkSync(tmpFilePath);
            console.log(`✅ PDF text extracted. Length: ${pdfText.length} characters.`);

            // Generate an embedding for the PDF text
            console.log("🔍 Generating embedding for uploaded PDF...");
            const embeddingResponse = await openaiClient.embeddings.create({
              model: "text-embedding-ada-002",
              input: pdfText,
            });
            userFileEmbedding = embeddingResponse.data[0].embedding;
            console.log("✅ PDF embedding generated.");
          } catch (error: any) {
            console.error("❌ Failed to process PDF:", error.message);
            return resolve(
              NextResponse.json(
                { error: "Failed to process PDF", details: error.message },
                { status: 500 }
              )
            );
          }
        } 
        // If we have a fileName but no tmpFilePath, try to get the document from the service
        else if (fileName && !tmpFilePath) {
          console.log("🔍 Looking for previously uploaded file in document service:", fileName);
          
          // Search for the document in chat uploads
          const chatDocs = simpleDocumentService.getChatDocuments();
          const existingDoc = chatDocs.find(doc => doc.filename === fileName);
          
          if (existingDoc) {
            console.log("✅ Found existing document:", existingDoc.filename);
            
            try {
              // Extract the base64 content
              const base64Content = existingDoc.content;
              
              // Convert to binary if it's a base64 string
              if (base64Content && base64Content.includes('base64')) {
                // Extract just the base64 part from the data URL
                const base64Data = base64Content.split(',')[1];
                
                // Convert to buffer
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Parse the PDF
                const pdfData = await pdfParse(buffer);
                pdfText = pdfData.text;
                console.log(`✅ PDF text extracted from stored document. Length: ${pdfText.length} characters.`);
                
                // Generate an embedding for the PDF text
                console.log("🔍 Generating embedding for stored PDF...");
                const embeddingResponse = await openaiClient.embeddings.create({
                  model: "text-embedding-ada-002",
                  input: pdfText,
                });
                userFileEmbedding = embeddingResponse.data[0].embedding;
                console.log("✅ PDF embedding generated for stored document.");
              } else {
                console.error("❌ Invalid document content format");
              }
            } catch (error) {
              console.error("❌ Error processing stored document:", error);
            }
          } else {
            console.log("⚠️ No existing document found with name:", fileName);
          }
        }

        // Generate an embedding for the user message
        console.log("🔍 Generating embedding for user message...");
        const queryEmbeddingResponse = await openaiClient.embeddings.create({
          model: "text-embedding-ada-002",
          input: userMessage,
        });
        const queryEmbedding = queryEmbeddingResponse.data[0].embedding;
        console.log("✅ userMessage embedding generated.");

        // Query Pinecone
        console.log("🔎 Querying Pinecone for relevant context...");
        const pineconeResults = await pineconeIndex.query({
          vector: queryEmbedding,
          topK: 5,
          includeMetadata: true,
        });
        console.log("✅ Pinecone query complete. Matches found:", pineconeResults.matches.length);

        // Build Pinecone context
        const pineconeContext = pineconeResults.matches
          .map((match) => match.metadata?.text || "")
          .join("\n\n");

        // Check similarity and optionally append user-uploaded PDF text
        let userFileContext = "";
        if (userFileEmbedding) {
          const userFileSimilarity = cosineSimilarity(queryEmbedding, userFileEmbedding);
          console.log(`🔎 File similarity score: ${userFileSimilarity.toFixed(3)}`);
          if (userFileSimilarity > 0.7 || pdfText.length > 0) {
            userFileContext = `\n\nUser-Uploaded Document Context:\n${pdfText}`;
            console.log("✅ Including user document content in prompt.");
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
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ type: "loading", indicator: { status: "Generating answer...", icon: "thinking" } }) + "\n"
                )
              );
              const streamedResponse = await openaiClient.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: "You are a helpful assistant." },
                  { role: "user", content: finalPrompt },
                ],
                stream: true,
                temperature: 0.7,
              });

              let responseBuffer = "";
              for await (const chunk of streamedResponse) {
                responseBuffer += chunk.choices[0]?.delta.content ?? "";
                controller.enqueue(
                  new TextEncoder().encode(
                    JSON.stringify({ type: "message", message: { role: "assistant", content: responseBuffer, citations: [] } }) + "\n"
                  )
                );
              }

              console.log("✅ OpenAI response streamed successfully.");
              controller.enqueue(
                new TextEncoder().encode(JSON.stringify({ type: "done", final_message: responseBuffer }) + "\n")
              );
              controller.close();
            } catch (error: any) {
              console.error("🚨 OpenAI API error:", error.message);
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ type: "error", indicator: { status: error.message, icon: "error" } }) + "\n"
                )
              );
              controller.close();
            }
          },
        });

        resolve(
          new NextResponse(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          })
        );
      });

      const nodeStream = ReadableStreamToNodeStream(req.body);
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