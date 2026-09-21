"use client";

import SalonBot, { SalonBotProps } from "@/components/SalonBot";

/**
 * SalonBot - Customer Support Widget (formerly legacy hardcoded Chatbot)
 * Powered by Next.js App Router, MongoDB Atlas Vector Search, and Vercel AI SDK.
 */
export default function Chatbot(props: SalonBotProps) {
  return <SalonBot {...props} />;
}