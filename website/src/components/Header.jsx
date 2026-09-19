import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LanguageButtons, useLanguage } from "../language";
import Logo from "./Logo";

const manNavItems = [
  { to: "/profiles", label: "Profiles" },
  { to: { pathname: "/contact", search: "" }, label: "Contact" },
];

export default function Header({ variant = "default" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const hideNav = variant === "minimal" || variant === "home" || variant === "dark";
  const navItems = variant === "navy" ? manNavItems : [];

  let logoTo = "/";
  if (path.startsWith("/profile/") || path === "/my-profile") {
    logoTo = path;
  } else if (path === "/pending") {
    logoTo = "/pending";
  } else if (path === "/men" || path === "/profiles" || variant === "navy") {
    logoTo = "/men";
  } else if (path === "/women" || path === "/register" || path === "/hotels") {
    logoTo = "/women";
  }

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className={`site-header site-header--${variant}`}>
      <div className="site-header__inner">
        <Link to={logoTo} className="logo-btn" aria-label="I Love Latinas">
          <Logo />
        </Link>

        <LanguageButtons />

        {hideNav ? null : (
          <>
            <nav
              className={`site-nav ${open ? "is-open" : ""}`}
              aria-label="Primary"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `site-nav__link ${isActive ? "is-active" : ""}`
                  }
                >
                  {t(item.label)}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className={`menu-toggle ${open ? "is-open" : ""}`}
              aria-expanded={open}
              aria-label={t("Toggle menu")}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
