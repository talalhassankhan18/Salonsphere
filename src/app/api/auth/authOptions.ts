import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          await dbConnect();

          if (!credentials?.identifier || !credentials?.password) {
            return null;
          }

          const salon = await Salon.findOne({
            $or: [
              { email: credentials.identifier.toLowerCase() },
              { username: credentials.identifier.toLowerCase() },
            ],
          });

          if (!salon) {
            return null;
          }

          if (!salon.password) {
            return null;
          }

          const isPasswordValid = await compare(credentials.password, salon.password);
          if (!isPasswordValid) {
            return null;
          }

          if (!salon.isVerified) {
            return null;
          }

          if (salon.paymentStatus !== "completed" && salon.plan) {
            return null;
          }

          return {
            id: salon._id.toString(),
            email: salon.email,
            name: salon.name,
            username: salon.username,
            role: salon.role === "salon" ? "salon_admin" : salon.role,
            authMethod: salon.authMethod || "email",
            image: salon.avatar || null,
          } as User;
        } catch (error: any) {
          console.error("Authorize error:", error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.role = user.role;
        token.authMethod = user.authMethod;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.authMethod = token.authMethod;
        session.user.image = token.image || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/salon/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || throwError("NEXTAUTH_SECRET is not set"),
  debug: process.env.NODE_ENV === "development",
};

// Utility function to throw error for missing environment variables
function throwError(message: string): never {
  throw new Error(message);
}