import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(name: string): string | undefined } };

const STORE_NAME = "rhuys-cms";
const ORDERS_KEY = "orders";

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

function getSessionSecret() {
  const packed = getEnv("CMS_ADMIN_USERNAME").split("_");
  return getEnv("CMS_SESSION_SECRET") || getEnv("CMS_SECRET") || packed[2] || "";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function verifyToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [payload, signature] = token.split(".");

  if (!payload || !signature || !getSessionSecret()) {
    return false;
  }

  if (!safeEqual(signature, signPayload(payload))) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function normalizeOrdersPayload(payload: unknown): OrdersPayload {
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
      .filter((order) => Boolean(order.id))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };
}

export default async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!verifyToken(req)) {
    return Response.json({ message: "Session admin invalide." }, { status: 401 });
  }

  const store = getStore(STORE_NAME, { consistency: "strong" });
  const payload = await store.get(ORDERS_KEY, { type: "json" });

  return Response.json(normalizeOrdersPayload(payload || { orders: [] }));
};

export const config = {
  path: ["/api/orders", "/api/admin/orders"],
};
