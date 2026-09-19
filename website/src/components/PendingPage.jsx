import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../language";
import { profilePath, readStoredSlug, storeSlug } from "../profileLink";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function PendingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [slug, setSlug] = useState(
    () => params.get("slug")?.trim() || readStoredSlug()
  );

  useEffect(() => {
    const fromQuery = params.get("slug")?.trim() || "";
    if (fromQuery) {
      storeSlug(fromQuery);
      setSlug(fromQuery);
      return undefined;
    }

    if (readStoredSlug()) return undefined;

    let id = "";
    try {
      id = sessionStorage.getItem("ill-application-id") || "";
    } catch {
      id = "";
    }

    if (!id) return undefined;

    let cancelled = false;

    fetch(`${API_BASE}/api/applications/${id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const nextSlug = data?.application?.slug;
        if (cancelled || !nextSlug) return;
        storeSlug(nextSlug);
        setSlug(String(nextSlug));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [params]);

  const profileHref = profilePath(slug);

  return (
    <section className="woman-stage" aria-labelledby="pending-title">
      <div className="woman-stage__art">
        <img
          src="https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?auto=format&fit=crop&w=1800&q=80"
          alt=""
        />
      </div>
      <div className="woman-stage__veil" />
      <div className="pending-card pending-card--dark">
        <div className="pending-card__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"
              fill="currentColor"
            />
          </svg>
        </div>
        <p className="gender-kicker">{t("Application Submitted")}</p>
        <h1 id="pending-title">{t("Your profile has been successfully submitted.")}</h1>
        <p className="pending-card__body">
          {t("Thank you for registering with us. We'll keep you updated as new opportunities become available.")}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!profileHref}
          onClick={() => {
            if (profileHref) navigate(profileHref);
          }}
        >
          {t("View Your Profile")}
        </button>
      </div>
    </section>
  );
}
