/// <reference path="../.astro/types.d.ts" />

/**
 * Public build-time configuration.
 *
 * Everything here is inlined into the bundle at build time and shipped to the
 * browser, which is why it is all `PUBLIC_`-prefixed. The Firebase web config
 * is public by design — it identifies the project, it does not authorise
 * anything — and the same values already ship in the web app's HTML. Secrets
 * must never be added to this interface.
 */
interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_FIREBASE_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
