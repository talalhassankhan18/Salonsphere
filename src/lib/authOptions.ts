import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import Salon from "@/mongoose-models/Salon";
import Customer from "@/mongoose-models/Customer";
import dbConnect from "@/dbConnect";
import { compare } from "bcryptjs";

// The `User`, `Session` and `JWT` shapes are augmented once, in
// `types/next-auth.d.ts`. Do not re-declare them here — a second
// `declare module "next-auth"` with a narrower `Session.user` was the
// source of a long chain of type errors across the app.

export type UserRole = NonNullable<User["role"]>;

const VALID_ROLES: UserRole[] = ["admin", "salon_admin", "customer", "super_admin"];

const DEFAULT_BUSINESS_HOURS = [
  { day: "Monday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM" },
  { day: "Tuesday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM" },
  { day: "Wednesday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM" },
  { day: "Thursday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM" },
  { day: "Friday", isOpen: true, openTime: "9:00 AM", closeTime: "6:00 PM" },
  { day: "Saturday", isOpen: true, openTime: "10:00 AM", closeTime: "4:00 PM" },
  { day: "Sunday", isOpen: false, openTime: null, closeTime: null },
];

// Single Auth Options for both Customer and Salon
export const authOptions: NextAuthOptions = {
  providers: [
    // Customer Credentials Provider
    CredentialsProvider({
      id: "customer-credentials-login",
      name: "Customer Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          await dbConnect();

          if (
            typeof credentials?.email !== "string" ||
            typeof credentials?.password !== "string"
          ) {
            throw new Error("Email and password must be strings");
          }

          const customer = await Customer.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password");

          if (!customer) {
            throw new Error("Invalid email or password");
          }

          if (!customer.password) {
            throw new Error(
              "No password set for this account. Please use Google sign-in or reset your password."
            );
          }

          const isPasswordValid = await compare(
            credentials.password,
            customer.password
          );
          if (!isPasswordValid) {
            throw new Error("Incorrect password");
          }

          if (!customer.isVerified) {
            throw new Error(
              `Account not verified. Please verify your email: ${customer.email}`
            );
          }

          return {
            id: customer._id.toString(),
            email: customer.email,
            name: customer.name || customer.email.split("@")[0],
            role: "customer",
            authMethod: "email",
            isVerified: true,
          };
        } catch (error: any) {
          console.error("Authorize error (customer):", error.message);
          throw new Error(error.message);
        }
      },
    }),

    // Salon Credentials Provider
    CredentialsProvider({
      id: "salon-credentials-login",
      name: "Salon Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          await dbConnect();

          if (
            typeof credentials?.identifier !== "string" ||
            typeof credentials?.password !== "string"
          ) {
            throw new Error("Email/username and password must be strings");
          }

          const identifier = credentials.identifier.toLowerCase();
          const salon = await Salon.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          }).select("+password");

          if (!salon) {
            throw new Error("Invalid email or username");
          }

          if (!salon.scheduling) {
            salon.scheduling = {
              businessHours: DEFAULT_BUSINESS_HOURS,
              appointmentBuffer: 15,
              allowOnlineBooking: true,
              requireConfirmation: false,
            };
            await salon.save();
          }

          if (!salon.password) {
            throw new Error(
              "No password set for this account. Please reset your password."
            );
          }

          const isPasswordValid = await compare(
            credentials.password,
            salon.password as string
          );
          if (!isPasswordValid) {
            throw new Error("Incorrect password");
          }

          if (!salon.isVerified) {
            throw new Error(
              `Account not verified. Please verify your email: ${salon.email}`
            );
          }

          if (salon.paymentStatus !== "completed" && salon.plan) {
            throw new Error(
              `Payment incomplete. Please complete payment for: ${salon.email}`
            );
          }

          const role = (salon.role || "salon_admin") as UserRole;
          if (!VALID_ROLES.includes(role)) {
            throw new Error(`Invalid role: ${role}`);
          }

          return {
            id: salon._id.toString(),
            email: salon.email,
            name: salon.name || salon.salonName || "",
            image: salon.avatar || null,
            username: salon.username || "",
            role,
            authMethod: salon.authMethod || "email",
            salonId: salon._id.toString(),
            userId: salon.userId || "",
            salonType: salon.salonType || "unisex",
            isVerified: Boolean(salon.isVerified),
          };
        } catch (error: any) {
          console.error("Authorize error (salon):", error.message);
          throw new Error(error.message);
        }
      },
    }),

    // Google Provider (for Customers)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }): Promise<JWT> {
      if (!user) return token;

      if (account?.provider === "google") {
        await dbConnect();
        const email = user.email?.toLowerCase();
        let customer = await Customer.findOne({ email });

        if (!customer) {
          customer = await Customer.create({
            email,
            name: user.name || email?.split("@")[0] || "User",
            authMethod: "google",
            isVerified: true,
            role: "customer",
          });
        }

        return {
          ...token,
          id: customer._id.toString(),
          email: customer.email,
          name: customer.name || user.name || email?.split("@")[0] || "User",
          role: "customer",
          authMethod: "google",
          isVerified: true,
        };
      }

      return {
        ...token,
        id: user.id,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        username: user.username,
        role: user.role ?? "customer",
        authMethod: user.authMethod ?? "email",
        salonId: user.salonId,
        userId: user.userId,
        salonType: user.salonType,
        isVerified: user.isVerified,
      };
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user = {
          ...session.user,
          id: token.id || "",
          email: token.email ?? null,
          name: token.name ?? null,
          image: token.image ?? null,
          username: token.username,
          role: token.role || "customer",
          authMethod: token.authMethod,
          salonId: token.salonId,
          userId: token.userId,
          salonType: token.salonType,
          isVerified: token.isVerified,
        };
      }
      return session;
    },

    // NextAuth's redirect callback does not receive the user, so role-based
    // landing pages are handled client-side after signIn(). Here we only make
    // sure we never redirect off-site.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
