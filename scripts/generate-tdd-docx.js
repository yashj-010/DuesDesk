const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} = require("docx");

async function generateDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22, // 11pt
            color: "1E293B",
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "TECHNICAL DESIGN DOCUMENT (TDD)",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            run: { bold: true, size: 36, color: "0284C7" },
          }),
          new Paragraph({
            text: "Coaching Institute Fee Tracking System & Parent Portal",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            run: { bold: true, size: 28, color: "0F172A" },
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Project GitHub URL:", bold: true })] })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "https://github.com/yashj-010/coaching-fee-system", color: "0284C7", bold: true })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Author / Engineer:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Yash Jain (GitHub: yashj-010 • yj99901@gmail.com)" })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Client:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Company A, Jaipur (4 Centres • 2,600 Students • ₹31.2 Cr Billed/yr)" })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Live Demo URL:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "http://localhost:3000 (Ready out of the box with zero external dependencies)" })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Section 1
          new Paragraph({
            text: "1. Executive Summary & Problem Framing",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            run: { bold: true, size: 26, color: "0F172A" },
          }),
          new Paragraph({
            text: "Company A operates 4 engineering and medical entrance coaching centres in Jaipur, enrolling 2,600 students paying an average fee of ₹1.2 Lakh annually across 3 to 4 instalments. The current manual workflow causes ₹79.2 Lakhs in annual financial drag from uncollected dues (₹62.4 Lakhs/yr) and manual staff chase time (4 FTEs = ₹16.8 Lakhs/yr). Furthermore, 12% of instalment value arrives over 60 days late.",
            spacing: { after: 140 },
          }),

          // Section 2
          new Paragraph({
            text: "2. Architecture & Design Decisions",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            run: { bold: true, size: 26, color: "0F172A" },
          }),
          new Paragraph({
            text: "The application is built on Next.js 14+ (App Router) with full TypeScript type safety, Tailwind CSS, embedded persistent database, and Vitest automated testing.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Zero-Latency Unified Runtime: ", bold: true }),
              new TextRun("Full-stack Next.js eliminates CORS and deployment complexity."),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Zero-Configuration Reviewer Setup: ", bold: true }),
              new TextRun("Embedded persistent data store runs with zero external DB setups."),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Mobile-First 5-Second Rule: ", bold: true }),
              new TextRun("Parents understand their dues within 5 seconds on low-end Android phones with instant Hindi (हिंदी) and English support."),
            ],
            spacing: { after: 140 },
          }),

          // Section 3
          new Paragraph({
            text: "3. Main Flows & Automation Mechanics",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            run: { bold: true, size: 26, color: "0F172A" },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. The 5-Second Dues & Payment Flow: ", bold: true }),
              new TextRun("Parents view amount due, due date, and tap 'Pay Now'. Gateway test mode simulates instant UPI, NetBanking, and Card checkout. Upon receipt, the system immediately issues an 18% GST invoice."),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "2. Stop-on-Payment Engine: ", bold: true }),
              new TextRun("The exact moment an instalment is paid, all scheduled Hindi and English SMS/WhatsApp reminders for that instalment are cancelled immediately with audit timestamps. Parents never receive reminders for cleared fees."),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "3. Ministry of Education (MoE) 2024 Statutory Pro-Rata Refund Engine: ", bold: true }),
              new TextRun("Calculates pro-rata refund based on days attended vs 365 course days. Registration charges are strictly capped at ₹5,000 as per statutory guidelines, 18% GST on unconsumed tuition is reversed, and the mandatory 10-day settlement deadline countdown is displayed with printable settlement vouchers."),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "4. Cross-Centre Ageing & Tally Export: ", bold: true }),
              new TextRun("Aggregates dues across Jaipur's 4 centres and batches into Current, 1-30d, 31-60d, and >60d overdue buckets. Generates standardized Tally Prime XML and CSV vouchers for 1-click accounting reconciliation."),
            ],
            spacing: { after: 140 },
          }),

          // Section 4
          new Paragraph({
            text: "4. AI Dropout-Risk Engine & Safety Guardrails",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            run: { bold: true, size: 26, color: "0F172A" },
          }),
          new Paragraph({
            text: "The AI engine models 3 orthogonal signals to flag students at risk of dropping out:",
            spacing: { after: 80 },
          }),
          new Paragraph({
            text: "• Fee Overdue Signal (Max 35 pts): Days overdue past instalment deadline.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Attendance Trajectory (Max 35 pts): Sudden drop in monthly attendance percentage.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Test Score Percentile Trend (Max 30 pts): Drop in diagnostic test percentiles.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Strict Safety Guardrail (Human-in-the-Loop): ", bold: true }),
              new TextRun("When the AI triggers or is unsure, it ONLY creates an internal Counsellor Call Task. It NEVER triggers fee actions or parent messages. Counsellors can mark false flags, which refines model weights and prevents alert fatigue. Unmatched payments divert to an investigation queue instead of misallocating funds."),
            ],
            spacing: { after: 140 },
          }),

          // Section 5
          new Paragraph({
            text: "5. Labeled Assumptions",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            run: { bold: true, size: 26, color: "0F172A" },
          }),
          new Paragraph({ text: "[Assumption A1] Academic session is 365 calendar days commencing July 1.", spacing: { after: 60 } }),
          new Paragraph({ text: "[Assumption A2] Coaching services fall under SAC 999293 attracting 18% GST (9% CGST + 9% SGST).", spacing: { after: 60 } }),
          new Paragraph({ text: "[Assumption A3] MoE 2024 Coaching Guidelines cap non-refundable registration fees at ₹5,000.", spacing: { after: 60 } }),
          new Paragraph({ text: "[Assumption A4] Study material deduction is ₹8,000 when physical modules were delivered.", spacing: { after: 60 } }),
          new Paragraph({ text: "[Assumption A5] DPDP Act 2023 requires digital verifiable parental consent for minor students.", spacing: { after: 140 } }),

          // Section 6
          new Paragraph({
            text: "6. Scope Decisions & What We Cut",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            run: { bold: true, size: 26, color: "0F172A" },
          }),
          new Paragraph({
            text: "Cut: LMS video streaming, timetable scheduling, and admissions lead CRM were strictly excluded as specified in the brief's out-of-scope directives to prioritize shipping the core fee and refund slice to production standard.",
            spacing: { after: 80 },
          }),
          new Paragraph({
            text: "Next Steps: Meta WhatsApp Cloud API webhooks for production HSM templates, direct ICICI/HDFC Corporate Banking Open API account aggregator, and physical biometric turnstile RFID sidecar.",
            spacing: { after: 140 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "../TDD.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Successfully generated TDD.docx at " + outPath);
}

generateDocx().catch(console.error);
