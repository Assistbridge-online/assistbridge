import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured. Add it to your .env file or environment variables.");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
      appInfo: { name: "AssistBridge", version: "0.1.0" },
    });
  }
  return _stripe;
}

interface CreateCheckoutSessionParams {
  orderId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession({
  orderId,
  amount,
  currency,
  successUrl,
  cancelUrl,
  customerEmail,
  description,
  metadata,
}: CreateCheckoutSessionParams) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: description ?? `AssistBridge Order #${orderId.slice(-8)}`,
            description: `Order ${orderId}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`,
    cancel_url: `${cancelUrl}?order=${orderId}`,
    customer_email: customerEmail,
    metadata: { orderId, ...(metadata ?? {}) },
    payment_intent_data: { metadata: { orderId, ...(metadata ?? {}) } },
  });
  return { url: session.url, id: session.id };
}

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  description?: string;
}

export async function createPaymentIntent({ amount, currency, metadata, customerEmail, description }: CreatePaymentIntentParams) {
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    receipt_email: customerEmail,
    description: description ?? "AssistBridge payment",
    metadata: metadata ?? {},
  });
  return { id: intent.id, clientSecret: intent.client_secret, status: intent.status };
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason: "requested_by_customer",
  });
  return { id: refund.id, status: refund.status, amount: refund.amount / 100 };
}

export async function retrieveCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}
