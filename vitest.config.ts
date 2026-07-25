import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const pkgSrc = (name: string): string =>
  fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  // Resolve workspace packages to source rather than dist, so `pnpm test` is meaningful on a
  // clean checkout without a build having run first.
  resolve: {
    alias: {
      "@tracecam/schema": pkgSrc("schema"),
      "@tracecam/theme": pkgSrc("theme"),
    },
  },
  test: {
    include: ["packages/*/src/**/*.test.ts"],
  },
});
