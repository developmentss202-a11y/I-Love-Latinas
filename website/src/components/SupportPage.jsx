import { useState } from "react";
import { useLanguage } from "../language";

const faqs = [
  {
    q: "Who can join?",
    a: "Adults 21 and over who complete the three-step application. We look for sincerity more than status.",
  },
  {
    q: "How long does review take?",
    a: "Most applications are reviewed within two business days. You will hear from us either way.",
  },
  {
    q: "Is my information private?",
    a: "Yes. Photos, voice notes, and videos are only visible to accepted members. We never sell your data.",
  },
  {
    q: "Can I edit my profile later?",
    a: "Once accepted, you may update details from your membership desk. Sensitive fields may be re-reviewed.",
  },
];

export default function SupportPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(null);

  return (
    <section className="page">
      <div className="simple-hero">
        <div className="simple-hero__inner">
          <p className="eyebrow">
            <span className="eyebrow__ring" aria-hidden="true" />
            {t("Support")}
          </p>
          <h1>{t("Help, quietly delivered.")}</h1>
          <p className="page__lead">
            {t("Common questions below. If you need a person, use Contact and we'll take it from there.")}
          </p>
        </div>
      </div>
      <div className="page-body">
        <div className="faq">
          {faqs.map((item, index) => (
            <article
              key={item.q}
              className={open === index ? "is-open" : ""}
              onClick={() => setOpen(open === index ? null : index)}
            >
              <div className="faq-q">
                <h2>{t(item.q)}</h2>
                <span className="faq-plus">+</span>
              </div>
              <div className="faq-a">
                <p>{t(item.a)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
