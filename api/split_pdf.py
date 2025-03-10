import os
import json
import base64
import tempfile
from typing import List, Dict, Any, Optional
import fitz  # PyMuPDF
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from pydantic import BaseModel
import re
from pathlib import Path

# Define document types
DOCUMENT_TYPES = [
    "promissory_note",
    "deed_of_trust",
    "closing_disclosure",
    "settlement_statement",
    "compliance_agreement", 
    "appraisal_report",
    "loan_application",
    "credit_report",
    "tax_return",
    "insurance_policy",
    "hud_statement",
    "identity_verification",
    "unclassified"
]

# Ensure upload directories exist
UPLOAD_DIR = Path("./public/uploads")
SPLIT_DIR = UPLOAD_DIR / "split"
UPLOAD_DIR.mkdir(exist_ok=True)
SPLIT_DIR.mkdir(exist_ok=True)

# Keywords that indicate each document type
DOCUMENT_KEYWORDS = {
    "promissory_note": ["promissory note", "promise to pay", "borrower promises", "fixed rate note"],
    "deed_of_trust": ["deed of trust", "security instrument", "mortgage", "trustee", "grant deed"],
    "closing_disclosure": ["closing disclosure", "loan estimate", "settlement costs", "loan terms"],
    "settlement_statement": ["settlement statement", "hud-1", "settlement charges", "disbursement"],
    "compliance_agreement": ["compliance agreement", "compliance certification", "federal regulations"],
    "appraisal_report": ["appraisal report", "appraised value", "property valuation", "market value"],
    "loan_application": ["uniform residential loan application", "loan application", "borrower information"],
    "credit_report": ["credit report", "credit score", "credit history", "credit inquiry"],
    "tax_return": ["tax return", "irs form", "adjusted gross income", "tax year"],
    "insurance_policy": ["insurance policy", "hazard insurance", "homeowner's insurance", "coverage"],
    "hud_statement": ["hud statement", "department of housing", "urban development"],
    "identity_verification": ["identity verification", "identification", "driver's license", "passport"]
}

# Document boundary indicators
BOUNDARY_INDICATORS = [
    "This agreement", "This document", "AGREEMENT", "DISCLOSURE", "NOTE", "DEED", 
    "CERTIFICATION", "Page 1 of", "Page 1", "SECTION 1", "In witness whereof", 
    "Uniform Residential Loan"
]

class DocumentPage:
    def __init__(self, page_num: int, text: str, doc_type: str, confidence: float):
        self.page_num = page_num
        self.text = text
        self.doc_type = doc_type
        self.confidence = confidence

class DocumentBoundary:
    def __init__(self, start_page: int, end_page: int, doc_type: str, confidence: float):
        self.start_page = start_page
        self.end_page = end_page
        self.doc_type = doc_type
        self.confidence = confidence
        
    def to_dict(self) -> Dict[str, Any]:
        return {
            "start_page": self.start_page,
            "end_page": self.end_page,
            "doc_type": self.doc_type,
            "confidence": self.confidence
        }

def classify_page_with_keywords(text: str) -> tuple[str, float]:
    """Classify a page using keyword matching."""
    text = text.lower()
    best_match = "unclassified"
    highest_score = 0
    
    for doc_type, keywords in DOCUMENT_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if keyword.lower() in text:
                # More specific/longer keywords get higher score
                keyword_score = len(keyword.split()) * 0.1
                score += keyword_score
        
        if score > highest_score:
            highest_score = score
            best_match = doc_type
    
    # Convert score to confidence (0.5-0.95 range)
    confidence = min(0.5 + (highest_score * 0.15), 0.95) if highest_score > 0 else 0.5
    
    return best_match, confidence

def is_likely_boundary(doc: fitz.Document, page1: int, page2: int) -> bool:
    """Determine if there's likely a document boundary between two pages."""
    # Skip if one of the pages is out of bounds
    if page1 < 0 or page2 >= len(doc):
        return False
        
    # Check if page2 has title-like text at the top
    page = doc[page2]
    top_text = page.get_text("text", clip=(0, 0, page.rect.width, 100)).strip()
    
    # Check for boundary indicators
    for indicator in BOUNDARY_INDICATORS:
        if indicator in top_text:
            return True
    
    # Check for page numbers resetting to 1 or "Page 1 of"
    page_num_match = re.search(r"Page\s+(\d+)\s+of", top_text)
    if page_num_match and page_num_match.group(1) == "1":
        return True
    
    # Document probably continues
    return False

