// Runs after the pages are built, to lay the files out the way the host serves them best.
//
// Each page is built as <page>/index.html. It is moved to <page>.html, which the host serves at /<page>
// with no trailing slash (and sends /<page>/ there). The page for unknown addresses becomes 404.html,
// which is the file the host looks for.
import fs from "node:fs";

const out = "build/client";
const pages = [];
for (const entry of fs.readdirSync(out, { withFileTypes: true })) {
  const page = `${out}/${entry.name}/index.html`;
  if (!entry.isDirectory() || !fs.existsSync(page)) continue;
  fs.renameSync(page, `${out}/${entry.name}.html`);
  // Only the page lived in that folder; anything else there would be a mistake worth seeing.
  fs.rmdirSync(`${out}/${entry.name}`);
  pages.push(entry.name);
}
// The not-found page is not an address of its own, so its data file is not needed.
fs.rmSync(`${out}/404.data`, { force: true });
console.log(`pages -> build/client/<page>.html: ${pages.sort().join(", ")}`);
