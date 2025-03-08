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
        if fuzz.partial_ratio(norm_line, normalize_text(keyword)) > 80:
            return doc_type
    return None

def full_text_classification(full_text):
    norm_text = normalize_text(full_text)
    best_match = None
    best_score = 0
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        score = fuzz.partial_ratio(norm_text, normalize_text(keyword))
        if score > best_score and score > 80:
            best_score = score
            best_match = doc_type
    return best_match

def get_embedding_classification(text):
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.embeddings.create(input=text, model="text-embedding-ada-002")
        embedding = response['data'][0]['embedding']
        return embedding  # Save embeddings for later use
    except Exception as e:
        print(f"❌ OpenAI Embedding Error: {e}")
        return None

def smooth_classifications(classifications):
    smoothed = classifications.copy()
    for i in range(1, len(classifications) - 1):
        prev = classifications[i - 1]["doc_name"]
        curr = classifications[i]["doc_name"]
        nxt = classifications[i + 1]["doc_name"]
        if curr == "unclassified" and prev == nxt and prev != "unclassified":
            smoothed[i]["doc_name"] = prev
    return smoothed

def upload_to_vercel_blob(filepath):
    if not VERCEL_BLOB_TOKEN:
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
            for i, page in enumerate(pdf_plumber_obj.pages):
                full_text = page.extract_text() or ""
                detected_doc_type = full_text_classification(full_text)
                
                if not detected_doc_type:
                    detected_doc_type = "unclassified"
                
                page_classifications.append({"doc_name": detected_doc_type, "page_index": i})
            pdf_plumber_obj.close()
            
            page_classifications = smooth_classifications(page_classifications)
            
            final_groups = []
            if page_classifications:
                current_group = [page_classifications[0]["page_index"]]
                current_doc_type = page_classifications[0]["doc_name"]
                for prev, current in zip(page_classifications, page_classifications[1:]):
                    if current["doc_name"] == current_doc_type and current["page_index"] == prev["page_index"] + 1:
                        current_group.append(current["page_index"])
                    else:
                        final_groups.append({"doc_name": current_doc_type, "pages": current_group})
                        current_group = [current["page_index"]]
                        current_doc_type = current["doc_name"]
                final_groups.append({"doc_name": current_doc_type, "pages": current_group})
            
            local_reader = PdfReader(upload_path)
            doc_counts = {}
            public_urls = []
            for group in final_groups:
                base_name = group["doc_name"]
                doc_counts[base_name] = doc_counts.get(base_name, 0) + 1
                suffix = f"_{doc_counts[base_name]}" if doc_counts[base_name] > 1 else ""
                filename = f"{base_name}{suffix}.pdf"
                pdf_writer = PdfWriter()
                for p in group["pages"]:
                    pdf_writer.add_page(local_reader.pages[p])
                new_doc_path = os.path.join(split_folder, filename)
                with open(new_doc_path, "wb") as f:
                    pdf_writer.write(f)
                file_url = upload_to_vercel_blob(new_doc_path)
                if file_url:
                    public_urls.append(file_url)
            
            response = {"message": "PDF split and categorized successfully.", "files": public_urls}
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
