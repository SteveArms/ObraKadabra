// Absolute base for share links and Open Graph images: the explicit site URL, then the URL Vercel gives each deploy, then local dev
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL;
  if (explicit) return new URL(explicit);
  return new URL(vercel ? `https://${vercel}` : "http://localhost:3000");
}
