import pdfplumber
import json
import os
import requests
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler

TEMP_DIR = "/tmp/"
VERCEL_BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN")

# Example dictionary for known doc types
DOCUMENT_KEYWORDS = {
    "lender's closing instructions": "lenders_closing_instructions",
    "promissory note": "promissory_note",
    "deed of trust": "deed_of_trust",
    "hud-1 settlement statement": "hud1_settlement_statement",
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

def is_header(line):
    """
    Decide if 'line' is a potential header by checking:
    - short length (e.g., < 80 chars)
    - uppercase or title-case
    You could also do a 'bold' check if using word-level pdfplumber data.
    """
    line_stripped = line.strip()
    if not line_stripped:
        return False

    # Example logic: short and uppercase
    if len(line_stripped) < 80 and line_stripped.isupper():
        return True

    return False

def classify_header(header_line):
    """Match a header line to known doc types by keywords."""
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

            # 2. Use pdfplumber to read each page
            pdf_reader = pdfplumber.open(upload_path)  # pdfplumber usage
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            doc_counts = {}
            groups = []
            current_doc_name = "unclassified"

            # For each page, look in top portion for a heading
            for i, page in enumerate(pdf_reader.pages):
                # Extract entire page text
                full_text = page.extract_text() or ""
                # Grab the top portion of the text (e.g., first ~30% lines)
                lines = full_text.split("\n")
                top_lines = lines[:5]  # check first 5 lines for a heading

                detected_header = None
                for line in top_lines:
                    if is_header(line):
                        # If we found a heading, classify it
                        doc_type = classify_header(line)
                        if doc_type:
                            detected_header = doc_type
                            break

                # If we found a new doc type, switch
                if detected_header and detected_header != current_doc_name:
                    current_doc_name = detected_header

                # Append page with the current doc name
                groups.append({"doc_name": current_doc_name, "page_index": i})

            pdf_reader.close()

            # 3. Save each group of pages to a PDF, then upload to Blob
            from PyPDF2 import PdfReader, PdfWriter
            local_reader = PdfReader(upload_path)

            # We'll create final "chunks" by grouping consecutive pages with same doc_name
            final_groups = []
            last_doc_name = None
            current_pages = []

            for g in groups:
                doc_name = g["doc_name"]
                page_idx = g["page_index"]

                if doc_name != last_doc_name:
                    # start a new group
                    if current_pages:
                        final_groups.append({"doc_name": last_doc_name, "pages": current_pages})
                    current_pages = [page_idx]
                    last_doc_name = doc_name
                else:
                    # same doc, keep appending
                    current_pages.append(page_idx)

            # Add the final group
            if current_pages:
                final_groups.append({"doc_name": last_doc_name, "pages": current_pages})

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

                # Upload to Vercel Blob
                file_url = upload_to_vercel_blob(new_doc_path)
                if file_url:
                    public_urls.append(file_url)

            # 4. Return public URLs
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
