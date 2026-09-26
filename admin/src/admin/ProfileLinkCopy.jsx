import { useState } from "react";

export default function ProfileLinkCopy({ url, className = "" }) {
  const [copied, setCopied] = useState(false);

  if (!url) return "-";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this profile link", url);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`admin-profile-link-row ${className}`.trim()}>
      <a
        className="admin-profile-link"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        {url}
      </a>
      <button
        type="button"
        className="admin-profile-copy-btn"
        onClick={copyLink}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
