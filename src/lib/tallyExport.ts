import { Student, PaymentTransaction } from "@/types";

/**
 * Generates Tally-compatible XML for Receipt and Sales Vouchers
 * Standard format for Tally Prime and Tally ERP 9
 */
export function generateTallyXML(students: Student[], transactions: PaymentTransaction[]): string {
  const xmlHeader = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Company A Coaching Jaipur</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>`;

  const voucherNodes = transactions.map((tx) => {
    const student = students.find((s) => s.id === tx.studentId);
    const studentName = student ? student.name : tx.studentId;
    const centreName = student ? student.centreName : "Jaipur Main";
    const dateFormatted = tx.date.replace(/-/g, ""); // YYYYMMDD for Tally

    return `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${dateFormatted}</DATE>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${tx.receiptNumber}</VOUCHERNUMBER>
            <REFERENCE>${tx.referenceId}</REFERENCE>
            <PARTYLEDGERNAME>${studentName} (${tx.studentId})</PARTYLEDGERNAME>
            <NARRATION>Coaching Fee Receipt for ${studentName}, Centre: ${centreName}. Base: ₹${tx.baseAmount}, CGST(9%): ₹${tx.cgst}, SGST(9%): ₹${tx.sgst}</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Bank Account / Payment Gateway</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${tx.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Coaching Tuition Fees</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.baseAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`;
  }).join("");

  const xmlFooter = `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return `${xmlHeader}${voucherNodes}${xmlFooter}`;
}

/**
 * Generates Tally-compatible CSV for accounts importing
 */
export function generateTallyCSV(students: Student[]): string {
  const headers = [
    "Student ID",
    "Student Name",
    "Centre",
    "Batch",
    "Total Plan (INR)",
    "Discount (INR)",
    "Net Payable (INR)",
    "Paid Amount (INR)",
    "Balance Due (INR)",
    "Overdue Category",
    "Parent Phone",
  ];

  const rows = students.map((s) => {
    let maxOverdueDays = 0;
    for (const inst of s.instalments) {
      if (inst.status !== "PAID" && inst.daysOverdue > maxOverdueDays) {
        maxOverdueDays = inst.daysOverdue;
      }
    }

    let category = "Not Due";
    if (maxOverdueDays > 60) category = ">60 Days Overdue";
    else if (maxOverdueDays > 30) category = "31-60 Days Overdue";
    else if (maxOverdueDays > 0) category = "1-30 Days Overdue";

    return [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.centreName}"`,
      `"${s.batch}"`,
      s.totalCourseFee,
      s.totalDiscount,
      s.netPayableFee,
      s.totalPaid,
      s.totalBalance,
      `"${category}"`,
      `"${s.parentPhone}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
