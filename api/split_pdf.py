import fitz
import json
import os
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read PDF data
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # Save uploaded PDF temporarily
            upload_path = '/tmp/uploaded_package.pdf'
            with open(upload_path, 'wb') as f:
                f.write(pdf_data)

            doc = fitz.open(upload_path)
            split_folder = '/tmp/split_docs'
            os.makedirs(split_folder, exist_ok=True)

            # Known headings dictionary (lowercase -> doc name)
            document_keywords = {
                "lender's closing instructions": "lenders_closing_instructions",
                "promissory note": "promissory_note",
                "deed of trust": "deed_of_trust",
                "hud-1 settlement statement": "hud1_settlement_statement",
                "adjustable rate note": "adjustable_rate_note",
                "home equity conversion loan agreement": "home_equity_conversion_loan_agreement",
                "home equity conversion loan agreements": "home_equity_conversion_loan_agreement",
                "flood insurance": "flood_insurance_certificate_notice",
                "name affidavit": "name_affidavit",
                "signature affidavit": "signature_affidavit",
                "mailing address affidavit": "mailing_address_affidavit",
                "compliance agreement": "compliance_agreement",
                "notice of right to cancel": "notice_of_right_to_cancel",
                "truth in lending": "truth_in_lending_disclosure",
                "closing disclosure": "closing_disclosure",
                "settlement statement": "settlement_statement"
            }

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
                        top_text.append(block[4].strip().lower())
                combined_top_text = "\n".join(top_text)

                # Check for heading
                header_found = None
                for keyword, base_name in document_keywords.items():
                    if keyword in combined_top_text:
                        # Found a match
                        header_found = base_name
                        break

                if header_found:
                    # Only switch docs if the new heading differs from the current doc
                    if header_found != current_doc_name:
                        # Close out current doc if pages exist
                        if current_group_pages:
                            groups.append({
                                "doc_name": current_doc_name,
                                "pages": current_group_pages
                            })
                            current_group_pages = []
                        # Start new doc
                        current_doc_name = header_found

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
                new_doc.insert_pdf(doc, from_page=g["pages"][0], to_page=g["pages"][-1])
                new_doc.save(os.path.join(split_folder, filename))
                saved_files.append(filename)

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
