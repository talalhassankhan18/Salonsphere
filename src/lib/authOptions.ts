import type { User, Session } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

import Salon from "@/mongoose-models/Salon";
import Customer from "@/mongoose-models/Customer";
import dbConnect from "@/dbConnect";
import { compare } from "bcryptjs";

// Custom interfaces
export interface CustomUser {
  id: string;
  email?: string;
  name?: string | null;
  image?: string | null;
  username?: string;
  authMethod?: "email" | "google" | undefined;
  salonId?: string;
  userId?: string;
  salonType?: "female" | "male" | "unisex";
  role?: "admin" | "salon_admin" | "customer" | "super_admin";
}

export interface CustomJWT extends JWT {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  username?: string;
  authMethod?: "email" | "google" | undefined;
  salonId?: string;
  userId?: string;
  salonType?: "female" | "male" | "unisex";
  role?: "admin" | "salon_admin" | "customer" | "super_admin";
}

export interface CustomSession extends Session {
  user: CustomUser;
}

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
      async authorize(credentials) {
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
          };
        } catch (error: any) {
          console.error("Authorize error (customer):", {
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          });
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
      async authorize(credentials) {
        try {
          await dbConnect();

          if (
            typeof credentials?.identifier !== "string" ||
            typeof credentials?.password !== "string"
          ) {
            throw new Error("Email/username and password must be strings");
          }

          console.log("Salon authorize: Querying for identifier", {
            identifier: credentials.identifier,
          });

          const salon = await Salon.findOne({
            $or: [
              { email: credentials.identifier.toLowerCase() },
              { username: credentials.identifier.toLowerCase() },
            ],
          }).select("+password");

          if (!salon) {
            console.log("Salon authorize: No salon found for identifier", {
              identifier: credentials.identifier,
            });
            throw new Error("Invalid email or username");
          }

          console.log("Salon authorize: Found salon", {
            email: salon.email,
            username: salon.username,
            isVerified: salon.isVerified,
            paymentStatus: salon.paymentStatus,
            scheduling: salon.scheduling,
          });

          if (!salon.scheduling) {
            console.log("Salon authorize: Initializing missing scheduling", {
              email: salon.email,
            });
            salon.scheduling = {
              businessHours: [
                {
                  day: "Monday",
                  isOpen: true,
                  openTime: "9:00 AM",
                  closeTime: "6:00 PM",
                },
                {
                  day: "Tuesday",
                  isOpen: true,
                  openTime: "9:00 AM",
                  closeTime: "6:00 PM",
                },
                {
                  day: "Wednesday",
                  isOpen: true,
                  openTime: "9:00 AM",
                  closeTime: "6:00 PM",
                },
                {
                  day: "Thursday",
                  isOpen: true,
                  openTime: "9:00 AM",
                  closeTime: "6:00 PM",
                },
                {
                  day: "Friday",
                  isOpen: true,
                  openTime: "9:00 AM",
                  closeTime: "6:00 PM",
                },
                {
                  day: "Saturday",
                  isOpen: true,
                  openTime: "10:00 AM",
                  closeTime: "4:00 PM",
                },
                {
                  day: "Sunday",
                  isOpen: false,
                  openTime: null,
                  closeTime: null,
                },
              ],
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

          const role = salon.role || "salon_admin";
          if (
            !["admin", "salon_admin", "customer", "super_admin"].includes(role)
          ) {
            throw new Error(`Invalid role: ${role}`);
          }

          const user = {
            id: salon._id.toString(),
            email: salon.email,
            name: salon.name || salon.salonName || "",
            image: salon.avatar || null,
            username: salon.username || "",
            role: role as CustomUser["role"],
            authMethod: salon.authMethod || "email",
            salonId: salon._id.toString(),
            userId: salon.userId || "",
            salonType: salon.salonType || "unisex",
          };

          console.log("Salon authorize: Returning user", user);

          return user;
        } catch (error: any) {
          console.error("Authorize error (salon):", {
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          });
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
    async jwt({ token, user, account }) {
      console.log("JWT callback:", {
        user: user || null,
        token,
        account: account || null,
      });
      if (user) {
        if (account?.provider === "google") {
          await dbConnect();
          let customer = await Customer.findOne({
            email: user.email?.toLowerCase(),
          });

          if (!customer) {
            customer = await Customer.create({
              email: user.email?.toLowerCase(),
              name: user.name || user.email?.split("@")[0] || "User",
              authMethod: "google",
              isVerified: true,
              role: "customer",
            });
          }

          return {
            ...token,
            id: customer._id.toString(),
            email: customer.email,
            name:
              customer.name || user.name || user.email?.split("@")[0] || "User",
            role: "customer",
            authMethod: "google",
          } satisfies CustomJWT;
        }

        const customUser = user as CustomUser;
        return {
          ...token,
          id: customUser.id,
          email: customUser.email ?? undefined,
          name: customUser.name ?? undefined,
          image: customUser.image ?? undefined,
          username: customUser.username ?? undefined,
          role: customUser.role ?? "customer",
          authMethod: customUser.authMethod ?? "email",
          salonId: customUser.salonId ?? undefined,
          userId: customUser.userId ?? undefined,
          salonType: customUser.salonType ?? undefined,
        } satisfies CustomJWT;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      if (session.user && token) {
        const customToken = token as CustomJWT;
        session.user = {
          id: customToken.id || "", // Ensure id is always set
          email: customToken.email || null,
          name: customToken.name || null,
          image: customToken.image || null,
          username: customToken.username || undefined,
          role: customToken.role || "customer",
          authMethod: customToken.authMethod || undefined,
          salonId: customToken.salonId || undefined,
          userId: customToken.userId || undefined,
          salonType: customToken.salonType || undefined,
        } satisfies CustomUser;
        console.log("Session callback: Updated session user", session.user);
      }
      return session;
    },
    async redirect({ url, baseUrl, user }) {
      console.log("Redirect callback:", {
        url,
        baseUrl,
        userRole: user?.role,
        user: user || null,
      });
      if (user?.role === "salon_admin") {
        return `${baseUrl}/salon/dashboard`;
      } else if (user?.role === "customer") {
        return `${baseUrl}/`;
      }
      return url;
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

// Extend next-auth types
declare module "next-auth" {
  interface User extends CustomUser {}
  interface Session {
    user: CustomUser;
    expires: string;
  }
}
