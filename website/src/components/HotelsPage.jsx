import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../language";

const photos = [
  "/hotels/good-times-cover.jpeg",
  "/hotels/good-times-palapa.jpeg",
  "/hotels/good-times-flag.jpeg",
  "/hotels/good-times-night-1.jpeg",
  "/hotels/good-times-night-2.jpeg",
  "/hotels/good-times-night-bar.jpeg",
  "/hotels/good-times-night-aerial.jpeg",
  "/hotels/good-times-waterfall.jpeg",
  "/hotels/good-times-sign.jpg",
  "/hotels/good-times-logo.jpeg",
  "/hotels/ocean-view-1.jpeg",
  "/hotels/ocean-view-2.jpeg",
  "/hotels/ocean-view-3.jpeg",
  "/hotels/garden-retreat-1.jpeg",
  "/hotels/mountain-view-1.jpeg",
];

const videos = [
  "/hotels/good-times-1.mp4",
  "/hotels/good-times-2.mp4",
  "/hotels/good-times-3.mp4",
  "/hotels/good-times-4.mp4",
  "/hotels/good-times-5.mp4",
  "/hotels/good-times-6.mp4",
];

function frameIsDark(video) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 24, 24);
    const pixels = ctx.getImageData(0, 0, 24, 24).data;
    let total = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      total += pixels[i] + pixels[i + 1] + pixels[i + 2];
    }
    return total / ((pixels.length / 4) * 3) < 24;
  } catch {
    return false;
  }
}

function VideoThumb({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;

    let step = 0;
    let stopped = false;
    const spots = [0.6, 1.4, 2.5, 4, 7];

    function go(time) {
      if (stopped || !Number.isFinite(video.duration) || video.duration <= 0) return;
      video.currentTime = Math.min(time, Math.max(video.duration - 0.15, 0));
    }

    function onMeta() {
      go(spots[0]);
    }

    function onSeeked() {
      if (stopped) return;
      if (step < spots.length - 1 && frameIsDark(video)) {
        step += 1;
        go(spots[step]);
      }
    }

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("seeked", onSeeked);
    if (video.readyState >= 1) onMeta();

    return () => {
      stopped = true;
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [src]);

  return <video ref={ref} src={src} muted playsInline preload="auto" />;
}

export default function HotelsPage() {
  const { t } = useLanguage();
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return undefined;

    function onKey(event) {
      if (event.key === "Escape") setActive(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section className="page hotels-page">
      <div className="simple-hero">
        <div className="simple-hero__inner">
          <p className="eyebrow eyebrow--on-dark">
            <span className="eyebrow__ring" aria-hidden="true" />
            {t("Owner hotels")}
          </p>
          <h1>{t("Explore our Hotels")}</h1>
          <p className="page__lead">
            {t("Private places to meet, stay, and take your time.")}
          </p>
        </div>
      </div>

      <div className="page-body hotels-gallery">
        <article className="hotel-card">
          <div className="hotel-card__copy">
            <h2>{t("Photos")}</h2>
            <div className="hotel-media">
              {photos.map((src) => (
                <button
                  key={src}
                  type="button"
                  className="hotel-media__item"
                  onClick={() => setActive({ type: "image", src })}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="hotel-card">
          <div className="hotel-card__copy">
            <h2>{t("Videos")}</h2>
            <div className="hotel-media hotel-media--videos">
              {videos.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className="hotel-media__item hotel-media__item--video"
                  onClick={() => setActive({ type: "video", src })}
                >
                  <VideoThumb src={src} />
                  <span>
                    {t("Play video")} {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </article>
      </div>

      {active ? (
        <div
          className="hotel-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t("Explore our Hotels")}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="hotel-lightbox__close"
            onClick={() => setActive(null)}
          >
            {t("Close")}
          </button>
          <div
            className="hotel-lightbox__frame"
            onClick={(event) => event.stopPropagation()}
          >
            {active.type === "video" ? (
              <video src={active.src} controls autoPlay playsInline />
            ) : (
              <img src={active.src} alt="" />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
