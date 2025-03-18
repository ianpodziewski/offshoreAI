import { LoanDetails } from '../types/loanTypes';

/**
 * Document templates for various funding-related documents used in hard money lending
 */

/**
 * Generates a Final Title Policy document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Final Title Policy document
 */
export const generateFinalTitlePolicy = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    propertyType,
    loanNumber,
  } = loanDetails;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
FINAL TITLE INSURANCE POLICY

POLICY NUMBER: FTP-${loanNumber}-${new Date().getFullYear()}
DATE OF POLICY: ${currentDate}
POLICY AMOUNT: $${(loanAmount * 1.1).toFixed(2)}

INSURED: ${lenderName}
BORROWER: ${borrowerName}
PROPERTY ADDRESS: ${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}

PROPERTY TYPE: ${propertyType}
LOAN CLOSING DATE: ${closingDate}
LOAN AMOUNT: $${loanAmount.toFixed(2)}

This Final Title Insurance Policy ("Policy") is issued by [Title Insurance Company Name], a corporation organized and existing under the laws of the State of [State], herein called the "Company."

COVERAGE STATEMENT:
Subject to the exclusions from coverage, the exceptions from coverage contained in Schedule B, and the conditions and stipulations, [Title Insurance Company Name], a [State] corporation, herein called the Company, insures, as of the Date of Policy shown above, against loss or damage, not exceeding the Amount of Insurance stated above, sustained or incurred by the insured by reason of:

1. Title to the estate or interest described in Schedule A being vested other than as stated therein;
2. Any defect in or lien or encumbrance on the title;
3. Unmarketability of the title;
4. Lack of right of access to and from the land;
5. The invalidity or unenforceability of the lien of the insured mortgage upon the title;
6. The priority of any lien or encumbrance over the lien of the insured mortgage;
7. Lack of priority of the lien of the insured mortgage over any statutory lien for services, labor, or material arising from an improvement or work related to the land which is contracted for or commenced prior to Date of Policy;
8. The invalidity or unenforceability of any assignment of the insured mortgage, provided the assignment is shown in Schedule A, or the failure of the assignment shown in Schedule A to vest title to the insured mortgage in the named insured assignee free and clear of all liens.

SCHEDULE A:
The estate or interest in the land which is encumbered by the insured mortgage is Fee Simple.
Title to the estate or interest in the land is vested in: ${borrowerName}
The insured mortgage and assignments thereof, if any, are described as follows:
Deed of Trust executed by ${borrowerName} to secure a note in the original principal amount of $${loanAmount.toFixed(2)}, dated ${closingDate}, in favor of ${lenderName}.

SCHEDULE B:
This policy does not insure against loss or damage by reason of the following:
1. Property taxes for the current fiscal year, and subsequent years, not yet due and payable.
2. Easements, restrictions, and conditions of record.
3. Any facts, rights, interests, or claims that are not shown by the public records but that could be ascertained by an inspection of the land or by making inquiry of persons in possession of the land.
4. Any encroachment, encumbrance, violation, variation, or adverse circumstance affecting the title that would be disclosed by an accurate and complete land survey of the land.

IN WITNESS WHEREOF, [Title Insurance Company Name] has caused this policy to be signed and sealed as of the Date of Policy shown above.

[Title Insurance Company Name]

____________________________
Authorized Signatory
`;
};

/**
 * Generates Disbursement Instructions document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Disbursement Instructions document
 */
export const generateDisbursementInstructions = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
    interestRate,
    originationFee,
    loanTerm,
  } = loanDetails;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate fees
  const origFeeAmount = loanAmount * (originationFee / 100);
  const titleFees = 1200;
  const escrowFees = 850;
  const appraisalFee = 700;
  const documentPreparationFee = 450;
  const wireTransferFee = 35;
  const recordingFees = 125;
  
  const totalFees = origFeeAmount + titleFees + escrowFees + appraisalFee + 
                    documentPreparationFee + wireTransferFee + recordingFees;
  
  const netProceedsToClosing = loanAmount - totalFees;

  return `
DISBURSEMENT INSTRUCTIONS

