import Link from "next/link";
import { getAllArticles, deleteArticle } from "@/lib/airtable/articles";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
  // Handle DELETE request via a POST form submission
  if (req.method === "POST") {
    const { _action, id } = await parseFormBody(req);

    if (_action === "delete" && id) {
      try {
        await deleteArticle(id);
        // Redirect to the same page to see the updated list
        res.writeHead(302, { Location: "/admin/articles" });
        res.end();
        return { props: {} };
      } catch (error) {
        console.error("Failed to delete article:", error);
        // You could pass an error message to the page here
      }
    }
  }

  // For GET requests, fetch and display the articles
  const articles = await getAllArticles();
  return {
    props: {
      articles,
    },
  };
}

export default function ArticlesPage({ articles }) {
  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Main Menu
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-300">Manage Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors"
        >
          + New Article
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 text-left font-semibold text-slate-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-5 text-left font-semibold text-slate-300 uppercase tracking-wider">
                Summary
              </th>
              <th className="px-5 text-left font-semibold text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 text-right font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr
                key={article.id}
                className="bg-cardDark border border-gray-600 hover:bg-gray-800"
              >
                <td className="px-5 py-4 text-sm text-slate-300">
                  {article.Title}
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">
                  {article.Summary
                    ? `${article.Summary.substring(0, 100)}${article.Summary.length > 100 ? "..." : ""}`
                    : ""}
                </td>
                <td className="px-5 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${article.Published ? "bg-teal-600 text-slate-100" : "bg-yellow-200 text-yellow-800"}`}
                  >
                    {article.Published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-right">
                  <Link
                    href={`/admin/articles/edit/${article.id}`}
                    className="text-slate-300 hover:text-slate-100 mr-4"
                  >
                    Edit
                  </Link>
                  <form
                    method="POST"
                    action="/admin/articles"
                    style={{ display: "inline" }}
                    onSubmit={(e) => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this article?",
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="_action" value="delete" />
                    <input type="hidden" name="id" value={article.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
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
