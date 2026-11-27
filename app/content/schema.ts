// The shape every content file must have. Used only while the site is built.
import { z } from "zod";
import { DESCRIBED_PAGES, GROUPS, JOIN_SCENE_IDS, LINK_KINDS, NEWS_KINDS, SCENE_IDS } from "./model";

const text = z.string().trim().min(1);
const id = text.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lower-case words joined by hyphens");

/** A link with its words: to a page of this site (an address starting with /) or to another site. */
const link = z.strictObject({
  label: text,
  url: text.refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "give a full address, or a page of this site starting with /",
  ),
});

export const personSchema = z.strictObject({
  id,
  name: text,
  title: text.optional(),
  groups: z.array(z.enum(GROUPS)).min(1),
  position: text.optional(),
  affiliations: z.array(text).max(2).default([]),
  /** the degree a person earned in the lab; the year can be added when it is known */
  graduated: z.strictObject({ degree: text, year: z.number().int().optional() }).optional(),
  photo: text.optional(),
  links: z.partialRecord(z.enum(LINK_KINDS), text).default({}),
  aliases: z.array(text).default([]),
});

export const themeSchema = z.strictObject({
  id,
  title: text,
  /** which animated example illustrates the theme */
  scene: z.enum(SCENE_IDS),
  /** one short paragraph, shown on the home page */
  summary: text.optional(),
  /** the full description, shown on the Research themes page */
  description: z.array(text).default([]),
  people: z.array(id).default([]),
  publications: z.array(text).default([]),
});

export const newsSchema = z.strictObject({
  date: text.regex(/^\d{4}(-\d{2})?$/, "write the date as YYYY-MM or YYYY"),
  kind: z.enum(NEWS_KINDS),
  title: text,
  text: text,
  people: z.array(id).default([]),
  publication: text.optional(),
});

export const siteSchema = z.strictObject({
  lab: z.strictObject({
    name: text,
    university: text,
    universityShort: text,
    url: z.url().refine((value) => !value.endsWith("/"), "leave out the slash at the end"),
    heading: text,
    headingHighlight: text,
    intro: text,
    founded: z.number().int(),
    contact: id,
  }),
  sites: z.strictObject({
    label: text,
    items: z.array(z.strictObject({ name: text, url: z.url() })),
  }),
  descriptions: z.partialRecord(z.enum(DESCRIBED_PAGES), text).default({}),
  mission: z.strictObject({
    vision: text,
    visionHighlight: text,
    points: z.array(z.strictObject({ lead: text, text })),
    values: z.array(text),
  }),
  join: z.strictObject({
    welcome: text,
    welcomeHighlight: text,
    paths: z.array(
      z.strictObject({
        id,
        title: text,
        scene: z.enum(JOIN_SCENE_IDS),
        summary: text,
        intro: z.array(text).default([]),
        steps: z.array(z.strictObject({ title: text, text, links: z.array(link).default([]) })).default([]),
        note: z.strictObject({ text, links: z.array(link).default([]) }).optional(),
        send: z.array(text).min(1),
        subject: text,
        graduates: z.boolean().default(false),
      }),
    ),
  }),
  licences: z.strictObject({ intro: text }),
  acknowledgements: z.strictObject({
    traditionalOwners: text,
    /** rows of logos: each row lists the institutions shown side by side */
    institutions: z.array(
      z.strictObject({
        row: z
          .array(
            z.strictObject({
              name: text,
              logo: text.optional(),
              logoHeight: z.number().positive().optional(),
              whiteOnly: z.boolean().default(false),
              url: z.url().optional(),
            }),
          )
          .min(1),
      }),
    ),
    schemes: z.array(text),
  }),
});