LOAN NUMBER: ${loanNumber}
DATE: ${currentDate}
CLOSING DATE: ${closingDate}
BORROWER: ${borrowerName}
PROPERTY ADDRESS: ${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}
LENDER: ${lenderName}

LOAN INFORMATION:
Loan Amount: $${loanAmount.toFixed(2)}
Interest Rate: ${interestRate}%
Loan Term: ${loanTerm} months
Origination Fee: ${originationFee}% ($${origFeeAmount.toFixed(2)})

DISBURSEMENT SCHEDULE:

FROM LOAN PROCEEDS:

1. Fees Due to Lender:
   a. Origination Fee: $${origFeeAmount.toFixed(2)}
   b. Document Preparation Fee: $${documentPreparationFee.toFixed(2)}

2. Third-Party Fees:
   a. Title Insurance Premium: $${titleFees.toFixed(2)}
   b. Escrow/Closing Fee: $${escrowFees.toFixed(2)}
   c. Appraisal Fee: $${appraisalFee.toFixed(2)}
   d. Recording Fees: $${recordingFees.toFixed(2)}
   e. Wire Transfer Fee: $${wireTransferFee.toFixed(2)}

TOTAL FEES: $${totalFees.toFixed(2)}

NET LOAN PROCEEDS TO CLOSING: $${netProceedsToClosing.toFixed(2)}

HOLDBACK RESERVES (if applicable): $0.00

INSTRUCTIONS TO TITLE/ESCROW:

1. Please disburse the funds as indicated above.
2. The net proceeds should be disbursed to the borrower after all fees are paid and all conditions for funding have been satisfied.
3. Do not release any funds until the Deed of Trust/Mortgage has been properly recorded.
4. Verify that all outstanding liens, if any, have been paid in full or subordinated as required.
5. Ensure that the title insurance policy is issued without delay following closing and recording.

These disbursement instructions are approved and authorized:

________________________________
${borrowerName}, Borrower  
Date: ${closingDate}

________________________________
Authorized Representative for ${lenderName}
Date: ${closingDate}

________________________________
Escrow Officer
Date: ${closingDate}
`;
};

/**
 * Generates a Funding Authorization document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Funding Authorization document
 */
export const generateFundingAuthorization = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
    propertyType,
    interestRate,
    loanTerm,
  } = loanDetails;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
FUNDING AUTHORIZATION

AUTHORIZATION NUMBER: FA-${loanNumber}
DATE: ${currentDate}

TO: [TITLE/ESCROW COMPANY]
RE: Loan Funding Authorization for Loan #${loanNumber}

LOAN INFORMATION:
Borrower(s): ${borrowerName}
Property Address: ${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}
Property Type: ${propertyType}
Loan Amount: $${loanAmount.toFixed(2)}
Interest Rate: ${interestRate}%
Loan Term: ${loanTerm} months
Scheduled Closing Date: ${closingDate}
Lender: ${lenderName}

This document serves as formal authorization to fund the above-referenced loan. The undersigned, as an authorized representative of ${lenderName} ("Lender"), hereby authorizes the funding of the above-referenced loan subject to the following conditions being met:

FUNDING CONDITIONS:

1. Receipt and approval of properly executed loan documents, including but not limited to:
   - Promissory Note
   - Deed of Trust/Mortgage
   - Closing Disclosure/Settlement Statement
   - Disbursement Instructions
   - Escrow Instructions
   - Borrower's Affidavit
   - Insurance Verification (with Lender listed as mortgagee/loss payee)
   - All applicable riders and addenda

2. Confirmation that the title insurance policy will be issued with no exceptions other than those approved by Lender in writing.

3. Verification that all property taxes are current.

4. Confirmation that hazard insurance is in place with appropriate coverage amounts and with Lender properly listed as mortgagee/loss payee.

5. Verification that all required inspections have been completed and approved.

6. Confirmation that all existing liens and encumbrances have been paid off or subordinated as required.

7. Receipt of a clear final inspection report (if applicable).

8. All conditions listed in the Loan Commitment Letter have been satisfied.

AUTHORIZATION:

Upon satisfaction of all conditions listed above, the Lender hereby authorizes the disbursement of loan funds in the amount of $${loanAmount.toFixed(2)} in accordance with the Disbursement Instructions provided separately.

EXPIRATION:

This Funding Authorization expires if funding does not occur by the close of business on [EXPIRATION DATE - 10 BUSINESS DAYS FROM ISSUE]. Any funding after this date requires a new authorization from Lender.

Authorized and Approved:

________________________________
Authorized Representative for ${lenderName}
Title: [TITLE]
Date: ${currentDate}

________________________________
Funding Department Approval
Date: ${currentDate}

CONTACT INFORMATION:
For questions regarding this Funding Authorization, please contact:
Name: [FUNDING MANAGER NAME]
Phone: [PHONE NUMBER]
Email: [EMAIL ADDRESS]
`;
};

