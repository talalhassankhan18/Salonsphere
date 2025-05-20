import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., Gmail)
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, issue } = body;

    // Prepare email content
    const mailOptions = {
      from: `"Issue Report" <${process.env.EMAIL_USER}>`,
      to: "talalhassankhan2003@gmail.com",
      subject: `New Issue Reported by User ${userId}`,
      html: `
        <h1>New Issue Reported</h1>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Issue:</strong> ${issue}</p>
        <p>Please address this issue as soon as possible.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to Salonsphere for issue from user ${userId}`);

    return NextResponse.json(
      { message: "Issue submitted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error submitting issue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit issue" },
      { status: 500 }
    );
  }
}
