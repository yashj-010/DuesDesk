// Application-wide configuration
// Supports quick renaming via environment variable or single constant update.

export const APP_CONFIG = {
  // Name of the application (configurable)
  name: process.env.NEXT_PUBLIC_APP_NAME || "DuesDesk",
  tagline: "Fee Tracking, Automated Dues & Parent Portal",
  clientName: "Company A, Jaipur",
  subTitle: "Jaipur Engineering & Medical Entrance Network (4 Centres)",
  annualRevenue: "₹31.2 Cr",
  annualStudents: 2600,
  centres: [
    { id: "C-01", name: "Malviya Nagar Centre", code: "MN" },
    { id: "C-02", name: "Raja Park Centre", code: "RP" },
    { id: "C-03", name: "Vaishali Nagar Centre", code: "VN" },
    { id: "C-04", name: "Vidhyadhar Nagar Centre", code: "VDN" },
  ],
  batches: [
    "JEE 2027 Morning",
    "JEE 2027 Evening",
    "NEET 2027 Morning",
    "NEET 2027 Evening",
  ],
  gstRate: 0.18, // 18% GST (9% CGST + 9% SGST)
  gstNumber: "08AABCC1234F1Z8", // Sample Rajasthan GSTIN
  statutoryRefundDays: 10, // Ministry of Education 2024 Guidelines: Max 10 days for pro-rata refund
};
