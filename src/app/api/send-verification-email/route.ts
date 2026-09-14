import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    console.log("Email Config in /api/send-verification-email:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM,
      fromName: process.env.EMAIL_FROM_NAME,
    });

    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // smtp.gmail.com
      port: parseInt(process.env.EMAIL_PORT || "587"), // 587
      secure: process.env.EMAIL_PORT === "465", // false for port 587 (TLS)
      auth: {
        user: process.env.EMAIL_USER, // akhterhifza@gmail.com
        pass: process.env.EMAIL_PASS, // dnkwlhjqlektszyf
      },
    });

    const verificationUrl = `http://localhost:3000/auth/verify?token=${token}`; // Replace with your domain in production

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`, // "SalonSphere" <akhterhifza@gmail.com>
      to: email,
      subject: "Verify Your Email - SalonSphere",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p style="color: #555; text-align: center;">Thank you for registering with SalonSphere!</p>
          <p style="color: #555; text-align: center;">Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #555; text-align: center;">If you did not request this, please ignore this email.</p>
          <p style="color: #777; text-align: center; font-size: 12px;">© ${new Date().getFullYear()} SalonSphere. All rights reserved.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: `Verification email sent to ${email}` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending verification email:", error.message);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
