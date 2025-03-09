import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In a real app, this would use a database
// This is a simple file-based implementation for demonstration
const STATUS_FILE = "/tmp/document_statuses.json";

type DocumentStatus = {
  documentPath: string;
  status: string;
  assignedTo?: string;
  updatedAt: string;
  notes?: string;
};

// Initialize status file if it doesn't exist
function initStatusFile() {
  if (!fs.existsSync(STATUS_FILE)) {
    fs.writeFileSync(STATUS_FILE, JSON.stringify({}));
  }
}

// Get current statuses
function getStatuses(): Record<string, DocumentStatus> {
  initStatusFile();
  try {
    const content = fs.readFileSync(STATUS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading status file:", error);
    return {};
  }
}

// Save statuses
function saveStatuses(statuses: Record<string, DocumentStatus>) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(statuses, null, 2));
}

export async function GET(req: NextRequest) {
  try {
    const statuses = getStatuses();
    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Error retrieving statuses:", error);
    return NextResponse.json({ error: "Failed to retrieve document statuses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentPath, status, assignedTo, notes } = body;
    
    if (!documentPath || !status) {
      return NextResponse.json({ error: "Document path and status are required" }, { status: 400 });
    }
    
    const statuses = getStatuses();
    
    statuses[documentPath] = {
      documentPath,
      status,
      assignedTo,
      notes,
      updatedAt: new Date().toISOString()
    };
    
    saveStatuses(statuses);
    
    return NextResponse.json({ 
      message: "Document status updated successfully", 
      status: statuses[documentPath] 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ error: "Failed to update document status" }, { status: 500 });
  }
}