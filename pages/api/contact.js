import nodemailer from "nodemailer";

export default async function handler(req, res) {
    console.log(`[Contact Form API] Received ${req.method} request.`);

    if (req.method !== "POST") {
        console.warn(
            `[Contact Form API] Method Not Allowed: Expected POST, received ${req.method}`,
        );
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, message, contact_company, startTime } = req.body;
    console.log(
        `[Contact Form API] Request Body: Name=${name}, Email=${email}, Message_length=${message?.length}, contact_company=${contact_company}, startTime=${startTime}`,
    );

    if (contact_company && contact_company.trim() !== "") {
        console.warn(
            `[Contact Form API] Bot detected (honeypot field filled). IP: ${req.headers["x-forwarded-for"] || req.connection.remoteAddress}. Returning 200 to confuse.`,
        );
        return res
            .status(200)
            .json({ success: true, message: "Thank you for your message." });
    }

    const elapsed = Date.now() - Number(startTime);
    console.log(
        `[Contact Form API] Time elapsed for submission: ${elapsed}ms.`,
    );
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
        console.log("[Contact Form API] Nodemailer transporter created.");

        console.log(
            `[Contact Form API] Attempting to send email to webmaster@aitoolpouch.com from "${email}"`,
        );
        await transporter.sendMail({
            from: `"AI Tool Pouch" <${process.env.GMAIL_USER}>`,
            to: "webmaster@aitoolpouch.com", // Your designated recipient for contact forms
            subject: `New Contact Submission from ${name}`,
            text: `
New message received:

Name: ${name}
Email: ${email}

Message:
${message}
                `,
        });
        console.log(
            `[Contact Form API] Email to webmaster successfully sent for ${name}.`,
        );

        console.log(
            `[Contact Form API] Attempting to send auto-reply to "${email}"`,
        );
        await transporter.sendMail({
            from: `"AI Tool Pouch" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Thanks for contacting AI Tool Pouch!`,
            text: `Hi ${name},
                Thanks for reaching out - your message has been received and we'll be in touch shortly.

                If this wasn’t you, feel free to ignore this email.

                - The AI Tool Pouch Team`,
        });
        console.log(
            `[Contact Form API] Auto-reply successfully sent to ${email}.`,
        );

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
