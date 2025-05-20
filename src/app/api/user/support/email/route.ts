// api/user/support/email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const faqs = [
  {
    question: "Can I browse salons and products without an account?",
    answer:
      "Yes, as a guest user, you can browse salons, view their services, and check out products. You can also add products to your cart. However, to complete a booking or order, you’ll need to sign up for an account.",
  },
  {
    question: "How do I book a service at a salon?",
    answer:
      "Browse salons and their services, select a service, and choose a date and time slot. If the slot is available, enter your details, confirm the booking, and choose your payment method—Cash on Service or Card Payment. You’ll need to sign up if you don’t have an account.",
  },
  {
    question: "How can I purchase products on SalonSphere?",
    answer:
      "You can purchase products in two ways: 1) From the Products page by browsing the catalog, or 2) From a salon’s profile by viewing their listed products. Add the product to your cart, proceed to checkout, and choose between Cash on Delivery or Card Payment. You’ll need to sign up to complete the purchase.",
  },
  {
    question: "What payment options are available for bookings and purchases?",
    answer:
      "For bookings, you can pay via Cash on Service or Card Payment (Bank Transfer). For product purchases, you can choose Cash on Delivery or Card Payment. Select your preferred method during checkout.",
  },
];

const supportInfo = {
  website: "https://salonsphere.com",
  phone: "+92 319 2590810",
  email: "support@salonsphere.com",
  twitter: "https://twitter.com/salonsphere",
  facebook: "https://facebook.com/salonsphere",
  instagram: "https://instagram.com/salonsphere",
};

export async function POST(req: Request) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { message: "Name and email are required" },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
    subject: "Salon Sphere Support – Customer Guide",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; padding: 20px 0; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <h1 style="font-size: 24px; color: #B4004E; margin: 0; font-family: Arial, sans-serif;">
            Salon Sphere
          </h1>
          <p style="font-size: 14px; color: #666666; margin: 5px 0 0 0;">Your Partner in Salon Services</p>
        </div>
        <div style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <h2 style="font-size: 20px; color: #231F20; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
            Hello ${name},
          </h2>
          <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for reaching out to Salon Sphere Support. Below are some FAQs and support details to help you with bookings, purchases, and more.
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
    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  }
}