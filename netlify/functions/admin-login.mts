import { createHmac, timingSafeEqual } from "node:crypto";

declare const Netlify: { env: { get(name: string): string | undefined } };

function getEnv(name: string) {
  return Netlify.env.get(name) || process.env[name] || "";
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getEnv("CMS_SESSION_SECRET")).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedUsername = getEnv("CMS_ADMIN_USERNAME");
  const expectedPassword = getEnv("CMS_ADMIN_PASSWORD");
  const sessionSecret = getEnv("CMS_SESSION_SECRET");

  if (!expectedUsername || !expectedPassword || !sessionSecret) {
    return Response.json(
      { message: "Configuration admin manquante sur Netlify." },
      { status: 500 }
    );
  }

  const { username = "", password = "" } = await req.json().catch(() => ({}));
  const isValidUser = safeEqual(String(username), expectedUsername);
  const isValidPassword = safeEqual(String(password), expectedPassword);

  if (!isValidUser || !isValidPassword) {
    return Response.json({ message: "Identifiants incorrects." }, { status: 401 });
  }

  const payload = toBase64Url(
    JSON.stringify({
      username: expectedUsername,
      exp: Date.now() + 1000 * 60 * 60 * 8,
    })
  );
  const token = `${payload}.${signPayload(payload)}`;

  return Response.json({ token });
};

export const config = {
  path: "/api/admin/login",
};
