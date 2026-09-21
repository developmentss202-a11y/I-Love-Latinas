const LIVE_SITE_URL = "https://latinas.myaibusiness.online";

function normalizeSiteOrigin(origin) {
  return String(origin || "")
    .replace(/\/$/, "")
    .replace("://latina.myaibusiness.online", "://latinas.myaibusiness.online");
}

function publicSiteOrigin() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return normalizeSiteOrigin(window.location.origin);
    }
  }

  const configured = String(
    import.meta.env.VITE_PUBLIC_SITE_URL || ""
  ).replace(/\/$/, "");

  return normalizeSiteOrigin(configured || LIVE_SITE_URL);
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
