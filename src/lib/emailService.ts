import nodemailer from "nodemailer";
import crypto from "crypto";

// Create a shared transporter instance
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  userId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex"); // Generate a random token

  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?userId=${userId}&token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SalonSphere" <no-reply@salonsphere.com>',
      to: email,
      subject: "Verify Your SalonSphere Account",
      html: `
        <h1>Welcome to SalonSphere!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    return token; // Return token to store in the database
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SalonSphere" <no-reply@salonsphere.com>',
      to: email,
      subject: "Reset Your SalonSphere Password",
      html: `
        <h2>Reset Your Password</h2>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}