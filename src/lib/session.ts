import "server-only";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Define a type for payload
interface SessionPayload extends JWTPayload {
  userId: string;
  expire: Date;
}

const key = new TextEncoder().encode(process.env.Secret || "SalonSphereSecretKey");

const cookie = {
  name: "session",
  options: { HttpOnly: true, secure: true, sameSite: "lax", path: "/" },
  duration: 60 * 1000,
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  try {
    const cookieStore = await cookies();
    const expire = new Date(Date.now() + cookie.duration);
    const session = await encrypt({ userId, expire });

    // Set the cookie
    cookieStore.set("session", session, {
      httpOnly: true,
      secure: true,
      expires: expire,
      sameSite: "lax",
      path: "/",
    });
  } catch (e) {
    console.log(e);
  }
}

export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return redirect("/login");
  }
  return { userId: session.userId };
}
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookie.name);
  return redirect("/login");
}

export const handleLogout = async () => {
  "use server"
  await deleteSession();
};