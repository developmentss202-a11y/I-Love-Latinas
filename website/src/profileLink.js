const LIVE_SITE_URL = "https://latina.myaibusiness.online";

function publicSiteOrigin() {
  const configured = String(
    import.meta.env.VITE_PUBLIC_SITE_URL || ""
  ).replace(/\/$/, "");

  if (configured) return configured;

  if (typeof window === "undefined") return LIVE_SITE_URL;

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return LIVE_SITE_URL;
  }

  return window.location.origin;
}

export function profilePath(slug) {
  if (!slug) return "";
  return `/profile/${encodeURIComponent(slug)}`;
}

export function profileAbsoluteUrl(slug) {
  if (!slug) return "";
  return `${publicSiteOrigin()}${profilePath(slug)}`;
}

export function readStoredSlug() {
  try {
    return sessionStorage.getItem("ill-application-slug") || "";
  } catch {
    return "";
  }
}

export function storeSlug(slug) {
  if (!slug) return;
  try {
    sessionStorage.setItem("ill-application-slug", String(slug));
  } catch {
    /* ignore */
  }
}
