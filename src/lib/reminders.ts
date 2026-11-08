import { ReminderNotification, Instalment, Student } from "@/types";

export function generateRemindersForInstalment(
  student: Student,
  instalment: Instalment
): ReminderNotification[] {
  const dueDate = new Date(instalment.dueDate);
  const formattedDueDate = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const dueHindiDate = dueDate.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Pre-due: 3 days before
  const preDueDate = new Date(dueDate);
  preDueDate.setDate(preDueDate.getDate() - 3);

  // On-due
  const onDueDate = new Date(dueDate);

  // Post-due: 5 days after
  const postDueDate = new Date(dueDate);
  postDueDate.setDate(postDueDate.getDate() + 5);

  const notifications: ReminderNotification[] = [
    {
      id: `REM-${instalment.id}-PRE`,
      studentId: student.id,
      instalmentId: instalment.id,
      parentPhone: student.parentPhone,
      type: "PRE_DUE",
      scheduledDate: preDueDate.toISOString().split("T")[0],
      messageHindi: `प्रिय ${student.parentName}, आपके वार्ड ${student.name} की किस्त संख्या ${instalment.instalmentNumber} की राशि ₹${instalment.balanceAmount.toLocaleString("en-IN")} देय तिथि ${dueHindiDate} तक भुगतान के लिए शेष है। सुविधा के लिए लिंक से ऑनलाइन भुगतान करें: ${instalment.paymentLink}`,
      messageEnglish: `Dear ${student.parentName}, instalment #${instalment.instalmentNumber} of ₹${instalment.balanceAmount.toLocaleString("en-IN")} for ${student.name} is due on ${formattedDueDate}. Pay instantly via link: ${instalment.paymentLink}`,
      status: "SCHEDULED",
    },
    {
      id: `REM-${instalment.id}-DUE`,
      studentId: student.id,
      instalmentId: instalment.id,
      parentPhone: student.parentPhone,
      type: "ON_DUE",
      scheduledDate: onDueDate.toISOString().split("T")[0],
      messageHindi: `स्मरण: आज ${dueHindiDate} को ${student.name} की फीस किस्त ₹${instalment.balanceAmount.toLocaleString("en-IN")} की अंतिम देय तिथि है। कृपया विलंब शुल्क से बचने के लिए अभी भुगतान करें: ${instalment.paymentLink}`,
      messageEnglish: `Reminder: Today ${formattedDueDate} is the due date for ${student.name}'s fee instalment of ₹${instalment.balanceAmount.toLocaleString("en-IN")}. Please pay now to avoid late penalty: ${instalment.paymentLink}`,
      status: "SCHEDULED",
    },
    {
      id: `REM-${instalment.id}-POST`,
      studentId: student.id,
      instalmentId: instalment.id,
      parentPhone: student.parentPhone,
      type: "POST_DUE",
      scheduledDate: postDueDate.toISOString().split("T")[0],
      messageHindi: `अति आवश्यक सूचना: ${student.name} की फीस किस्त ₹${instalment.balanceAmount.toLocaleString("en-IN")} की देय तिथि समाप्त हो चुकी है। कृपया तुरंत भुगतान पूर्ण करें: ${instalment.paymentLink}`,
      messageEnglish: `Urgent notice: Fee instalment of ₹${instalment.balanceAmount.toLocaleString("en-IN")} for ${student.name} is overdue. Please settle immediately via: ${instalment.paymentLink}`,
      status: "SCHEDULED",
    },
  ];

  return notifications;
}

/**
 * Stop-on-Payment rule:
 * The MOMENT a payment is verified for an instalment, all pending or scheduled reminders
 * for that instalment MUST be cancelled immediately with timestamping, ensuring no parent
 * receives reminders for fees they have already settled.
 */
export function haltRemindersOnPayment(
  allReminders: ReminderNotification[],
  paidInstalmentId: string
): { updatedReminders: ReminderNotification[]; cancelledCount: number } {
  let cancelledCount = 0;
  const now = new Date().toISOString();

  const updatedReminders = allReminders.map((rem) => {
    if (rem.instalmentId === paidInstalmentId && rem.status === "SCHEDULED") {
      cancelledCount++;
      return {
        ...rem,
        status: "CANCELLED_ON_PAYMENT" as const,
        cancelledAt: now,
      };
    }
    return rem;
  });

  return { updatedReminders, cancelledCount };
}
