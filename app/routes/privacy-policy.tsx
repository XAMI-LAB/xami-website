import "~/styles/prose.css";

import type { Route } from "./+types/privacy-policy";
import { PageTitle } from "~/components/PageTitle";
import { loadPrivacyPolicy } from "~/content/privacy.server";
import { pageHead } from "~/content/head";

export async function loader() {
  return { policy: loadPrivacyPolicy() };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/privacy-policy", matches);

export default function PrivacyPolicy({ loaderData }: Route.ComponentProps) {
  return (
    <main id="content" tabIndex={-1}>
      <PageTitle>Privacy policy</PageTitle>
      <div className="prose">
        {/* The policy is the lab's own Markdown file, turned into HTML when the site is built. */}
        <div className="wrap" dangerouslySetInnerHTML={{ __html: loaderData.policy }} />
      </div>
    </main>
  );
}
