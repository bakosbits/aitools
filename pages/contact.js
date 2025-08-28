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

        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setStatus("success");
            setFormData({ name: "", email: "", message: "", company: "" });
        } else {
            setStatus("error");
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-6 bg-cardDark rounded-lg shadow-lg border border-gray-600">
                <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="w-full p-2 text-gray-400 rounded bg-gray-800"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your email"
                        required
                        className="w-full p-2 text-gray-400 rounded bg-gray-800"
                    />
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your message"
                        required
                        rows={5}
                        className="w-full p-2 text-gray-400 rounded bg-gray-800"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 text-gray-100 hover:bg-blue-600 transition font-bold rounded"
                    >
                        Send
                    </button>
                    {status === "success" && (
                        <p className="text-green-400 mt-2">Message sent!</p>
                    )}
                    {status === "error" && (
                        <p className="text-red-400 mt-2">
                            Something went wrong.
                        </p>
                    )}

                    <input
                        type="text"
                        name="company"
                        className="absolute left-[-9999px] top-[-9999px]"
                        autoComplete="off"
                    />
                </form>
            </div>
        </div>
    );
}
