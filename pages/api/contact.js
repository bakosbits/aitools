import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.warn(
      `[Contact Form API] Method Not Allowed: Expected POST, received ${req.method}`,
    );
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message, contact_company, startTime } = req.body;
  if (contact_company && contact_company.trim() !== "") {
    console.warn(
      `[Contact Form API] Bot detected (honeypot field filled). IP: ${req.headers["x-forwarded-for"] || req.connection.remoteAddress}. Returning 200 to confuse.`,
    );
    return res
      .status(200)
      .json({ success: true, message: "Thank you for your message." });
  }

  const elapsed = Date.now() - Number(startTime);
  if (elapsed < 2000) {
    // Adjust threshold as needed
    console.warn(
      `[Contact Form API] Bot detected (submission too fast: ${elapsed}ms). IP: ${req.headers["x-forwarded-for"] || req.connection.remoteAddress}. Returning 200 to confuse.`,
    );
    return res
      .status(200)
      .json({ success: true, message: "Thank you for your message." });
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    console.error(
      `[Contact Form API] Invalid email format received: "${email}".`,
    );
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error(
        "[Contact Form API] CRITICAL ERROR: Missing GMAIL_USER or GMAIL_PASS environment variables. Cannot send email.",
      );
      return res.status(500).json({
        success: false,
        error: "Server configuration error: Email credentials missing.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AI Tool Pouch" <${process.env.GMAIL_USER}>`,
      to: `<${process.env.GMAIL_TO}>`,
      subject: `New Contact Submission from ${name}`,
      text: `New message received:

Name: ${name}
Email: ${email}

Message:
${message}`,
    });

    await transporter.sendMail({
      from: `"AI Tool Pouch" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Thanks for contacting AI Tool Pouch!`,
      text: `Hi ${name},
Thanks for reaching out - your message has been received and we'll be in touch shortly.

If this wasn’t you, feel free to ignore this email.

- The AI Tool Pouch Team`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(
      "[Contact Form API] Email send error:",
      err.message,
      err.stack,
    );
    return res.status(500).json({
      success: false,
      error: "Email failed to send. Please try again later.",
    });
  }
}
