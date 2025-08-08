import Link from "next/link";

export default function AliasForm({ alias, error }) {
  const isNew = !alias?.id;
  const aliasTypes = ["UseCases", "Madalities", "Preferences", "Contexts"];

  return (
    <form
      method="POST"
      className="space-y-6 bg-cardDark p-8 rounded-lg shadow-lg"
    >
      {error && (
        <div className="bg-red-800 text-gray-100 p-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div>
        <label
          htmlFor="Type"
          className="block text-sm font-medium text-gray-300"
        >
          Type
        </label>
        <select
          name="Type"
          id="Type"
          required
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={alias?.Type || ""}
        >
          {aliasTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="Name"
          className="block text-sm font-medium text-gray-300"
        >
          Name
        </label>
        <input
          type="text"
          name="Name"
          id="Name"
          required
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={alias?.Name || ""}
        />
      </div>

      <div>
        <label
          htmlFor="Aliases"
          className="block text-sm font-medium text-gray-300"
        >
          Aliases (comma-separated)
        </label>
        <input
          type="text"
          name="Aliases"
          id="Aliases"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={alias?.Aliases || ""}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Link
          href="/aliases"
          className="bg-gray-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="bg-emerald-500 text-gray-100 font-bold py-2 px-4 rounded hover:bg-emerald-600 transition-colors"
        >
          {isNew ? "Create Alias" : "Update Alias"}
        </button>
      </div>
    </form>
  );
}