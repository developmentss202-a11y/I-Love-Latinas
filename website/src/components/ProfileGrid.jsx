import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard, { ProfileDetail, fetchApprovedProfiles } from "./ProfileCard";
import Pagination from "./Pagination";
import { useLanguage } from "../language";

const PAGE_SIZE = 8;

const RELATIONSHIP_FILTERS = [
  { value: "", label: "All" },
  { value: "dating", label: "Serious dating" },
  { value: "long-term", label: "Long-term relationship" },
  { value: "marriage", label: "Marriage-minded" },
  { value: "life-partner", label: "Life partner" },
];

export default function ProfileGrid({ onRegister, onNavigate, onConnect, compact = false }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const filtersRef = useRef(null);
  const [page, setPage] = useState(1);
  const [detailIndex, setDetailIndex] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relationshipFilter, setRelationshipFilter] = useState("");
  const [filterScroll, setFilterScroll] = useState({ left: false, right: false });

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

  useEffect(() => {
    const el = filtersRef.current;
    if (!el || !compact) return;

    function updateScrollHints() {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setFilterScroll({
        left: el.scrollLeft > 4,
        right: maxScroll > 4 && el.scrollLeft < maxScroll - 4,
      });
    }

    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    window.addEventListener("resize", updateScrollHints);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollHints) : null;
    resizeObserver?.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      window.removeEventListener("resize", updateScrollHints);
      resizeObserver?.disconnect();
    };
  }, [compact, t]);

  const filteredProfiles = useMemo(() => {
    if (!relationshipFilter) return profiles;
    return profiles.filter(
      (profile) => profile.relationshipDesired === relationshipFilter
    );
  }, [profiles, relationshipFilter]);

  function goTo(next) {
    setPage(next);
    setDetailIndex(null);
    document.getElementById("members")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectFilter(value) {
    setRelationshipFilter(value);
    setPage(1);
    setDetailIndex(null);
  }

  function scrollFilters(direction) {
    const el = filtersRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(140, el.clientWidth * 0.55), behavior: "smooth" });
  }

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageProfiles = filteredProfiles.slice(start, start + PAGE_SIZE);
  const detailProfile = detailIndex != null ? filteredProfiles[detailIndex] : null;

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
                <>
                  <div
                    className={`members__filters-wrap${
                      filterScroll.left ? " has-left" : ""
                    }${filterScroll.right ? " has-right" : ""}`}
                  >
                    <button
                      type="button"
                      className="members__filters-arrow members__filters-arrow--left"
                      aria-label={t("Scroll filters left")}
                      disabled={!filterScroll.left}
                      onClick={() => scrollFilters(-1)}
                    >
                      ‹
                    </button>
                    <div
                      ref={filtersRef}
                      className="members__filters"
                      role="group"
                      aria-label={t("Relationship desired")}
                    >
                      {RELATIONSHIP_FILTERS.map((filter) => (
                        <button
                          key={filter.label}
                          type="button"
                          className={`members__filter-pill${
                            relationshipFilter === filter.value ? " is-active" : ""
                          }`}
                          onClick={() => selectFilter(filter.value)}
                        >
                          {t(filter.label)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="members__filters-arrow members__filters-arrow--right"
                      aria-label={t("Scroll filters right")}
                      disabled={!filterScroll.right}
                      onClick={() => scrollFilters(1)}
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    className="page-back members__back"
                    onClick={() => navigate("/men")}
                  >
                    ← {t("Back")}
                  </button>
                </>
              ) : null}
            </div>
            <h2>{compact ? t("Women who want to be wanted") : t("People currently seeking a match")}</h2>
            <p>
              {compact
                ? t("Take your time to find a meaningful connection, and let us bring you together")
                : t("Eight profiles at a time. Take your time with each one — there's no swiping here.")}
            </p>
        </div>

        <div className="profile-grid">
          {loading ? (
            <p className="pending-card__body">{t("Loading…")}</p>
          ) : pageProfiles.length === 0 ? (
            <p className="pending-card__body">
              {relationshipFilter
                ? t("No profiles match this relationship type.")
                : t("No approved profiles yet.")}
            </p>
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

        {!loading && filteredProfiles.length > PAGE_SIZE ? (
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
