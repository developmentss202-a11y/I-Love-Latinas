import { useLanguage } from "../language";

export default function Banner({ side = "man", onSelectMan, onSelectWoman, onExploreHotels }) {
  const isWoman = side === "woman";
  const { t } = useLanguage();

  return (
    <section className="gender-hero gender-hero--single" aria-label={isWoman ? t("For women") : t("For men")}>
      {isWoman ? (
        <article className="gender-panel gender-panel--woman">
          <div className="gender-panel__art">
            <img src="/images/we-vibe-toys-nyMfwv7LBPw-unsplash.jpg" alt="" />
          </div>
          <div className="gender-panel__overlay" />
          <div className="gender-panel__copy">
            <h1>
              <span className="headline-line">{t("Be Valued by a Man")}</span>
              <span className="headline-line">
                <i>{t("Who Means It.")}</i>
              </span>
            </h1>
            <p className="gender-lead">{t("Looking for meaningful companionship?")}</p>
            <p className="copy-accent">{t("Honesty. Respect. Commitment.")}</p>
            <p>
              {t("Maybe your life is missing a man who means it.")} <span className="copy-heart">❤</span>
            </p>
            <div className="gender-panel__actions">
              <button type="button" className="btn btn--primary" onClick={onSelectWoman}>
                {t("Register yourself →")}
              </button>
              <button type="button" className="btn btn--outline" onClick={onExploreHotels}>
                {t("Explore our Places")}
              </button>
            </div>
          </div>
        </article>
      ) : (
        <article className="gender-panel gender-panel--man">
          <div className="gender-panel__art">
            <picture>
              <source media="(max-width: 860px)" srcSet="/images/man-hero-mobile.png" />
              <img src="/images/man-hero.jpg" alt="" />
            </picture>
          </div>
          <div className="gender-panel__overlay" />
          <div className="gender-panel__copy">
            <h1>
              <span className="headline-line">{t("Find the Latina Who’s")}</span>
              <span className="headline-line">
                {t("Truly")} <i>{t("Unforgettable.")}</i>
              </span>
            </h1>
            <p className="gender-lead">{t("Are you living the life? Is something missing?")}</p>
            <p className="copy-accent">{t("Warmth. Companionship. Shared moments.")}</p>
            <p>
              {t("Maybe your life is missing a Latina.")} <span className="copy-heart">❤</span>
            </p>
            <div className="gender-panel__actions">
              <button type="button" className="btn btn--gold" onClick={onSelectMan}>
                {t("Explore Options →")}
              </button>
              <button type="button" className="btn btn--outline" onClick={onExploreHotels}>
                {t("Explore our Places")}
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
