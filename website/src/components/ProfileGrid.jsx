import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard, { ProfileDetail, fetchApprovedProfiles } from "./ProfileCard";
import Pagination from "./Pagination";
import { useLanguage } from "../language";

const PAGE_SIZE = 8;

export default function ProfileGrid({ onRegister, onNavigate, onConnect, compact = false }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [detailIndex, setDetailIndex] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchApprovedProfiles().then((list) => {
      if (!active) return;
      setProfiles(list);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  function goTo(next) {
    setPage(next);
    setDetailIndex(null);
    document.getElementById("members")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const totalPages = Math.max(1, Math.ceil(profiles.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageProfiles = profiles.slice(start, start + PAGE_SIZE);
  const detailProfile = detailIndex != null ? profiles[detailIndex] : null;

  return (
    <>
      <section id="members" className={`members ${compact ? "members--browse" : ""}`}>
        <div className="members__intro">
            <div className="members__intro-row">
              <p className="eyebrow">
                <span className="eyebrow__ring" aria-hidden="true" />
                {t("Private circle")}
              </p>
              {compact ? (
                <button
                  type="button"
                  className="page-back"
                  onClick={() => navigate("/men")}
                >
                  ← {t("Back")}
                </button>
              ) : null}
            </div>
            <h2>{compact ? t("Women who want to be wanted") : t("People currently seeking a match")}</h2>
            <p>
              {compact
                ? t("Take your time with each one. When you feel the pull, apply to connect — we arrange the night.")
                : t("Eight profiles at a time. Take your time with each one — there's no swiping here.")}
            </p>
        </div>

        <div className="profile-grid">
          {loading ? (
            <p className="pending-card__body">{t("Loading…")}</p>
          ) : pageProfiles.length === 0 ? (
            <p className="pending-card__body">{t("No approved profiles yet.")}</p>
          ) : (
            pageProfiles.map((profile, i) => {
              const absoluteIndex = start + i;
              return (
                <ProfileCard
                  key={profile.slug || `${profile.name}-${absoluteIndex}`}
                  profile={profile}
                  index={absoluteIndex}
                  onReadMore={() => setDetailIndex(absoluteIndex)}
                />
              );
            })
          )}
        </div>

        {!loading && profiles.length > PAGE_SIZE ? (
          <Pagination page={safePage} totalPages={totalPages} onChange={goTo} />
        ) : null}
      </section>

      {compact ? null : (
        <>
          <section className="band-alt">
            <div className="band-alt__inner">
              <div className="members__intro">
                <p className="eyebrow">
                  <span className="eyebrow__ring" aria-hidden="true" />
                  Real stories
                </p>
                <h2>Introductions that became something more</h2>
              </div>
              <div className="testi-row">
                <article className="testi-card">
                  <div className="stars">★★★★★</div>
                  <p>
                    We were matched after a two-day review, met for coffee that Sunday, and haven't stopped talking
                    since. It felt slower, and better for it.
                  </p>
                  <div className="testi-who">
                    <div className="mini-avatar">R&T</div>
                    <div>
                      <b>Renata & Tomás</b>
                      <span>Together since Feb 2025</span>
                    </div>
                  </div>
                </article>
                <article className="testi-card">
                  <div className="stars">★★★★★</div>
                  <p>
                    I appreciated that someone actually read my application. My first conversation on here already
                    felt further along than months on other apps.
                  </p>
                  <div className="testi-who">
                    <div className="mini-avatar">V&D</div>
                    <div>
                      <b>Valentina & Diego</b>
                      <span>Engaged — Spring 2026</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <div className="cta-banner">
            <p className="eyebrow eyebrow--on-dark">
              <span className="eyebrow__ring" aria-hidden="true" />
              Applications open
            </p>
            <h2>Your story is waiting to be written.</h2>
            <p>
              Join a circle of members who take introductions seriously. Applications are reviewed by hand, not an
              algorithm.
            </p>
            <div className="cta-banner__actions">
              <button type="button" className="btn btn--gold" onClick={onRegister}>
                Start Your Application
              </button>
              <button type="button" className="btn btn--outline" onClick={() => onNavigate("contact")}>
                Have a question?
              </button>
            </div>
          </div>
        </>
      )}

      {detailProfile ? (
        <ProfileDetail
          profile={detailProfile}
          index={detailIndex}
          onClose={() => setDetailIndex(null)}
          onRegister={onRegister}
          onConnect={onConnect}
        />
      ) : null}
    </>
  );
}
