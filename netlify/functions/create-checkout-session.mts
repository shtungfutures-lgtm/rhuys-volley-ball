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
  try {
    const stored = await getStore(STORE_NAME, { consistency: "strong" }).get("products", { type: "json" });
    const products = getProductsFromPayload(stored);
    const product = products.find((item) => cleanMetadataValue((item as Record<string, unknown>).id) === productId);
    const priceId = product ? getProductPriceId(product) : "";
    if (priceId) return priceId;
  } catch {
    // Local development without Blob state falls back to static content.
  }

  return fetchProductPriceIdFromContent(origin, productId);
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
  const productId = cleanMetadataValue(body.productId);
  const productName = cleanMetadataValue(body.productName) || "Produit RHUYS VOLLEY BALL";
  const priceId = cleanMetadataValue(body.priceId);
  const origin = getRequestOrigin(req);
  const expectedPriceId = (await getAllowedPriceId(origin, productId)) || fallbackAllowedPrices.get(productId);

  if (!expectedPriceId || expectedPriceId !== priceId) {
    return Response.json({ message: "Produit Stripe invalide ou non autorisé." }, { status: 400 });
  }

  const quantity = toPositiveQuantity(body.quantity);
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", String(quantity));
  params.set("success_url", `${origin}/boutique.html?checkout=success`);
  params.set("cancel_url", `${origin}/boutique.html?checkout=cancel`);
  params.set("client_reference_id", productId);
  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "auto");
  params.set("shipping_address_collection[allowed_countries][0]", "FR");
  params.set("metadata[product_id]", productId);
  params.set("metadata[product_name]", productName);
  params.set("metadata[size]", cleanMetadataValue(body.size));
  params.set("metadata[color]", cleanMetadataValue(body.color));
  params.set("metadata[quantity]", String(quantity));

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
