import { NextRequest, NextResponse } from "next/server";
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log("✅ API `/api/get-file-sockets` CALLED!");

  try {
    const fileSockets: { [key: string]: string[] } = {
      "legal": [],
      "financial": [],
      "loan": [],
      "misc": []
    };

    // List all blobs
    const { blobs } = await list();
    console.log("📂 Found blobs:", blobs.length);

    // Group files by category based on path or filename
    blobs.forEach(blob => {
      // Extract category from the path or filename
      let category = "misc"; // Default category
      
      // Parse category from URL or pathname
      const url = new URL(blob.url);
      const pathname = url.pathname;
      
      // Determine category from pathname or filename
      if (pathname.includes("legal") || blob.pathname.includes("legal")) {
        category = "legal";
      } else if (pathname.includes("financial") || blob.pathname.includes("financial")) {
        category = "financial";
      } else if (pathname.includes("loan") || blob.pathname.includes("loan")) {
        category = "loan";
      }
      
      // Add to appropriate category
      fileSockets[category].push(blob.url);
    });

    console.log("📌 Returning:", fileSockets);
    return NextResponse.json({ message: "File sockets retrieved successfully.", files: fileSockets });
  } catch (error) {
    console.error("❌ ERROR retrieving file sockets:", error);
    return NextResponse.json({ message: "Server error retrieving file sockets", error }, { status: 500 });
  }
}