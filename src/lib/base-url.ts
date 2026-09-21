/**
 * The public origin of this deployment, e.g. "https://salonsphere.vercel.app".
 *
 * Every absolute URL the server builds (OAuth redirect_uri, verification and
 * reset links, review links) must come from here. Precedence:
 *
 *  1. NEXTAUTH_URL — unless it points at localhost while running on Vercel.
 *     That exact misconfiguration (a local .env pasted into the Vercel
 *     dashboard) sent "Continue with Google" to http://localhost:3000 and put
 *     localhost links in production emails.
 *  2. Vercel's own variables: VERCEL_PROJECT_PRODUCTION_URL for the production
 *     alias, VERCEL_URL for preview deployments (both without a scheme).
 *  3. NEXT_PUBLIC_BASE_URL, then http://localhost:3000 for local dev.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

function isLocal(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return true; // unparsable → treat as unusable
  }
}

function withScheme(host: string): string {
  return /^https?:\/\//.test(host) ? host : `https://${host}`;
}

export function getBaseUrl(): string {
  const onVercel = process.env.VERCEL === "1";
  const configured = process.env.NEXTAUTH_URL?.trim();

  if (configured && !(onVercel && isLocal(configured))) {
    return configured.replace(/\/+$/, "");
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (onVercel && vercelHost) {
    return withScheme(vercelHost);
  }

  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (publicBase) return publicBase.replace(/\/+$/, "");

  return "http://localhost:3000";
}

/**
 * NextAuth v4 reads process.env.NEXTAUTH_URL directly to build OAuth
 * redirect_uris and there is no option to inject it, so the only way to
 * protect it from a bad dashboard value is to correct the variable before
 * NextAuth runs. Call at module scope of the [...nextauth] route.
 */
export function ensureNextAuthUrl(): void {
  const resolved = getBaseUrl();
  if (process.env.NEXTAUTH_URL !== resolved) {
    if (process.env.NEXTAUTH_URL) {
      console.warn(
        `NEXTAUTH_URL="${process.env.NEXTAUTH_URL}" is not usable here; using ${resolved}. Fix it in the Vercel dashboard.`
      );
    }
    process.env.NEXTAUTH_URL = resolved;
  }
}
