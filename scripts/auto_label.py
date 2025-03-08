import json

# Define keywords and corresponding document types
DOCUMENT_KEYWORDS = {
    "lender's closing instructions": "lenders_closing_instructions",
    "closing instructions": "lenders_closing_instructions",
    "promissory note": "promissory_note",
    "deed of trust": "deed_of_trust",
    "settlement statement": "settlement_statement",
    "closing disclosure": "closing_disclosure",
    "truth in lending": "truth_in_lending_disclosure",
    "compliance agreement": "compliance_agreement",
    "notice of right to cancel": "notice_of_right_to_cancel",
    "hud/va addendum": "hud_va_addendum",
    "hecm fnma submission": "hecm_fnma_sub"
}

def auto_label_sample_data(sample_data):
    """
    Auto-labels the extracted text using keyword matching.
    """
    labeled_data = {}

    for page, text in sample_data.items():
        best_match = "unclassified"  # Default label if no match is found

        # Check for keyword matches
        for keyword, label in DOCUMENT_KEYWORDS.items():
            if keyword.lower() in text.lower():
                best_match = label
                break  # Stop at first match to avoid multiple labels

        # Store labeled results
        labeled_data[page] = {"text": text, "doc_type": best_match}

    return labeled_data

# Load extracted text
with open("data/sample_dataset.json", "r") as f:
    sample_dataset = json.load(f)

# Run auto-labeling
labeled_dataset = auto_label_sample_data(sample_dataset)

# Save labeled dataset
with open("data/labeled_sample_dataset.json", "w") as f:
    json.dump(labeled_dataset, f, indent=4)

print("✅ Auto-labeled dataset created successfully!")
