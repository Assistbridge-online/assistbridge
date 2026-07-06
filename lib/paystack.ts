// Paystack wrapper — mirrors lib/stripe.ts and lib/paypal.ts shape so the
// rest of the app can treat all three gateways the same way.
//
// API references:
//   POST  /transaction/initialize   → returns authorization_url + reference
//   GET   /transaction/verify/:ref  → returns full transaction incl. status + amount
//   POST  /refund                  → initiate a refund against a transaction
//
// Auth: every request carries `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`.
//
// Amount units: Paystack's `amount` is in the smallest unit of the currency —
// kobo for NGN, cents for USD/GHS/ZAR. We always do the × 100 conversion in
// here so the rest of the app can pass through normal decimal amounts (same
// pattern as Stripe's cents-based amount handling).

const PAYSTACK_BASE = "https://api.paystack.co";

// Currencies Paystack will settle to. USD is accepted for international
// card payments and is the default for our `currency` field on Order. Any
// other ISO 4217 code passed in will be rejected by Paystack at
// initialize-time, so we validate client-side here too.
export const PAYSTACK_SUPPORTED_CURRENCIES = new Set([
  "NGN", // Nigerian Naira
  "GHS", // Ghanaian Cedi
  "ZAR", // South African Rand
  "USD", // US Dollar (international cards)
]);

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured. Add it to your .env file or environment variables."
    );
  }
  return key;
}

function getPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured. Add it to your .env file or environment variables."
    );
  }
  return key;
}

interface PaystackFetchOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
}

async function paystackFetch<T = unknown>(
  path: string,
  { method = "GET", body }: PaystackFetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getSecretKey()}`,
    Accept: "application/json",
  };
  const init: RequestInit = { method, headers };
  if (body) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${PAYSTACK_BASE}${path}`, init);
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }
  if (!res.ok) {
    const message =
      (parsed as { message?: string })?.message ?? `Paystack ${method} ${path} failed with ${res.status}`;
    throw new Error(`Paystack error: ${message}`);
  }
  return parsed as T;
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
}

export function isSupportedCurrency(currency: string): boolean {
  return PAYSTACK_SUPPORTED_CURRENCIES.has(currency.toUpperCase());
}

/** Exported so the public-key can be read from the browser safely. */
export function getPaystackPublicKey(): string {
  return getPublicKey();
}

interface InitializeTransactionParams {
  email: string;
  amount: number;       // decimal (e.g. 50.00)
  currency?: string;    // default "USD" — only NGN/GHS/ZAR/USD accepted
  reference?: string;   // your own reference. We always pass orderId.
  callbackUrl?: string;
  metadata?: Record<string, string>;
  channels?: string[];  // e.g. ["card", "bank", "ussd", "mobile_money"]
}

export interface InitializeTransactionResult {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const currency = (params.currency ?? "USD").toUpperCase();
  if (!isSupportedCurrency(currency)) {
    throw new Error(
      `Paystack does not support currency "${currency}". Supported currencies: ${Array.from(
        PAYSTACK_SUPPORTED_CURRENCIES
      ).join(", ")}.`
    );
  }
  const data = await paystackFetch<{
    status: boolean;
    data: { authorization_url: string; reference: string; access_code: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: {
      email: params.email,
      // Paystack takes integer smallest-unit. Send it as a string to avoid
      // any client/library float arithmetic drift (e.g. 0.1 + 0.2).
      amount: Math.round(params.amount * 100).toString(),
      currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      channels: params.channels ?? ["card", "bank", "ussd", "mobile_money"],
    },
  });
  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
    accessCode: data.data.access_code,
  };
}

export interface VerifiedTransaction {
  id: number;
  reference: string;
  status: "success" | "failed" | "pending" | "abandoned" | "reversed";
  amount: number; // in cents/kobo
  currency: string;
  paid_at?: string;
  channel?: string;
  customer?: { email: string };
  authorization?: {
    authorization_code: string;
    reusable?: boolean;
    card_type?: string;
    last4?: string;
    bank?: string;
  };
}

export async function verifyTransaction(reference: string): Promise<VerifiedTransaction> {
  const data = await paystackFetch<{ status: boolean; data: VerifiedTransaction }>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
  return data.data;
}

interface RefundParams {
  transactionReference: string; // the original transaction reference
  amount?: number;              // decimal; omit for full refund
  merchantNote?: string;
}

export async function refundTransaction(params: RefundParams): Promise<{
  id: string;
  status: string;
  amount: number;
}> {
  const body: Record<string, unknown> = {
    transaction: params.transactionReference,
    merchant_note: params.merchantNote ?? "Customer-initiated refund",
  };
  if (params.amount !== undefined) {
    body.amount = Math.round(params.amount * 100).toString();
  }
  const data = await paystackFetch<{
    status: boolean;
    data: { id: number; status: string; amount: number };
  }>("/refund", { method: "POST", body });
  return {
    id: String(data.data.id),
    status: data.data.status,
    amount: data.data.amount / 100,
  };
}

/**
 * Verify a webhook request from Paystack. Returns the parsed JSON event body
 * if the signature is valid, otherwise throws.
 *
 * Paystack signs webhooks with HMAC SHA-512 of the raw body using your
 * webhook secret as the key, sent in the `x-paystack-signature` header.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): unknown {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "PAYSTACK_WEBHOOK_SECRET is not configured. Set it in your environment."
    );
  }
  // Node's crypto is the safest cross-runtime path; the API route already
  // forces runtime = "nodejs" so this is always available.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (computed.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(signature, "hex"))) {
    throw new Error("Invalid Paystack webhook signature");
  }
  return JSON.parse(rawBody);
}
