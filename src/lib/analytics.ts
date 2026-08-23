/**
 * Marketing-site analytics — anonymous by default, no banner.
 *
 * Reports into the same Firebase project as the web app so the
 * marketing-to-signup funnel is joinable, with a `surface` user property to
 * separate them again.
 *
 * ## Why there is no consent prompt
 *
 * Analytics runs in **Google Consent Mode v2 with storage denied**. In that
 * mode GA4 writes no `_ga` cookie, keeps no persistent visitor identifier, and
 * sends "cookieless pings" that carry the event and its parameters but nothing
 * that follows a person between sessions.
 *
 * That matters legally. The consent requirement people mean when they say
 * "cookie banner" comes from ePrivacy Article 5(3), which is triggered by
 * *storing information on, or reading information from, a user's device* — not
 * by processing data as such. Store nothing, read nothing, and the trigger does
 * not fire. This is the same basis the whole cookieless-analytics category
 * (Plausible, Fathom, Simple Analytics) operates on, and it is Google's own
 * stated purpose for Consent Mode.
 *
 * The honest caveat: it is not perfectly settled. A minority of EU regulators
 * argue that reading device characteristics — user agent, screen size — is
 * itself "access to terminal equipment" and needs consent regardless. The
 * mainstream position, and the one taken here, is that cookieless measurement
 * does not. What is *not* in dispute is that this is a large improvement over
 * cookied analytics with no banner at all.
 *
 * What is given up: no returning-visitor counts, no cross-session attribution,
 * no user-level funnels on this site. Aggregate page views, traffic sources,
 * CTA clicks and demo usage all still work, which is what a marketing site is
 * actually asking of analytics.
 *
 * To switch to full, cookied analytics, call `grantFullConsent()` — from a
 * consent banner, and only from one. Everything below already supports it.
 */

const CONSENT_KEY = "transcribr_analytics_consent";

export type ConsentState = "granted" | "default";

/** Names shared with the web app where the same action exists on both. */
export const Events = {
  // No PAGE_VIEW: Firebase sends one automatically on init, and this is a
  // multi-page site, so every navigation is already counted exactly once.
  CTA_CLICKED: "cta_clicked",
  PRICING_VIEWED: "pricing_viewed",
  PLAN_SELECTED: "plan_selected",
  APP_STORE_CLICKED: "app_store_clicked",
  FAQ_OPENED: "faq_opened",
  LANGUAGE_CHANGED: "language_changed",
  SECTION_VIEWED: "section_viewed",
  OUTBOUND_CLICKED: "outbound_clicked",

  // The in-browser converter demo, which is the page's main interaction.
  DEMO_FILE_SELECTED: "demo_file_selected",
  DEMO_SAMPLE_LOADED: "demo_sample_loaded",
  DEMO_FORMAT_SELECTED: "demo_format_selected",
  DEMO_CONVERSION_STARTED: "demo_conversion_started",
  DEMO_CONVERSION_COMPLETED: "media_converted",
  DEMO_CONVERSION_FAILED: "media_conversion_failed",
  DEMO_CONVERSION_CANCELLED: "demo_conversion_cancelled",
  DEMO_DOWNLOADED: "file_download",
  DEMO_UNSUPPORTED: "demo_unsupported",

  CLIENT_ERROR: "client_error",
} as const;

type Params = Record<string, string | number | boolean | undefined | null>;

let analytics: import("firebase/analytics").Analytics | undefined;
let loading: Promise<void> | undefined;

/**
 * Events fired while Firebase is still loading.
 *
 * Purely a race buffer — the SDK import takes a moment and a click in that
 * window would otherwise be lost. Held in memory only.
 */
const pending: { name: string; params: Params }[] = [];
const MAX_PENDING = 25;

/**
 * Whether a visitor has explicitly opted in to full, cookied analytics.
 *
 * "default" means nobody has been asked, which is the normal state of this
 * site: measurement runs anonymously and nothing is stored on the device.
 */
