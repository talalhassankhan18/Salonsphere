
import { NextAuthOptions } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    // Add your providers here - we'll use credentials for now
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).exec();

        if (!user) {
          return null;
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          salon: user.salon?.toString(),
          _id: user._id.toString(),
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token._id = user.id;
        token.role = user.role;
        token.salon = user.salon;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token.id;
        session.user.role = token.role as 'admin' | 'salon_admin' | 'customer';
        session.user.salon = token.salon;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 200 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ status: 200 });
}
