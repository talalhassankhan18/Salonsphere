import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string;
    authMethod?: "email" | "google";
    salonId?: string;
    userId?: string;
    salonType?: "female" | "male" | "unisex";
    role?: "admin" | "salon_admin" | "customer" | "super_admin";
    isVerified?: boolean;
    password?: string;
  }

  interface Session {
    user: {
      id?: string | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      username?: string;
      authMethod?: "email" | "google";
      salonId?: string;
      userId?: string;
      salonType?: "female" | "male" | "unisex";
      role?: "admin" | "salon_admin" | "customer" | "super_admin";
      isVerified?: boolean;
    } & DefaultSession["user"];
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    image?: string | null;
    username?: string;
    authMethod?: "email" | "google";
    salonId?: string;
    userId?: string;
    salonType?: "female" | "male" | "unisex";
    role?: "admin" | "salon_admin" | "customer" | "super_admin";
    isVerified?: boolean;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}
