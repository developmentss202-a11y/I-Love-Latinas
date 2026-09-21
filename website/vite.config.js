import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function isHotelsPageUrl(url) {
  const path = String(url || "").split("?")[0];
  return path === "/hotels" || path === "/hotels/";
}

function spaFallbackForHotels() {
  function rewriteHotelsPage(req) {
    if (isHotelsPageUrl(req.url)) req.url = "/index.html";
  }

  return {
    name: "spa-fallback-hotels",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteHotelsPage(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteHotelsPage(req);
        next();
      });
    },
    closeBundle() {
      const hotelsDir = resolve("dist", "hotels");
      mkdirSync(hotelsDir, { recursive: true });
      copyFileSync(resolve("dist", "index.html"), resolve(hotelsDir, "index.html"));
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallbackForHotels()],
  server: {
    watch: {
      ignored: [
        "**/*.zip",
        "**/dist.zip",
        "**/*.mp4",
        "**/Hotels Videos and Images/**",
      ],
    },
  },
});
