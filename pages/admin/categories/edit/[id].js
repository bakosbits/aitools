import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCategoryById, updateCategory } from "@/lib/airtable/categories";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res, params }) {
  const { id } = params;

  if (req.method === "POST") {
    try {
      const { Name, Slug } = await parseFormBody(req);
      await updateCategory(id, { Name, Slug });
      res.writeHead(302, { Location: "/admin/categories" });
      res.end();
      return { props: {} };
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      return {
        props: { error: `Failed to update category: ${error.message}` },
      };
    }
  }

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        category,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch category ${id}:`, error);
    return { props: { error: `Failed to fetch category: ${error.message}` } };
  }
}

export default function EditCategoryPage({ category, error }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    event.target.submit();
  };

  if (error && !category) {
    return (
      <div className="w-full md:w-[75%] mx-auto text-slate-300">
        <p>Error: {error}</p>
        <Link
          href="/admin/categories"
          className="text-slate-300 hover:text-slate-100"
        >
          &larr; Back to Manage Categories
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full md:w-[75%] mx-auto text-slate-300">
        <p>Category not found.</p>
        <Link
          href="/admin/categories"
          className="text-slate-300 hover:text-slate-100"
        >
          &larr; Back to Manage Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin/categories"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Manage Categories
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-300 mb-6">Edit Category</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form
        method="POST"
        onSubmit={handleSubmit}
        className="bg-cardDark p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="Name"
            className="block text-slate-300 text-sm font-bold mb-2"
          >
            Name:
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            defaultValue={category.Name}
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
            {isSubmitting ? "Updating..." : "Update Category"}
          </button>
          <Link
            href="/admin/categories"
            className="bg-gray-700 text-slate-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors focus:outline-none focus:shadow-outline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
