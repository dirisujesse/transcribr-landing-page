import { config, collection, fields } from "@keystatic/core";

/**
 * A rich editor over the markdown files in this repository.
 *
 * Local storage, deliberately. Keystatic can run as a deployed admin backed by
 * GitHub OAuth, but that would mean turning this static site into a server
 * rendered one and putting an authenticated surface on the public internet to
 * save two people from running a dev server. Instead:
 *
 *   pnpm dev   →   http://localhost:4321/keystatic
 *
 * The editor writes markdown into src/content/blog, and the change shows up as
 * an ordinary working-tree edit to be reviewed and committed like any other.
 * Nothing is published until it is pushed, which is the property that makes a
 * git-backed blog worth having.
 *
 * The schema mirrors src/content.config.ts. They are two descriptions of the
 * same frontmatter, so a field added in one belongs in the other — Astro's
 * schema is the one that actually validates at build time.
 */
export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Transcribr" },
  },
  collections: {
    blog: collection({
      label: "Blog posts",
      slugField: "title",
      path: "src/content/blog/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: { length: { min: 1, max: 120 } },
          },
        }),
        description: fields.text({
          label: "Description",
          description:
            "Shown on the blog index and used as the meta description in search results.",
          multiline: true,
          validation: { length: { min: 1, max: 200 } },
        }),
        publishDate: fields.date({
          label: "Publish date",
          defaultValue: { kind: "today" },
        }),
        updatedDate: fields.date({
          label: "Updated date",
          description: "Set this only when revising a post that is already out.",
        }),
        draft: fields.checkbox({
          label: "Draft",
          description: "Drafts are excluded from the build; they get no URL at all.",
          defaultValue: false,
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        author: fields.text({
          label: "Author",
          defaultValue: "The Transcribr team",
        }),
        content: fields.markdoc({
          label: "Post",
          options: {
            image: {
              directory: "src/assets/blog",
              publicPath: "/src/assets/blog/",
            },
          },
        }),
      },
    }),
  },
});
