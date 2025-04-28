
import { Session } from "next-auth";

/**
 * Helper function to safely access session user properties
 * This helps TypeScript understand our custom properties
 */
export const getSessionUser = (session: Session | null) => {
  if (!session || !session.user) return null;
  
  return {
    _id: session.user._id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as 'admin' | 'salon_admin' | 'customer' | 'super_admin',
    salon: session.user.salon
  };
};

export const isAuthenticated = (session: Session | null): boolean => {
  return !!session && !!session.user;
};

export const isSalonAdmin = (session: Session | null): boolean => {
  return !!session && !!session.user && session.user.role === 'salon_admin';
};

export const isCustomer = (session: Session | null): boolean => {
  return !!session && !!session.user && session.user.role === 'customer';
};

export const isAdmin = (session: Session | null): boolean => {
  return !!session && !!session.user && session.user.role === 'admin';
};

export const isSuperAdmin = (session: Session | null): boolean => {
  return !!session && !!session.user && session.user.role === 'super_admin';
};
