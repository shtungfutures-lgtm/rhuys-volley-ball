import { createHmac, randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(name: string): string | undefined } };

const STORE_NAME = "rhuys-cms";
const ORDERS_KEY = "orders";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
};

type OrderRecord = {
  id: string;
  stripeEventId: string;
  checkoutSessionId: string;
  paymentLinkId: string;
  amountTotal: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  lineItems: Array<{ description: string; quantity: number }>;
  selectedOptions: {
    size: string;
    color: string;
    quantity: number;
  };
  purchasedAt: string;
  createdAt: string;
};

type OrdersPayload = {
  orders: OrderRecord[];
};

function getEnv(name: string) {
  return Netlify.env.get(name) || process.env[name] || "";
}

function signStripePayload(payload: string, timestamp: string, secret: string) {
  const content = `${timestamp}.${payload}`;
  return createHmac("sha256", secret).update(content).digest("hex");
}

function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string) {
  if (!signatureHeader || !secret) {
    return false;
  }

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));

  if (!timestampPart || signatures.length === 0) {
    return false;
  }

  const timestamp = timestampPart.slice(2);
  const expected = signStripePayload(rawBody, timestamp, secret);

  const timestampMs = Number(timestamp) * 1000;
  const now = Date.now();
  const fiveMinutesMs = 5 * 60 * 1000;

  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > fiveMinutesMs) {
    return false;
  }

  return signatures.some((signature) => signature === expected);
}

function normalizeStoredOrders(payload: unknown): OrdersPayload {
  const orders = Array.isArray((payload as { orders?: unknown }).orders)
    ? ((payload as { orders: unknown[] }).orders as unknown[])
    : [];

  return {
    orders: orders
      .map((order) => {
        const raw = order as Record<string, unknown>;
        const lineItemsRaw = Array.isArray(raw.lineItems) ? raw.lineItems : [];

        return {
          id: String(raw.id || ""),
          stripeEventId: String(raw.stripeEventId || ""),
          checkoutSessionId: String(raw.checkoutSessionId || ""),
          paymentLinkId: String(raw.paymentLinkId || ""),
          amountTotal: Number(raw.amountTotal || 0),
          currency: String(raw.currency || "eur"),
          customerName: String(raw.customerName || ""),
          customerEmail: String(raw.customerEmail || ""),
          lineItems: lineItemsRaw.map((item) => {
            const rawItem = item as Record<string, unknown>;
            return {
              description: String(rawItem.description || "Produit"),
              quantity: Number(rawItem.quantity || 1),
            };
          }),
          selectedOptions: {
            size: String((raw.selectedOptions as Record<string, unknown> | undefined)?.size || ""),
            color: String((raw.selectedOptions as Record<string, unknown> | undefined)?.color || ""),
            quantity: Number((raw.selectedOptions as Record<string, unknown> | undefined)?.quantity || 1),
          },
          purchasedAt: String(raw.purchasedAt || ""),
          createdAt: String(raw.createdAt || ""),
        } satisfies OrderRecord;
      })
      .filter((order) => Boolean(order.id)),
  };
}

async function fetchCheckoutSessionLineItems(
  checkoutSessionId: string
): Promise<Array<{ description: string; quantity: number }>> {
  const stripeSecretKey = getEnv("STRIPE_SECRET_KEY");

  if (!stripeSecretKey || !checkoutSessionId) {
    return [];
  }

  const url = `${STRIPE_API_BASE}/checkout/sessions/${encodeURIComponent(checkoutSessionId)}/line_items?limit=100`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  const items = Array.isArray(payload.data) ? payload.data : [];

  return items.map((item) => ({
    description: String(item.description || "Produit"),
    quantity: Number(item.quantity || 1),
  }));
}

function toCurrencyString(amountMinor: number, currency: string) {
  const normalizedCurrency = (currency || "eur").toUpperCase();
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: normalizedCurrency,
  }).format(amountMinor / 100);
}

