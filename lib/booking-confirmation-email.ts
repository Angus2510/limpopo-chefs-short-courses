import { Resend } from "resend";
import { formatDate, formatPrice } from "@/lib/courses";

type BookingConfirmation = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  campus: string;
  date: string;
  participants: number;
  amount: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendBookingConfirmation(booking: BookingConfirmation) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      "[booking-confirmation-email] Missing RESEND_API_KEY or RESEND_FROM_EMAIL; confirmation email was not sent",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const customerName = `${booking.firstName} ${booking.lastName}`.trim();
  const reference = booking.id;
  const formattedDate = formatDate(booking.date);
  const formattedAmount = formatPrice(booking.amount / 100);
  const logoUrl = process.env.RESEND_LOGO_URL?.trim();
  const supportContacts = [
    {
      name: "Mokopane Campus",
      phone: "015 491 1226",
      whatsapp: "066 008 6821",
      address: "82 Rabe Street, Mokopane 0600",
    },
    {
      name: "Polokwane Campus",
      phone: "015 292 0102",
      whatsapp: "066 245 0458",
      address: "22 Hans van Rensburg Street, Polokwane 0699",
    },
  ];

  const text = [
    `Hello ${customerName},`,
    "",
    "Your booking is confirmed.",
    `Date: ${formattedDate}`,
    `Participants: ${booking.participants}`,
    `Total paid: ${formattedAmount}`,
    `Booking reference: ${reference}`,
    "",
    "For assistance, please contact either campus:",
    ...supportContacts.flatMap((contact) => [
      "",
      contact.name,
      contact.phone,
      contact.whatsapp,
      contact.address,
    ]),
    "",
    "Limpopo Chefs Academy",
  ].join("\n");

  const html = `
    <div style="margin:0;background:#f3f3f3;padding:32px 16px;font-family:Arial,sans-serif;color:#131313">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden">
        ${logoUrl ? `<div style="background:#ffffff;padding:20px 24px 8px;text-align:center"><img src="${escapeHtml(logoUrl)}" alt="Limpopo Chefs Academy" width="220" style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto" /></div>` : `<div style="background:#ffffff;padding:20px 24px 8px;text-align:center;font-size:18px;font-weight:700;color:#315631">Limpopo Chefs Academy</div>`}
        <div style="background:#315631;padding:24px;color:#ffffff">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.75">Limpopo Chefs Academy</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25">Your booking is confirmed</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 20px;font-size:16px;line-height:1.5">Hello ${escapeHtml(customerName)}, your booking has been successfully confirmed.</p>
          <div style="border:1px solid #e5e5e5;border-radius:8px;padding:16px">
            <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#666">Booking details</p>
            <p style="margin:8px 0"><strong>Course:</strong> ${escapeHtml(booking.courseTitle)}</p>
            <p style="margin:8px 0"><strong>Campus:</strong> ${escapeHtml(booking.campus)}</p>
            <p style="margin:8px 0"><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
            <p style="margin:8px 0"><strong>Participants:</strong> ${booking.participants}</p>
            <p style="margin:8px 0"><strong>Total paid:</strong> ${escapeHtml(formattedAmount)}</p>
            <p style="margin:8px 0 0"><strong>Booking reference:</strong> ${escapeHtml(reference)}</p>
          </div>
          <div style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#454545">
            <p style="margin:0 0 8px"><strong>Need assistance?</strong> Contact either campus:</p>
            ${supportContacts
              .map(
                (contact) => `<div style="margin:12px 0">
                  <p style="margin:0;font-weight:700">${escapeHtml(contact.name)}</p>
                  <p style="margin:2px 0">${escapeHtml(contact.phone)}</p>
                  <p style="margin:2px 0">${escapeHtml(contact.whatsapp)}</p>
                  <p style="margin:2px 0">${escapeHtml(contact.address)}</p>
                </div>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: "Your booking is confirmed",
      html,
      text,
    });

    if (error) {
      console.error("[booking-confirmation-email] Resend error:", error);
      return;
    }

    console.log(
      `[booking-confirmation-email] Sent confirmation for booking ${booking.id}`,
    );
  } catch (error) {
    console.error("[booking-confirmation-email] Failed to send email:", error);
  }
}
