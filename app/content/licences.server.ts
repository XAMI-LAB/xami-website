// The open source packages whose code or fonts reach visitors, with their licences.
// Read from the installed packages while the site is built, so the page never goes stale.
import fs from "node:fs";
import path from "node:path";

export type PackageLicence = {
  name: string;
  version: string;
  licence: string;
  repository?: string;
  text?: string;
};

/** Licences that would oblige the site's own code to be released under the same terms. */
const NOT_ACCEPTED = /\b(A?GPL|LGPL|NGPL)\b/i;

function repositoryUrl(repository: unknown): string | undefined {
  const raw = typeof repository === "string" ? repository : (repository as { url?: string } | undefined)?.url;
  if (!raw) return undefined;
  const url = raw
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git:\/\//, "https://");
  return /^https?:\/\//.test(url) ? url : /^[\w.-]+\/[\w.-]+$/.test(url) ? `https://github.com/${url}` : undefined;
}

export function loadLicences(): PackageLicence[] {
  const manifest = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
  const found = new Map<string, PackageLicence>();

  // "dependencies" are what the pages are built from; tools used only to build the site are not shipped.
  const visit = (directory: string) => {
    const real = fs.realpathSync(directory);
    const pkg = JSON.parse(fs.readFileSync(path.join(real, "package.json"), "utf8"));
    const key = `${pkg.name}@${pkg.version}`;
    if (found.has(key)) return;
    const licenceFile = fs.readdirSync(real).find((file) => /^licen[sc]e/i.test(file));
    found.set(key, {
      name: pkg.name,
      version: pkg.version,
      licence: typeof pkg.license === "string" ? pkg.license : "Unknown",
      repository: repositoryUrl(pkg.repository),
      text: licenceFile ? fs.readFileSync(path.join(real, licenceFile), "utf8").trim() : undefined,
    });
    // pnpm keeps a package's own dependencies beside it, in the same node_modules folder.
    let siblings = real;
    while (path.basename(siblings) !== "node_modules") siblings = path.dirname(siblings);
    for (const dependency of Object.keys(pkg.dependencies ?? {})) {
      const location = path.join(siblings, dependency);
      if (fs.existsSync(location)) visit(location);
    }
  };
  for (const dependency of Object.keys(manifest.dependencies ?? {})) visit(path.resolve("node_modules", dependency));

  const packages = [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
  const refused = packages.filter((p) => NOT_ACCEPTED.test(p.licence));
  if (refused.length) {
    throw new Error(
      "These packages have a licence the site does not accept:\n" +
        refused.map((p) => `  - ${p.name} ${p.version}: ${p.licence}`).join("\n"),
    );
  }
  return packages;
}
