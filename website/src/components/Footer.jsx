import { Link } from "react-router-dom";
import { useLanguage } from "../language";
import Logo from "./Logo";

export default function Footer({ compact = false }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="site-footer site-footer--compact">
        <p>
          © {year} I Love Latinas. {t("All rights reserved.")}
        </p>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p>
            {t("Discreet matchmaking for people who know what they want. Reviewed by hand, kept private, built for real conversation.")}
          </p>
        </div>

        <div className="site-footer__col">
          <h4>{t("Site")}</h4>
          <nav className="site-footer__links" aria-label={t("Site")}>
            <Link className="site-footer__link" to="/">
              {t("Home")}
            </Link>
            <Link className="site-footer__link" to="/about">
              {t("About Us")}
            </Link>
            <Link className="site-footer__link" to="/contact">
              {t("Contact")}
            </Link>
            <Link className="site-footer__link" to="/support">
              {t("Support")}
            </Link>
          </nav>
        </div>

        <div className="site-footer__col">
          <h4>{t("Legal")}</h4>
          <nav className="site-footer__links" aria-label={t("Legal")}>
            <Link className="site-footer__link" to="/support">
              {t("Privacy Policy")}
            </Link>
            <Link className="site-footer__link" to="/support">
              {t("Terms of Use")}
            </Link>
            <Link className="site-footer__link" to="/support">
              {t("Community Guidelines")}
            </Link>
          </nav>
        </div>

        <div className="site-footer__col">
          <h4>{t("Membership")}</h4>
          <nav className="site-footer__links" aria-label={t("Membership")}>
            <Link className="site-footer__link" to="/register">
              {t("Apply to Join")}
            </Link>
            <Link className="site-footer__link" to="/support">
              {t("FAQ")}
            </Link>
          </nav>
        </div>
      </div>
      <div className="site-footer__bar">
        <p>© {new Date().getFullYear()} I Love Latinas. {t("All rights reserved.")}</p>
      </div>
    </footer>
  );
}
