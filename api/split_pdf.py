import fitz
import json
import os
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read PDF data from request body
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            # Save the uploaded PDF temporarily
            upload_path = '/tmp/uploaded_package.pdf'
            with open(upload_path, 'wb') as f:
                f.write(pdf_data)

            doc = fitz.open(upload_path)
            split_folder = '/tmp/split_docs'
            os.makedirs(split_folder, exist_ok=True)

            # Dictionary of document keywords (all in lower case)
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

            # Initialize grouping
            current_doc_name = "unclassified"
            current_group_pages = []
            groups = []  # Each group is a dict: {"doc_name": ..., "pages": [...]}

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text().lower()

                # Check if any known header is present on this page
                header_found = None
                for keyword, base_name in document_keywords.items():
                    if keyword in text:
                        header_found = base_name
                        break

                if header_found:
                    # If current group already has pages, flush it as one document group.
                    if current_group_pages:
                        groups.append({
                            "doc_name": current_doc_name,
                            "pages": current_group_pages
                        })
                    # Start a new group with the new header (even if the header appears on the same page,
                    # we treat that page as the first page of the new document).
                    current_doc_name = header_found
                    current_group_pages = [page_num]
                else:
                    # No header on this page; add to current group
                    current_group_pages.append(page_num)
            
            # Flush the final group if any pages remain
            if current_group_pages:
                groups.append({
                    "doc_name": current_doc_name,
                    "pages": current_group_pages
                })

            # Now, save each group as a PDF.
            saved_files = []
            doc_counts = {}  # To number multiple occurrences of the same doc type
            for group in groups:
                base_name = group["doc_name"]
                doc_counts[base_name] = doc_counts.get(base_name, 0) + 1
                # Append a suffix if there is more than one document of this type.
                filename = f"{base_name}_{doc_counts[base_name]}.pdf" if doc_counts[base_name] > 1 else f"{base_name}.pdf"
                new_doc = fitz.open()
                # We assume pages in the group are sequential.
                first_page = group["pages"][0]
                last_page = group["pages"][-1]
                new_doc.insert_pdf(doc, from_page=first_page, to_page=last_page)
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
