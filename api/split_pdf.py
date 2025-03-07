import pdfplumber
import json
import os
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler

# Define a writable temp directory
TEMP_DIR = "/tmp/"

# Section classification dictionary
document_keywords = {
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

def extract_text_from_page(page):
    """Extracts text from a PDF page using pdfplumber."""
    with pdfplumber.open(page) as pdf:
        return pdf.pages[0].extract_text() if pdf.pages else ""

def classify_section(text):
    """Classifies text based on simple keyword matching."""
    text_lower = text.lower()
    for keyword in document_keywords.keys():
        if keyword in text_lower:
            return document_keywords[keyword]
    return "unclassified"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read PDF data from request
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # Save uploaded PDF to Vercel's writable /tmp/ directory
            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            # Read PDF
            pdf_reader = PdfReader(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            current_doc_name = "unclassified"
            current_group_pages = []
            groups = []
            doc_counts = {}

            for i, page in enumerate(pdf_reader.pages):
                extracted_text = extract_text_from_page(upload_path)
                detected_header = classify_section(extracted_text)

                if detected_header != current_doc_name:
                    if current_group_pages:
                        groups.append({"doc_name": current_doc_name, "pages": current_group_pages})
                        current_group_pages = []
                    current_doc_name = detected_header

                current_group_pages.append(i)

            if current_group_pages:
                groups.append({"doc_name": current_doc_name, "pages": current_group_pages})

            saved_files = []
            for g in groups:
                base_name = g["doc_name"]
                doc_counts[base_name] = doc_counts.get(base_name, 0) + 1
                suffix = f"_{doc_counts[base_name]}" if doc_counts[base_name] > 1 else ""
                filename = f"{base_name}{suffix}.pdf"

                pdf_writer = PdfWriter()
                for page_num in g["pages"]:
                    pdf_writer.add_page(pdf_reader.pages[page_num])

                new_doc_path = os.path.join(split_folder, filename)
                with open(new_doc_path, "wb") as f:
                    pdf_writer.write(f)
                saved_files.append(new_doc_path)

            response = {
                "message": "PDF split successfully.",
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
