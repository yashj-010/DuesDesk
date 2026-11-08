# Technical Design Document (TDD)
## Coaching Institute Fee Tracking System & Parent Portal

**GitHub Repository URL:** `https://github.com/yashj-010/coaching-fee-system`  
**Live Application URL:** `https://coaching-fee-system.vercel.app` *(or local review at http://localhost:3000)*  
**Author / Engineer:** Yash Jain (GitHub: yashj-010 • yj99901@gmail.com)  
**Client:** Company A, Jaipur (4 Centres • 2,600 Students • 140 Staff • ₹30–34 Cr Annual Revenue)  
**Date:** November 2026  

---

## 1. Executive Summary & Problem Framing

Company A operates 4 engineering and medical entrance coaching centres in Jaipur, enrolling 2,600 students paying an average fee of ₹1.2 Lakh annually across 3 to 4 instalments. The current operating model relies on desktop fee software, Excel due trackers per centre, manual phone reminders, WhatsApp score PDFs, and ad-hoc calculator refunds.

### Quantified Business Leakage & Inefficiencies:
1. **Uncollected Revenue**: 2,600 students × ₹1.2 Lakh = **₹31.2 Crore billed/year**. 2% is lost completely due to late and uneven follow-ups: **₹62.4 Lakhs/year**.
2. **Delayed Cashflow**: 12% of total instalment value arrives >60 days overdue (approx **₹3.74 Crore** delayed pipeline).
3. **Labour Cost**: 8 accounts staff spend 50% of their working hours chasing dues = **4 FTEs × ₹4.2 Lakh = ₹16.8 Lakhs/year**.
4. **Total Annual Financial Drag**: **₹79.2 Lakhs/year**.

### Core Mandates:
- **Parent Self-Service**: Give parents real-time visibility into what they owe and when without calling centres.
- **Automated Bilingual Reminders with Instant "Stop-on-Payment"**: Dispatch Hindi/English reminders before, on, and after due dates that halt the instant payment is recorded.
- **Executive Visibility**: Unified multi-centre and batch dues aggregation with ageing buckets and Tally Prime/ERP 9 export.
- **Regulatory Compliance**:
  - **Ministry of Education (MoE) 2024 Coaching Guidelines**: Published policy with pro-rata tuition refund disbursed within a strict 10-day statutory timeline and registration deductions capped.
  - **DPDP Act 2023**: Verifiable digital parental consent for minor students.
  - **Statutory GST Invoicing**: 18% GST (9% CGST + 9% SGST) breakdown on fee receipts and reversals.
- **AI Dropout-Risk Safeguard**: Multi-signal early warning engine for students at risk of dropping out, protected by strict safety guardrails (counsellor tasks only; never triggers fee notices or parent collection SMS).

---

## 2. Architecture & Tech Stack Decisions

### System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENT LAYER                               |
|                                                                                   |
|  [ Parent Portal (Mobile-First) ]      [ Accounts Executive Management Console ]  |
|  - 5-Second Dues Glance Card           - 4-Centre Ageing Dashboard (0-30,31-60,>60)|
|  - Bilingual Toggle (English / हिंदी)   - Student Fee Ledger & Payment Links       |
|  - GST Tax Receipt Generator           - MoE 2024 Pro-Rata Refund Engine          |
|  - Attendance & Test Percentiles       - Counsellor Dropout Queue (Human-in-Loop) |
|  - Mock Payment Checkout Modal         - Tally XML/CSV Exporter & Bulk CSV Upload |
+------------------------------------------+----------------------------------------+
                                           | Next.js API Routes (JSON / REST)
+------------------------------------------v----------------------------------------+
|                                APPLICATION CORE SERVICES                          |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Payment Engine     |  | Stop-on-Payment    |  | MoE 2024 Statutory Refund   |  |
|  | - Mock Gateway     |  | Reminder Engine    |  | - Pro-rata tuition formula  |  |
|  | - Webhook Handler  |  | - Hindi & English  |  | - Reg cap (₹5,000 max)      |  |
|  | - GST Tax Split    |  | - Auto-halt on pay |  | - 10-day deadline countdown |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | AI Dropout Scorer  |  | Accounts Exception |  | Tally & Bulk Ingestion      |  |
|  | - Overdue days (35)|  | Queue              |  | - Tally XML & CSV generator |  |
|  | - Attendance drop35|  | - Unmatched NEFT   |  | - Batch CSV parser          |  |
|  | - Test decline (30)|  |   investigation    |  | - Real-time ledger update   |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Storage Abstraction
+------------------------------------------v----------------------------------------+
|                                DATA PERSISTENCE LAYER                             |
|  - Embedded Zero-Config Persistent Store (Pre-seeded with Jaipur Sample Data)     |
|  - Pure TypeScript Entity Mappings with Vitest Automated Suite                    |
+-----------------------------------------------------------------------------------+
```

### Why Next.js 14+ (App Router) & TypeScript?
1. **Zero-Latency Unified Runtime**: Full-stack Next.js App Router eliminates cross-origin CORS overhead between frontend components and backend services.
2. **Zero-Dependency Reviewer Experience**: Reviewers need only run `npm install && npm run dev` to evaluate the entire system in 30 seconds. No external PostgreSQL, MySQL, or Docker daemon setup is required.
3. **Mobile-First Low-End Phone Optimization**: Low-end phones used by parents require lightweight JavaScript payloads. Next.js delivers server-optimized HTML and minimal bundles (<110 kB First Load JS).
4. **Tailwind CSS & Restrained Palette**: Ensures a clean, minimal design adhering to the client's explicit design brief: white space, readable typography, and zero frivolous visual clutter.

---

## 3. Data Model & Entity Relationships

The data model captures the entire lifecycle of a student from enrollment to fee collection, automated reminders, and refund settlement:

### Entity Specifications

1. **`Student`**
   - `id`: Unique identifier (e.g., `STU-0412`, `STU-0587`, `STU-0219`).
   - `name`, `parentName`, `parentPhone`, `parentEmail`.
   - `centreId`, `centreName`: Malviya Nagar, Raja Park, Vaishali Nagar, Vidhyadhar Nagar.
   - `batch`: JEE 2027 Morning/Evening, NEET 2027 Morning/Evening.
   - `enrollmentDate`: ISO date string.
   - `totalCourseFee`: Base course plan (e.g. ₹1,20,000).
   - `totalDiscount`: Scholarships (merit, sibling, early bird).
   - `netPayableFee`: `totalCourseFee - totalDiscount`.
   - `totalPaid`: Cumulative sum of verified payments.
   - `totalBalance`: Outstanding dues (`netPayableFee - totalPaid`).
   - `instalments`: Array of `Instalment` references.
   - `attendance`: Historical monthly records (`attendedClasses`, `totalClasses`, `percentage`).
   - `testScores`: Historical exam records (`score`, `maxScore`, `rank`, `percentile`).
   - `dropoutRiskScore`: Computed risk index (0–100).
   - `dropoutRiskLevel`: `"LOW"` | `"MODERATE"` | `"HIGH"`.
   - `dropoutRiskReasons`: Array of explanatory signals.

2. **`Instalment`**
   - `id`: Unique identifier (e.g., `INST-0587-2`).
   - `studentId`: Foreign key to `Student`.
   - `instalmentNumber`: Sequential instalment (1, 2, 3, or 4).
   - `totalAmount`, `paidAmount`, `balanceAmount`.
   - `dueDate`: ISO date string.
   - `status`: `"PAID"` | `"PARTIALLY_PAID"` | `"OVERDUE"` | `"PENDING"`.
   - `daysOverdue`: Integer days past due date relative to reference date.
   - `paymentLink`: Unique tokenized payment URL.
   - `lastPaymentDate`: Timestamp of most recent payment.

3. **`PaymentTransaction`**
   - `id`: Unique transaction identifier (`TXN-xxxx`).
   - `instalmentId`, `studentId`.
   - `amount`: Gross amount paid.
   - `date`: ISO date string.
   - `method`: `"UPI"` | `"NET_BANKING"` | `"CARD"` | `"CASH"` | `"CHEQUE"`.
   - `referenceId`: Bank/Gateway transaction reference.
   - `receiptNumber`: Official sequential tax invoice ID (`RCPT-2026-xxxx`).
   - `baseAmount`: Amount net of GST (`amount / 1.18`).
   - `cgst`: Central GST 9%.
   - `sgst`: Rajasthan State GST 9%.

4. **`ReminderNotification`**
   - `id`: Notification ID (`REM-xxxx`).
   - `studentId`, `instalmentId`, `parentPhone`.
   - `type`: `"PRE_DUE"` (T-3 days) | `"ON_DUE"` (T-0) | `"POST_DUE"` (T+5 days).
   - `scheduledDate`: Trigger date.
   - `messageHindi`: Devanagari template with student name, instalment number, amount, and payment link.
   - `messageEnglish`: English notification copy.
   - `status`: `"SCHEDULED"` | `"SENT"` | `"CANCELLED_ON_PAYMENT"`.
   - `cancelledAt`: Timestamp when Stop-on-Payment rule triggered.

5. **`StatutoryRefundCalculation`**
   - `studentId`, `studentName`, `batch`.
   - `courseCommencedDate`, `leavingNoticeDate`.
   - `statutoryDeadlineDate`: `leavingNoticeDate + 10 days`.
   - `daysAttended`: Days elapsed since course commencement.
   - `applicableTuitionBase`: `totalCourseFee - regFeeCap - studyMaterialCost`.
   - `proRataTuitionPerDay`: `applicableTuitionBase / totalCourseDurationDays`.
   - `tuitionFeeConsumed`: `proRataTuitionPerDay * daysAttended`.
   - `eligibleRefundAmount`: `totalPaidSoFar - (regFeeCap + studyMaterialCost + tuitionFeeConsumed)`.
   - `gstReversalAmount`: 18% credit on refundable tuition.
   - `netRefundPayable`: Net disbursement amount.

6. **`CounsellorTask`**
   - `id`: Task reference (`TASK-xxxx`).
   - `studentId`, `studentName`, `batch`, `centreName`.
   - `riskScore`: Aggregate multi-signal score (0–100).
   - `riskReasons`: String array explaining root cause.
   - `status`: `"PENDING_CALL"` | `"CALLED_RESOLVED"` | `"FALSE_FLAG"`.
   - `assignedTo`: `"Academic Counselling Cell"`.
   - `notes`: Counsellor intervention record.

---

## 4. Main Flows & Automation Mechanics

### Flow A: The 5-Second Parent Dues & Payment Flow
1. **Access**: Parent accesses portal on mobile browser; identity verified via phone OTP or link.
2. **Instant Cognitive Relief**: The 5-Second Card displays:
   - Total Pending Balance in large 48px type.
   - Due Date / Overdue Status badge.
   - 1-Tap "Pay Now (अभी भुगतान करें)" button.
3. **Gateway Checkout**: Parent taps button -> Modal opens with UPI (GPay/PhonePe/Paytm), NetBanking, or Card.
4. **Execution & Stop-on-Payment**:
   - Payment confirmed -> Instalment balance updated to ₹0.
   - Instalment status updated to `PAID`.
   - **Stop-on-Payment Engine triggers immediately**: All pending/scheduled reminders for this instalment are marked `CANCELLED_ON_PAYMENT`.
   - Official GST Tax Invoice generated instantly with Rajasthan GSTIN and 9% CGST + 9% SGST breakdown.

```
[ Parent Clicks "Pay Now" ] 
       │
       ▼
[ Mock Gateway Success Webhook ] 
       │
       ├──► 1. Update Instalment Status: "PAID"
       ├──► 2. Generate GST Tax Invoice Receipt
       ├──► 3. Halt Reminders: Trigger Stop-on-Payment rule
       │       (All pending SMS/WhatsApp triggers cancelled)
       └──► 4. Re-evaluate AI Risk Scorer (lowers risk index)
```

### Flow B: Statutory MoE 2024 Pro-Rata Refund Engine
1. **Legal Constraint**: Under the 2024 Coaching Guidelines issued by the Ministry of Education, coaching centres are strictly prohibited from retaining full course fees when a student leaves mid-term.
2. **Calculation Formula**:
   $$\text{Applicable Tuition Base} = \text{Gross Fee} - \min(\text{Registration Fee}, ₹5,000) - \text{Study Material Cost}$$
   $$\text{Tuition Consumed} = \left(\frac{\text{Applicable Tuition Base}}{365}\right) \times \text{Days Attended}$$
   $$\text{Eligible Refund} = \text{Total Paid} - (\text{Registration Cap} + \text{Material Cost} + \text{Tuition Consumed})$$
3. **10-Day Statutory Timer**: The system calculates the exact legal deadline (`Notice Date + 10 Days`) and produces a printable **Statutory Refund Settlement Voucher**.

### Flow C: Cross-Centre Ageing & Tally Prime Integration
1. **Ageing Buckets**: All unpaid instalments are categorized into:
   - `Current (Not Due)`: Due date in future.
   - `1–30 Days Overdue`: Early stage reminder triggers.
   - `31–60 Days Overdue`: Escalated reminders.
   - `>60 Days Overdue`: Critical leakage pipeline (the 12% baseline that costs Company A ₹79.2 Lakhs annually).
2. **Tally Prime / ERP 9 XML Export**: Generates standardized XML `<ENVELOPE>` containing `<VOUCHER VCHTYPE="Receipt">` with dual ledger debit/credit postings (`Bank Account` vs `Coaching Tuition Fees` + `Output CGST @ 9%` + `Output SGST @ 9%`).
3. **Accounts CSV Export**: Outputs comma-delimited ledger summary for manual audit and reconciliation.

---

## 5. How the AI Part Works & Safety Guardrails

### Multi-Signal Risk Scoring Formulation
The AI Dropout-Risk Engine continuously evaluates student records using 3 orthogonal signals:

$$\text{Risk Score} = S_{\text{Fee}} + S_{\text{Att}} + S_{\text{Test}} \quad (0 \le \text{Score} \le 100)$$

1. **Signal 1: Overdue Instalment Age ($S_{\text{Fee}}$, Max 35 points)**
   - Overdue $\ge 30$ days: $+35$ points
   - Overdue $15–29$ days: $+20$ points
   - Overdue $1–14$ days: $+10$ points
2. **Signal 2: Attendance Trajectory ($S_{\text{Att}}$, Max 35 points)**
   - Attendance drop $\ge 20\%$ or absolute $< 65\%$: $+35$ points
   - Attendance drop $10–19\%$ or absolute $< 75\%$: $+20$ points
   - Benchmark threshold $< 80\%$: $+10$ points
3. **Signal 3: Academic Percentile Trajectory ($S_{\text{Test}}$, Max 30 points)**
   - Percentile drop $\ge 15\%$ or latest percentile $< 50^{\text{th}}$: $+30$ points
   - Percentile drop $8–14\%$ or latest percentile $< 65^{\text{th}}$: $+15$ points

### Strict Safety Guardrails (When the AI is Wrong or Unsure)
As mandated by the client brief:
1. **Zero External Action**: A high risk score **never** triggers an automated payment reminder, aggressive collection notice, or fee-related SMS to parents.
2. **Internal Counselling Task Only**: The flag routes exclusively to the internal **Academic Counselling Cell** queue with the directive: *"Do not mention fee dues first; enquire about academic difficulty and concept understanding."*
3. **False-Positive Feedback Loop**: Counsellors can mark any task as **"False Flag"** (e.g. verified medical absence or family emergency). This logs counsellor notes and dynamically reduces model sensitivity for that student by 30 points, eliminating alert fatigue.
4. **Unmatched Payments Isolation**: Unmatched bank transfers (NEFT/UPI deposits with ambiguous narrations) are automatically diverted to an **Accounts Investigation Queue** rather than arbitrarily crediting random student accounts.

---

## 6. UI & Design Rationale

### The "5-Second Rule" for Low-End Mobile Phones
- **Context**: Parents in Jaipur access the portal on varied Android devices over mobile networks. Many prefer Hindi.
- **Design Decision**:
  - The dues screen contains no extraneous navigational chrome or confusing charts.
  - White space and clear typography hierarchy: Amount Due in bold 48px, Due Date with calendar icon, and a single prominent blue "Pay Now (अभी भुगतान करें)" action button.
  - 1-tap bilingual language switcher immediately swaps all terms into natural Hindi (*"कुल देय राशि"*, *"अभी भुगतान करें"*, *"जीएसटी रसीद डाउनलोड करें"*).

### High-Density Dashboard for Accounts Executives
- Accounts staff manage 2,600 students across 4 physical centres.
- Desktop layout maximizes information density without cognitive clutter: 4 KPI summary cards, interactive ageing pipeline cards, centre-by-centre comparative table, and 1-click export actions.

---

## 7. Assumptions Labeled

1. **Assumption A1 (Course Duration)**: Standard academic session is 365 calendar days commencing July 1 and concluding June 30 unless custom dates are provided.
2. **Assumption A2 (GST Applicability)**: Coaching services fall under SAC Code `999293`, attracting 18% GST (9% CGST + 9% SGST for intra-state Rajasthan supply). Course fees shown in the ledger are inclusive of GST.
3. **Assumption A3 (MoE 2024 Registration Cap)**: In accordance with Rule 6 of the Ministry of Education Coaching Guidelines 2024, non-refundable administrative and registration retention is capped at a statutory ceiling of ₹5,000.
4. **Assumption A4 (Study Material Value)**: Fixed non-refundable study material pack deduction is set to ₹8,000 when physical modules have been handed over to the student.
5. **Assumption A5 (DPDP Act 2023 Consent)**: Since coaching students preparing for JEE/NEET 2027 are minors (aged 15–17), verifiable digital consent is recorded from the registered parent's mobile phone number prior to displaying academic records.

---

## 8. What Was Cut & Future Roadmap

### What Was Intentionally Excluded from Core Build
In strict accordance with the client brief's *Out of Scope* directives:
- **Video Lectures & Learning Management System (LMS)**: Coaching platforms require specialized CDNs; this build strictly focuses on fee collection and compliance.
- **Class Timetables & Scheduling**: Handled by existing centre notice boards.
- **Admissions Lead CRM**: Focused exclusively on enrolled students and fee pipeline.

### Next Phase Engineering Roadmap
1. **WhatsApp Cloud API Webhooks**: Transition mock notification dispatcher to production Meta WhatsApp Business Cloud API with approved bilingual HSM templates.
2. **Direct Bank Open Banking Account Aggregator (AA)**: Automated reconciliation of NEFT/RTGS inward remittances directly via ICICI/HDFC Corporate Banking APIs.
3. **Real-Time Biometric RFID Attendance Integration**: Hardware sidecar listening to centre biometric turnstiles for sub-second attendance syncing.
4. **Tally Prime Direct ODBC/XML Server Connector**: Real-time push synchronization directly into local Tally Prime server over port 9000.
