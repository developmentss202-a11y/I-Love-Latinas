import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CopyProfileLink from "./CopyProfileLink";
import { formFields, formSteps } from "./FormFields";
import { useLanguage } from "../language";
import { profilePath, readStoredSlug, storeSlug } from "../profileLink";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const DEMO_PHOTO = "/images/wa-1.jpg";

function photoUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function FieldValue({ field, application }) {
  const raw = application?.[field.name];

  if (field.type === "file") {
    const files = asList(raw);
    if (!files.length) return <span>—</span>;

    if (field.accept?.includes("image") || field.name === "photos") {
      return (
        <div className="profile-media profile-media--photos">
          {files.map((file) => (
            <img key={file} src={photoUrl(file)} alt={field.label} />
          ))}
        </div>
      );
    }

    if (field.accept?.includes("audio") || field.name === "voiceRecording") {
      return (
        <audio className="profile-media__audio" controls src={photoUrl(files[0])}>
          Voice recording
        </audio>
      );
    }

    if (field.accept?.includes("video") || field.name === "videoRecording") {
      return (
        <video className="profile-media__video" controls src={photoUrl(files[0])}>
          Video recording
        </video>
      );
    }

    return <span>{files.join(", ")}</span>;
  }

  if (raw === 0) return <span>0</span>;
  if (raw == null || raw === "") return <span>—</span>;
  return <span>{String(raw)}</span>;
}

function statusLabel(status) {
  const value = String(status || "pending").trim().toLowerCase();

  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  return "Pending";
}

export default function WomanProfilePage() {
  const { t } = useLanguage();
  const { slug: slugParam } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const slug = slugParam || readStoredSlug();
  const applicationStatus = statusLabel(application?.status);

  useEffect(() => {
    if (slugParam) storeSlug(slugParam);

    if (!slugParam && readStoredSlug()) {
      navigate(profilePath(readStoredSlug()), { replace: true });
      return undefined;
    }

    if (!slug) {
      setLoading(false);
      setError("This profile link is missing. Use the copied link from your submitted application.");
      return undefined;
    }

    let cancelled = false;

    function loadProfile(isRefresh = false) {
      if (!isRefresh) {
        setError("");
        setLoading(true);
      }

      fetch(`${API_BASE}/api/applications/by-slug/${encodeURIComponent(slug)}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (cancelled) return;
          const next = data?.application;
          if (!next) {
            if (!isRefresh) {
              setApplication(null);
              setError("We could not find this profile. Check that you used the full copied link.");
            }
            return;
          }
          setError("");
          storeSlug(next.slug || slug);
          setApplication(next);
        })
        .catch(() => {
          if (!cancelled && !isRefresh) {
            setError("We could not load this profile right now.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    loadProfile();

    function onFocus() {
      loadProfile(true);
    }

    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [navigate, slug, slugParam]);

  const photo = useMemo(() => {
    const first = asList(application?.photos)[0];
    return photoUrl(first) || DEMO_PHOTO;
  }, [application]);

  const name = application?.firstName || "Your profile";

  return (
    <section className="woman-stage woman-stage--form" aria-labelledby="live-profile-title">
      <div className="woman-stage__art">
        {photo ? <img src={photo} alt="" /> : null}
      </div>
      <div className="woman-stage__veil" />

      <div className="woman-form">
        <CopyProfileLink slug={application?.slug || slug} />

        <header className="woman-form__banner">
          <p className="gender-kicker">{t("Your profile")}</p>
          <h1 id="live-profile-title">{t("Your submitted application")}</h1>
          <p>
            {t("This is your unique profile page. Keep the copied link so you can return here later.")}
          </p>
        </header>

        {loading ? (
          <p className="pending-card__body">{t("Loading your profile…")}</p>
        ) : error ? (
          <p className="pending-card__body">{error}</p>
        ) : (
          <>
            <div className="woman-form__identity">
              <img src={photo} alt={name} />
              <div>
                <p className="gender-kicker">{t("Your listing")}</p>
                <div className="woman-form__identity-head">
                  <h2>{name}</h2>
                  <span
                    className={`profile-status-pill profile-status-pill--${applicationStatus.toLowerCase()}`}
                  >
                    {t(applicationStatus)}
                  </span>
                </div>
                <p>{t("All of the details you submitted are shown below.")}</p>
              </div>
            </div>

            {formSteps.map((step) => {
              const fields = formFields.filter((field) => field.step === step.id);
              return (
                <section key={step.id} className="profile-fields__section">
                  <header>
                    <p className="gender-kicker">{t(step.subtitle)}</p>
                    <h2>{t(step.title)}</h2>
                  </header>
                  <dl className="profile-fields__grid">
                    {fields.map((field) => (
                      <div
                        key={field.name}
                        className={
                          field.type === "textarea" || field.type === "file" ? "is-wide" : ""
                        }
                      >
                        <dt>{t(field.label)}</dt>
                        <dd>
                          <FieldValue field={field} application={application} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
