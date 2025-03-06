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

            document_headers = {
                "lender's closing instructions": "lenders_closing_instructions",
                "promissory note": "promissory_note",
                "deed of trust": "deed_of_trust",
                "hud-1 settlement statement": "hud1_settlement_statement",
                "adjustable rate note": "adjustable_rate_note",
                "adjustable rate mortgage": "adjustable_rate_mortgage",
                "flood insurance": "flood_insurance_certificate_notice",
                "name affidavit": "name_affidavit",
                "signature affidavit": "signature_affidavit",
                "mailing address affidavit": "mailing_address_affidavit",
                "compliance agreement": "compliance_agreement",
                "right to cancel": "notice_of_right_to_cancel",
                "truth in lending disclosure": "truth_in_lending_disclosure"
            }

            current_doc_name = "unclassified"
            current_doc_pages = []
            saved_files = []
            current_doc_count = {}

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text().lower()

                found_new_doc = False
                for header, doc_name in document_headers.items():
                    if header in text:
                        found_new_doc = True
                        if doc_name in saved_files:
                            saved_files[doc_name] += 1
                            current_doc_name = f"{doc_name}_{saved_files[doc_name]}"
                        else:
                            saved_files[doc_name] = 1

                        current_doc_fullname = f"{doc_name}_{saved_files[doc_name]}"
                        current_doc_path = f"{split_folder}/{current_doc_fullname}.pdf"
                        new_doc = fitz.open()
                        new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                        new_doc.save(new_doc_path)
                        break  # found new document clearly

                if not found_new_doc and saved_files:
                    last_doc_name = list(saved_files.keys())[-1]
                    doc_index = saved_files[last_doc_name]
                    existing_doc_path = f"{split_folder}/{last_doc_name}_{doc_counts[last_doc_name]}.pdf"
                    existing_doc = fitz.open(existing_path)
                    existing_pages = fitz.open(new_doc_path)
                    existing_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                    existing_doc_path = f"/tmp/split_docs/{last_doc_name}_{saved_files[last_doc_name]}.pdf"
                    existing_doc.save(existing_doc_path)

            # List filenames clearly in the response
            final_filenames = [f"{name}_{count}.pdf" if count > 1 else f"{name}.pdf" for name, count in saved_files.items() for count in range(1, saved_files[name]+1)]

            response = {
                'message': 'PDF split successfully.',
                'files': final_filenames
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