def detect_document_boundaries(doc: fitz.Document, page_classifications: List[DocumentPage]) -> List[DocumentBoundary]:
    """Detect document boundaries based on page classifications and layout analysis."""
    if not page_classifications:
        return []
        
    boundaries = []
    current_type = page_classifications[0].doc_type
    start_page = 0
    total_confidence = page_classifications[0].confidence
    page_count = 1
    
    for i, page in enumerate(page_classifications[1:], 1):
        # Check if document type changes or if there's a boundary indicator
        if (page.doc_type != current_type or 
            is_likely_boundary(doc, i-1, i)):
            
            # Calculate average confidence for this document span
            avg_confidence = total_confidence / page_count
            
            boundaries.append(DocumentBoundary(
                start_page=start_page,
                end_page=i-1,
                doc_type=current_type,
                confidence=avg_confidence
            ))
            
            # Reset for next document
            current_type = page.doc_type
            start_page = i
            total_confidence = page.confidence
            page_count = 1
        else:
            # Continue current document
            total_confidence += page.confidence
            page_count += 1
    
    # Add the last document
    avg_confidence = total_confidence / page_count
    boundaries.append(DocumentBoundary(
        start_page=start_page,
        end_page=len(page_classifications)-1,
        doc_type=current_type,
        confidence=avg_confidence
    ))
    
    return boundaries

def extract_text_with_layout(page: fitz.Page) -> str:
    """Extract text while preserving some layout information."""
    blocks = page.get_text("dict")["blocks"]
    text_lines = []
    
    for block in blocks:
        if "lines" in block:
            for line in block["lines"]:
                line_text = ""
                for span in line["spans"]:
                    line_text += span["text"] + " "
                text_lines.append(line_text.strip())
    
    return "\n".join(text_lines)

def split_pdf_by_boundaries(doc: fitz.Document, boundaries: List[DocumentBoundary], upload_id: str) -> List[Dict[str, Any]]:
    """Split PDF document according to detected boundaries."""
    result_files = []
    
    for i, boundary in enumerate(boundaries):
        # Create a new document with the pages from this boundary
        new_doc = fitz.open()
        start = boundary.start_page
        end = boundary.end_page
        
        # Skip documents with only one mostly empty page
        if start == end:
            page_text = doc[start].get_text().strip()
            if len(page_text) < 50:  # Skip very short single-page documents
                continue
                
        # Insert the pages
        new_doc.insert_pdf(doc, from_page=start, to_page=end)
        
        # Create a meaningful filename
        doc_type = boundary.doc_type.replace("_", "-")
        filename = f"{doc_type}_{i+1}_{upload_id}.pdf"
        file_path = str(SPLIT_DIR / filename)
        
        # Save the document
        new_doc.save(file_path)
        new_doc.close()
        
        # Add metadata to results
        result_files.append({
            "path": file_path,
            "filename": filename,
            "docType": boundary.doc_type,
            "category": get_category_from_doc_type(boundary.doc_type),
            "pageRange": f"{start+1}-{end+1}",
            "confidenceScore": round(boundary.confidence, 2),
        })
    
    return result_files

def get_category_from_doc_type(doc_type: str) -> str:
    """Map document type to a category."""
    category_mapping = {
        "promissory_note": "loan",
        "deed_of_trust": "legal",
        "closing_disclosure": "financial",
        "settlement_statement": "financial",
        "compliance_agreement": "legal",
        "appraisal_report": "financial",
        "loan_application": "loan",
        "credit_report": "financial",
        "tax_return": "financial",
        "insurance_policy": "financial",
        "hud_statement": "financial",
        "identity_verification": "legal"
    }
    return category_mapping.get(doc_type, "misc")

def process_pdf(pdf_path: str, upload_id: str) -> List[Dict[str, Any]]:
    """Process a PDF file, detecting document types and splitting into separate files."""
    try:
        doc = fitz.open(pdf_path)
        
        # Step 1: Classify each page
        page_classifications = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = extract_text_with_layout(page)
            doc_type, confidence = classify_page_with_keywords(text)
            page_classifications.append(DocumentPage(page_num, text, doc_type, confidence))
        
        # Step 2: Detect document boundaries
        boundaries = detect_document_boundaries(doc, page_classifications)
        
        # Step 3: Split the PDF by boundaries
        result_files = split_pdf_by_boundaries(doc, boundaries, upload_id)
        
        doc.close()
        return result_files
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise e

async def split_pdf_handler(file_content: bytes) -> Dict[str, Any]:
    """Handle PDF splitting."""
    try:
        # Generate a unique ID for this upload
        upload_id = base64.urlsafe_b64encode(os.urandom(8)).decode('ascii')
        
        # Write the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        # Process the PDF
        result_files = process_pdf(temp_path, upload_id)
        
        # Clean up the temp file
        os.unlink(temp_path)
        
        return {
            "success": True,
            "message": f"Successfully split into {len(result_files)} documents",
            "files": result_files
        }
        
    except Exception as e:
        print(f"Error in split_pdf_handler: {str(e)}")
        return {
            "success": False,
            "message": f"Error processing PDF: {str(e)}"
        }

# API route handler (for Next.js API route)
async def handle_api_request(request):
    try:
        # Parse the request body to get the file content
        body = await request.body()
        
        # Call the PDF splitting function
        result = await split_pdf_handler(body)
        
        return result
    except Exception as e:
        print(f"API Error: {str(e)}")
        return {
            "success": False,
            "message": f"Server error: {str(e)}"
        }