// api/salon-admin/support/suggestions/route.ts
import { NextResponse } from "next/server";

const suggestions = [
  "How do I add a new service?",
  "How do I manage appointments?",
  "How can I sell products?",
  "How are my commissions calculated?",
  "How do I update my portfolio?",
  "How do I view my analytics?",
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