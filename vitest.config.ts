import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const pkgSrc = (name: string): string =>
  fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  // Resolve workspace packages to source rather than dist, so `pnpm test` is meaningful on a
  // clean checkout without a build having run first.
  resolve: {
    alias: {
      "@algovis/schema": pkgSrc("schema"),
      "@algovis/theme": pkgSrc("theme"),
      "@algovis/lift": pkgSrc("lift"),
      "@algovis/director": pkgSrc("director"),
      "@algovis/views": pkgSrc("views"),
      "@algovis/video": pkgSrc("video"),
      "@algovis/audio": pkgSrc("audio"),
    },
  },
  test: {
    include: ["packages/*/src/**/*.test.ts"],
  },
});
