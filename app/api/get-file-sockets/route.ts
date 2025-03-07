import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TEMP_DIR = "/tmp/split_docs/";

export async function GET(req: NextRequest) {
  try {
    const fileSockets: { [key: string]: string[] } = {};

    if (fs.existsSync(TEMP_DIR)) {
      const categories = fs.readdirSync(TEMP_DIR);
      categories.forEach((category) => {
        const categoryPath = path.join(TEMP_DIR, category);
        if (fs.statSync(categoryPath).isDirectory()) {
          fileSockets[category] = fs.readdirSync(categoryPath).map((file) =>
            path.join(categoryPath, file)
          );
        }
      });
    }

    return NextResponse.json({ message: "File sockets retrieved successfully.", files: fileSockets });
  } catch (error) {
    console.error("Error retrieving file sockets:", error);
    return NextResponse.json({ message: "Server error retrieving file sockets", error }, { status: 500 });
  }
}
