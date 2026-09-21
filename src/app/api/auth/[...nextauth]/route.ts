import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { ensureNextAuthUrl } from "@/lib/base-url";

// Module scope runs on every cold start, before NextAuth reads NEXTAUTH_URL
// for the OAuth redirect_uri. See src/lib/base-url.ts for why.
ensureNextAuthUrl();

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
