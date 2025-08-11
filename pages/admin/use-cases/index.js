import Link from "next/link";
import { getAllUseCases, deleteUseCase } from "@/lib/airtable/use-cases";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
  if (req.method === "POST") {
    const { _action, id } = await parseFormBody(req);

    if (_action === "delete" && id) {
      try {
        await deleteUseCase(id);
        res.writeHead(302, { Location: "/admin/use-cases" });
        res.end();
        return { props: {} };
      } catch (error) {
        console.error("Failed to delete use case:", error);
      }
    }
  }

  const useCases = await getAllUseCases();
  return {
    props: {
      useCases,
    },
  };
}

export default function UseCasesPage({ useCases }) {
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
        <h1 className="text-3xl font-bold text-slate-300">Manage Use Cases</h1>
        <Link
          href="/admin/use-cases/new"
          className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors"
        >
          + New Use Case
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 text-left  font-semibold text-slate-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 text-left  font-semibold text-slate-300 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-5 text-right  font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {useCases.map((useCase) => (
              <tr
                key={useCase.id}
                className="bg-cardDark border border-gray-600 hover:bg-gray-800"
              >
                <td className="px-5 py-4 text-sm text-slate-300">
                  {useCase.Name}
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">
                  {useCase.TagNames ? useCase.TagNames.join(", ") : "N/A"}
                </td>
                <td className="px-5 py-4 text-sm text-right">
                  <Link
                    href={`/admin/use-cases/edit/${useCase.id}`}
                    className="text-slate-300 hover:text-slate-100 mr-4"
                  >
                    Edit
                  </Link>
                  <form
                    method="POST"
                    action="/admin/use-cases"
                    style={{ display: "inline" }}
                    onSubmit={(e) => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this use case?",
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="_action" value="delete" />
                    <input type="hidden" name="id" value={useCase.id} />
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
