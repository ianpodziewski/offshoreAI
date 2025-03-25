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

// Maximumtokens that can be safely sent to the model
const MAX_TOKENS_LIMIT = 7000; // Leave some buffer from the 8192 max
const ESTIMATED_CHARS_PER_TOKEN = 4; // Rough estimate of characters per token
const MAX_CHARS = MAX_TOKENS_LIMIT * ESTIMATED_CHARS_PER_TOKEN;

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
            
            try {
              const pdfData = await pdfParse(dataBuffer);
              pdfText = pdfData.text;
              console.log(`✅ PDF text extracted. Length: ${pdfText.length} characters.`);
              
              // Save document to simpleDocumentService for future reference
              if (fileName) {
                try {
                  const base64Content = dataBuffer.toString('base64');
                  // Add document to service if it doesn't exist or update it
                  const chatDocs = simpleDocumentService.getChatDocuments();
                  const existingDoc = chatDocs.find(doc => doc.filename === fileName);
                  
                  if (existingDoc) {
                    console.log("🔄 Updating existing document in service:", fileName);
                  } else {
                    console.log("➕ Adding new document to service:", fileName);
                  }
                  
                  // Create a File object from the base64 content
                  const byteCharacters = atob(base64Content);
                  const byteArrays = [];
                  
                  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                    const slice = byteCharacters.slice(offset, offset + 512);
                    
                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                      byteNumbers[i] = slice.charCodeAt(i);
                    }
                    
                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                  }
                  
                  const blob = new Blob(byteArrays, { type: 'application/pdf' });
                  const file = new File([blob], fileName, { type: 'application/pdf' });
                  
                  // Use the addDocument method instead
                  simpleDocumentService.addDocument(file, 'chat-uploads');
                } catch (saveError) {
                  console.error("⚠️ Error saving document to service:", saveError);
                  // Continue processing even if saving fails
                }
              }
            } catch (pdfError) {
              console.error("❌ Error parsing PDF:", pdfError);
              pdfText = "[Error: Could not extract text from PDF. The document may be corrupted or password-protected.]";
            }
            
            // Clean up the temporary file
            try {
              fs.unlinkSync(tmpFilePath);
            } catch (unlinkError) {
              console.error("⚠️ Error removing temporary file:", unlinkError);
            }

            // Apply text chunking for large documents
            let truncatedPdfText = pdfText;
            if (pdfText.length > MAX_CHARS) {
              console.log(`⚠️ PDF text too large (${pdfText.length} chars), truncating to ~${MAX_CHARS} chars`);
              truncatedPdfText = pdfText.substring(0, MAX_CHARS);
              truncatedPdfText += "\n\n[Note: This document has been truncated due to its large size. If you need information from later parts of the document, please ask a more specific question about those sections.]";
            }
            
            // Generate an embedding for the truncated PDF text
            try {
              console.log("🔍 Generating embedding for uploaded PDF...");
              const embeddingResponse = await openaiClient.embeddings.create({
                model: "text-embedding-ada-002",
                input: truncatedPdfText.substring(0, 8000), // Further limit for embedding API
              });
              userFileEmbedding = embeddingResponse.data[0].embedding;
              console.log("✅ PDF embedding generated.");
              
              // Use the truncated text for future processing
              pdfText = truncatedPdfText;
            } catch (embeddingError) {
              console.error("❌ Error generating embedding:", embeddingError);
              // Continue without embedding if it fails
            }
          } catch (fileError: any) {
            console.error("❌ Failed to process uploaded file:", fileError.message);
            pdfText = "[Error: Failed to process the uploaded file]";
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
              if (base64Content) {
                // Handle both raw base64 and data URL formats
                let base64Data = base64Content;
                if (base64Content.includes('base64')) {
                  // Extract just the base64 part from the data URL
                  base64Data = base64Content.split(',')[1];
                }
                
                // Convert to buffer
                const buffer = Buffer.from(base64Data, 'base64');
                
                try {
                  // Parse the PDF
                  const pdfData = await pdfParse(buffer);
                  pdfText = pdfData.text;
                  console.log(`✅ PDF text extracted from stored document. Length: ${pdfText.length} characters.`);
                  
                  // Apply text chunking for large documents
                  let truncatedPdfText = pdfText;
                  if (pdfText.length > MAX_CHARS) {
                    console.log(`⚠️ PDF text too large (${pdfText.length} chars), truncating to ~${MAX_CHARS} chars`);
                    truncatedPdfText = pdfText.substring(0, MAX_CHARS);
                    truncatedPdfText += "\n\n[Note: This document has been truncated due to its large size. If you need information from later parts of the document, please ask a more specific question about those sections.]";
                  }
                  
                  // Generate an embedding for the truncated PDF text
                  try {
                    console.log("🔍 Generating embedding for stored PDF...");
                    const embeddingResponse = await openaiClient.embeddings.create({
                      model: "text-embedding-ada-002",
                      input: truncatedPdfText.substring(0, 8000), // Further limit for embedding API
                    });
                    userFileEmbedding = embeddingResponse.data[0].embedding;
                    console.log("✅ PDF embedding generated for stored document.");
                    
                    // Use the truncated text for future processing
                    pdfText = truncatedPdfText;
                  } catch (embeddingError) {
                    console.error("❌ Error generating embedding for stored document:", embeddingError);
                    // Continue without embedding if it fails
                  }
                } catch (pdfError) {
                  console.error("❌ Error parsing stored PDF:", pdfError);
                  pdfText = "[Error: Could not extract text from the stored PDF. The document may be corrupted or password-protected.]";
                }
              } else {
                console.error("❌ Invalid document content format");
                pdfText = "[Error: The stored document has invalid content]";
              }
            } catch (error) {
              console.error("❌ Error processing stored document:", error);
              pdfText = "[Error: Failed to process the stored document]";
            }
          } else {
            console.log("⚠️ No existing document found with name:", fileName);
            pdfText = "[Error: The requested document could not be found]";
          }
        }

        try {
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
          if (userFileEmbedding && pdfText) {
            const userFileSimilarity = cosineSimilarity(queryEmbedding, userFileEmbedding);
            console.log(`🔎 File similarity score: ${userFileSimilarity.toFixed(3)}`);
            if (userFileSimilarity > 0.7 || pdfText.length > 0) {
              userFileContext = `\n\nUser-Uploaded Document Context:\n${pdfText}`;
              console.log("✅ Including user document content in prompt.");
            }
          } else if (pdfText) {
            // If we have PDF text but no embedding, include it anyway
            userFileContext = `\n\nUser-Uploaded Document Context:\n${pdfText}`;
            console.log("✅ Including user document content without similarity check.");
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
        } catch (apiError: any) {
          console.error("🚨 API processing error:", apiError.message);
          // Create a stream that returns an error message
          const errorStream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ type: "error", indicator: { status: "Error processing your request", icon: "error" } }) + "\n"
                )
              );
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ type: "message", message: { role: "assistant", content: "I encountered an error while processing your document. This might be because the document is too large or contains complex formatting. Could you try again with a smaller document or a more specific question?", citations: [] } }) + "\n"
                )
              );
              controller.enqueue(
                new TextEncoder().encode(JSON.stringify({ type: "done", final_message: "Error processing your request" }) + "\n")
              );
              controller.close();
            }
          });
          
          resolve(
            new NextResponse(errorStream, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            })
          );
        }
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