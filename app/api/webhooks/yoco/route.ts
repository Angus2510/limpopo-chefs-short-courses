import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";

// Yoco Checkout API webhook handler
// Event types: "payment.succeeded" | "payment.failed"
// Payload: { id, type, createdDate, payload: { id, amount, currency, status, metadata, ... } }

function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function verifyWebhookSignature(
  req: NextRequest,
  rawBody: string,
  secret: string,
) {
  const signatureHeader = req.headers.get("webhook-signature") ?? "";
  if (!signatureHeader) return false;

  // Standard Webhooks format used by Yoco when secret starts with whsec_.
  if (secret.startsWith("whsec_")) {
    const webhookId = req.headers.get("webhook-id") ?? "";
    const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
    if (!webhookId || !webhookTimestamp) return false;

    const timestampInt = Number(webhookTimestamp);
    if (!Number.isFinite(timestampInt)) return false;

    // Reject stale events to reduce replay risk.
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestampInt) > 180) return false;

    const secretPart = secret.split("_", 2)[1];
    if (!secretPart) return false;
    const secretBytes = Buffer.from(secretPart, "base64");
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
    const expectedSignature = createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    const signatures = signatureHeader.split(" ").map((entry) => {
      const [, value = ""] = entry.split(",", 2);
      return value;
    });

    return signatures.some((sig) => sig && safeCompare(sig, expectedSignature));
  }

  // Legacy fallback if a non-whsec secret is configured.
  const expectedHex = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const provided = signatureHeader.startsWith("v1,")
    ? (signatureHeader.split(",", 2)[1] ?? "")
    : signatureHeader;
  return !!provided && safeCompare(provided, expectedHex);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify webhook signature if secret is configured.
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const verified = verifyWebhookSignature(req, rawBody, webhookSecret);
    if (!verified) {
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
