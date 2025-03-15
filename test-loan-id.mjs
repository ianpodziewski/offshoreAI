// Simple test script to verify loan ID generation
import { generateLoan } from './utilities/loanGenerator.ts';

// Generate a few loans and log their IDs
for (let i = 0; i < 5; i++) {
  const loan = generateLoan();
  console.log(`Loan ${i+1} ID: ${loan.id}`);
}

console.log('Test completed.'); 