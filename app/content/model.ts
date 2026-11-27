// The content model as the pages see it: the kinds of things the site shows and the fixed lists they draw on.
// Nothing here reads files, so pages and components can import it freely.
import type { z } from "zod";
import type { newsSchema, personSchema, siteSchema, themeSchema } from "./schema";

export const GROUPS = ["leader", "member", "collaborator", "alumni"] as const;
export const LINK_KINDS = ["email", "website", "linkedin", "scholar", "github"] as const;
export const NEWS_KINDS = ["people", "graduation", "publication"] as const;
/** The pages whose description can be set in the content files. */
export const DESCRIBED_PAGES = [
  "home",
  "mission",
  "people",
  "research",
  "publications",
  "news",
  "join",
  "acknowledgements",
] as const;
/** The animated examples a research theme can be illustrated with. */
export const SCENE_IDS = [
  "loan-decision",
  "chest-xray",
  "chilled-shipment",
  "invoice-handoff",
  "battery-plan",
] as const;

export type Person = z.infer<typeof personSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type NewsItem = z.infer<typeof newsSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Group = (typeof GROUPS)[number];
export type LinkKind = (typeof LINK_KINDS)[number];
export type NewsKind = (typeof NEWS_KINDS)[number];
export type SceneId = (typeof SCENE_IDS)[number];

export type PublicationKind = "journal" | "conference" | "preprint" | "dataset";
export type Publication = {
  key: string;
  kind: PublicationKind;
  title: string;
  authors: { name: string; lab: boolean }[];
  venue: string;
  year: number;
  date: string;
  /** where the title links to */
  href?: string;
  links: { label: "Paper" | "arXiv" | "Code" | "Demo"; href: string }[];
  abstract?: string;
  bibtex: string;
};

/** A person's name as shown on the site, with their title. */
export function displayName(p: Pick<Person, "name" | "title">): string {
  return p.title ? `${p.title} ${p.name}` : p.name;
}
