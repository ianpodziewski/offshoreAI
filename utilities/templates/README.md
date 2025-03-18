# Document Templates

This directory contains template functions for generating HTML documents for the OffshoreAI lending platform.

## Template Files

- **documentTemplateStrings.ts** - Main templates file with primary loan documents
- **entityDocumentTemplates.ts** - Entity-specific document templates

## Document Type Coverage

### Entity Documentation (Implemented)
- ✅ `formation_documents` - Certificate of Formation/Organization
- ✅ `operating_agreement` - LLC Operating Agreement / Corporate Bylaws
- ✅ `certificate_good_standing` - Certificate of Good Standing
- ✅ `ein_documentation` - IRS EIN Assignment Letter
- ✅ `resolution_to_borrow` - Corporate Resolution to Borrow

### Personal Information Documents (Implemented)
- ✅ `loan_application`
- ✅ `photo_id`
- ✅ `credit_authorization`
- ✅ `contact_information`

### Financial Documentation (Implemented)
- ✅ `financial_statement`
- ✅ `personal_tax_returns`
- ✅ `business_tax_returns`
- ✅ `bank_statements`
- ✅ `income_verification`
- ✅ `real_estate_schedule`
- ✅ `debt_schedule`
- ✅ `credit_explanation`

### Loan Agreements (Implemented)
- ✅ `promissory_note`
- ✅ `deed_of_trust`
- ✅ `security_agreement`
- ✅ `personal_guarantee`
- ✅ `assignment_rents_leases`
- ✅ `term_sheet`
- ✅ `closing_disclosure`

### Credit & Background (Implemented)
- ✅ `background_check`

### Loan Monitoring (Implemented)
- ✅ `draw_requests`

### Property Information (Not Implemented)
- ❌ `purchase_contract`
- ❌ `preliminary_title`
- ❌ `renovation_budget`
- ❌ `draw_schedule`

### Income Property Documents (Not Implemented)
- ❌ `lease_agreements`
- ❌ `dscr_calculation`
- ❌ `property_management_agreement`

### Pre-Closing (Partial Implementation)
- ✅ `term_sheet`
- ❌ `pre_approval_letter`
- ❌ `fee_disclosure`
- ❌ `rate_lock_agreement`

### Compliance Documents (Not Implemented)
- ❌ `state_lending_disclosures`
- ❌ `federal_lending_disclosures`
- ❌ `aml_documentation`
- ❌ `ofac_check`
- ❌ `patriot_act_compliance`

### Insurance (Not Implemented)
- ❌ `property_insurance`
- ❌ `flood_insurance`
- ❌ `builders_risk_policy`
- ❌ `liability_insurance`
- ❌ `insurance_binder`

### Funding (Partial Implementation)
- ✅ `closing_disclosure`
- ❌ `final_title_policy`
- ❌ `disbursement_instructions`
- ❌ `funding_authorization`
- ❌ `escrow_agreements`
- ❌ `wiring_instructions`

### Payment Records (Not Implemented)
- ❌ `payment_history`
- ❌ `payment_receipts`
- ❌ `ach_authorization`
- ❌ `late_notices`

### Asset Management (Not Implemented)
- ❌ `property_tax_verification`
- ❌ `insurance_renewal`
- ❌ `annual_financial_review`

### Default Management (Not Implemented)
- ❌ `default_notices`
- ❌ `workout_documentation`
- ❌ `forbearance_agreements`
- ❌ `loan_modification`

### Loan Conclusion (Not Implemented)
- ❌ `payoff_statement`
- ❌ `satisfaction_of_mortgage`
- ❌ `release_documents`

### Required Document Types (Special Cases)
- ❌ `executed_package` (Special case - needs custom handling) 