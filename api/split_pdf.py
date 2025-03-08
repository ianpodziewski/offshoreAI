import pdfplumber
import json
import os
import requests
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler

TEMP_DIR = "/tmp/"

# Read/Write token for Vercel Blob
VERCEL_BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN")

# Categorized storage paths
FILE_SOCKETS = {
    "legal": ["deed_of_trust", "adjustable_rate_note", "compliance_agreement"],
    "financial": ["hud1_settlement_statement", "closing_disclosure", "truth_in_lending_disclosure"],
    "identity": ["name_affidavit", "signature_affidavit", "mailing_address_affidavit"],
    "insurance": ["flood_insurance_certificate_notice"],
    "loan": ["promissory_note", "home_equity_conversion_loan_agreement"]
}

def get_category(doc_type):
    """Determine the category of a document type."""
    for category, docs in FILE_SOCKETS.items():
        if doc_type in docs:
            return category
    return "uncategorized"

def classify_section(text):
    """Classifies text based on keyword matching."""
    text_lower = text.lower()
    for category, doc_types in FILE_SOCKETS.items():
        for doc_type in doc_types:
            # Flexible match: 'deed_of_trust' -> 'deed of trust'
            if doc_type.replace("_", " ") in text_lower:
                return doc_type
    return "unclassified"

def upload_to_vercel_blob(filepath):
    """
    Uploads a file to Vercel Blob and returns its public URL.
    Docs: https://vercel.com/docs/storage/blob
    """
    if not VERCEL_BLOB_TOKEN:
        print("❌ Missing BLOB_READ_WRITE_TOKEN in environment.")
        return None

    # Example path name: "deed_of_trust_1.pdf"
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
        blob_info = response.json()
        # blob_info should contain {"url": "...public URL..."}
        return blob_info.get("url")
    else:
        print(f"❌ Vercel Blob Upload Failed: {response.status_code} {response.text}")
        return None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # 1. Save the uploaded PDF to /tmp/
            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            # 2. Split PDF locally
            pdf_reader = PdfReader(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            doc_counts = {}
            groups = []
            current_doc_name = "unclassified"

            # Classify each page
            for i, page in enumerate(pdf_reader.pages):
                extracted_text = page.extract_text() or ""
                detected_doc_type = classify_section(extracted_text)

                if detected_doc_type != current_doc_name:
                    current_doc_name = detected_doc_type

                groups.append({"doc_name": current_doc_name, "page": i})

            # 3. For each group, save locally, then upload to Blob
            public_urls = []
            for g in groups:
                base_name = g["doc_name"]
                category = get_category(base_name)
                doc_counts[base_name] = doc_counts.get(base_name, 0) + 1
                suffix = f"_{doc_counts[base_name]}" if doc_counts[base_name] > 1 else ""
                filename = f"{base_name}{suffix}.pdf"

                category_folder = os.path.join(split_folder, category)
                os.makedirs(category_folder, exist_ok=True)

                pdf_writer = PdfWriter()
                pdf_writer.add_page(pdf_reader.pages[g["page"]])

                new_doc_path = os.path.join(category_folder, filename)
                with open(new_doc_path, "wb") as f:
                    pdf_writer.write(f)

                # 4. Upload to Vercel Blob
                file_url = upload_to_vercel_blob(new_doc_path)
                if file_url:
                    public_urls.append(file_url)
                else:
                    print(f"❌ Could not upload {new_doc_path} to Vercel Blob.")

            # Debug: local logs
            if os.path.exists(split_folder):
                print("✅ /tmp/split_docs/ directory exists.")
                for c in os.listdir(split_folder):
                    c_path = os.path.join(split_folder, c)
                    if os.path.isdir(c_path):
                        print(f"📁 {c} =>", os.listdir(c_path))

            # 5. Return public URLs to the frontend
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
