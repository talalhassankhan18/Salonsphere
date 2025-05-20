import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

// FAQ data to include in the email
const faqs = [
  {
    question: "How do I add a new salon to the platform?",
    answer:
      "To add a new salon, navigate to the Salons section and click on 'Add New Salon'. Fill in all the required details including salon name, owner information, contact details, and subscription plan. Once submitted, the salon will be registered and can begin using the platform.",
  },
  {
    question: "How do subscription plans work?",
    answer:
      "Salon Sphere offers monthly and yearly subscription plans. You can assign different plans to salons based on their needs. Plans determine feature access and commission rates. Subscription management is handled in the Salons section where you can view, modify, or cancel subscriptions.",
  },
  {
    question: "How are commissions calculated?",
    answer:
      "Commissions are calculated as a percentage of product sales. By default, salons receive 5% commission on products sold through their storefront. Commission rates can be customized per salon or subscription tier in the Settings section. Payouts are processed based on the schedule set in the Payouts section.",
  },
  {
    question: "How do I process refunds?",
    answer:
      "To process a refund, navigate to the Orders section, find the specific order, and click 'View'. On the order details page, click the 'Refund' button and follow the prompts to complete the refund process. You can choose to refund the full amount or a partial amount.",
  },
  {
    question: "How do I manage inventory across multiple salons?",
    answer:
      "Inventory management is centralized in the Stock section. You can view inventory levels across all salons, set low stock alerts, and manage stock transfers. Each product page also shows its current allocation and availability status across all participating salons.",
  },
  {
    question: "How do I create promotional banners?",
    answer:
      "To create promotional banners, go to the Banners section and click 'Add New Banner'. Upload your banner image, set the target URL, scheduling, and display rules. You can create global banners that appear across the platform or salon-specific banners for targeted promotions.",
  },
];

// Support information to include in the email
const supportInfo = {
  website: "https://salonsphere.vercel.app",
  phone: "+92 319 2590810",
  email: "info.salonsphere@gmail.com",
  twitter: "https://twitter.com/salonsphere",
  facebook: "https://facebook.com/salonsphere",
  instagram: "https://instagram.com/salonsphere",
};

export async function POST(req: Request, res: NextApiResponse) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return new Response(JSON.stringify({ message: "Name and email are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Configure Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Generate HTML content for the email
  const faqHtml = faqs
    .map(
      (faq) => `
      <div style="margin-bottom: 20px; border-left: 3px solid #B4004E; padding-left: 15px;">
        <h3 style="font-size: 18px; color: #B4004E; margin: 0 0 10px 0; font-family: Arial, sans-serif;">${faq.question}</h3>
        <p style="font-size: 14px; color: #333333; margin: 0; line-height: 1.5; font-family: Arial, sans-serif;">${faq.answer}</p>
      </div>
    `
    )
    .join("");

  const mailOptions = {
    from: `"Salon Sphere Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Salon Sphere Support – Your Guide to Getting Started",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <!-- Header -->
        <div style="text-align: center; padding: 20px 0; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <h1 style="font-size: 24px; color: #B4004E; margin: 0; font-family: Arial, sans-serif;">
            Salon Sphere
          </h1>
          <p style="font-size: 14px; color: #666666; margin: 5px 0 0 0;">Your Partner in Salon Management</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <h2 style="font-size: 20px; color: #231F20; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
            Hello ${name},
          </h2>
          <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for reaching out to Salon Sphere Support. We’re here to help you navigate our platform with ease. Below, you’ll find answers to some of our most frequently asked questions, along with key support information to assist you.
          </p>

          <h2 style="font-size: 18px; color: #231F20; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
            Frequently Asked Questions
          </h2>
          ${faqHtml}

          <h2 style="font-size: 18px; color: #231F20; margin: 20px 0 15px 0; font-family: Arial, sans-serif;">
            Support Information
          </h2>
          <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 10px 0;">
            <strong>Website:</strong> <a href="${supportInfo.website}" style="color: #D5AA68; text-decoration: none;">${supportInfo.website}</a><br />
            <strong>Phone:</strong> ${supportInfo.phone}<br />
            <strong>Email:</strong> <a href="mailto:${supportInfo.email}" style="color: #D5AA68; text-decoration: none;">${supportInfo.email}</a>
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${supportInfo.website}/support" style="display: inline-block; padding: 10px 20px; background-color: #B4004E; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">
              Visit Support Center
            </a>
          </div>
        </div>


        <!-- Footer -->
        <div style="text-align: center; padding: 20px 0; background-color: #f1f1f1; font-size: 12px; color: #666666;">
          <p style="margin: 0 0 10px 0;">
            Follow us on:
            <a href="${supportInfo.twitter}" style="color: #D5AA68; text-decoration: none; margin: 0 5px;">Twitter</a> |
            <a href="${supportInfo.facebook}" style="color: #D5AA68; text-decoration: none; margin: 0 5px;">Facebook</a> |
            <a href="${supportInfo.instagram}" style="color: #D5AA68; text-decoration: none; margin: 0 5px;">Instagram</a>
          </p>
          <p style="margin: 0 0 10px 0;">
            Salon Sphere, Basti, Wahcantt, Pakistan
          </p>
          <p style="margin: 0;">
            <a href="${supportInfo.website}/unsubscribe?email=${email}" style="color: #D5AA68; text-decoration: none;">Unsubscribe</a> from future emails
          </p>
          <p style="margin: 10px 0 0 0;">
            © 2025 Salon Sphere. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ message: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}