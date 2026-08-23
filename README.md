# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Analytics configuration (required)

Analytics needs seven `PUBLIC_FIREBASE_*` variables at **build time**. They are
inlined into the bundle by Vite, so they must be present in the build
environment — not just at runtime.

`.env` is gitignored, which means the hosting platform does **not** get them
from the repository. Without them the analytics module hits its own guard
(`if (!config.apiKey || !config.measurementId) return;`) and does nothing: no
error, no data. That is the intended failure mode, and it is silent, so the way
to notice is that no events arrive.

Set these in **Cloudflare Pages → the project → Settings → Environment variables
→ Production** (and Preview, if preview builds should report), then redeploy:

```
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
PUBLIC_FIREBASE_MESSAGING_ID
PUBLIC_FIREBASE_APP_ID
PUBLIC_FIREBASE_MEASUREMENT_ID
```

The values are the same Firebase web config the app already uses — copy them
from the web app's `.env`, or from the Firebase console under Project settings →
Your apps. They are public by design (they identify the project, they authorise
nothing) and already ship in the web app's HTML, but this repository is public,
so they belong in the platform's environment rather than in a committed file.

To check whether a deployed build has them:

```bash
curl -s https://transcribr.org/en/ | grep -o '/_astro/analytics[^"]*\.js'
# then fetch that chunk and look for the measurement id:
curl -s https://transcribr.org/_astro/analytics.<hash>.js | grep -c 'G-'
```

`1` means configured, `0` means the build had no variables.
