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

# Updated dictionary: new keywords for HUD/VA Addendum & HECM-FNMA Submission
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
    "invoice": "invoice",

    # Newly added:
    "hud/va addendum to uniform residential loan application": "hud_va_addendum",
    "hud va addendum": "hud_va_addendum",
    "hecm-fnma submission": "hecm_fnma_sub",
    "hecm fnma submission": "hecm_fnma_sub"
}

# Expanded categorization mapping
FILE_SOCKETS = {
    "legal": [
        "lenders_closing_instructions",
        "deed_of_trust",
        "compliance_agreement"
    ],
    "financial": [
        "settlement_statement",
        "closing_disclosure",
        "truth_in_lending_disclosure",
        "hud_va_addendum"
    ],
    "loan": [
        "promissory_note",
        "hecm_fnma_sub"
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
    Optional logic that can improve classification if pages
    have bold headings.
    """
    words = page.extract_words() or []
    page_top_cutoff = page.height * 0.25
    bold_candidates = []
    for w in words:
        if w.get("top", 9999) < page_top_cutoff and "bold" in w.get("fontname", "").lower():
            bold_candidates.append(w["text"])
    if not bold_candidates:
        return None
    return " ".join(bold_candidates)

def classify_header(header_line):
    """
    Use token_set_ratio for more flexible matching on headers.
    """
    if not header_line:
        return None
    
    norm_line = normalize_text(header_line)
    best_match = None
    best_score = 0

    # Debug log
    print(f"DEBUG: classify_header -> analyzing '{header_line}'")

    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        score = fuzz.token_set_ratio(norm_line, normalize_text(keyword))
        if score > best_score and score > 80:
            best_score = score
            best_match = doc_type
        # Additional debug
        if score > 50:  # Only log "somewhat relevant" matches
            print(f"  => Checking header vs keyword '{keyword}': score {score}")
    print(f"DEBUG: final header doc_type: {best_match}, best_score={best_score}")
    return best_match

def full_text_classification(full_text):
    norm_text = normalize_text(full_text)
    best_match = None
    best_score = 0

    # Debug log
    print(f"DEBUG: full_text_classification -> analyzing text length {len(norm_text)}")

    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        score = fuzz.token_set_ratio(norm_text, normalize_text(keyword))
        if score > best_score and score > 80:
            best_score = score
            best_match = doc_type
        # Additional debug
        if score > 50:
            print(f"  => Checking full_text vs keyword '{keyword}': score {score}")

    print(f"DEBUG: final full_text doc_type: {best_match}, best_score={best_score}")
    return best_match

def get_embedding_classification(text):
    """
    Optional fallback classification using OpenAI embeddings.
    Currently returns just "unclassified", but you could compare
    embeddings with known doc_type embeddings if you store them.
    """
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.embeddings.create(input=text, model="text-embedding-ada-002")
        embedding = response['data'][0]['embedding']
        # Real embedding classification would require comparison logic here
        return "unclassified"  # Placeholder
    except Exception as e:
        print(f"❌ OpenAI Embedding Error: {e}")
        return None

def classify_page(page, page_index):
    """
    Attempts to classify a page by:
    1. Checking bold header text
    2. Falling back to a full text classification
    3. Optionally falling back to embedding-based classification
    """
    print(f"\nDEBUG: classify_page -> Page {page_index + 1}")
    header_text = get_bold_header(page)
    if header_text:
        print(f"DEBUG: extracted bold header text: {header_text}")
        doc_type = classify_header(header_text)
        if doc_type:
            print(f"DEBUG: returning doc_type from header -> {doc_type}")
            return doc_type
    
    # Fallback: full text
    full_text = page.extract_text() or ""
    doc_type = full_text_classification(full_text)
    if doc_type:
        print(f"DEBUG: returning doc_type from full_text -> {doc_type}")
        return doc_type
    
    # Optional final fallback: embedding approach
    # embed_type = get_embedding_classification(full_text[:1000])
    # if embed_type:
    #     print(f"DEBUG: returning doc_type from embeddings -> {embed_type}")
    #     return embed_type
    
    print(f"DEBUG: no doc_type found, defaulting -> unclassified")
    return "unclassified"

def smooth_classifications(classifications):
    """
    After classifying each page, do a second pass:
    1. If a page is 'unclassified' but both neighbors have the same doc_type,
       assign that doc_type to the page.
    """
    print("\nDEBUG: smooth_classifications -> starting smoothing process")
    smoothed = classifications.copy()
    for i in range(1, len(classifications) - 1):
        prev = classifications[i - 1]["doc_name"]
        curr = classifications[i]["doc_name"]
        nxt = classifications[i + 1]["doc_name"]
        if curr == "unclassified" and prev == nxt and prev != "unclassified":
            print(f"  => Smoothing: Page {classifications[i]['page_index']+1} from 'unclassified' to '{prev}'")
            smoothed[i]["doc_name"] = prev
    print("DEBUG: smoothing complete\n")
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
            content_length = int(self.headers["Content-Length"])
            pdf_data = self.rfile.read(content_length)
            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            print("DEBUG: PDF saved to:", upload_path)

            pdf_plumber_obj = pdfplumber.open(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            # Classify each page
            page_classifications = []
            for i, page in enumerate(pdf_plumber_obj.pages):
                doc_type = classify_page(page, i)
                page_classifications.append({
                    "doc_name": doc_type or "unclassified",
                    "page_index": i
                })
            pdf_plumber_obj.close()

            print("\nDEBUG: Initial classifications:")
            for c in page_classifications:
                print(f"  => Page {c['page_index']+1}: {c['doc_name']}")

            # Smooth out misclassifications
            page_classifications = smooth_classifications(page_classifications)

            print("\nDEBUG: Final classifications after smoothing:")
            for c in page_classifications:
                print(f"  => Page {c['page_index']+1}: {c['doc_name']}")

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

            print("\nDEBUG: Final document groups:")
            for fg in final_groups:
                print(f"  => Doc_type: {fg['doc_name']} -> Pages: {fg['pages']}")

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
                print(f"DEBUG: Created {new_doc_path} for pages {group['pages']} with doc_type {base_name}")

                file_url = upload_to_vercel_blob(new_doc_path)
                if file_url:
                    print(f"DEBUG: Uploaded to Vercel Blob -> {file_url}")
                    public_urls.append(file_url)

            # Return final response with public URLs & classification results
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
            print(f"❌ ERROR in split_pdf: {str(e)}")
            response = {"message": f"Server Error: {str(e)}"}
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
