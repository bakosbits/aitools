import Link from "next/link";
import { getAllCategoriesForAdmin, deleteCategory } from "@/lib/airtable/categories";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
    if (req.method === "POST") {
        const { _action, id } = await parseFormBody(req);

        if (_action === "delete" && id) {
            try {
                await deleteCategory(id);
                res.writeHead(302, { Location: "/admin/categories" });
                res.end();
                return { props: {} };
            } catch (error) {
                console.error("Failed to delete category:", error);
            }
        }
    }

    const categories = await getAllCategoriesForAdmin();
    return {
        props: {
            categories,
        },
    };
}

export default function CategoriesPage({ categories }) {
    return (
        <div className="w-[80%] mx-auto">
            <div><Link href="/admin" className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Main Menu</Link></div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Categories</h1>
                <Link href="/admin/categories/new" className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors">
                    + New Category
                </Link>
            </div>
            <div className="overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="bg-cardDark border border-gray-600 hover:bg-gray-800">
                                <td className="px-5 py-4 text-sm text-slate-300">{category.Name}</td>
                                <td className="px-5 py-4 text-sm text-slate-300">{category.Description}</td>
                                <td className="px-5 py-4 text-sm text-right">
                                    <Link href={`/admin/categories/edit/${category.id}`} className="text-slate-100 hover:text-slate-300 mr-4">Edit</Link>
                                    <form method="POST" action="/admin/categories" style={{ display: 'inline' }} onSubmit={(e) => { if (!window.confirm("Are you sure you want to delete this category?")) e.preventDefault(); }}>
                                        <input type="hidden" name="_action" value="delete" />
                                        <input type="hidden" name="id" value={category.id} />
                                        <button type="submit" className="text-red-500 hover:text-red-600">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}