import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// No hardcoded fallback: a guessable secret lets anyone forge session cookies.
const secretKey = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
if (!secretKey) {
  throw new Error(
    "SESSION_SECRET (or NEXTAUTH_SECRET) must be set to sign session cookies"
  );
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expires });

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) return null;
  const session = await decrypt(cookie);
  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