/**
 * Generates an Escrow Agreement document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Escrow Agreement document
 */
export const generateEscrowAgreement = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
    propertyType,
    interestRate,
    loanTerm,
  } = loanDetails;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate estimated monthly tax and insurance amounts
  const estimatedAnnualTaxes = loanAmount * 0.015; // Assuming 1.5% of loan amount annually
  const estimatedAnnualInsurance = propertyType === 'Commercial' ? loanAmount * 0.01 : loanAmount * 0.005; // 1% for commercial, 0.5% for residential
  const monthlyTaxes = estimatedAnnualTaxes / 12;
  const monthlyInsurance = estimatedAnnualInsurance / 12;
  const monthlyEscrowAmount = monthlyTaxes + monthlyInsurance;
  
  // Calculate initial escrow deposit
  const initialEscrowDeposit = monthlyEscrowAmount * 2; // Two months of reserve

  return `
ESCROW AGREEMENT

THIS ESCROW AGREEMENT (the "Agreement") is made and entered into on ${currentDate}, by and between:

BORROWER: ${borrowerName} (the "Borrower")
LENDER: ${lenderName} (the "Lender")
ESCROW AGENT: [ESCROW COMPANY NAME] (the "Escrow Agent")

PROPERTY: ${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}
LOAN NUMBER: ${loanNumber}
LOAN AMOUNT: $${loanAmount.toFixed(2)}
LOAN CLOSING DATE: ${closingDate}

RECITALS:

WHEREAS, Borrower has obtained a loan from Lender secured by the above-referenced Property;

WHEREAS, Lender requires Borrower to maintain an escrow account for the payment of property taxes and insurance premiums;

WHEREAS, the parties desire to establish the terms and conditions governing the administration of the escrow account;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. ESTABLISHMENT OF ESCROW ACCOUNT:
   
   Lender and Borrower hereby establish an escrow account (the "Escrow Account") with Escrow Agent for the purpose of paying property taxes, hazard insurance premiums, and other charges as they become due on the Property.

2. INITIAL DEPOSIT:
   
   At closing, Borrower shall deposit with Escrow Agent the sum of $${initialEscrowDeposit.toFixed(2)} as an initial deposit to the Escrow Account.

3. MONTHLY DEPOSITS:
   
   Borrower agrees to pay to Lender, along with the regular monthly mortgage payment, the following amounts to be deposited into the Escrow Account:
   
   a. Property Taxes: $${monthlyTaxes.toFixed(2)} per month
   b. Hazard Insurance: $${monthlyInsurance.toFixed(2)} per month
   
   Total Monthly Escrow Payment: $${monthlyEscrowAmount.toFixed(2)}
   
   These amounts are subject to adjustment based on actual tax and insurance bills as they are received by Lender.

4. ESCROW ANALYSIS:
   
   Lender will perform an annual analysis of the Escrow Account to determine if the monthly deposits are sufficient to pay the expected disbursements for the coming year. Borrower will be notified of any adjustment to the monthly escrow payment.

5. PAYMENT OF ESCROW ITEMS:
   
   Escrow Agent shall use the funds in the Escrow Account to pay property taxes, hazard insurance premiums, and other charges when they become due. Escrow Agent shall provide Borrower with an annual statement showing all deposits to and disbursements from the Escrow Account.

6. INSUFFICIENT FUNDS:
   
   If at any time the funds in the Escrow Account are insufficient to pay an escrow item when due, Borrower shall, upon notice from Lender, promptly deposit the amount of the deficiency with Escrow Agent.

7. SURPLUS FUNDS:
   
   If at any time the amount of funds in the Escrow Account exceeds the amount deemed necessary by Lender to pay escrow items when due, plus any cushion permitted by applicable law, Lender shall refund the excess to Borrower.

8. TERMINATION:
   
   This Agreement shall terminate upon the payment in full of the loan or upon the mutual agreement of the parties.

9. GOVERNING LAW:
   
   This Agreement shall be governed by and construed in accordance with the laws of the state in which the Property is located.

IN WITNESS WHEREOF, the parties have executed this Escrow Agreement as of the date first written above.

BORROWER:
____________________________
${borrowerName}
Date: ${closingDate}

LENDER:
____________________________
${lenderName}
By: ________________________
Title: _____________________
Date: ${closingDate}

ESCROW AGENT:
____________________________
[ESCROW COMPANY NAME]
By: ________________________
Title: _____________________
Date: ${closingDate}
`;
};