async function sendOrderNotificationEmail(order: OrderRecord) {
  const resendApiKey = getEnv("RESEND_API_KEY");
  const to = getEnv("STRIPE_ORDER_NOTIFY_TO") || getEnv("CLUB_EMAIL");
  const from = getEnv("STRIPE_ORDER_NOTIFY_FROM") || "Rhuys Volley <onboarding@resend.dev>";

  if (!resendApiKey || !to) {
    return;
  }

  const lineItemsText =
    order.lineItems.length > 0
      ? order.lineItems.map((item) => `- ${item.description} x${item.quantity}`).join("\n")
      : "- Détail produit non disponible";

  const amount = toCurrencyString(order.amountTotal, order.currency);
  const optionsText = [
    order.selectedOptions.size ? `Taille: ${order.selectedOptions.size}` : "",
    order.selectedOptions.color ? `Couleur: ${order.selectedOptions.color}` : "",
    `Quantité choisie: ${order.selectedOptions.quantity || 1}`,
  ]
    .filter(Boolean)
    .join("\n");

  const text = [
    "Nouvelle commande Stripe reçue.",
    "",
    `Commande: ${order.id}`,
    `Session Stripe: ${order.checkoutSessionId}`,
    `Montant: ${amount}`,
    `Client: ${order.customerName || "N/A"}`,
    `Email client: ${order.customerEmail || "N/A"}`,
    `Date de paiement: ${order.purchasedAt}`,
    "",
    "Articles:",
    lineItemsText,
    "",
    "Options:",
    optionsText || "Options non renseignées",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Nouvelle commande boutique - ${amount}`,
      text,
    }),
  });
}

async function persistOrder(order: OrderRecord) {
  const store = getStore(STORE_NAME, { consistency: "strong" });
  const existingPayload = await store.get(ORDERS_KEY, { type: "json" });
  const normalized = normalizeStoredOrders(existingPayload || { orders: [] });

  const alreadyExists = normalized.orders.some(
    (entry) =>
      entry.stripeEventId === order.stripeEventId ||
      (entry.checkoutSessionId && entry.checkoutSessionId === order.checkoutSessionId)
  );

  if (alreadyExists) {
    return { saved: false };
  }

  const updated: OrdersPayload = {
    orders: [order, ...normalized.orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };

  await store.setJSON(ORDERS_KEY, updated);
  return { saved: true };
}

async function buildOrderFromCheckoutEvent(event: StripeEvent): Promise<OrderRecord | null> {
  const session = event.data.object;
  const paymentStatus = String(session.payment_status || "").toLowerCase();

  if (paymentStatus && paymentStatus !== "paid") {
    return null;
  }

  const checkoutSessionId = String(session.id || "");
  if (!checkoutSessionId) {
    return null;
  }

  const amountTotal = Number(session.amount_total || 0);
  const currency = String(session.currency || "eur");
  const paymentLink = session.payment_link;
  const paymentLinkId = typeof paymentLink === "string" ? paymentLink : "";

  const customerDetails = (session.customer_details || {}) as Record<string, unknown>;
  const customerName = String(customerDetails.name || "");
  const customerEmail = String(customerDetails.email || "");
  const metadata = (session.metadata || {}) as Record<string, unknown>;

  const purchasedAt = new Date((Number(session.created) || event.created) * 1000).toISOString();
  const lineItems = await fetchCheckoutSessionLineItems(checkoutSessionId);

  return {
    id: `cmd_${randomUUID()}`,
    stripeEventId: event.id,
    checkoutSessionId,
    paymentLinkId,
    amountTotal,
    currency,
    customerName,
    customerEmail,
    lineItems,
    selectedOptions: {
      size: String(metadata.size || ""),
      color: String(metadata.color || ""),
      quantity: Number(metadata.quantity || 1),
    },
    purchasedAt,
    createdAt: new Date().toISOString(),
  };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");

  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return Response.json({ message: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return Response.json({ message: "Invalid event payload." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ ok: true, ignored: true, eventType: event.type });
  }

  const order = await buildOrderFromCheckoutEvent(event);
  if (!order) {
    return Response.json({ ok: true, ignored: true, reason: "Session not paid or incomplete" });
  }

  const persisted = await persistOrder(order);

  if (persisted.saved) {
    try {
      await sendOrderNotificationEmail(order);
    } catch (error) {
      console.error("Order email notification failed", error);
    }
  }

  return Response.json({ ok: true, saved: persisted.saved, orderId: order.id });
};

export const config = {
  path: "/api/stripe/webhook",
};
