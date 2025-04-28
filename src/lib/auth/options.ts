import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/mongoose-models/User";
import dbConnect from "@/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please provide both email and password");
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("This account uses Google Sign-In. Please use Google to log in.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          registrationStatus: user.registrationStatus,
          emailVerified: user.emailVerified,
          salon: user.salon ? user.salon.toString() : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      if (account?.provider === "google") {
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          existingUser = new User({
            name: user.name,
            email: user.email,
            role: "salonOwner",
            emailVerified: true,
            registrationStatus: "started",
          });
          await existingUser.save();
        } else if (!existingUser.emailVerified) {
          existingUser.emailVerified = true;
          await existingUser.save();
        }
        user._id = existingUser._id.toString();
        user.role = existingUser.role;
        user.registrationStatus = existingUser.registrationStatus;
        user.emailVerified = existingUser.emailVerified;
        user.salon = existingUser.salon ? existingUser.salon.toString() : undefined;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        await dbConnect();
        const updatedUser = await User.findById(token._id);
        if (updatedUser) {
          return {
            ...token,
            ...session,
            emailVerified: updatedUser.emailVerified,
            registrationStatus: updatedUser.registrationStatus,
            salon: updatedUser.salon ? updatedUser.salon.toString() : undefined,
          };
        }
      }

      if (user) {
        token._id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.registrationStatus = user.registrationStatus;
        token.emailVerified = user.emailVerified;
        token.salon = user.salon;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          _id: token._id,
          name: token.name,
          email: token.email,
          role: token.role,
          registrationStatus: token.registrationStatus,
          emailVerified: token.emailVerified,
          salon: token.salon,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/Login",
    error: "/Login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};