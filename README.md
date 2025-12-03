AI Health Chains – Take-Home Assessment

Author: Joshua Kern
Role: Senior Web3 MERN Stack Developer Candidate

This project implements the required patient management, statistics, transaction history, and consent management features using React, a mock Express backend, and MetaMask-based message signing.

Implemented Features

Patients
- Search + pagination using /api/patients
- Patient list with responsive cards
- Patient detail view with parallel fetching of patient info + records

Statistics
- Dashboard powered by /api/stats
- Responsive grid with clear metric display

Transactions
- Full transaction list via /api/transactions
- Optional filtering by connected wallet
- Address truncation + timestamp formatting
- Type/status badges styled with provided CSS

Consent Management (Web3)
- Filter by status (all/active/pending)
- Create consent flow:
    - User signs message with MetaMask
    - Signature + wallet + payload sent to backend
- Update consent status (pending > active) with mock tx hash
- Error + loading state handling
- Verifies signatures via `/api/verify-signature` before creating consents (extra Web3 round-trip).

Notable Implementation Details
- UI continuity: Search input stays focused by avoiding full remount during loading.
- Data normalization: Backend responses vary slightly; components gracefully handle arrays or nested objects.
- Web3 signing: Message format follows spec: "I consent to: {purpose} for patient: {patientId}"
- Provided CSS used exactly as structured for all pages.
- Parallel fetching improves perceived performance (e.g., patient detail).

Running the App

Backend

cd backend
npm install
npm start

Frontend

cd frontend
npm install
npm start

Summary

The app demonstrates:
- MERN stack proficiency
- Web3 integration experience
- Clean component design
- UX + error handling
- Ability to deliver production-ready features quickly

Thanks for reviewing my submission. I'd be happy to walk through the code in the next interview.
