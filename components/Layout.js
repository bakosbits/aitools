import Link from "next/link";

import MobileMenu from "@/components/MobileMenu";
import { Analytics } from "@vercel/analytics/next";

/**
 * Provides the basic structure for all pages in the application.
 * It includes a fixed header with navigation links, a main content area,
 * and a footer. It ensures a consistent look and feel across the site.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The page content to be rendered inside the layout.
 */
export default function Layout({ children }) {
  return (
    <div className="bg-backgroundDark min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-backgroundDark border-b border-gray-600 flex items-center justify-between">
        {/* Unified Header */}
        <div className="w-full px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-gray-300 text-3xl font-bold hover:text-gray-400 transition-colors duration-150 tracking-tighter"
          >
            <div className="flex justify-left gap-4 items-center">
              {/* Logo (always visible) */}
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                  width="40"
                  height="40"
                  fill="currentColor"
                >
                  <path d="m784 74 9 1 5 4 2 6-2 7a2200 2200 0 0 1-46 68l-1 5 11 27 12 26 5 3 26 3c13 1 25 2 28 1l7-2 28-38 27-37 6-2 6 2c2 1 4 4 6 10a240 240 0 0 1 6 32 118 118 0 0 1-5 39l-6 19-10 18a142 142 0 0 1-33 33 146 146 0 0 1-66 23l-12 2-6 6a11068 11068 0 0 0-140 197h-38l-2-7c0-5-2-10-3-13l-6-9a45 45 0 0 0-18-13l-45-2 3-4 15-21 46-65a34121 34121 0 0 0 91-134l-4-10a95 95 0 0 1-11-53 95 95 0 0 1 7-43 122 122 0 0 1 108-79zM230 278a283 283 0 0 1 94 15v4a472 472 0 0 1-22 0 331 331 0 0 0-54 0 182 182 0 0 0-30 8c-4 1-10 4-13 7l-14 10-9 14-5 14-1 20 4 24a215 215 0 0 0 34 72 512 512 0 0 0 79 94 1149 1149 0 0 0 97 83 1090 1090 0 0 0 197 114 815 815 0 0 0 80 26 663 663 0 0 0 80 10 258 258 0 0 0 46-5 141 141 0 0 0 26-10 116 116 0 0 0 21-14 87 87 0 0 0 28-73 131 131 0 0 0-9-45 362 362 0 0 0-32-71l1-3 3-1 5 3a330 330 0 0 1 30 48 382 382 0 0 1 27 71 270 270 0 0 1 5 43 156 156 0 0 1-6 32 119 119 0 0 1-15 26 133 133 0 0 1-23 22 159 159 0 0 1-92 25 325 325 0 0 1-122-18 771 771 0 0 1-277-143 1438 1438 0 0 1-102-87 1319 1319 0 0 1-74-83 531 531 0 0 1-40-64 342 342 0 0 1-14-40l-4-22a130 130 0 0 1 2-43 107 107 0 0 1 17-34l11-11 14-7a106 106 0 0 1 34-10l23-1zm379 51-3 3-51 72-55 79h-20c-14 0-21 1-25 2l-12 4-10 9-7 11-3 18h-26a238 238 0 0 1-47-4 186 186 0 0 1-35-13 178 178 0 0 1-63-49 229 229 0 0 1-27-42v-33c1-33 1-34 3-38l6-8 7-6 8-4 360-1zm187 20 3 5 1 45c0 40 0 42-2 47l-7 11-18 19a339 339 0 0 1-36 29 168 168 0 0 1-68 22l24-34a19607 19607 0 0 0 103-144zm3 140 1 1c-1 1 0 10 1 21l2 47 2 36 2 20a622 622 0 0 0 2 32l1 25a2240 2240 0 0 1 2 67 47 47 0 0 1-21 17 108 108 0 0 1-38 9 193 193 0 0 1-34-1l-13-1a389 389 0 0 1-40-8l-19-5a791 791 0 0 1-198-96 1253 1253 0 0 1-103-81 1236 1236 0 0 1-36-34l9 3a266 266 0 0 0 54 13l50 1v16c1 15 1 16 4 22 1 4 5 8 8 11 3 4 9 7 20 13h55c47 0 55 0 61-2 3 0 8-2 10-4l9-7 7-10 4-12 1-27h33a341 341 0 0 0 62-6 225 225 0 0 0 69-31 254 254 0 0 0 33-29zm-580 93 28 27a1150 1150 0 0 0 95 83 1069 1069 0 0 0 252 139 939 939 0 0 0 100 27l27 5a293 293 0 0 0 98-5 161 161 0 0 1-9 27 110 110 0 0 1-22 29 125 125 0 0 1-26 17l-26 7H513l-232-1-17-6-16-9a113 113 0 0 1-30-31 118 118 0 0 1-11-30l-1-16 4-77 5-98 2-46 2-23a244 244 0 0 0 0-19z" />
                </svg>
              </div>
              <div>AI Tool Pouch</div>
            </div>
          </Link>
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-6 font-semibold">
            <Link
              href="/"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Home
            </Link>
            <Link
              href="/foundational-models"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Foundational Models
            </Link>
            <Link
              href="/quick-tools"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Quick Tools
            </Link>
            <Link
              href="/categories"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Categories
            </Link>
            <Link
              href="/use-cases"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Use Cases
            </Link>
            <Link
              href="/tools"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              All Tools
            </Link>
            <Link
              href="/blog"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Blog
            </Link>
          </nav>
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 w-full px-6 py-4">
        <div className="mt-20 md:mt-24 lg:mt-28 mb-6">{children}</div>
      </main>
      {/* Footer */}
      <footer className="mb-4 text-gray-300 ">
        <div className="w-full px-0 md:px-8 max-w-7xl mx-auto font-semibold">
          <nav className="flex flex-wrap justify-center space-x-6">
            <Link
              href="/about"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Contact
            </Link>
            <Link
              href="/legal"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Legal
            </Link>
            <Link
              href="/privacy"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-300 hover:text-gray-400 transition-colors duration-150"
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
