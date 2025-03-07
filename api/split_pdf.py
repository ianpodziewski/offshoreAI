import fitz  # PyMuPDF
import json
import os
import spacy
from http.server import BaseHTTPRequestHandler

# Load NLP model
nlp = spacy.load("en_core_web_sm")

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

# Define a function to check if a given text is a header
def is_header(text):
    """
    Determines if the given text is a section header.
    Uses NLP to check structure (short, capitalized, meaningful).
    """
    doc = nlp(text)
    is_short = len(text) < 60  # Headers are usually short
    is_title_case = text.istitle() or text.isupper()  # Headers often in title case
    return is_short and is_title_case

def classify_section(text):
    """
    Classifies text using Spacy's built-in word vectors for similarity matching.
    """
    doc = nlp(text)
    best_match = None
    best_score = -1  # Track highest similarity

    for keyword in document_keywords.keys():
        keyword_doc = nlp(keyword)
        score = doc.similarity(keyword_doc)  # Spacy similarity comparison
        if score > best_score:
            best_score = score
            best_match = document_keywords[keyword]

    return best_match if best_score > 0.75 else None  # Only return if above threshold

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read PDF data
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # Save uploaded PDF temporarily
            upload_path = os.path.join(os.getcwd(), "uploaded_package.pdf")
            with open(upload_path, "wb") as f:
                f.write(pdf_data)

            doc = fitz.open(upload_path)
            split_folder = os.path.join(os.getcwd(), "split_docs")
            os.makedirs(split_folder, exist_ok=True)

            # We only check the top portion of each page for a heading
            TOP_PORTION = 0.3

            current_doc_name = "unclassified"
            current_group_pages = []
            groups = []  # Each element: {"doc_name": <name>, "pages": [list_of_pages]}
            doc_counts = {}

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_height = page.rect.height
                blocks = page.get_text("blocks")  # (x0, y0, x1, y1, text, block_no)

                # Gather text in the top 30% of the page
                top_text = []
                for block in blocks:
                    if block[1] < page_height * TOP_PORTION:
                        top_text.append(block[4].strip())

                combined_top_text = "\n".join(top_text)

                if not combined_top_text.strip():
                    continue  # Skip empty pages

                # Check for NLP-based heading detection
                detected_header = None
                for line in combined_top_text.split("\n"):
                    if is_header(line):  # Use NLP to check structure
                        detected_header = classify_section(line)  # Classify header using similarity
                        if detected_header:
                            break  # Stop checking if a match is found

                if detected_header:
                    if detected_header != current_doc_name:
                        if current_group_pages:
                            groups.append({
                                "doc_name": current_doc_name,
                                "pages": current_group_pages
                            })
                            current_group_pages = []
                        current_doc_name = detected_header

                # Add page to current doc
                current_group_pages.append(page_num)

            # Flush last doc
            if current_group_pages:
                groups.append({
                    "doc_name": current_doc_name,
                    "pages": current_group_pages
                })

            # Now save each group
            saved_files = []
            for g in groups:
                base_name = g["doc_name"]
                doc_counts[base_name] = doc_counts.get(base_name, 0) + 1
                suffix = f"_{doc_counts[base_name]}" if doc_counts[base_name] > 1 else ""
                filename = f"{base_name}{suffix}.pdf"

                new_doc = fitz.open()
                for page in g["pages"]:
                    new_doc.insert_pdf(doc, from_page=page, to_page=page)
                
                new_doc_path = os.path.join(split_folder, filename)
                new_doc.save(new_doc_path)
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
