import pdfplumber
import json
import os
import requests
import string
from collections import defaultdict
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler
from rapidfuzz import fuzz
from openai import OpenAI

TEMP_DIR = "/tmp/"
VERCEL_BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Expanded document keyword dictionary
DOCUMENT_KEYWORDS = {
    "lender's closing instructions": "lenders_closing_instructions",
    "closing instructions": "lenders_closing_instructions",
    "promissory note": "promissory_note",
    "deed of trust": "deed_of_trust",
    "settlement statement": "settlement_statement",
    "closing disclosure": "closing_disclosure",
    "truth in lending": "truth_in_lending_disclosure",
    "compliance agreement": "compliance_agreement",
    "notice of right to cancel": "notice_of_right_to_cancel",
    "invoice": "invoice"
}

# Categorization mapping
FILE_SOCKETS = {
    "legal": ["lenders_closing_instructions", "deed_of_trust", "compliance_agreement"],
    "financial": ["settlement_statement", "closing_disclosure", "truth_in_lending_disclosure"],
    "loan": ["promissory_note"],
    "misc": ["invoice"]
}

def normalize_text(text):
    return text.lower().translate(str.maketrans("", "", string.punctuation)).strip()

def classify_header(header_line):
    norm_line = normalize_text(header_line)
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        score = fuzz.partial_ratio(norm_line, normalize_text(keyword))
        print(f"DEBUG: Checking header match '{header_line}' -> '{keyword}' | Score: {score}")
        if score > 80:
            return doc_type
    return None

def full_text_classification(full_text):
    norm_text = normalize_text(full_text)
    best_match = None
    best_score = 0
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        score = fuzz.partial_ratio(norm_text, normalize_text(keyword))
        print(f"DEBUG: Checking full-text match '{keyword}' | Score: {score}")
        if score > best_score and score > 80:
            best_score = score
            best_match = doc_type
    return best_match

def smooth_classifications(classifications):
    smoothed = classifications.copy()
    for i in range(1, len(classifications) - 1):
        prev = classifications[i - 1]["doc_name"]
        curr = classifications[i]["doc_name"]
        nxt = classifications[i + 1]["doc_name"]
        if curr == "unclassified" and prev == nxt and prev != "unclassified":
            smoothed[i]["doc_name"] = prev
            print(f"DEBUG: Smoothing page {classifications[i]['page_index']+1} to '{prev}'")
    return smoothed

def upload_to_vercel_blob(filepath):
    if not VERCEL_BLOB_TOKEN:
        print("❌ Missing Vercel Blob Token")
        return None
    filename = os.path.basename(filepath)
    url = f"https://api.vercel.com/v2/blob/{filename}"
    headers = {"Authorization": f"Bearer {VERCEL_BLOB_TOKEN}", "Content-Type": "application/octet-stream"}
    with open(filepath, "rb") as f:
        response = requests.put(url, headers=headers, data=f.read())
    return response.json().get("url") if response.status_code == 200 else None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)
            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)
            
            pdf_plumber_obj = pdfplumber.open(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)
            
            page_classifications = []
            public_urls = []
            for i, page in enumerate(pdf_plumber_obj.pages):
                full_text = page.extract_text() or ""
                detected_doc_type = full_text_classification(full_text)
                
                if not detected_doc_type:
                    detected_doc_type = "unclassified"
                
                print(f"DEBUG: Page {i+1} classified as {detected_doc_type}")
                page_classifications.append({"doc_name": detected_doc_type, "page_index": i})
            pdf_plumber_obj.close()
            
            page_classifications = smooth_classifications(page_classifications)
            
            for group in page_classifications:
                doc_name = group["doc_name"]
                filename = f"{doc_name}.pdf"
                file_url = upload_to_vercel_blob(os.path.join(split_folder, filename))
                if file_url:
                    public_urls.append({"name": filename, "url": file_url})
            
            print("DEBUG: Final document classification groups:", page_classifications)
            
            response = {"message": "PDF split and categorized successfully.", "classification": page_classifications, "files": public_urls}
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            response = {"message": f"Server Error: {str(e)}"}
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
