// api/user/support/chat/route.ts
import { NextResponse } from "next/server";

const predefinedResponses = [
  {
    keywords: ["browse", "salon", "service", "product", "without", "account"],
    response:
      "Yes, as a guest user, you can browse salons, view their services, and check out products. You can also add products to your cart. However, to complete a booking or order, you’ll need to sign up for an account.",
    suggestions: [
      "How do I book a service?",
      "How can I purchase products?",
    ],
  },
  {
    keywords: ["book", "service", "appointment"],
    response:
      "To book a service, browse salons, select a service, and choose a date and time slot. If the slot is available, enter your details, confirm the booking, and choose your payment method—Cash on Service or Card Payment. You’ll need to sign up if you don’t have an account.",
    suggestions: [
      "What payment options are available?",
      "How do I track my bookings?",
    ],
  },
  {
    keywords: ["purchase", "buy", "product"],
    response:
      "You can purchase products in two ways: 1) From the Products page by browsing the catalog, or 2) From a salon’s profile by viewing their listed products. Add the product to your cart, proceed to checkout, and choose between Cash on Delivery or Card Payment. You’ll need to sign up to complete the purchase.",
    suggestions: [
      "What payment options are available?",
      "How do I track my orders?",
    ],
  },
  {
    keywords: ["payment", "option", "method", "cash", "card"],
    response:
      "For bookings, you can pay via Cash on Service or Card Payment (Bank Transfer). For product purchases, you can choose Cash on Delivery or Card Payment. Select your preferred method during checkout.",
    suggestions: [
      "How do I book a service?",
      "How can I purchase products?",
    ],
  },
  {
    keywords: ["track", "order", "booking"],
    response:
      "After signing up and completing your order or booking, you can track them in your account. Go to 'My Orders' for product purchases or 'My Bookings' for service appointments to view their status.",
    suggestions: [
      "How do I book a service?",
      "How can I purchase products?",
    ],
  },
  {
    keywords: ["sign", "up", "signup", "account", "register"],
    response:
      "You’ll need to sign up to complete a booking or order. Click 'Sign Up' on the website, enter your details, and verify your email. Once registered, you can manage your bookings, orders, and payments in your account.",
    suggestions: [
      "What happens if I don’t sign up?",
      "How do I track my orders?",
    ],
  },
  {
    keywords: ["without", "sign", "up", "signup", "account"],
    response:
      "You can add products to your cart or start a booking as a guest, but to finalize the order or booking, you’ll need to sign up. Your cart and booking details will be saved once you create an account.",
    suggestions: [
      "How do I sign up?",
      "How do I book a service?",
    ],
  },
  {
    keywords: ["slot", "available", "date", "time"],
    response:
      "When booking a service, you’ll see available date and time slots. Select a slot that suits you, enter your details, and confirm the booking. If a slot isn’t available, try a different time or date.",
    suggestions: [
      "How do I book a service?",
      "What payment options are available?",
    ],
  },
  {
    keywords: ["cash", "delivery", "service"],
    response:
      "Cash on Delivery is available for product purchases, and Cash on Service is an option for booking payments. Select these options during checkout if you prefer to pay in cash upon delivery or service completion.",
    suggestions: [
      "What other payment options are there?",
      "How do I track my orders?",
    ],
  },
  {
    keywords: ["card", "payment", "bank", "transfer"],
    response:
      "Card Payment (Bank Transfer) is available for both bookings and product purchases. Select this option during checkout, enter your card details, and complete the payment securely.",
    suggestions: [
      "What other payment options are there?",
      "How do I track my orders?",
    ],
  },
  {
    keywords: ["cancel", "booking", "order"],
    response:
      "To cancel a booking or order, go to 'My Bookings' or 'My Orders' in your account. If the salon or seller allows cancellations, you’ll see an option to cancel. Policies may vary by salon.",
    suggestions: [
      "How do I track my bookings?",
      "How do I contact support?",
    ],
  },
  {
    keywords: ["reschedule", "booking"],
    response:
      "To reschedule a booking, go to 'My Bookings' in your account, select the booking, and choose a new date and time slot if available. Confirm the changes to update your booking.",
    suggestions: [
      "How do I cancel a booking?",
      "How do I contact support?",
    ],
  },
  {
    keywords: ["contact", "support"],
    response:
      "Contact support via email at support@salonsphere.com, call +92 319 2590810, or use the chat feature for instant help.",
    suggestions: [
      "How do I book a service?",
      "How can I purchase products?",
    ],
  },
  {
    keywords: ["hello", "hi", "hey"],
    response:
      "Hi there! I'm SalonBot, here to help with your SalonSphere queries. What would you like to know?",
    suggestions: [
      "How do I book a service?",
      "How can I purchase products?",
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
        "I'm not sure I understand your question. Try asking about booking, purchasing, payments, or support options.",
      suggestions: [
        "How do I book a service?",
        "How can I purchase products?",
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