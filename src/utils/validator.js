//Payment
// utils/validator.js
import crypto from "node:crypto";

export const validateSignature = (req) => {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return true; // Asumsi aman jika tidak ada secret di ENV
  }

  const incomingSignature = req.headers["x-webhook-signature"] || req.body.signature;
  if (!incomingSignature) {
    return false;
  }

  const rawBody = req.rawBody || JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature.length !== String(incomingSignature).length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(String(incomingSignature))
  );
};

export const validateWebhookPayload = (data) => {
  // Mengecek apakah input wajib tersedia
  if (!data.order_id) {
    return "order_id wajib disertakan dalam payload";
  }
  if (!data.transaction_status) {
    return "transaction_status wajib disertakan dalam payload";
  }
  
  return null; // Return null jika validasi lolos
};