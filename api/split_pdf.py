import pdfplumber
import json
import os
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler

TEMP_DIR = "/tmp/"

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
            if doc_type.replace("_", " ") in text_lower:  # Match flexible naming
                return doc_type
    return "unclassified"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            pdf_reader = PdfReader(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            doc_counts = {}
            groups = []
            current_doc_name = "unclassified"

            # Process and classify sections
            for i, page in enumerate(pdf_reader.pages):
                extracted_text = page.extract_text() or ""
                detected_doc_type = classify_section(extracted_text)

                if detected_doc_type != current_doc_name:
                    current_doc_name = detected_doc_type

                groups.append({"doc_name": current_doc_name, "page": i})

            # Save each document in categorized folders
            saved_files = []
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

                saved_files.append(new_doc_path)

            response = {
                "message": "PDF split and categorized successfully.",
                "files": saved_files
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
