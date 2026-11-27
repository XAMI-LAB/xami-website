import { llmsTxt } from "~/content/text.server";

export async function loader() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
