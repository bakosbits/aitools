import Link from "next/link";
import { getAllModalities, deleteModality } from "@/lib/airtable/modalities";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
  if (req.method === "POST") {
    const { _action, id } = await parseFormBody(req);

    if (_action === "delete" && id) {
      try {
        await deleteModality(id);
        res.writeHead(302, { Location: "/admin/modalities" });
        res.end();
        return { props: {} };
      } catch (error) {
        console.error("Failed to delete modality:", error);
      }
    }
  }

  const modalities = await getAllModalities();
  return {
    props: {
      modalities,
    },
  };
}

export default function AdminModalities({ modalities }) {
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
        <h1 className="text-3xl font-bold text-slate-300">Manage Modalities</h1>
        <Link
          href="/admin/modalities/new"
          className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors"
        >
          + New Modality
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
            {modalities.map((modality) => (
              <tr
                key={modality.id}
                className="bg-cardDark border border-gray-600 hover:bg-gray-800"
              >
                <td className="px-5 py-4 text-sm text-slate-300">
                  {modality.Name}
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">
                  {modality.TagNames ? modality.TagNames.join(', ') : 'N/A'}
                </td>
                <td className="px-5 py-4 text-sm text-right">
                  <Link
                    href={`/admin/modalities/edit/${modality.id}`}
                    className="text-slate-300 hover:text-slate-100 mr-4"
                  >
                    Edit
                  </Link>
                  <form
                    method="POST"
                    action="/admin/modalities"
                    style={{ display: "inline" }}
                    onSubmit={(e) => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this modality?",
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="_action" value="delete" />
                    <input type="hidden" name="id" value={modality.id} />
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
