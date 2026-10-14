import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CopyProfileLink from "./CopyProfileLink";
import { useLanguage } from "../language";
import {
  manProfilePath,
  readStoredManSlug,
  storeManSlug,
} from "../profileLink";

const LIVE_API = "https://node.latina.myaibusiness.online";

// Honor VITE_API_URL including localhost. Live only if env is empty.
const API_BASE = (() => {
  const fromEnv = String(import.meta.env.VITE_API_URL || "").trim();
  if (!fromEnv) return LIVE_API;
  return fromEnv.replace(/\/$/, "");
})();

const NIGHT_LABELS = {
  "hotel-beach": "Hotel at Beach",
  "hotel-mountains": "Hotel at Mountains",
  dinner: "Late dinner",
  hotel: "Hotel / private suite",
  weekend: "Weekend away",
  open: "Open to her suggestion",
};

function formatMeetingDate(value, language) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(language === "es" ? "es-ES" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calendarParts(value, language) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    return {
      month: "—",
      day: "—",
      weekday: "",
      time: "",
    };
  }

  const locale = language === "es" ? "es-ES" : "en-US";

  return {
    month: date.toLocaleDateString(locale, { month: "short" }),
    day: String(date.getDate()),
    weekday: date.toLocaleDateString(locale, { weekday: "short" }),
    time: date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function nightLabel(value, t) {
  return t(NIGHT_LABELS[value] || value || "—");
}

function EntryDetails({ entry, t, language }) {
  const members =
    Array.isArray(entry.memberNames) && entry.memberNames.length
      ? entry.memberNames
      : entry.memberName
        ? [entry.memberName]
        : [];

  return (
    <dl className="man-entry__details">
      <div>
        <dt>{t("What you are looking for")}</dt>
        <dd>{t(entry.lookingForLabel || entry.lookingFor || "—")}</dd>
      </div>
      <div>
        <dt>{t("She is")}</dt>
        <dd>{members.length ? members.join(", ") : "—"}</dd>
      </div>
      <div>
        <dt>{t("Desired meeting date & time")}</dt>
        <dd>{formatMeetingDate(entry.meetingDate, language)}</dd>
      </div>
      <div>
        <dt>{t("Meeting Preference")}</dt>
        <dd>{nightLabel(entry.nightType, t)}</dd>
      </div>
      <div>
        <dt>{t("Place Name")}</dt>
        <dd>{entry.hotelName || "Ecuador"}</dd>
      </div>
      <div>
        <dt>{t("Your name")}</dt>
        <dd>{entry.name || "—"}</dd>
      </div>
      <div>
        <dt>{t("Your email")}</dt>
        <dd>{entry.email || "—"}</dd>
      </div>
      <div>
        <dt>{t("Mobile number")}</dt>
        <dd>{entry.mobile || "—"}</dd>
      </div>
      <div>
        <dt>{t("Subject")}</dt>
        <dd>{entry.subject || "—"}</dd>
      </div>
      <div className="man-entry__details--full">
        <dt>{t("What you want")}</dt>
        <dd>{entry.message || "—"}</dd>
      </div>
      <div>
        <dt>{t("Status")}</dt>
        <dd>{t(String(entry.status || "pending"))}</dd>
      </div>
    </dl>
  );
}

export default function ManProfilePage() {
  const { t, lang } = useLanguage();
  const { slug: slugParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [man, setMan] = useState(null);
  const [applications, setApplications] = useState([]);
  const [openId, setOpenId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSubmittedPopup, setShowSubmittedPopup] = useState(
    () => searchParams.get("submitted") === "1"
  );

  const slug = slugParam || readStoredManSlug();

  const sortedEntries = useMemo(() => {
    return [...applications].sort(
      (a, b) =>
        new Date(a.meetingDate || 0).getTime() -
        new Date(b.meetingDate || 0).getTime()
    );
  }, [applications]);

  useEffect(() => {
    if (searchParams.get("submitted") === "1") {
      setShowSubmittedPopup(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (slugParam) storeManSlug(slugParam);

    if (!slugParam && readStoredManSlug()) {
      const suffix =
        searchParams.get("submitted") === "1" ? "?submitted=1" : "";
      navigate(`${manProfilePath(readStoredManSlug())}${suffix}`, {
        replace: true,
      });
      return undefined;
    }

    if (!slug) {
      setLoading(false);
      setError(
        t("This profile link is missing. Use the copied link from your submitted application.")
      );
      return undefined;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/men-applications/by-slug/${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data?.applications?.length) {
          setMan(null);
          setApplications([]);
          setError(
            t("We could not find this profile. Check that you used the full copied link.")
          );
          return;
        }
        storeManSlug(data.slug || slug);
        setMan(data.man || null);
        setApplications(data.applications);
        setOpenId(String(data.applications[0]?._id || ""));
        setError("");
      })
      .catch(() => {
        if (cancelled) return;
        setError(t("We could not find this profile. Check that you used the full copied link."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // searchParams only used for first redirect when slug is missing from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, slugParam, navigate, t]);

  function dismissSubmittedPopup() {
    setShowSubmittedPopup(false);
    if (searchParams.get("submitted") === "1") {
      const next = new URLSearchParams(searchParams);
      next.delete("submitted");
      setSearchParams(next, { replace: true });
    }
    window.setTimeout(() => {
      document
        .getElementById("man-entries")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <section className="page page--adult man-profile-page">
      <div className="man-profile-page__inner">
        <div className="man-profile-page__top">
          <p className="gender-kicker">{t("Your bookings")}</p>
          <button
            type="button"
            className="page-back"
            onClick={() => navigate("/profiles")}
          >
            ← {t("Back")}
          </button>
        </div>

        <h1>
          {man?.name
            ? t("{name}'s introductions", { name: man.name })
            : t("Your introductions")}
        </h1>
        <p className="page__lead">
          {t("Review every request you submitted. Keep your link saved so you can return anytime.")}
        </p>

        {slug ? <CopyProfileLink slug={slug} kind="man" /> : null}

        {loading ? (
          <p className="pending-card__body">{t("Loading…")}</p>
        ) : error ? (
          <p className="men-form-error">{error}</p>
        ) : (
          <>
            <div id="man-entries" className="man-entries">
              <h2>
                {t("Your entries")} ({sortedEntries.length})
              </h2>
              <p className="man-entries__hint">
                {t("Tap an entry to expand and see full booking details.")}
              </p>
              {sortedEntries.map((entry, index) => {
                const id = String(entry._id);
                const isOpen = openId === id;
                const members =
                  Array.isArray(entry.memberNames) && entry.memberNames.length
                    ? entry.memberNames.join(", ")
                    : entry.memberName || "—";
                const stamp = calendarParts(entry.meetingDate, lang);

                return (
                  <article
                    key={id}
                    className={`man-entry${isOpen ? " is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="man-entry__toggle"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? "" : id)}
                    >
                      <span className="man-entry__cal" aria-hidden="true">
                        <span className="man-entry__cal-month">{stamp.month}</span>
                        <span className="man-entry__cal-day">{stamp.day}</span>
                        <span className="man-entry__cal-time">{stamp.time}</span>
                      </span>

                      <span className="man-entry__summary">
                        <strong>
                          {t("Entry")} {index + 1}
                        </strong>
                        <small>{members}</small>
                        <em className="man-entry__weekday">
                          {stamp.weekday}
                          {stamp.weekday ? " · " : ""}
                          {nightLabel(entry.nightType, t)}
                        </em>
                      </span>

                      <span className="man-entry__aside">
                        <span className="man-entry__action-label">
                          {isOpen ? t("Hide details") : t("Show details")}
                        </span>
                        <span className="man-entry__chevron" aria-hidden="true">
                          {isOpen ? "▴" : "▾"}
                        </span>
                      </span>
                    </button>
                    {isOpen ? (
                      <div className="man-entry__body">
                        <EntryDetails entry={entry} t={t} language={lang} />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="man-profile-page__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate("/profiles")}
              >
                {t("Explore More Options")}
              </button>
              <button
                type="button"
                className="btn man-profile-secondary-btn"
                onClick={() => navigate("/contact")}
              >
                {t("Submit New Request")}
              </button>
            </div>
          </>
        )}
      </div>

      {showSubmittedPopup ? (
        <div
          className="popup-overlay man-submitted-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="man-submitted-title"
        >
          <div className="popup man-submitted-popup">
            <div className="men-status-icon submitted">✓</div>
            <h2 id="man-submitted-title">{t("Application Submitted")}</h2>
            <p>
              {t(
                "Your application was submitted successfully. Copy your profile link below, then open your profile."
              )}
            </p>

            {slug ? <CopyProfileLink slug={slug} kind="man" /> : null}

            <div className="popup-actions man-submitted-popup__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={dismissSubmittedPopup}
              >
                {t("Go to profile")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
