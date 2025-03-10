import { NextRequest, NextResponse } from "next/server";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { writeFile, mkdir, access } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import path from "path";
import { unlink } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Processing PDF split request");
    
    // Get the binary PDF data from the request
    const fileBuffer = await req.arrayBuffer();
    
    // Create a temporary file to store the uploaded PDF
    const tempFilePath = join(process.cwd(), "temp", `${randomUUID()}.pdf`);
    
    // Ensure temp directory exists
    await createDirectoryIfNotExists(join(process.cwd(), "temp"));
    await createDirectoryIfNotExists(join(process.cwd(), "public", "uploads", "split"));
    
    // Write the file to disk
    await writeFile(tempFilePath, Buffer.from(fileBuffer));
    
    // Process the PDF with Python script
    const result = await processPdfWithPython(tempFilePath);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    return NextResponse.json(
      { message: "Failed to process PDF", error: String(error) },
      { status: 500 }
    );
  }
}

async function createDirectoryIfNotExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dirPath, { recursive: true });
  }
}

async function processPdfWithPython(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), "api", "split_pdf_cli.py");
    
    // Run the Python script
    const pythonProcess: ChildProcessWithoutNullStreams = spawn("python", [
      scriptPath,
      "--file",
      filePath
    ]);
    
    let resultData = "";
    let errorData = "";
    
    // Collect data from stdout
    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });
    
    // Collect error data from stderr
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.error(`Python stderr: ${data}`);
    });
    
    // Handle process completion
    pythonProcess.on("close", async (code) => {
      // Clean up the temp file
      try {
        await unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete temp file: ${err}`);
      }
      
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}. Error: ${errorData}`));
        return;
      }
      
      try {
        // Parse the JSON result
        const result = JSON.parse(resultData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output. Error: ${error}. Output: ${resultData}`));
      }
    });
  });
}