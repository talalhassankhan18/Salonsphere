import { NextResponse } from "next/server";

const predefinedResponses = [
  {
    keywords: ["add", "new", "salon"],
    response:
      "To add a new salon, go to the Salons section and click 'Add New Salon'. Fill in the required details like salon name, owner info, and subscription plan. Once submitted, the salon is ready to use the platform!",
    suggestions: [
      "How do subscription plans work?",
      "How do I manage salon inventory?",
    ],
  },
  {
    keywords: ["subscription", "plans"],
    response:
      "Salon Sphere offers monthly and yearly subscription plans that determine feature access and commission rates. You can manage these in the Salons section, where you can view, modify, or cancel subscriptions.",
    suggestions: [
      "How are commissions calculated?",
      "How do I add a new salon?",
    ],
  },
  {
    keywords: ["commission", "calculate"],
    response:
      "Commissions are a percentage of product sales, defaulting to 5% for salons. You can customize rates per salon or subscription tier in the Settings section. Payouts follow the schedule in the Payouts section.",
    suggestions: [
      "How do I process refunds?",
      "How do subscription plans work?",
    ],
  },
  {
    keywords: ["refund", "process"],
    response:
      "To process a refund, go to the Orders section, find the order, and click 'View'. Then, click 'Refund' and follow the prompts to issue a full or partial refund.",
    suggestions: [
      "How are commissions calculated?",
      "How do I manage inventory?",
    ],
  },
  {
    keywords: ["inventory", "manage"],
    response:
      "Inventory is managed in the Stock section, where you can view levels across all salons, set low stock alerts, and handle stock transfers. Product pages show allocation and availability details.",
    suggestions: [
      "How do I create promotional banners?",
      "How do I add a new salon?",
    ],
  },
  {
    keywords: ["banner", "promotional"],
    response:
      "Create banners in the Banners section by clicking 'Add New Banner'. Upload an image, set the target URL, schedule, and display rules. You can make global or salon-specific banners.",
    suggestions: [
      "How do I manage inventory?",
      "How do subscription plans work?",
    ],
  },
  {
    keywords: ["contact", "support"],
    response:
      "You can contact support via email at support@salonsphere.com, call us at +1 (800) 123-4567, or use the chat feature to get instant help!",
    suggestions: [
      "How do I process refunds?",
      "How do I add a new salon?",
    ],
  },
  {
    keywords: ["hours", "operation"],
    response:
      "Our support team is available 24/7 to assist you. You can reach out via chat, email, or phone at any time!",
    suggestions: [
      "How do I contact support?",
      "How do subscription plans work?",
    ],
  },
  {
    keywords: ["payment", "payout"],
    response:
      "Payouts are managed in the Payouts section. You can schedule and process payouts for salons based on their sales and commission rates.",
    suggestions: [
      "How are commissions calculated?",
      "How do I process refunds?",
    ],
  },
  {
    keywords: ["analytics", "report"],
    response:
      "You can access analytics and reports in the Analytics section. It provides insights into sales, salon performance, and more to help grow your business.",
    suggestions: [
      "How do I manage inventory?",
      "How do subscription plans work?",
    ],
  },
  {
    keywords: ["security", "secure"],
    response:
      "Salon Sphere uses industry-standard security practices to keep your data safe. You can learn more in the Security Best Practices help article.",
    suggestions: [
      "How do I contact support?",
      "How do I add a new salon?",
    ],
  },
  {
    keywords: ["hello", "hi", "hey"],
    response:
      "Hi there! I'm SalonBot, here to help with your Salon Sphere queries. What would you like to know?",
    suggestions: [
      "How do I add a new salon?",
      "How do subscription plans work?",
    ],
  },
];

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const lowercaseMessage = message.toLowerCase();

    // Split message into words for better matching
    const words = lowercaseMessage.split(/\s+/);

    // Find the best matching response
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

    // Fallback response for unmatched queries
    return NextResponse.json({
      response:
        "I'm not sure I understand your question. Could you please rephrase it, or try asking about salons, subscriptions, inventory, or support options?",
      suggestions: [
        "How do I add a new salon?",
        "How do subscription plans work?",
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