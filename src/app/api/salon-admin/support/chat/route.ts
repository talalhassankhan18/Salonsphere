// api/salon-admin/support/chat/route.ts
import { NextResponse } from "next/server";

const predefinedResponses = [
  {
    keywords: ["add", "new", "service"],
    response:
      "To add a new service, go to the Services section in your dashboard. Click 'Add New Service', fill in the details like name, description, price, and duration, then save.",
    suggestions: [
      "How do I manage appointments?",
      "How can I sell products?",
    ],
  },
  {
    keywords: ["appointment", "manage"],
    response:
      "In the Appointments section, view all bookings, confirm, reschedule, or cancel them. Use the calendar to manage your availability.",
    suggestions: [
      "How do I add a new service?",
      "How do I view my analytics?",
    ],
  },
  {
    keywords: ["sell", "product"],
    response:
      "Go to the Products section, browse the superadmin’s catalog, add products to your storefront, set pricing, and track sales in the Orders section.",
    suggestions: [
      "How are my commissions calculated?",
      "How do I manage appointments?",
    ],
  },
  {
    keywords: ["commission", "calculate"],
    response:
      "Commissions are based on product sales, defaulting to 5%. Check the Commission section for your specific rate, which may vary by subscription plan.",
    suggestions: [
      "How do I sell products?",
      "How do I update my portfolio?",
    ],
  },
  {
    keywords: ["portfolio", "update"],
    response:
      "In the Portfolio section, upload images of your work, add descriptions, and categorize them to showcase your services.",
    suggestions: [
      "How do I add a new service?",
      "How do I view my analytics?",
    ],
  },
  {
    keywords: ["analytics", "view"],
    response:
      "The Analytics section shows your sales, appointments, and reviews. Use filters to customize reports and track performance.",
    suggestions: [
      "How do I manage appointments?",
      "How are my commissions calculated?",
    ],
  },
  {
    keywords: ["contact", "support"],
    response:
      "Contact support via email at support@salonsphere.com, call +92 319 2590810, or use the chat feature for instant help.",
    suggestions: [
      "How do I add a new service?",
      "How do I sell products?",
    ],
  },
  {
    keywords: ["hello", "hi", "hey"],
    response:
      "Hi there! I'm SalonBot, here to help with your SalonSphere queries. What would you like to know?",
    suggestions: [
      "How do I add a new service?",
      "How do I manage appointments?",
    ],
  },
];

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const lowercaseMessage = message.toLowerCase();
    const words = lowercaseMessage.split(/\s+/);

    let bestMatch = null;
    let maxKeywordMatches = 0;

    for (const item of predefinedResponses) {
      const matchedKeywords = item.keywords.filter((keyword) =>
        words.includes(keyword)
      );
      if (matchedKeywords.length > maxKeywordMatches) {
        maxKeywordMatches = matchedKeywords.length;
        bestMatch = item;
      }
    }

    if (bestMatch) {
      return NextResponse.json({
        response: bestMatch.response,
        suggestions: bestMatch.suggestions,
      });
    }

    return NextResponse.json({
      response:
        "I'm not sure I understand your question. Try asking about services, appointments, products, or support options.",
      suggestions: [
        "How do I add a new service?",
        "How do I manage appointments?",
        "How do I contact support?",
      ],
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}