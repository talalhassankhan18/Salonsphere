
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'salon_admin' | 'customer' | 'super_admin';
    salon?: string;
    _id?: string;
  }

  interface Session {
    user: {
      _id: string;
      name: string;
      email: string;
      role: 'admin' | 'salon_admin' | 'customer' | 'super_admin';
      salon?: string;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    salon?: string;
    _id?: string;
  }
}
