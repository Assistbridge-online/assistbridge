const PAYPAL_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

function paypalBase() {
  const mode = (process.env.PAYPAL_MODE ?? "sandbox").toLowerCase();
  return mode === "live" ? PAYPAL_BASE.live : PAYPAL_BASE.sandbox;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured");
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

interface CreateOrderParams {
  amount: number;
  currency: string;
  description?: string;
  customId?: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createOrder({
  amount,
  currency,
  description,
  customId,
  returnUrl,
  cancelUrl,
}: CreateOrderParams) {
  const token = await getAccessToken();

  const response = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          description: description ?? "AssistBridge payment",
          custom_id: customId,
        },
      ],
      application_context: {
        brand_name: "AssistBridge",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal createOrder failed: ${text}`);
  }

  const order = (await response.json()) as {
    id: string;
    status: string;
    links: { href: string; rel: string }[];
  };

  const approvalUrl =
    order.links.find((l) => l.rel === "approve")?.href ?? "";

  return { id: order.id, status: order.status, approvalUrl };
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken();
  const response = await fetch(
    `${paypalBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export async function getOrderDetails(orderId: string) {
  const token = await getAccessToken();
  const response = await fetch(
    `${paypalBase()}/v2/checkout/orders/${orderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal getOrder failed: ${text}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export async function refundCapture(captureId: string, amount?: number, currency: string = "USD") {
  const token = await getAccessToken();
  const body: Record<string, unknown> = {};
  if (amount !== undefined) {
    body.amount = {
      currency_code: currency.toUpperCase(),
      value: amount.toFixed(2),
    };
  }

  const response = await fetch(
    `${paypalBase()}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal refund failed: ${text}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export function verifyWebhookSignature(args: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: Record<string, unknown>;
}) {
  return getAccessToken().then(async () => {
    const token = await getAccessToken();
    const response = await fetch(
      `${paypalBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(args),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PayPal webhook verification failed: ${text}`);
    }
    return (await response.json()) as { verification_status: string };
  });
}