/**
 * Generates Wiring Instructions document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Wiring Instructions document
 */
export const generateWiringInstructions = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
  } = loanDetails;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate net amount after fees (simplified for example)
  const netLoanAmount = loanAmount * 0.97; // Assuming 3% in fees

  return `
WIRE TRANSFER INSTRUCTIONS

DATE: ${currentDate}
LOAN NUMBER: ${loanNumber}
BORROWER: ${borrowerName}
PROPERTY ADDRESS: ${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}
CLOSING DATE: ${closingDate}

IMPORTANT: THESE WIRE INSTRUCTIONS ARE FOR THE ABOVE-REFERENCED TRANSACTION ONLY

PLEASE WIRE FUNDS TO:

RECEIVING BANK INFORMATION:
Bank Name: [BANK NAME]
Bank Address: [BANK ADDRESS]
ABA/Routing Number: [ROUTING NUMBER]
Swift Code (for international wires): [SWIFT CODE]

BENEFICIARY INFORMATION:
Account Name: [TITLE/ESCROW COMPANY NAME] Trust Account
Account Number: [ACCOUNT NUMBER]
Reference/Note: Loan #${loanNumber}, ${borrowerName}, ${propertyAddress.street}

AMOUNT TO BE WIRED: $${netLoanAmount.toFixed(2)}

INTERMEDIARY BANK (if applicable):
Bank Name: [INTERMEDIARY BANK NAME]
ABA/Routing Number: [INTERMEDIARY ROUTING NUMBER]

SPECIAL INSTRUCTIONS:
1. Please include the loan number, borrower name, and property address in the reference section of the wire.
2. Notify the escrow officer when wire has been sent.
3. Due to the risk of wire fraud, please call to verify these instructions before sending any funds.

VERIFICATION CONTACT:
Name: [ESCROW OFFICER NAME]
Phone: [PHONE NUMBER] (must call this number to verify before sending)
Email: [EMAIL ADDRESS]
Title/Escrow Company: [TITLE/ESCROW COMPANY NAME]
File/Escrow Number: [ESCROW NUMBER]

IMPORTANT WIRE FRAUD ADVISORY:
WIRE FRAUD IS ON THE RISE. Before sending any wire, call the intended recipient at a number you know is valid to confirm the instructions. Additionally, note that wiring instructions are typically not changed during the course of a transaction.

CONFIRMATION OF RECEIPT:
Once the wire has been sent, please email wire confirmation to:
[EMAIL ADDRESS]

FUNDING AUTHORIZATION:
These wire instructions are hereby authorized by:

____________________________
Authorized Representative for ${lenderName}
Title: [TITLE]
Date: ${currentDate}

LENDER INFORMATION:
${lenderName}
[LENDER ADDRESS]
[LENDER PHONE]
[LENDER EMAIL]

DISCLAIMER:
${lenderName} is not responsible for any delay, failure of delivery, or misdirection of funds resulting from incorrect or incomplete wire instructions. The sender is responsible for confirming the accuracy of these instructions prior to sending funds.
`;
};
