import { llmsFullTxt } from "~/content/text.server";

export async function loader() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
