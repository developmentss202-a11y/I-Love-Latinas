import { useState } from "react";
import { useLanguage } from "../language";
import { profileAbsoluteUrl } from "../profileLink";

export default function CopyProfileLink({ slug }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const link = profileAbsoluteUrl(slug);

  if (!link) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt(t("Copy this profile link"), link);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="profile-copy-link">
      <p className="profile-copy-link__label">{t("Copy link")}</p>
      <p className="profile-copy-link__hint">
        {t("Save this link. You will need it to return to your profile later.")}
      </p>
      <div className="profile-copy-link__row">
        <input type="text" readOnly value={link} aria-label={t("Profile link")} />
        <button type="button" className="btn btn--primary" onClick={copyLink}>
          {copied ? t("Copied") : t("Copy link")}
        </button>
      </div>
    </div>
  );
}
