import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

// Yoco Checkout API webhook handler
// Event types: "payment.succeeded" | "payment.failed"
// Payload: { id, type, createdDate, payload: { id, amount, currency, status, metadata, ... } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify HMAC signature if secret is configured
  // Header name per Yoco spec: "webhook-signature"
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("webhook-signature") ?? "";
    const expected = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (signature !== expected) {
      console.warn("[yoco-webhook] Invalid signature — rejecting request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: {
    id: string;
    type: "payment.succeeded" | "payment.failed";
    createdDate: string;
    payload: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata?: Record<string, string>;
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, payload } = event;

  if (type === "payment.succeeded") {
    const clientReferenceId = payload.metadata?.clientReferenceId;
    const paymentId = payload.id;

    if (clientReferenceId) {
      const updated = await prisma.booking.updateMany({
        where: { clientReferenceId, status: "pending" },
        data: { status: "paid", yocoPaymentId: paymentId },
      });
      console.log(
        `[yoco-webhook] payment.succeeded — updated ${updated.count} booking(s) for ref ${clientReferenceId}`,
      );
    } else {
      console.warn(
        "[yoco-webhook] payment.succeeded but no clientReferenceId in metadata",
      );
    }
  } else if (type === "payment.failed") {
    const clientReferenceId = payload.metadata?.clientReferenceId;
    if (clientReferenceId) {
      await prisma.booking.updateMany({
        where: { clientReferenceId, status: "pending" },
        data: { status: "failed" },
      });
    }
  }

  // Always return 200 to acknowledge receipt to Yoco
  return NextResponse.json({ received: true });
}
