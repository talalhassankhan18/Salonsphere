// api/user/support/suggestions/route.ts
import { NextResponse } from "next/server";

const suggestions = [
  "How do I book a service?",
  "How can I purchase products?",
  "What payment options are available?",
  "How do I track my orders?",
  "How do I sign up?",
  "Can I browse without an account?",
  "How do I contact support?",
];

export async function GET() {
  try {
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}