// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: "admin" | "salon_admin" | "customer" | "super_admin" | "salonOwner";
    registrationStatus: "started" | "completed";
    emailVerified: boolean | null;
    salon?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      _id: string;
      name: string;
      email: string;
      role: "admin" | "salon_admin" | "customer" | "super_admin" | "salonOwner";
      registrationStatus: "started" | "completed";
      emailVerified: boolean | null;
      salon?: string;
    };
  }
}


declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }

  interface User extends CustomUser {}
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: "admin" | "salon_admin" | "customer" | "super_admin" | "salonOwner";
    registrationStatus: "started" | "completed";
    emailVerified: boolean | null;
    salon?: string;
  }
}