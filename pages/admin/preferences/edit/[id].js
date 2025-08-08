import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getPreferenceById, updatePreference } from "@/lib/airtable/preferences";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res, params }) {
  const { id } = params;

  if (req.method === "POST") {
    try {
      const { Name, Slug } = await parseFormBody(req);
      await updatePreference(id, { Name, Slug });
      res.writeHead(302, { Location: "/admin/preferences" });
      res.end();
      return { props: {} };
    } catch (error) {
      console.error(`Failed to update preference ${id}:`, error);
      return { props: { error: `Failed to update preference: ${error.message}` } };
    }
  }

  try {
    const preference = await getPreferenceById(id);
    if (!preference) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        preference,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch preference ${id}:`, error);
    return { props: { error: `Failed to fetch preference: ${error.message}` } };
  }
}

export default function EditPreferencePage({ preference, error }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    event.target.submit();
  };

  if (error && !preference) {
    return (
      <div className="w-full md:w-[75%] mx-auto text-slate-300">
        <p>Error: {error}</p>
        <Link href="/admin/preferences" className="text-slate-300 hover:text-slate-100">
          &larr; Back to Manage Preferences
        </Link>
      </div>
    );
  }

  if (!preference) {
    return (
      <div className="w-full md:w-[75%] mx-auto text-slate-300">
        <p>Preference not found.</p>
        <Link href="/admin/preferences" className="text-slate-300 hover:text-slate-100">
          &larr; Back to Manage Preferences
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin/preferences"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Manage Preferences
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-300 mb-6">Edit Preference</h1>

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
            defaultValue={preference.Name}
            required
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="Slug" className="block text-slate-300 text-sm font-bold mb-2">
            Slug:
          </label>
          <input
            type="text"
            id="Slug"
            name="Slug"
            defaultValue={preference.Slug}
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
            {isSubmitting ? "Updating..." : "Update Preference"}
          </button>
          <Link
            href="/admin/preferences"
            className="bg-gray-700 text-slate-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors focus:outline-none focus:shadow-outline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
