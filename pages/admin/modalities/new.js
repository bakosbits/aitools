import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createModality } from "@/lib/airtable/modalities";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
  if (req.method === "POST") {
    try {
      const { Name } = await parseFormBody(req);
      await createModality({ Name });
      res.writeHead(302, { Location: "/admin/modalities" });
      res.end();
      return { props: {} };
    } catch (error) {
      console.error("Failed to create modality:", error);
      return { props: { error: "Failed to create modality." } };
    }
  }
  return { props: {} };
}

export default function NewModalityPage({ error }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    event.target.submit();
  };

  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin/modalities"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Manage Modalities
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-300 mb-6">Create New Modality</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form method="POST" onSubmit={handleSubmit} className="bg-cardDark p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="Name" className="block text-slate-300 text-sm font-bold mb-2">
            Name:
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            required
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors focus:outline-none focus:shadow-outline"
          >
            {isSubmitting ? "Creating..." : "Create Modality"}
          </button>
          <Link
            href="/admin/modalities"
            className="bg-gray-700 text-slate-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors focus:outline-none focus:shadow-outline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
