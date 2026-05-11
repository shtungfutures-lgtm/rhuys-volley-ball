import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(name: string): string | undefined } };

const STORE_NAME = "rhuys-cms";
const ARTICLES_KEY = "articles";
const FALLBACK_ARTICLES_URL =
  "https://raw.githubusercontent.com/shtungfutures-lgtm/rhuys-volley-ball/main/content/articles/articles.json";

type ArticleRecord = {
  id: string;
  title: string;
  date: string;
  category: string;
  featured_image: string;
  excerpt: string;
  body: string;
  author: string;
};

type ArticlesPayload = {
  articles: ArticleRecord[];
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

function getArticleDateKey(value: unknown) {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0];
  }

  const timestamp = Date.parse(String(value || ""));
  if (Number.isNaN(timestamp)) {
    return "";
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function getArticleTime(article: ArticleRecord) {
  const dateKey = getArticleDateKey(article.date);
  return dateKey ? Date.parse(`${dateKey}T12:00:00`) : 0;
}

function sortArticlesByNewest(articles: ArticleRecord[]) {
  return [...articles].sort((a, b) => {
    const dateDiff = getArticleTime(b) - getArticleTime(a);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return String(b.id || "").localeCompare(String(a.id || ""));
  });
}

function sortedPayload(payload: ArticlesPayload): ArticlesPayload {
  return {
    articles: sortArticlesByNewest(payload.articles),
  };
}

async function getStoredArticles() {
  const store = getStore(STORE_NAME, { consistency: "strong" });
  const stored = await store.get(ARTICLES_KEY, { type: "json" });

  if (stored) {
    return sortedPayload(normalizePayload(stored));
  }

  const fallback = await fetch(FALLBACK_ARTICLES_URL);
  if (!fallback.ok) {
    return { articles: [] };
  }

  return sortedPayload(normalizePayload(await fallback.json()));
}

function normalizePayload(payload: unknown) {
  const articles = Array.isArray((payload as { articles?: unknown }).articles)
    ? (payload as { articles: unknown[] }).articles
    : [];

  return sortedPayload({
    articles: articles.map((article, index) => ({
      id: String((article as { id?: string | number }).id || Date.now() + index),
      title: String((article as { title?: string }).title || "Article"),
      date: getArticleDateKey((article as { date?: string }).date) || new Date().toISOString().slice(0, 10),
      category: String((article as { category?: string }).category || "Club"),
      featured_image: String((article as { featured_image?: string }).featured_image || ""),
      excerpt: String((article as { excerpt?: string }).excerpt || ""),
      body: String((article as { body?: string }).body || ""),
      author: String((article as { author?: string }).author || "RHUYS VOLLEY BALL"),
    })),
  });
}

export default async (req: Request) => {
  if (req.method === "GET") {
    return Response.json(await getStoredArticles());
  }

  if (req.method !== "PUT") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!verifyToken(req)) {
    return Response.json({ message: "Session admin invalide." }, { status: 401 });
  }

  const payload = normalizePayload(await req.json().catch(() => ({ articles: [] })));
  const store = getStore(STORE_NAME, { consistency: "strong" });
  await store.setJSON(ARTICLES_KEY, payload);

  return Response.json({ ok: true, articles: payload.articles });
};

export const config = {
  path: ["/api/articles", "/api/admin/articles"],
};
