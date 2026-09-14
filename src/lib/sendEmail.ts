import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string; // Allows dynamic sender name
}

// Validate required environment variables
const requiredEnvVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM_NAME",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Log Email configuration for debugging (hide password)
console.log("Email Config:", {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? "[REDACTED]" : undefined,
  fromName: process.env.EMAIL_FROM_NAME,
});

// Create Nodemailer transporter with explicit TLS configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: parseInt(process.env.EMAIL_PORT!, 10),
  secure: process.env.EMAIL_PORT === "465", // Use SSL for port 465, TLS for others
  requireTLS: process.env.EMAIL_PORT !== "465", // Enforce TLS for non-SSL ports
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
  logger: process.env.NODE_ENV === "development", // Enable logging in development
  debug: process.env.NODE_ENV === "development", // Enable debug output in development
});

// Function to generate a professional HTML email template
const generateProfessionalEmail = (
  fromName: string | undefined,
  subject: string,
  message: string
): string => {
  const salonName = fromName || process.env.EMAIL_FROM_NAME || "Glimmer Salon";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #4A90E2;
          padding: 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
        }
        .content h2 {
          font-size: 20px;
          color: #4A90E2;
          margin-top: 0;
        }
        .content p {
          margin: 10px 0;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #777777;
          border-top: 1px solid #eeeeee;
        }
        .footer a {
          color: #4A90E2;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          background-color: #4A90E2;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          text-align: center;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 10px;
          }
          .content {
            padding: 20px;
          }
          .button {
            padding: 10px 20px;
            width: 100%;
            box-sizing: border-box;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${salonName}</h1>
        </div>
        <div class="content">
          <h2>Dear Valued Customer,</h2>
          <p>${message}</p>
          <p>If you have any questions, please don’t hesitate to contact us.</p>
          <a href="mailto:${
            process.env.EMAIL_USER
          }" class="button">Contact Us</a>
          <p>Thank you for choosing ${salonName}. We look forward to serving you!</p>
          <p>Best regards,<br>The ${salonName} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${salonName}. All rights reserved.</p>
          <p>
            Need help? <a href="mailto:${
              process.env.EMAIL_USER
            }">Email us</a> | 
            <a href="${process.env.NEXTAUTH_URL || "#"}">Visit our website</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to generate a plain text version of the email
const generatePlainTextEmail = (
  fromName: string | undefined,
  message: string
): string => {
  const salonName = fromName || process.env.EMAIL_FROM_NAME || "Glimmer Salon";
  return `
Dear Valued Customer,

${message}

If you have any questions, please don’t hesitate to contact us at ${
    process.env.EMAIL_USER
  }.

Thank you for choosing ${salonName}. We look forward to serving you!

Best regards,
The ${salonName} Team

---
${salonName} | Email: ${
    process.env.EMAIL_USER
  } | © ${new Date().getFullYear()} All rights reserved.
Visit our website: ${process.env.NEXTAUTH_URL || "our website"}
  `;
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  fromName,
}: EmailOptions): Promise<void> => {
  try {
    // Validate input parameters
    if (!to || !subject || !text) {
      throw new Error(
        "Missing required email parameters: to, subject, and text are required"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error(`Invalid email address: ${to}`);
    }

    // Generate professional email content if not provided
    const professionalHtml =
      html || generateProfessionalEmail(fromName, subject, text);
    const plainText = generatePlainTextEmail(fromName, text);

    // Send email
    const info = await transporter.sendMail({
      from: `"${
        fromName || process.env.EMAIL_FROM_NAME || "Glimmer Salon"
      }" <${process.env.EMAIL_USER!}>`,
      to,
      subject,
      text: plainText,
      html: professionalHtml,
    });

    console.log(
      `Email sent to ${to}: ${subject} (Message ID: ${info.messageId})`
    );
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while sending email";
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};
