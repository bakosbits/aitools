import Link from "next/link";
import { createCategory } from "@/lib/airtable/categories";
import CategoryForm from "@/components/CategoryForm";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
    if (req.method === "POST") {
        try {
            const categoryData = await parseFormBody(req);
            await createCategory(categoryData);

            res.writeHead(302, { Location: "/admin/categories" });
            res.end();
            return { props: {} };
        } catch (error) {
            console.error("Failed to create category:", error);
            return {
                props: {
                    error: error.message || "Something went wrong.",
                },
            };
        }
    }

    return {
        props: {
            error: null,
        },
    };
}

export default function NewCategoryPage({ error }) {
    return (
        <div className="w-full w-[80%] mx-auto">
            <Link href="/admin/categories"  className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Categories</Link>
            <h1 className="text-3xl font-bold mb-6">New Category</h1>
            <CategoryForm error={error} />
        </div>
    );
}