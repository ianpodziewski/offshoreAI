import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import Busboy from 'busboy';
import { OpenAI } from 'openai';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Storage for loan documents
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>(async (resolve, reject) => {
    try {
      if (!req.body) {
        console.error("❌ No request body found.");
        return resolve(
          NextResponse.json({ error: "Empty request body" }, { status: 400 })
        );
      }

      console.log("🔍 Parsing form data with Busboy for loan document upload...");
      const busboyHeaders: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        busboyHeaders[key.toLowerCase()] = value;
      });

      const busboy = Busboy({ headers: busboyHeaders });
      let loanId = '';
      let docType = '';
      let tmpFilePath: string | null = null;
      let fileName: string | null = null;

      busboy.on("field", (fieldname, val) => {
        console.log(`📩 Received field: ${fieldname} = ${val}`);
        if (fieldname === "loanId") {
          loanId = val;
        }
        if (fieldname === "docType") {
          docType = val;
        }
      });

      busboy.on("file", (_fieldname, fileStream, info) => {
        const effectiveFilename = `${randomUUID()}.pdf`;
        fileName = info.filename; // Store the original filename
        tmpFilePath = path.join("/tmp", effectiveFilename);
        console.log(`📂 Uploading loan document: '${info.filename}' as '${effectiveFilename}'`);
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
        
        try {
          // Wait for file to finish writing if there is one
          if ((req as any).fileWritePromise) {
            await (req as any).fileWritePromise;
          }
          
          // Process the uploaded file
          if (tmpFilePath && fileName) {
            console.log(`📄 Processing uploaded file: ${fileName}`);
            
            try {
              // Read the file
              const fileBuffer = fs.readFileSync(tmpFilePath);
              
              // Create embeddings for the document content
              const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: fileName,
              });
              
              const embedding = embeddingResponse.data[0].embedding;
              
              // Store the document in our loan-specific document storage
              // This is separate from the main chat document storage
              const loanDocuments = JSON.parse(localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY) || '[]');
              
              // Create a new document entry
              const newDocument = {
                id: randomUUID(),
                loanId,
                fileName,
                docType,
                content: fileBuffer.toString('base64'),
                embedding,
                uploadedAt: new Date().toISOString()
              };
              
              // Add to storage
              loanDocuments.push(newDocument);
              localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(loanDocuments));
              
              console.log(`✅ Successfully processed and stored loan document: ${fileName}`);
              
              // Clean up the temporary file
              fs.unlinkSync(tmpFilePath);
              
              resolve(NextResponse.json({ 
                success: true, 
                message: `Document ${fileName} uploaded successfully` 
              }));
            } catch (error) {
              console.error("❌ Error processing file:", error);
              resolve(NextResponse.json({ 
                error: "Failed to process file" 
              }, { status: 500 }));
            }
          } else {
            console.error("❌ No file was uploaded.");
            resolve(NextResponse.json({ 
              error: "No file was uploaded" 
            }, { status: 400 }));
          }
        } catch (error) {
          console.error("❌ Error in busboy finish handler:", error);
          resolve(NextResponse.json({ 
            error: "Error processing form data" 
          }, { status: 500 }));
        }
      });

      // Pipe the request body to busboy for processing
      const stream = new ReadableStream({
        start(controller) {
          req.body?.pipeTo(
            new WritableStream({
              write(chunk) {
                controller.enqueue(chunk);
              },
              close() {
                controller.close();
              },
            })
          );
        },
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        busboy.write(Buffer.from(chunk));
      }

      busboy.end();
    } catch (error) {
      console.error("❌ Error in loan document upload API:", error);
      resolve(NextResponse.json({ 
        error: "Failed to process request" 
      }, { status: 500 }));
    }
  });
} 