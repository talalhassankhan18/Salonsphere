import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    username?: string | null;
    role: "admin" | "salon_admin" | "customer" | "super_admin";
    authMethod: string;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      username?: string | null;
      role: "admin" | "salon_admin" | "customer" | "super_admin";
      authMethod: string;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    username?: string | null;
    role: "admin" | "salon_admin" | "customer" | "super_admin";
    authMethod: string;
  }
}