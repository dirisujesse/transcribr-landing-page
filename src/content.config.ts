import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Blog posts, as markdown files in the repository.
 *
 * No database and no CMS backend. A post is a document that changes rarely and
 * is written by us, so git already provides everything a CMS would: history,
 * review before publishing, and rollback. The build renders them statically,
 * which is why the blog costs nothing to serve and cannot go down separately
 * from the rest of the site.
 *
 * Posts are English only, and live at /blog rather than under a locale prefix.
 * Seven translations of every article is not a commitment we can keep, and
 * publishing the same English text at seven URLs would split the search
 * authority the blog exists to build.
 */
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      /** Shown on the index and used as the meta description. */
      description: z.string().max(200),
      publishDate: z.coerce.date(),
      /** Set when a post is materially revised; shown to readers and to search. */
      updatedDate: z.coerce.date().optional(),
      /** Drafts build locally but are excluded from the published site. */
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      author: z.string().default("The Transcribr team"),
      /** Optional social card; falls back to the site image. */
      cover: image().optional(),
    }),
});

export const collections = { blog };
