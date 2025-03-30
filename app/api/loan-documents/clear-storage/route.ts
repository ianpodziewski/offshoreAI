import { NextRequest, NextResponse } from "next/server";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("⚠️ Clearing document storage");
    
    // This operation will be performed client-side because:
    // 1. localStorage is not accessible from server-side code
    // 2. IndexedDB is also a client-side API
    
    // Return instructions for client-side script to handle
    return NextResponse.json({ 
      status: "success",
      message: "Storage clear operation initiated",
      clientAction: "clearStorage",
      clearInstructions: {
        storageKeys: [
          "simple_documents",
          "loan_documents",
          "indexeddb_migration_done"
        ],
        dbName: "offshoreAI_DocumentDB"
      }
    });
  } catch (error: any) {
    console.error("❌ Error initiating storage clear:", error);
    return NextResponse.json({
      status: "error",
      error: error.message
    }, { status: 500 });
  }
} 