// src/lib/email/emailService.ts
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  name: string;
  code: string;
}

interface ResetEmailOptions {
  to: string;
  name: string;
  resetToken: string;
}

interface PaymentEmailOptions {
  to: string;
  name: string;
  planName: string;
  planPrice: string;
}

export async function sendVerificationCodeEmail({
  to,
  name,
  code,
}: EmailOptions) {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email configuration missing: EMAIL_USER or EMAIL_PASS not set"
    );
  }
  if (!process.env.NEXTAUTH_URL) {
    throw new Error("NEXTAUTH_URL not set in environment variables");
  }

  // Create transporter with Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 20000,
  });

  // Email options
  const mailOptions = {
    from: `"SalonSphere Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1>Verify Your Email</h1>
        <p>Hello ${name},</p>
        <p>Your verification code is: <strong style="font-size: 1.2em;">${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>Click <a href="${
          process.env.NEXTAUTH_URL
        }/salon/register/verification?email=${encodeURIComponent(
      to
    )}" style="color: #B4004E;">here</a> to enter your code.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>SalonSphere Team</p>
      </div>
    `,
    text: `
      Hello ${name},\n\n
      Your verification code is: ${code}\n
      This code will expire in 15 minutes.\n
      Visit ${
        process.env.NEXTAUTH_URL
      }/salon/register/verification?email=${encodeURIComponent(
      to
    )} to enter your code.\n\n
      If you didn't request this, please ignore this email.\n\n
      Best regards,\n
      SalonSphere Team
    `,
  };

  // Retry logic for transient network issues
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${to} on attempt ${attempt}`);
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed to send email to ${to}:`, error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Log the code as a fallback for testing
  console.log(`Fallback: Verification code for ${to}: ${code}`);

  // Throw specific error for EHOSTUNREACH
  if (lastError.code === "ESOCKET" && lastError.errno === -4073) {
    throw new Error(
      `Email sending failed: Unable to reach smtp.gmail.com:587 (EHOSTUNREACH). Check your network, firewall, or antivirus settings. Code logged for testing: ${code}`
    );
  }

  throw new Error(
    `Email sending failed after ${maxRetries} attempts: ${lastError.message}`
  );
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: ResetEmailOptions) {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email configuration missing: EMAIL_USER or EMAIL_PASS not set"
    );
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL not set in environment variables");
  }

  // Create transporter with Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 20000,
  });

  // Email options
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/salon/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"SalonSphere Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1>Reset Your Password</h1>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="font-size: 1.2em; color: #B4004E;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>SalonSphere Team</p>
      </div>
    `,
    text: `
      Hello ${name},\n\n
      You requested a password reset. Visit the link below to reset your password:\n
      ${resetUrl}\n
      This link will expire in 1 hour.\n\n
      If you didn't request this, please ignore this email.\n\n
      Best regards,\n
      SalonSphere Team
    `,
  };

  // Retry logic for transient network issues
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${to} on attempt ${attempt}`);
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed to send email to ${to}:`, error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Log the reset link as a fallback for testing
  console.log(`Fallback: Reset link for ${to}: ${resetUrl}`);

  // Throw specific error for EHOSTUNREACH
  if (lastError.code === "ESOCKET" && lastError.errno === -4073) {
    throw new Error(
      `Email sending failed: Unable to reach smtp.gmail.com:587 (EHOSTUNREACH). Check network, firewall, or antivirus settings. Reset link logged for testing: ${resetUrl}`
    );
  }

  throw new Error(
    `Email sending failed after ${maxRetries} attempts: ${lastError.message}`
  );
}

export async function sendPaymentConfirmationEmail({
  to,
  name,
  planName,
  planPrice,
}: PaymentEmailOptions) {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email configuration missing: EMAIL_USER or EMAIL_PASS not set"
    );
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL not set in environment variables");
  }

  // Create transporter with Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 20000,
  });

  // Email options
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/salon/dashboard`;
  const mailOptions = {
    from: `"SalonSphere Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Payment Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1>Payment Confirmed</h1>
        <p>Hello ${name},</p>
        <p>Your payment for the <strong>${planName}</strong> plan has been successfully processed.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Plan: ${planName}</li>
          <li>Price: $${planPrice}</li>
        </ul>
        <p>You can now access your dashboard to manage your salon:</p>
        <p><a href="${dashboardUrl}" style="font-size: 1.2em; color: #B4004E;">Go to Dashboard</a></p>
        <p>If you have any questions, contact our support team.</p>
        <p>Best regards,<br>SalonSphere Team</p>
      </div>
    `,
    text: `
      Hello ${name},\n\n
      Your payment for the ${planName} plan has been successfully processed.\n
      Details:\n
      - Plan: ${planName}\n
      - Price: $${planPrice}\n\n
      You can now access your dashboard at ${dashboardUrl}.\n\n
      If you have any questions, contact our support team.\n\n
      Best regards,\n
      SalonSphere Team
    `,
  };

  // Retry logic for transient network issues
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `Payment confirmation email sent to ${to} on attempt ${attempt}`
      );
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed to send email to ${to}:`, error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Log as a fallback for testing
  console.log(
    `Fallback: Payment confirmation for ${to}: ${planName}, $${planPrice}`
  );

  // Throw specific error for EHOSTUNREACH
  if (lastError.code === "ESOCKET" && lastError.errno === -4073) {
    throw new Error(
      `Email sending failed: Unable to reach smtp.gmail.com:587 (EHOSTUNREACH). Check network, firewall, or antivirus settings.`
    );
  }

  throw new Error(
    `Email sending failed after ${maxRetries} attempts: ${lastError.message}`
  );
}
