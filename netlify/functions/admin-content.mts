import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(name: string): string | undefined } };

const STORE_NAME = "rhuys-cms";
const GITHUB_BASE = "https://raw.githubusercontent.com/shtungfutures-lgtm/rhuys-volley-ball/main";

type ContentType = "gallery" | "products" | "partners" | "pages" | "teams";

type PageRecord = {
  slug: string;
  title: string;
  content: string;
  image: string;
};

const defaultTeams = {
  teams: [
    {
      id: "ecole-volley",
      name: "École de Volley",
      age: "8 à 11 ans",
      schedule: "Mercredi 16h00 - 17h30",
      location: "Sarzeau",
      image: "https://images.pexels.com/photos/6203648/pexels-photo-6203648.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Découverte du volley dans une ambiance ludique, progressive et collective.",
      highlights: ["Découverte du volley", "Motricité et coordination", "Approche ludique et collective"],
    },
    {
      id: "volley-jeunes",
      name: "Volley Jeunes",
      age: "12 à 17 ans",
      schedule: "Mercredi 18h00 - 19h30",
      location: "Sarzeau",
      image: "https://images.pexels.com/photos/6203569/pexels-photo-6203569.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Un groupe pour progresser techniquement, gagner en confiance et préparer les rencontres.",
      highlights: ["Perfectionnement technique", "Travail tactique", "Préparation aux rencontres"],
    },
    {
      id: "adultes-competition",
      name: "Loisir Adultes - Compétition",
      age: "Adultes",
      schedule: "Mercredi 20h30 - 22h30",
      location: "Surzur",
      image: "https://images.pexels.com/photos/6203586/pexels-photo-6203586.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Une pratique plus engagée pour les joueurs souhaitant évoluer dans un cadre compétitif.",
      highlights: ["Rythme soutenu", "Objectifs de performance", "Participation championnat"],
    },
    {
      id: "adultes-tous-niveaux",
      name: "Loisir Adultes - Tous niveaux",
      age: "Adultes",
      schedule: "Mardi 20h00 - 22h00",
      location: "Sarzeau",
      image: "https://images.pexels.com/photos/6203635/pexels-photo-6203635.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Une section conviviale ouverte aux débutants comme aux joueurs déjà expérimentés.",
      highlights: ["Séances conviviales", "Intégration des débutants", "Progression individualisée"],
    },
  ],
};

