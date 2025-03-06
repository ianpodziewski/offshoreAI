import fitz
import json
import os
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            upload_path = '/tmp/uploaded_package.pdf'
            with open(upload_path, 'wb') as f:
                f.write(pdf_data)

            doc = fitz.open(upload_path)
            split_folder = '/tmp/split_docs'
            os.makedirs(split_folder, exist_ok=True)

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

            current_doc_name = "unclassified"
            current_doc_pages = []
            saved_files = []
            doc_counts = {}

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text().lower()

                header_found = False
                for keyword, doc_base_name in document_keywords.items():
                    if keyword in text:
                        header_found = True
                        if current_doc_pages:
                            # Save the previous grouped pages
                            doc_counts[current_doc_name] = doc_counts.get(current_doc_name, 0) + 1
                            suffix = f"_{doc_counts[current_doc_name]}" if doc_counts[current_doc_name] > 1 else ""
                            filename = f"{current_doc_name}{suffix}.pdf"
                            new_doc = fitz.open()
                            new_doc.insert_pdf(doc, from_page=current_doc_pages[0], to_page=current_doc_pages[-1])
                            new_doc.save(os.path.join(split_folder, filename))
                            saved_files.append(filename)
                            current_doc_pages = []

                        # Start clearly a new document
                        current_doc_name = doc_base_name
                        break

                # Add page explicitly to current document
                current_doc_pages.append(page_num)

            # Save the last document explicitly
            if current_doc_pages:
                doc_counts[current_doc_name] = doc_counts.get(current_doc_name, 0) + 1
                suffix = f"_{doc_counts[current_doc_name]}" if doc_counts[current_doc_name] > 1 else ""
                filename = f"{current_doc_name}{suffix}.pdf"
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=current_doc_pages[0], to_page=current_doc_pages[-1])
                new_doc.save(os.path.join(split_folder, filename))
                saved_files.append(filename)

            response = {
                'message': 'PDF split successfully.',
                'files': saved_files
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            response = {'message': f'Server Error: {str(e)}'}
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
