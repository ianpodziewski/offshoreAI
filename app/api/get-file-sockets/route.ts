import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TEMP_DIR = "/tmp/split_docs/";

export async function GET(req: NextRequest) {
  console.log("✅ API `/api/get-file-sockets` CALLED!");

  try {
    const fileSockets: { [key: string]: string[] } = {};

    if (fs.existsSync(TEMP_DIR)) {
      console.log("📁 /tmp/split_docs/ directory FOUND!");

      const categories = fs.readdirSync(TEMP_DIR);
      console.log("📂 Categories:", categories);

      categories.forEach((category) => {
        const categoryPath = path.join(TEMP_DIR, category);

        if (fs.statSync(categoryPath).isDirectory()) {
          const files = fs.readdirSync(categoryPath);
          console.log(`📂 ${category} contains:`, files);

          fileSockets[category] = files.map((file) => `/api/download?file=${path.join(categoryPath, file)}`);
        }
      });
    } else {
      console.warn("⚠️ /tmp/split_docs/ directory NOT FOUND!");
    }

    console.log("📌 Returning:", fileSockets);
    return NextResponse.json({ message: "File sockets retrieved successfully.", files: fileSockets });
  } catch (error) {
    console.error("❌ ERROR retrieving file sockets:", error);
    return NextResponse.json({ message: "Server error retrieving file sockets", error }, { status: 500 });
  }
}
