import type { Config } from "@react-router/dev/config";

// No server at runtime: every page is written out as a real HTML file when the site is built.
// "/404" is not a page of its own; it is built so the host has a page to show for unknown addresses.
export default {
  ssr: false,
  prerender: ({ getStaticPaths }) => [...getStaticPaths(), "/404"],
} satisfies Config;
