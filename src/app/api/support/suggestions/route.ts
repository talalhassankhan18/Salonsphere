import { NextResponse } from "next/server";

const suggestions = [
  "How do I add a new salon?",
  "How do subscription plans work?",
  "How are commissions calculated?",
  "How do I process refunds?",
  "How do I manage inventory?",
  "How do I create promotional banners?",
  "How do I contact support?",
  "What are your hours of operation?",
  "How do I manage payouts?",
  "How can I view analytics?",
  "How does Salon Sphere ensure security?",
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