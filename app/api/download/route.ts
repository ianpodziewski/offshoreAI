export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("file");

    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    // Check if it's a Blob URL
    if (filePath.startsWith('http')) {
      // Fetch from URL instead of filesystem
      const response = await fetch(filePath);
      if (!response.ok) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      
      const fileData = await response.arrayBuffer();
      const fileName = filePath.split('/').pop() || 'document.pdf';
      
      return new NextResponse(fileData, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      });
    }

    // Original local filesystem code
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes("..")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileData = fs.readFileSync(normalizedPath);
    const fileName = path.basename(normalizedPath);
    
    return new NextResponse(fileData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("❌ Error serving file:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}