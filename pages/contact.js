import { useState } from "react";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitted!");
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setStatus("success");
            setFormData({ name: "", email: "", message: "" });
        } else {
            setStatus("error");
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-6 bg-cardDark rounded-md">
            <h1 className="text-2xl font-bold text-headingWhite mb-6">
                Contact Us
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    required
                    className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    required
                    rows={5}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-accentGreen text-black font-bold rounded"
                >
                    Send
                </button>
                {status === "success" && (
                    <p className="text-green-400 mt-2">Message sent!</p>
                )}
                {status === "error" && (
                    <p className="text-red-400 mt-2">Something went wrong.</p>
                )}
            </form>
        </div>
    );
}
