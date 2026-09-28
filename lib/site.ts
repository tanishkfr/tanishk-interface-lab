/**
 * The Lab's canonical public origin.
 *
 * The install command and absolute metadata URLs read from here, so a
 * component copied off any page installs from the deployed registry —
 * never from whatever host the page happens to be open on (localhost
 * included). Override with NEXT_PUBLIC_SITE_URL for previews or to move
 * the Lab to another domain without touching components.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lab.tanishk.me"
).replace(/\/+$/, "");
