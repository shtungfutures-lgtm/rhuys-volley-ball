import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(name: string): string | undefined } };

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STORE_NAME = "rhuys-cms";

const fallbackAllowedPrices = new Map([
  ["sweat-rvb", "price_1TSKcP3OCDghhlsbO4GhVpHA"],
  ["tshirt-club", "price_1TVIJN3OCDghhlsbNVFVJ3rN"],
  ["maillot-entrainement", "price_1TVIJO3OCDghhlsbkjbbj2vd"],
  ["gourde-club", "price_1TVIJQ3OCDghhlsbt6IFwq4f"],
  ["sac-sport", "price_1TVIJS3OCDghhlsbEhYNVgAB"],
]);

type CheckoutItem = {
  productId: string;
  productName: string;
  priceId: string;
  quantity: number;
  size: string;
  color: string;
};

function getEnv(name: string) {
  return Netlify.env.get(name) || process.env[name] || "";
}

function getRequestOrigin(req: Request) {
  const origin = req.headers.get("origin");

  if (origin) {
    return origin;
  }

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

function toPositiveQuantity(value: unknown) {
  const quantity = Number(value || 1);

  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.min(10, Math.trunc(quantity)));
}

function cleanMetadataValue(value: unknown) {
  return String(value || "").slice(0, 250);
}

function getProductsFromPayload(payload: unknown) {
  const products = (payload as { products?: unknown[]; produits?: unknown[] }) || {};
  return Array.isArray(products.products)
    ? products.products
    : Array.isArray(products.produits)
      ? products.produits
      : [];
}

function getProductPriceId(product: unknown) {
  const data = product as Record<string, unknown>;
  return cleanMetadataValue(data.priceId || data.price_id || data.stripePriceId || "");
}

function normalizeCheckoutItems(body: Record<string, unknown>) {
  const rawItems = Array.isArray(body.items) ? body.items : [body];

  return rawItems
    .slice(0, 20)
    .map((rawItem) => {
      const data = (rawItem || {}) as Record<string, unknown>;
      const productId = cleanMetadataValue(data.productId);
      const priceId = cleanMetadataValue(data.priceId);

      if (!productId || !priceId) {
        return null;
      }

      return {
        productId,
        productName: cleanMetadataValue(data.productName) || "Produit RHUYS VOLLEY BALL",
        priceId,
        quantity: toPositiveQuantity(data.quantity),
        size: cleanMetadataValue(data.size),
        color: cleanMetadataValue(data.color),
      };
    })
    .filter((item): item is CheckoutItem => Boolean(item));
}

function getCartSummary(items: CheckoutItem[]) {
  return items
    .map((item) => {
      const options = [item.size, item.color].filter(Boolean).join("/");
      return `${item.productId}${options ? `(${options})` : ""}x${item.quantity}`;
    })
    .join(", ")
    .slice(0, 250);
}

async function fetchProductPriceIdFromContent(origin: string, productId: string) {
  const urls = [`${origin}/content/products/products.json`, `${origin}/content/produits/produits.json`];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const products = getProductsFromPayload(await response.json());
      const product = products.find((item) => cleanMetadataValue((item as Record<string, unknown>).id) === productId);
      const priceId = product ? getProductPriceId(product) : "";
      if (priceId) return priceId;
    } catch {
      // The checkout can continue with the next source.
    }
  }

  return "";
}

async function getAllowedPriceId(origin: string, productId: string) {
  const contentPriceId = await fetchProductPriceIdFromContent(origin, productId);
  if (contentPriceId) {
    return contentPriceId;
  }

  try {
    const stored = await getStore(STORE_NAME, { consistency: "strong" }).get("products", { type: "json" });
    const products = getProductsFromPayload(stored);
    const product = products.find((item) => cleanMetadataValue((item as Record<string, unknown>).id) === productId);
    const priceId = product ? getProductPriceId(product) : "";
    if (priceId) return priceId;
  } catch {
    // Local development without Blob state falls back to static content.
  }

  return "";
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeSecretKey = getEnv("STRIPE_SECRET_KEY");

  if (!stripeSecretKey) {
    return Response.json(
      { message: "Configuration Stripe manquante : ajoutez STRIPE_SECRET_KEY sur Netlify." },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const origin = getRequestOrigin(req);
  const items = normalizeCheckoutItems(body);

  if (!items.length) {
    return Response.json({ message: "Panier vide ou produit Stripe manquant." }, { status: 400 });
  }

  for (const item of items) {
    const expectedPriceId = (await getAllowedPriceId(origin, item.productId)) || fallbackAllowedPrices.get(item.productId);

    if (!expectedPriceId || expectedPriceId !== item.priceId) {
      return Response.json({ message: "Produit Stripe invalide ou non autorisé." }, { status: 400 });
    }
  }

  const params = new URLSearchParams();
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  params.set("mode", "payment");
  items.forEach((item, index) => {
    params.set(`line_items[${index}][price]`, item.priceId);
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
  });
  params.set("success_url", `${origin}/boutique.html?checkout=success`);
  params.set("cancel_url", `${origin}/boutique.html?checkout=cancel`);
  params.set("client_reference_id", items.length === 1 ? items[0].productId : `cart-${Date.now()}`);
  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "auto");
  params.set("shipping_address_collection[allowed_countries][0]", "FR");
  params.set("metadata[order_type]", items.length === 1 ? "single" : "cart");
  params.set("metadata[item_count]", String(items.length));
  params.set("metadata[total_quantity]", String(totalQuantity));
  params.set("metadata[cart_summary]", getCartSummary(items));

  if (items.length === 1) {
    params.set("metadata[product_id]", items[0].productId);
    params.set("metadata[product_name]", items[0].productName);
    params.set("metadata[size]", items[0].size);
    params.set("metadata[color]", items[0].color);
    params.set("metadata[quantity]", String(items[0].quantity));
  } else {
    params.set("metadata[product_id]", "cart");
    params.set("metadata[product_name]", "Panier boutique RHUYS VOLLEY BALL");
    params.set("metadata[quantity]", String(totalQuantity));
  }

  const stripeResponse = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const payload = (await stripeResponse.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!stripeResponse.ok || !payload.url) {
    return Response.json(
      { message: payload.error?.message || "Stripe Checkout est indisponible pour le moment." },
      { status: stripeResponse.status || 502 }
    );
  }

  return Response.json({ id: payload.id, url: payload.url });
};

export const config = {
  path: "/api/create-checkout-session",
};
