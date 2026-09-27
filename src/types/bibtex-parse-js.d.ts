// Type declarations for @orcid/bibtex-parse-js, which ships without types.
declare module "@orcid/bibtex-parse-js" {
  export interface ParsedBibEntry {
    citationKey: string;
    entryType: string;
    entryTags: Record<string, string>;
  }

  export function toJSON(bibtex: string): ParsedBibEntry[];
  export function toBibtex(json: ParsedBibEntry[], compact?: boolean): string;
}
