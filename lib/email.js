import nodemailer from "nodemailer";

const { GMAIL_USER, GMAIL_PASS, GMAIL_TO } = process.env;

const EMAIL_FROM = GMAIL_USER;
const EMAIL_TO = GMAIL_TO;

const isEmailConfigured = GMAIL_USER && GMAIL_PASS && EMAIL_TO;

if (!isEmailConfigured) {
    console.warn(
        "Gmail environment variables (GMAIL_USER, GMAIL_PASS, EMAIL_TO) are not fully configured. Email sending will be disabled, and image ideas will be logged to the console instead.",
    );
}

const transporter = isEmailConfigured
    ? nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: GMAIL_USER,
              pass: GMAIL_PASS,
          },
      })
    : null;

/**
 * Sends an email with the generated image ideas.
 * @param {string} articleTitle The title of the article.
 * @param {string[]} imageIdeas An array of image idea prompts.
 */
export async function sendImageIdeasEmail(articleTitle, imageIdeas) {
    if (!transporter) {
        console.log(
            "Email sending is disabled. Would have sent the following image ideas for article:",
            `"${articleTitle}"`,
        );
        console.log(imageIdeas.map((idea) => `- ${idea}`).join("\n"));
        return;
    }

    const subject = `Image Ideas for Article: "${articleTitle}"`;
    const htmlBody = `<h1>Image Ideas for "${articleTitle}"</h1><p>Here are the AI-generated image ideas:</p><ul>${imageIdeas.map((idea) => `<li>${idea}</li>`).join("")}</ul>`;

    await transporter.sendMail({
        from: `"AI Content Admin" <${EMAIL_FROM}>`,
        to: EMAIL_TO,
        subject: subject,
        html: htmlBody,
    });
}
