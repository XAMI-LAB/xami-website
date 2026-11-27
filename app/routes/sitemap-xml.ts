import { sitemapXml } from "~/content/text.server";

export async function loader() {
  return new Response(sitemapXml(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
