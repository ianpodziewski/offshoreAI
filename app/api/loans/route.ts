// app/api/loans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loanDatabase } from "@/utilities/loanDatabase";
import { generateLoan } from "@/utilities/loanGenerator";

export async function GET() {
  try {
    const loans = loanDatabase.getLoans();
    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Error retrieving loans:", error);
    return NextResponse.json({ error: "Failed to retrieve loans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Generate a new loan with any provided overrides
    const newLoan = generateLoan(body);
    loanDatabase.addLoan(newLoan);
    
    return NextResponse.json({ 
      message: "Loan created successfully", 
      loan: newLoan 
    });
  } catch (error) {
    console.error("Error creating loan:", error);
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
  }
}