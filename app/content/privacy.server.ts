// The privacy policy is written in Markdown (content/privacy-policy.md) and turned into HTML while the site is built.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

export function loadPrivacyPolicy(): string {
  const source = fs.readFileSync(path.resolve("content/privacy-policy.md"), "utf8");
  return marked.parse(source, { async: false });
}
