import pdfplumber
import json
import os
import requests
import string
from PyPDF2 import PdfReader, PdfWriter
from http.server import BaseHTTPRequestHandler

TEMP_DIR = "/tmp/"
VERCEL_BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN")

# Expanded dictionary for known document keywords (loosened matching)
DOCUMENT_KEYWORDS = {
    "lender's closing instructions": "lenders_closing_instructions",
    "lender s closing instructions": "lenders_closing_instructions",  # extra variation
    "promissory note": "promissory_note",
    "deed of trust": "deed_of_trust",
    "second deed of trust": "second_deed_of_trust",
    "hud-1 settlement statement": "settlement_statement",
    "adjustable rate note": "adjustable_rate_note",
    "adjustable rate second note": "adjustable_rate_second_note",
    "home equity conversion loan agreement": "home_equity_conversion_loan_agreement",
    "flood insurance": "flood_insurance_certificate_notice",
    "name affidavit": "name_affidavit",
    "signature affidavit": "signature_affidavit",
    "mailing address affidavit": "mailing_address_affidavit",
    "compliance agreement": "compliance_agreement",
    "notice of right to cancel": "notice_of_right_to_cancel",
    "truth in lending": "truth_in_lending_disclosure",
    "closing disclosure": "closing_disclosure",
    "hud/va addendum to uniform residential loan application": "hud_va_addendum",
    "direct endorsement approval": "endorsement_approval",
    "tax and insurance disclosure": "tax_insurance_disclosure",
    "hecm-fnma submission": "hecm_fnma_sub",
    "allonge": "allonge",
    "hold harmless agreement": "hold_harmless_agreement",
    "home equity conversion mortgage disclosure": "hecm_third_party_fees",
    "borrower certification regarding third party fees": "hecm_third_party_fees",
    "electronic fund transfer request": "electronic_fund_transfer_request",
    "equal credit opportunity act": "equal_credit_opportunity_notice",
    "choice of insurance option": "choice_of_insurance_option",
    "notice to the borrower": "notice_to_borrower",
    "lender certificate": "lender_certificate",
    "confirmation": "confirmation",
    "notice of assignment": "notice_of_assignment_servicing_rights",
    "servicing rights": "notice_of_assignment_servicing_rights",
    "hotel and transient": "borrowers_hotel_transient_contract",
    "invoice": "invoice"
}

# Updated categorization mapping
FILE_SOCKETS = {
    "legal": [
        "lenders_closing_instructions",
        "deed_of_trust",
        "second_deed_of_trust",
        "allonge",
        "adjustable_rate_note",  # original note remains legal
        "compliance_agreement",
        "hold_harmless_agreement",
        "borrowers_hotel_transient_contract"
    ],
    "financial": [
        "settlement_statement",
        "closing_disclosure",
        "truth_in_lending_disclosure",
        "tax_insurance_disclosure",
        "hecm_fnma_sub",
        "hud_va_addendum",
        "endorsement_approval",
        "electronic_fund_transfer_request",
        "equal_credit_opportunity_notice",
        "choice_of_insurance_option",
        "notice_to_borrower",
        "lender_certificate",
        "confirmation",
        "notice_of_assignment_servicing_rights",
        "invoice",
        "hecm_third_party_fees"
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
        "home_equity_conversion_loan_agreement",
        "adjustable_rate_second_note"
    ]
}

def normalize_text(text):
    """Lowercases and removes punctuation for looser matching."""
    return text.lower().translate(str.maketrans("", "", string.punctuation)).strip()

def classify_header(header_line):
    """Matches a header line against known document keywords using normalized text."""
    norm_line = normalize_text(header_line)
    for keyword, doc_type in DOCUMENT_KEYWORDS.items():
        norm_keyword = normalize_text(keyword)
        if norm_keyword in norm_line:
            return doc_type
    return None

def is_header_line(line):
    """
    Determines if a line is likely a header.
    For example, if it's short (<80 characters) and in uppercase or title case.
    """
    line_stripped = line.strip()
    if not line_stripped:
        return False
    return len(line_stripped) < 80 and (line_stripped.isupper() or line_stripped.istitle())

def get_bold_header(page):
    """
    Extracts words from the top 30% of the page with 'bold' in their fontname.
    Returns a concatenated header line if found.
    """
    words = page.extract_words()
    if not words:
        return None
    top_threshold = page.height * 0.3
    top_words = [w for w in words if w.get("top", 9999) < top_threshold]
    bold_words = [w for w in top_words if "bold" in w.get("fontname", "").lower()]
    if not bold_words:
        return None
    bold_words.sort(key=lambda w: w["x0"])
    header_line = " ".join(w["text"] for w in bold_words)
    return header_line

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

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # 1. Save the uploaded PDF to /tmp/
            upload_path = os.path.join(TEMP_DIR, "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            # 2. Open PDF with pdfplumber for header detection
            pdf_plumber = pdfplumber.open(upload_path)
            split_folder = os.path.join(TEMP_DIR, "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            doc_counts = {}
            page_classifications = []  # List of {"doc_name": ..., "page_index": ...}

            # Loop over each page to detect a header
            for i, page in enumerate(pdf_plumber.pages):
                detected_doc_type = None
                # Try bold header extraction first
                header_line = get_bold_header(page)
                if header_line:
                    detected_doc_type = classify_header(header_line)
                    print(f"DEBUG: Page {i+1}: Bold header line: '{header_line}' -> Classified as: {detected_doc_type}")
                # Fallback: scan first 5 lines if no bold header found
                if not detected_doc_type:
                    full_text = page.extract_text() or ""
                    lines = full_text.split("\n")
                    for line in lines[:5]:
                        if is_header_line(line):
                            detected_doc_type = classify_header(line)
                            if detected_doc_type:
                                print(f"DEBUG: Page {i+1}: Fallback header line: '{line}' -> Classified as: {detected_doc_type}")
                                break
                if not detected_doc_type:
                    print(f"DEBUG: Page {i+1}: No valid header found; defaulting to 'unclassified'")
                    detected_doc_type = "unclassified"
                page_classifications.append({"doc_name": detected_doc_type, "page_index": i})
            pdf_plumber.close()

            # 3. Group only contiguous pages with the same classification.
            final_groups = []
            if page_classifications:
                current_group = [page_classifications[0]["page_index"]]
                current_doc_type = page_classifications[0]["doc_name"]
                for prev, current in zip(page_classifications, page_classifications[1:]):
                    # Only group if the same doc type AND pages are consecutive
                    if current["doc_name"] == current_doc_type and current["page_index"] == prev["page_index"] + 1:
                        current_group.append(current["page_index"])
                    else:
                        final_groups.append({"doc_name": current_doc_type, "pages": current_group})
                        current_group = [current["page_index"]]
                        current_doc_type = current["doc_name"]
                # Append the last group
                final_groups.append({"doc_name": current_doc_type, "pages": current_group})

            print("DEBUG: Final Groupings:")
            for group in final_groups:
                print(f"Document type '{group['doc_name']}' covers pages: {group['pages']}")

            # 4. For each group, save the PDF and upload to Vercel Blob.
            local_reader = PdfReader(upload_path)
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

            # 5. Debug: Log the local split_docs structure.
            if os.path.exists(split_folder):
                print("✅ /tmp/split_docs/ directory exists.")
                for item in os.listdir(split_folder):
                    print(f"📄 {item}")

            # 6. Return the public URLs.
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
