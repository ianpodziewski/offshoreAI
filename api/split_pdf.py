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
            os.makedirs('/tmp/split_docs', exist_ok=True)

            # Ordered list of document headers to detect clearly
            document_headers = {
                "Lender's Closing Instructions": "lenders_closing_instructions",
                "Promissory Note": "promissory_note",
                "Deed of Trust": "deed_of_trust",
                "Adjustable Rate Note": "adjustable_rate_note",
                "Adjustable Rate Mortgage": "adjustable_rate_mortgage",
                "HUD-1 Settlement Statement": "hud1_settlement_statement",
                "Home Equity Conversion Loan Agreement": "home_equity_conversion_loan_agreement",
                "Flood Insurance": "flood_insurance_certificate_notice",
                "Name Affidavit": "name_affidavit",
                "Signature Affidavit": "signature_affidavit",
                "Mailing Address Affidavit": "mailing_address_affidavit",
                "Compliance Agreement": "compliance_agreement",
                "Notice of Right to Cancel": "notice_of_right_to_cancel",
                "Closing Disclosure": "closing_disclosure",
                "Truth in Lending Disclosure": "truth_in_lending_disclosure",
                "Errors & Omissions": "errors_and_omissions_agreement",
                "Settlement Statement": "settlement_statement"
            }

            current_doc_name = "unclassified"
            doc_page_buffers = {}
            doc_counts = {}

            # Iterate clearly to group pages
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text().lower()

                # Check clearly if page matches any document header
                found_new_doc = False
                for header, doc_name in document_headers.items():
                    if header.lower() in text:
                        current_doc_name = doc_name
                        doc_counts[current_doc_name] = doc_counts.get(current_doc_name, 0) + 1
                        current_doc_fullname = f"{current_doc_name}_{doc_counts[current_doc_name]}"
                        doc_page_buffers[current_doc_fullname] = []
                        found_new_doc = True
                        break  # found new document clearly

                if not found_new_doc and current_doc_name == "unclassified":
                    current_doc_fullname = f"{current_doc_name}_{page_num+1}"
                    doc_page_buffers[current_doc_fullname] = []

                # Append current page explicitly to buffer
                doc_page_buffers[current_doc_fullname].append(page_num)

            # Save clearly grouped PDFs
            saved_files = []
            for doc_fullname, pages in doc_page_buffers.items():
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=pages[0], to_page=pages[-1])
                filename = f"/tmp/split_docs/{doc_fullname}.pdf"
                new_doc.save(filename)
                saved_files.append(f"{doc_fullname}.pdf")

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

