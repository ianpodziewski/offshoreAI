// app/api/loans/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loanDatabase } from "@/utilities/loanDatabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = loanDatabase.getLoanById(params.id);
    
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
    
    return NextResponse.json({ loan });
  } catch (error) {
    console.error("Error retrieving loan:", error);
    return NextResponse.json({ error: "Failed to retrieve loan" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updatedLoan = loanDatabase.updateLoan(params.id, body);
    
    if (!updatedLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Loan updated successfully", 
      loan: updatedLoan 
    });
  } catch (error) {
    console.error("Error updating loan:", error);
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = loanDatabase.deleteLoan(params.id);
    
    if (!success) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Loan deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting loan:", error);
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 });
  }
}