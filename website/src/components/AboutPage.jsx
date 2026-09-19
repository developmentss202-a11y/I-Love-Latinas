import { useLanguage } from "../language";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <section className="page">
      <div className="simple-hero">
        <div className="simple-hero__inner">
          <p className="eyebrow">
            <span className="eyebrow__ring" aria-hidden="true" />
            {t("About Us")}
          </p>
          <h1>{t("A quieter way to meet.")}</h1>
          <p className="page__lead">
            {t("I Love Latinas is a private matchmaking site for people who would rather be known than swiped. We favor depth, intention, and profiles that actually say something.")}
          </p>
        </div>
      </div>
      <div className="page-body">
        <div className="page-grid">
          <article>
            <span className="num">{t("Principle One")}</span>
            <h3>{t("Curated, not crowded")}</h3>
            <p>
              {t("Every member completes a thorough application. We're looking for adults who know what they want and are willing to say it plainly.")}
            </p>
          </article>
          <article>
            <span className="num">{t("Principle Two")}</span>
            <h3>{t("Privacy first")}</h3>
            <p>
              {t("Photos, recordings, and personal details stay inside the site. We do not sell data, and we do not run ads against your profile.")}
            </p>
          </article>
          <article>
            <span className="num">{t("Principle Three")}</span>
            <h3>{t("Human review")}</h3>
            <p>
              {t("Applications are read by people, not only filters. If we accept you, you join a circle that takes courtship seriously.")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
