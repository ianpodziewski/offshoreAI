import pdfplumber
import json
import os
import requests
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler

TEMP_DIR = "/tmp/"
VERCEL_BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN")

# Updated dictionary for known document keywords
DOCUMENT_KEYWORDS = {
    "lender's closing instructions": "lenders_closing_instructions",
    "promissory note": "promissory_note",
    "deed of trust": "deed_of_trust",
    "hud-1 settlement statement": "addendum_hud1_settlement_statement",
    "adjustable rate note": "adjustable_rate_note",
    "home equity conversion loan agreement": "home_equity_conversion_loan_agreement",
    "flood insurance": "flood_insurance_certificate_notice",
    "name affidavit": "name_affidavit",
    "signature affidavit": "signature_affidavit",
    "mailing address affidavit": "mailing_address_affidavit",
    "compliance agreement": "compliance_agreement",
    "notice of right to cancel": "notice_of_right_to_cancel",
    "truth in lending": "truth_in_lending_disclosure",
    "closing disclosure": "closing_disclosure",
    "settlement statement": "settlement_statement",
    "hud/va addendum to uniform residential loan application": "hud_va_addendum",
    "direct endoremsent approval": "endorsement_approval",
    "tax and insurance disclosure": "tax_insurance_disclosure",
    "hecm-fnma submission": "hecm_fnma_sub"
}

# Updated FILE_SOCKETS categorization
FILE_SOCKETS = {
    "legal": [
        "lenders_closing_instructions",
        "deed_of_trust",
        "adjustable_rate_note",
        "compliance_agreement"
    ],
    "financial": [
        "addendum_hud1_settlement_statement",
        "closing_disclosure",
        "settlement_statement",
        "truth_in_lending_disclosure",
        "tax_insurance_disclosure",
        "hecm_fnma_sub",
        "hud_va_addendum",
        "endorsement_approval"
    ],
    "identity": [
        "name_affidavit",
        "signature_affidavit",
        "mailing_address_affidavit"
    ],
    "insurance": [
        "flood_insurance_certificate_notice"
    ],
    "loan": [
        "promissory_note",
        "home_equity_conversion_loan_agreement"
    ]
}

def upload_to_vercel_blob(filepath):
    """Uploads a file to Vercel Blob and returns its public URL."""
    if not VERCEL_BLOB_TOKEN:
        print("❌ Missing BLOB_READ_WRITE_TOKEN in environment.")
        return None
    filename = os.path.basename(filepath)
    url = f"https://api.vercel.com/v2/blob/{filename}"
    headers = {
        "Authorization": f"Bearer {VERCEL_BLOB_TOKEN}",
        "Content-Type": "application/octet-stream"
    }
    with open(filepath, "rb") as f:
        file_data = f.read()
    response = requests.put(url, headers=headers, data=file_data)
    if response.status_code == 200:
        return response.json().get("url")
    else:
        print(f"❌ Vercel Blob Upload Failed: {response.status_code} {response.text}")
        return None

def get_bold_header(page):
    """
    Extracts words in the top 30% of the page and returns a concatenated header string
    if a sufficient number of words have 'bold' in their fontname.
    """
    words = page.extract_words()
    if not words:
        return None
    top_threshold = page.height * 0.3
    top_words = [w for w in words if w.get("top", 9999) < top_threshold]
    # Filter words with "bold" in their fontname
    bold_words = [w for w in top_words if "bold" in w.get("fontname", "").lower()]
    if not bold_words:
        return None
    # Sort by horizontal position and join the text
    bold_words.sort(key=lambda w: w["x0"])
    header_line = " ".join(w["text"] for w in bold_words)
    return header_line

def is_header_line(line):
    """
    Determines if a line is a header by checking if it's short and all uppercase or title case.
    """
    line_stripped = line.strip()
    if not line_stripped:
        return False
    return len(line_stripped) < 80 and (line_stripped.isupper() or line_stripped.istitle())

def classify_header(header_line):
    """
    Matches a header line against known document keywords.
    """
    text_lower = header_line.lower()
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        if keyword in text_lower:
            return doc_type
    return None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # 1. Save the uploaded PDF
            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            # 2. Open the PDF with pdfplumber for header detection
            pdf_plumber = pdfplumber.open(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            doc_counts = {}
            groups = []
            current_doc_name = "unclassified"

            # Loop through pages to detect headers and assign document types
            for i, page in enumerate(pdf_plumber.pages):
                # Try bold header detection first
                header_line = get_bold_header(page)
                detected_doc_type = None
                if header_line:
                    detected_doc_type = classify_header(header_line)
                # Fallback: check first 5 lines of text if no bold header found
                if not detected_doc_type:
                    full_text = page.extract_text() or ""
                    lines = full_text.split("\n")
                    for line in lines[:5]:
                        if is_header_line(line):
                            detected_doc_type = classify_header(line)
                            if detected_doc_type:
                                break
                # If a new doc type is detected, update current_doc_name
                if detected_doc_type and detected_doc_type != current_doc_name:
                    current_doc_name = detected_doc_type
                groups.append({"doc_name": current_doc_name, "page_index": i})
            pdf_plumber.close()

            # 3. Group consecutive pages with the same doc type
            from PyPDF2 import PdfReader, PdfWriter
            local_reader = PdfReader(upload_path)
            final_groups = []
            last_doc_name = None
            current_pages = []
            for g in groups:
                doc_name = g["doc_name"]
                page_idx = g["page_index"]
                if doc_name != last_doc_name:
                    if current_pages:
                        final_groups.append({"doc_name": last_doc_name, "pages": current_pages})
                    current_pages = [page_idx]
                    last_doc_name = doc_name
                else:
                    current_pages.append(page_idx)
            if current_pages:
                final_groups.append({"doc_name": last_doc_name, "pages": current_pages})

            # 4. Save each group to a PDF and upload to Vercel Blob
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
                else:
                    print(f"❌ Could not upload {new_doc_path} to Vercel Blob.")

            # 5. Debug log local groups
            if os.path.exists(split_folder):
                print("✅ /tmp/split_docs/ directory exists.")
                for cat in os.listdir(split_folder):
                    cat_path = os.path.join(split_folder, cat)
                    if os.path.isdir(cat_path):
                        print(f"📁 {cat} contains:", os.listdir(cat_path))

            # 6. Return public URLs to the frontend
            response = {
                "message": "PDF split and categorized successfully.",
                "files": public_urls
            }
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            print("❌ ERROR in split_pdf:", str(e))
            response = {"message": f"Server Error: {str(e)}"}
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
