import { robotsTxt } from "~/content/text.server";

export async function loader() {
  return new Response(robotsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
