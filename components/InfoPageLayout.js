import React from "react";
import Image from "next/image";

/**
 * A reusable two-column layout for informational pages like About, Terms, etc.
 * @param {object} props
 * @param {string} props.title - The main title of the page, displayed in an <h1> tag.
 * @param {React.ReactNode} props.children - The text content of the page.
 * @param {string} props.imageSrc - The path to the image for the right column.
 * @param {string} props.imageAlt - The alt text for the image.
 */
export default function InfoPageLayout({ title, children, imageSrc, imageAlt }) {
    return (
        // OUTER WRAPPER: 90% of screen width, centered
        <div className="w-[90%] mx-auto flex flex-col md:flex-row gap-6">
            {/* LEFT COLUMN: 60% of outer container */}
            <div className="w-full md:w-[60%] flex justify-center">
                {/* INNER WRAPPER: 75% of left column, padded on mobile */}
                <div className="w-full md:w-[75%] text-left flex flex-col">
                    <div>
                        <h1 className="text-3xl font-bold mb-6">
                            {title}
                        </h1>
                        {children}
                    </div>
                </div>
            </div>
            {/* Right column: image */}
            <div className="w-full md:w-[40%]">
                <div className="w-full md:w-[75%]">
                    <Image src={imageSrc} alt={imageAlt} width={800} height={600} style={{ filter: "saturate(110%) brightness(0.95) contrast(0.98)" }} className="w-full h-auto object-cover rounded-lg shadow-3xl shadow-[0_6px_16px_rgba(0,255,128,0.25)]" />
                </div>
            </div>
        </div>
    );
}