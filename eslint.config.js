import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * §2.1: every pixel of frame N is a pure function of (storyboard, frameNumber, width, height).
 * These identifiers make that false, so they are banned outright in the render path.
 *
 * Catching them needs three rules working together, because one alone is not sufficient:
 * `no-restricted-globals` cannot see `Date.now` (`Date` is a legitimate global), and
 * `no-restricted-properties` cannot see `new Date()`.
 *
 * The one sanctioned exception is the motion-trail feedback buffer (§10.4), which is handled by
 * recomputing trail state over a fixed window of previous frames rather than by reaching for
 * anything on this list.
 */
const NO_CLOCK = "there is no real time in a render. Derive it from `frame / fps` (§2.1).";

const RESTRICTED_GLOBALS = [
  {
    name: "requestAnimationFrame",
    message: `Animation is driven by the frame number passed in as a prop, not by rAF — ${NO_CLOCK}`,
  },
  {
    name: "cancelAnimationFrame",
    message: `Animation is driven by the frame number passed in as a prop, not by rAF — ${NO_CLOCK}`,
  },
  { name: "setTimeout", message: `Frames are rendered out of order — ${NO_CLOCK}` },
  { name: "setInterval", message: `Frames are rendered out of order — ${NO_CLOCK}` },
  { name: "performance", message: `Wall-clock timing has no meaning here — ${NO_CLOCK}` },
];

const RESTRICTED_PROPERTIES = [
  { object: "Date", property: "now", message: `Date.now() is banned — ${NO_CLOCK}` },
  {
    object: "performance",
    property: "now",
    message: `performance.now() is banned — ${NO_CLOCK}`,
  },
  {
    object: "Math",
    property: "random",
    message:
      "Math.random() is banned. Use a seeded PRNG (mulberry32) seeded from the storyboard (§2.1).",
  },
];

const RESTRICTED_SYNTAX = [
  {
    selector: "NewExpression[callee.name='Date']",
    message: `new Date() is banned — ${NO_CLOCK}`,
  },
  {
    // `const { random } = Math` slips past no-restricted-properties.
    selector: "VariableDeclarator > ObjectPattern > Property[key.name='random']",
    message:
      "Destructuring Math.random is banned. Use a seeded PRNG (mulberry32) seeded from the storyboard (§2.1).",
  },
];

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**", "**/*.d.ts"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // §19: `any` fails the build. `strict: true` does not reject explicit `any` on its own,
      // so this rule — not tsc — is what actually enforces it.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      // A leading underscore marks a parameter a signature requires but this implementation
      // does not use — which is every stub in the repo until its phase lands.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    files: ["packages/views/**/*.ts", "packages/video/**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-restricted-globals": ["error", ...RESTRICTED_GLOBALS],
      "no-restricted-properties": ["error", ...RESTRICTED_PROPERTIES],
      "no-restricted-syntax": ["error", ...RESTRICTED_SYNTAX],
    },
  },
);
