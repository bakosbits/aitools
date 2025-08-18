import { serialize } from "cookie";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res
            .status(405)
            .json({ message: `Method ${req.method} Not Allowed` });
    }

    const { username, password } = req.body;

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // DEBUG LOGGING - REMOVE IN PRODUCTION
    console.log("Login attempt:", { username, password });
    console.log("ADMIN_USERNAME (hash):", ADMIN_USERNAME);
    console.log("ADMIN_PASSWORD (hash):", ADMIN_PASSWORD);

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        return res.status(500).json({ message: "Server configuration error." });
    }

    let usernameMatches = false;
    let passwordMatches = false;
    try {
        usernameMatches = await bcrypt.compare(username, ADMIN_USERNAME);
        passwordMatches = await bcrypt.compare(password, ADMIN_PASSWORD);
        console.log("usernameMatches:", usernameMatches);
        console.log("passwordMatches:", passwordMatches);
    } catch (err) {
        console.error("bcrypt.compare error:", err);
        return res.status(500).json({ message: "Hash compare error." });
    }

    if (usernameMatches && passwordMatches) {
        const cookie = serialize("auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 60 * 15,
            path: "/",
        });

        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({ message: "Login successful" });
    }

    return res.status(401).json({ message: "Invalid credentials" });
}
