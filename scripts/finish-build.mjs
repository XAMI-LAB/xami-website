// Runs after the pages are built. The host shows build/client/404.html for unknown addresses,
// but the page for them is built as 404/index.html, so it is moved to where the host looks.
import fs from "node:fs";

const out = "build/client";
fs.renameSync(`${out}/404/index.html`, `${out}/404.html`);
fs.rmSync(`${out}/404`, { recursive: true });
fs.rmSync(`${out}/404.data`, { force: true });
console.log("404 page -> build/client/404.html");
