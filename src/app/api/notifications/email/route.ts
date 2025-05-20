import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

// Define EmailOptions interface locally to match sendEmail.ts
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, subject, message, fromName } = await req.json();

    if (!email || !subject || !message) {
      console.error("Missing email, subject, or message", {
        email,
        subject,
        message,
      });
      return NextResponse.json(
        { message: "Email, subject, and message are required" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    const html = `<p>${message.replace(/\n/g, "<br>")}</p>`;
    await sendEmail({
      to: email,
      subject,
      text: message,
      html,
      fromName,
    } as EmailOptions);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/notifications/email:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}