export function getConsent(): ConsentState {
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted" ? "granted" : "default";
  } catch {
    return "default";
  }
}

/**
 * Upgrades to full analytics. Nothing calls this today — it exists so that
 * adding a consent banner later is a UI change rather than a rewrite.
 */
export function grantFullConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, "granted");
  } catch {
    /* the session still honours it below */
  }

  void import("firebase/analytics").then(({ setConsent }) =>
    setConsent({
      analytics_storage: "granted",
      functionality_storage: "granted",
      security_storage: "granted",
    }),
  );
}

/**
 * Brings analytics up in the mode the visitor's choice implies.
 *
 * `setConsent` must run *before* `getAnalytics`, or gtag initialises with its
 * own defaults and sets a cookie before being told not to.
 */
async function load(): Promise<void> {
  if (analytics || loading) return loading;

  loading = (async () => {
    try {
      const config = {
        apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
        authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_ID,
        appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
        measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
      };

      if (!config.apiKey || !config.measurementId) return;

      const [{ initializeApp, getApps }, analyticsModule] = await Promise.all([
        import("firebase/app"),
        import("firebase/analytics"),
      ]);

      if (!(await analyticsModule.isSupported())) return;

      const optedIn = getConsent() === "granted";

      // Denied storage is what makes this cookieless. Advertising signals stay
      // denied in both modes: this site does not advertise, and leaving them
      // open would contradict the privacy policy's promise that nothing goes to
      // advertisers or data brokers.
      analyticsModule.setConsent({
        analytics_storage: optedIn ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        personalization_storage: "denied",
        functionality_storage: "granted",
        security_storage: "granted",
      });

      const app = getApps().length ? getApps()[0] : initializeApp(config);

      analytics = analyticsModule.getAnalytics(app);

      analyticsModule.setUserProperties(analytics, {
        surface: "landing",
        locale: document.documentElement.lang || "en",
        measurement_mode: optedIn ? "full" : "cookieless",
      });

      for (const event of pending.splice(0)) {
        analyticsModule.logEvent(analytics, event.name, clean(event.params));
      }
    } catch {
      // Analytics failing must never affect the page. A blocked request, an ad
      // blocker, a webview without IndexedDB — all of them land here.
      analytics = undefined;
    }
  })();

  return loading;
}

/**
 * Drops anything long enough to be someone's data.
 *
 * The demo runs on files the visitor chooses, and a file name is exactly the
 * value that gets passed "for context". Sizes, formats and outcomes are what
 * the questions are about.
 */
function clean(params: Params = {}): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "number") {
      if (Number.isFinite(value)) safe[key] = Math.round(value * 100) / 100;
      continue;
    }
    if (typeof value === "boolean") {
      safe[key] = value;
      continue;
    }
    const text = String(value);
    if (text.length > 0 && text.length <= 60) safe[key] = text;
  }

  return safe;
}

/** Records an event. Safe to call before `initAnalytics` has finished. */
export function track(name: string, params: Params = {}): void {
  const enriched = {
    ...params,
    page_locale: document.documentElement.lang || "en",
  };

  if (!analytics) {
    if (pending.length < MAX_PENDING) pending.push({ name, params: enriched });
    void load();
    return;
  }

  void import("firebase/analytics")
    .then(({ logEvent }) => logEvent(analytics!, name, clean(enriched)))
    .catch(() => undefined);
}

/** Starts analytics. Called from every page's bootstrap. */
export function initAnalytics(): void {
  void load();
}

/** Size buckets, matching the web app's so the two are comparable. */
export function sizeBucket(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return "under_1mb";
  if (mb < 10) return "1_10mb";
  if (mb < 50) return "10_50mb";
  if (mb < 100) return "50_100mb";
  if (mb < 250) return "100_250mb";
  return "over_250mb";
}
