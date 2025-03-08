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
    "legal": [
        "lenders_closing_instructions",
        "deed_of_trust",
        "compliance_agreement"
    ],
    "financial": [
        "settlement_statement",
        "closing_disclosure",
        "truth_in_lending_disclosure"
    ],
    "loan": [
        "promissory_note"
    ],
    "misc": [
        "invoice"
    ]
}

def normalize_text(text):
    """Lowercases and removes punctuation/spaces for more accurate fuzzy matching."""
    return text.lower().translate(str.maketrans("", "", string.punctuation)).strip()

def get_bold_header(page):
    """
    Attempt to extract any bold text near the top of the page.
    This is optional logic that can improve classification if pages
    have bold headings.
    """
    words = page.extract_words() or []
    # Limit to top 25% of the page
    page_top_cutoff = page.height * 0.25
    bold_candidates = []
    for w in words:
        # 'fontname' can vary, so "bold" or "black" might be an indicator
        if w.get("top", 9999) < page_top_cutoff and "bold" in w.get("fontname", "").lower():
            bold_candidates.append(w["text"])
    if not bold_candidates:
        return None
    # Join all bold words to form a header line
    return " ".join(bold_candidates)

def classify_header(header_line):
    """
    Use token_set_ratio to better handle reordering of words or extra words.
    """
    if not header_line:
        return None
    norm_line = normalize_text(header_line)
    best_match = None
    best_score = 0
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        score = fuzz.token_set_ratio(norm_line, normalize_text(keyword))
        if score > best_score and score > 80:
            best_score = score
            best_match = doc_type
    return best_match

def full_text_classification(full_text):
    norm_text = normalize_text(full_text)
    best_match = None
    best_score = 0
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        # Using token_set_ratio for slightly more robust matching
        score = fuzz.token_set_ratio(norm_text, normalize_text(keyword))
        if score > best_score and score > 80:
            best_score = score
            best_match = doc_type
    return best_match

def get_embedding_classification(text):
    """
    Optional fallback classification using OpenAI embeddings.
    Currently returns just the embedding, but you could compare
    embeddings with known doc_type embeddings if you store them.
    """
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.embeddings.create(input=text, model="text-embedding-ada-002")
        embedding = response['data'][0]['embedding']
        # For actual classification, you could implement a similarity check vs known doc_type embeddings.
        return "unclassified"  # Placeholder
    except Exception as e:
        print(f"❌ OpenAI Embedding Error: {e}")
        return None

def classify_page(page):
    """
    Attempts to classify a page by:
    1. Checking bold header text
    2. Falling back to a full text classification
    3. Optionally falling back to embedding-based classification
    """
    header_text = get_bold_header(page)
    if header_text:
        doc_type = classify_header(header_text)
        if doc_type:
            return doc_type
    
    # Fallback: full text
    full_text = page.extract_text() or ""
    doc_type = full_text_classification(full_text)
    if doc_type:
        return doc_type
    
    # Optional final fallback: embedding approach
    # embed_type = get_embedding_classification(full_text[:1000])  # limiting text length
    # if embed_type:
    #     return embed_type
    
    return "unclassified"

def smooth_classifications(classifications):
    """
    After classifying each page, we do a second pass:
    1. If a page is 'unclassified' but both neighbors have the same doc_type,
       assign this doc_type to the page.
    2. (Optional) If doc_type differs from neighbors but is very similar,
       we could unify them as well.
    """
    smoothed = classifications.copy()
    for i in range(1, len(classifications) - 1):
        prev = classifications[i - 1]["doc_name"]
        curr = classifications[i]["doc_name"]
        nxt = classifications[i + 1]["doc_name"]
        # Merge unclassified
        if curr == "unclassified" and prev == nxt and prev != "unclassified":
            smoothed[i]["doc_name"] = prev
    return smoothed

def upload_to_vercel_blob(filepath):
    if not VERCEL_BLOB_TOKEN:
        return None
    filename = os.path.basename(filepath)
    url = f"https://api.vercel.com/v2/blob/{filename}"
    headers = {
        "Authorization": f"Bearer {VERCEL_BLOB_TOKEN}",
        "Content-Type": "application/octet-stream"
    }
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

            # Classify each page
            page_classifications = []
            for i, page in enumerate(pdf_plumber_obj.pages):
                doc_type = classify_page(page)
                page_classifications.append({
                    "doc_name": doc_type or "unclassified",
                    "page_index": i
                })
            pdf_plumber_obj.close()

            # Smooth out misclassifications
            page_classifications = smooth_classifications(page_classifications)

            # Group contiguous pages with same classification
            final_groups = []
            if page_classifications:
                current_group = [page_classifications[0]["page_index"]]
                current_doc_type = page_classifications[0]["doc_name"]
                for prev, current in zip(page_classifications, page_classifications[1:]):
                    if (
                        current["doc_name"] == current_doc_type
                        and current["page_index"] == prev["page_index"] + 1
                    ):
                        current_group.append(current["page_index"])
                    else:
                        final_groups.append({
                            "doc_name": current_doc_type,
                            "pages": current_group
                        })
                        current_group = [current["page_index"]]
                        current_doc_type = current["doc_name"]
                # Append the last group
                final_groups.append({
                    "doc_name": current_doc_type,
                    "pages": current_group
                })

            # Save and upload grouped PDFs
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

            # Return final response with public URLs
            response = {
                "message": "PDF split and categorized successfully.",
                "classification": page_classifications,
                "files": public_urls
            }
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
