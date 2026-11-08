# Deployment & Local Run Guide

## System Overview
**Platform**: DuesDesk — Coaching Institute Fee Tracking System & Parent Portal  
**Client**: Company A, Jaipur (4 Centres • 2,600 Students • ₹31.2 Cr Annual Billing)  
**Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Embedded Persistent Database, Vitest

---

## 1. How to Run Locally (Step-by-Step)

### Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ / v24+ recommended)
- **npm**: v9+ or higher
- **Git**

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yashj-010/coaching-fee-system.git
   cd coaching-fee-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run automated test suite (verifies refund math, reminders & AI logic):**
   ```bash
   npm test
   ```
   *Expected result: 4 test suites and 8 unit tests pass in < 1 second.*

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

*Zero external database setup or Docker container required — the application includes embedded seeded data matching the brief out of the box.*

---

## 2. Environment Variables

Create a `.env.local` file in the root directory if customizing environment settings. **Only variable names are declared below; no secrets or live credentials are in the repository:**

| Variable Name | Description | Default Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | Configurable display brand name | `"DuesDesk"` |
| `NEXT_PUBLIC_CLIENT_NAME` | Client institutional title | `"Company A, Jaipur"` |
| `PORT` | Local server port | `3000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |

---

## 3. How It Is Deployed (Production Guide)

### Option A: Vercel (Recommended 1-Click Serverless Deploy)
1. Push the repository to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Framework Preset: **Next.js**.
4. Root Directory: `./` (or project root).
5. Deploy. Vercel automatically runs `npm run build` and serves static assets and API routes globally.

### Option B: Self-Hosted Node.js / Docker
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

---

## 4. Demo Login & Reviewer Role Personas

The application features a zero-friction top-bar switcher to navigate seamlessly between all reviewer personas and seeded students:

### Persona 1: Parent Portal (5-Second Glance View)
- **Design Rule**: Parents understand dues in 5 seconds (amount, due date, pay button).
- **Language**: English and Hindi toggle (हिंदी).
- **Test Students**:
  - **Ishita Sharma (`STU-0587`)**: JEE 2027 Evening. Part-paid; Instalment #2 is 75 days overdue (>60d critical leakage target), Instalment #3 is 29 days overdue.
  - **Mohit Gurjar (`STU-0219`)**: NEET 2027 Morning. Upcoming instalment of ₹40,000 due in future.
  - **Aarav Meena (`STU-0412`)**: JEE 2027 Morning. All instalments fully paid; zero balance. Click "Download GST Receipt" to verify GSTIN and 18% tax breakdown.
- **Actions to Test**:
  1. Click **"Pay Now (अभी भुगतान करें)"** on Ishita Sharma's card.
  2. Select test payment mode (UPI, NetBanking, Card) and click **"Simulate Successful Payment"**.
  3. Verify the **Stop-on-Payment** confirmation: all 3 active reminders for that instalment are immediately halted with timestamps!

### Persona 2: Accounts Executive (Dues & Ageing Console)
- **Navigation Tab**: Tab 2 (`Dues & Ageing Dashboard`) & Tab 3 (`Student Fee Ledger`).
- **Features to Test**:
  1. **Cross-Centre Summary**: View aggregate numbers across Jaipur's 4 centres (Malviya Nagar, Raja Park, Vaishali Nagar, Vidhyadhar Nagar).
  2. **Ageing Pipeline**: Inspect breakdown across `Current`, `1–30d`, `31–60d`, and `>60d Overdue` (highlighting the ₹3.74 Cr leakage target).
  3. **Tally Prime / ERP 9 Export**: Click **"Export Tally XML"** and **"Export Tally CSV"** to download import-ready voucher files.

### Persona 3: Ministry of Education (MoE) 2024 Refund Calculator
- **Navigation Tab**: Tab 4 (`MoE 2024 Refund Calculator`).
- **Features to Test**:
  1. Select student leaving mid-session (e.g. Ishita Sharma).
  2. Enter commencement date and exit notice date.
  3. Verify pro-rata tuition calculation, registration fee statutory cap of ₹5,000, 18% GST reversal, and the statutory **10-Day Disbursement Deadline** countdown.
  4. Click **"Print Voucher"** to generate the formal audit-ready settlement certificate.

### Persona 4: Academic Counsellor (Dropout-Risk Queue)
- **Navigation Tab**: Tab 6 (`AI Dropout Risk Queue`).
- **Features to Test**:
  1. Review multi-signal flags: overdue days + attendance collapse + test score drop.
  2. Verify safety isolation: **No fee notices or parent collection SMS are ever triggered by AI flags.**
  3. Click **"Mark False Flag"**: Demonstrates the human-in-the-loop feedback loop adjusting model weights and logging counsellor notes.

---

## 5. Verification Checklist

| Requirement | Verified Screen / Endpoint | Result |
| :--- | :--- | :--- |
| Fee ledger per student | `Tab 3: Student Fee Ledger` | PASS |
| Parent portal with 5-second glance & Hindi toggle | `Tab 1: Parent Portal` | PASS |
| Gateway test mode marking paid | `Payment Modal` | PASS |
| Stop-on-payment rule halting reminders | `Tab 5: Reminders & Stop-on-Payment` | PASS |
| MoE 2024 Pro-rata refund within 10 days | `Tab 4: MoE 2024 Refund Calculator` | PASS |
| Cross-centre ageing & Tally export | `Tab 2: Dues & Ageing Dashboard` | PASS |
| AI dropout-risk & counsellor false flag loop | `Tab 6: AI Dropout Risk Queue` | PASS |
| Bulk attendance & test score upload | `Tab 7: Bulk CSV Upload` | PASS |
| Automated unit test suite | `npm test` (4 test suites, 8 unit tests) | PASS |
