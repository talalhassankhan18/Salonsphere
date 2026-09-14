import "server-only";

// Super-admin login credentials.
//
// Project requirement: the super-admin account is a single hardcoded login
// (no database record). The values below are the defaults; they can be
// overridden with SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD in .env without
// touching code. This file is server-only so the password is never bundled
// into client JavaScript.

export const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || "Superadmin@gmail.com";

export const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || "Superadmin@123";