const contentConfig: Record<ContentType, { key: string; primaryField: string; fallbackUrls: string[] }> = {
  gallery: {
    key: "gallery",
    primaryField: "gallery",
    fallbackUrls: [`${GITHUB_BASE}/content/gallery/gallery.json`, `${GITHUB_BASE}/content/galerie/galerie.json`],
  },
  products: {
    key: "products",
    primaryField: "products",
    fallbackUrls: [`${GITHUB_BASE}/content/products/products.json`, `${GITHUB_BASE}/content/produits/produits.json`],
  },
  partners: {
    key: "partners",
    primaryField: "partners",
    fallbackUrls: [`${GITHUB_BASE}/content/partners/partners.json`, `${GITHUB_BASE}/content/partenaires/partenaires.json`],
  },
  teams: {
    key: "teams",
    primaryField: "teams",
    fallbackUrls: [`${GITHUB_BASE}/content/teams/teams.json`],
  },
  pages: {
    key: "pages",
    primaryField: "pages",
    fallbackUrls: [
      `${GITHUB_BASE}/content/pages/accueil.json`,
      `${GITHUB_BASE}/content/pages/club.json`,
      `${GITHUB_BASE}/content/pages/contact.json`,
      `${GITHUB_BASE}/content/pages/pages.json`,
    ],
  },
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

function toSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getContentType(req: Request): ContentType | null {
  const pathname = new URL(req.url).pathname;
  const segment = pathname.split("/").filter(Boolean).pop() || "";

  if (["gallery", "products", "partners", "pages", "teams"].includes(segment)) {
    return segment as ContentType;
  }

  return null;
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGallery(payload: unknown) {
  const raw = payload as { gallery?: unknown[]; galerie?: unknown[] };
  const items = Array.isArray(raw.gallery) ? raw.gallery : Array.isArray(raw.galerie) ? raw.galerie : [];

  return {
    gallery: items.map((item, index) => {
      const photo = item as Record<string, unknown>;
      const title = String(photo.title || photo.titre || `Photo ${index + 1}`);
      return {
        id: String(photo.id || toSlug(title) || `photo-${index + 1}`),
        title,
        image: String(photo.image || ""),
        description: String(photo.description || ""),
        category: String(photo.category || photo.categorie || "Club"),
      };
    }),
  };
}

function normalizeProducts(payload: unknown) {
  const raw = payload as { products?: unknown[]; produits?: unknown[] };
  const items = Array.isArray(raw.products) ? raw.products : Array.isArray(raw.produits) ? raw.produits : [];

  return {
    products: items.map((item, index) => {
      const product = item as Record<string, unknown>;
      const name = String(product.name || product.nom || `Produit ${index + 1}`);
      return {
        id: String(product.id || toSlug(name) || `produit-${index + 1}`),
        name,
        image: String(product.image || ""),
        price: String(product.price || product.prix || ""),
        sizes: asStringArray(product.sizes || product.tailles),
        colors: asStringArray(product.colors || product.couleurs),
        shortDescription: String(product.shortDescription || product.descriptionCourte || product.description || ""),
        detailedDescription: String(product.detailedDescription || product.descriptionDetaillee || product.description || ""),
        stripeLink: String(product.stripeLink || product.stripeTestLink || ""),
        priceId: String(product.priceId || product.price_id || ""),
        status: String(product.status || product.statut || "indisponible"),
        availability: String(product.availability || product.disponibilite || ""),
        stock: String(product.stock || ""),
      };
    }),
  };
}

function normalizePartners(payload: unknown) {
  const raw = payload as { partners?: unknown[]; partenaires?: unknown[] };
  const items = Array.isArray(raw.partners) ? raw.partners : Array.isArray(raw.partenaires) ? raw.partenaires : [];

  return {
    partners: items.map((item, index) => {
      const partner = item as Record<string, unknown>;
      const name = String(partner.name || partner.nom || `Partenaire ${index + 1}`);
      return {
        id: String(partner.id || toSlug(name) || `partenaire-${index + 1}`),
        name,
        logo: String(partner.logo || ""),
        category: String(partner.category || partner.categorie || "Partenaire local"),
        description: String(partner.description || ""),
        website: String(partner.website || partner.lien || partner.url || ""),
      };
    }),
  };
}

function normalizeTeams(payload: unknown) {
  const raw = payload as { teams?: unknown[]; equipes?: unknown[] };
  const items = Array.isArray(raw.teams) ? raw.teams : Array.isArray(raw.equipes) ? raw.equipes : [];

  return {
    teams: items.map((item, index) => {
      const team = item as Record<string, unknown>;
      const name = String(team.name || team.nom || `Équipe ${index + 1}`);
      return {
        id: String(team.id || toSlug(name) || `equipe-${index + 1}`),
        name,
        age: String(team.age || team.ages || team.category || ""),
        schedule: String(team.schedule || team.horaire || team.horaires || ""),
        location: String(team.location || team.lieu || ""),
        image: String(team.image || ""),
        description: String(team.description || ""),
        highlights: asStringArray(team.highlights || team.points || team.atouts),
      };
    }),
  };
}

function normalizePages(payload: unknown) {
  const raw = payload as Record<string, unknown>;
  let items: unknown[] = [];

  if (Array.isArray(raw.pages)) {
    items = raw.pages;
  } else if (raw.title || raw.content || raw.image) {
    items = [raw];
  }

  const pages = items.map((item, index) => {
    const page = item as Record<string, unknown>;
    return {
      slug: String(page.slug || ["index", "club", "contact"][index] || `page-${index + 1}`),
      title: String(page.title || page.titre || ""),
      content: String(page.content || page.contenu || ""),
      image: String(page.image || ""),
    } satisfies PageRecord;
  });

  return { pages };
}

function normalizePayload(type: ContentType, payload: unknown) {
  if (type === "gallery") return normalizeGallery(payload);
  if (type === "products") return normalizeProducts(payload);
  if (type === "partners") return normalizePartners(payload);
  if (type === "teams") return normalizeTeams(payload);
  return normalizePages(payload);
}

async function fetchFallback(type: ContentType) {
  const config = contentConfig[type];

  if (type === "teams") {
    for (const url of config.fallbackUrls) {
      const response = await fetch(url);
      if (!response.ok) continue;
      return normalizePayload(type, await response.json());
    }

    return normalizeTeams(defaultTeams);
  }

  if (type === "pages") {
    const pages: PageRecord[] = [];
    const slugs = ["index", "club", "contact"];

    for (let index = 0; index < config.fallbackUrls.length; index += 1) {
      const response = await fetch(config.fallbackUrls[index]);
      if (!response.ok) continue;
      const payload = await response.json();
      const normalized = normalizePages({ ...payload, slug: slugs[index] });
      for (const page of normalized.pages) {
        if (!pages.some((existing) => existing.slug === page.slug)) {
          pages.push(page);
        }
      }
    }

    return { pages };
  }

  for (const url of config.fallbackUrls) {
    const response = await fetch(url);
    if (!response.ok) continue;
    return normalizePayload(type, await response.json());
  }

  return normalizePayload(type, {});
}

async function getStoredContent(type: ContentType) {
  const store = getStore(STORE_NAME, { consistency: "strong" });
  const stored = await store.get(contentConfig[type].key, { type: "json" });

  if (stored) {
    return normalizePayload(type, stored);
  }

  return fetchFallback(type);
}

export default async (req: Request) => {
  const type = getContentType(req);

  if (!type) {
    return Response.json({ message: "Contenu inconnu." }, { status: 404 });
  }

  if (req.method === "GET") {
    return Response.json(await getStoredContent(type));
  }

  if (req.method !== "PUT") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!new URL(req.url).pathname.startsWith("/api/admin/") || !verifyToken(req)) {
    return Response.json({ message: "Session admin invalide." }, { status: 401 });
  }

  const payload = normalizePayload(type, await req.json().catch(() => ({})));
  const store = getStore(STORE_NAME, { consistency: "strong" });
  await store.setJSON(contentConfig[type].key, payload);

  return Response.json({ ok: true, ...payload });
};

export const config = {
  path: [
    "/api/gallery",
    "/api/products",
    "/api/partners",
    "/api/teams",
    "/api/pages",
    "/api/admin/gallery",
    "/api/admin/products",
    "/api/admin/partners",
    "/api/admin/teams",
    "/api/admin/pages",
  ],
};
