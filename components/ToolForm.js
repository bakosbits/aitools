import Link from "next/link";

export default function ToolForm({
  tool,
  categories,
  articles = [],
  pricingOptions = [],
  error,
}) {
  const isNew = !tool?.id;

  return (
    <form
      method="POST"
      className="space-y-6 bg-cardDark p-8 rounded-lg shadow-lg border border-gray-600"
    >
      {error && (
        <div className="bg-red-800 text-gray-100 p-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            defaultValue={tool?.Name || ""}
          />
        </div>
        <div>
          <label
            htmlFor="Domain"
            className="block text-sm font-medium text-gray-300"
          >
            Domain
          </label>
          <input
            type="text"
            name="Domain"
            id="Domain"
            required
            className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
            defaultValue={tool?.Domain || ""}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="Website"
          className="block text-sm font-medium text-gray-300"
        >
          Website
        </label>
        <input
          type="text"
          name="Website"
          id="Website"
          required
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={tool?.Website || ""}
        />
      </div>

      <div>
        <label
          htmlFor="Why"
          className="block text-sm font-medium text-gray-300"
        >
          Why
        </label>
        <textarea
          name="Why"
          id="Why"
          rows="3"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={tool?.Why || ""}
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="Description"
          className="block text-sm font-medium text-gray-300"
        >
          Description
        </label>
        <textarea
          name="Description"
          id="Description"
          rows="3"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={tool?.Description || ""}
        ></textarea>
      </div>
      <div>
        <label
          htmlFor="Details"
          className="block text-sm font-medium text-gray-300"
        >
          Details
        </label>
        <textarea
          name="Details"
          id="Details"
          rows="5"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={tool?.Details || ""}
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="Features"
          className="block text-sm font-medium text-gray-300"
        >
          Features
        </label>
        <textarea
          name="Features"
          id="Features"
          rows="5"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={
            Array.isArray(tool?.Features)
              ? tool.Features.join("\n")
              : tool?.Features || ""
          }
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="Cautions"
          className="block text-sm font-medium text-gray-300"
        >
          Cautions
        </label>
        <textarea
          name="Cautions"
          id="Cautions"
          rows="3"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={
            Array.isArray(tool?.Cautions)
              ? tool.Cautions.join("\n")
              : tool?.Cautions || ""
          }
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="Tags"
          className="block text-sm font-medium text-gray-300"
        >
          Tags
        </label>
        <textarea
          name="Tags"
          id="Tags"
          rows="2"
          className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
          defaultValue={
            Array.isArray(tool?.Tags) ? tool.Tags.join(", ") : tool?.Tags || ""
          }
        ></textarea>
        <p className="mt-1 text-xs text-gray-300">
          Comma-separated list of tags for the tag cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="Buyer"
            className="block text-sm font-medium text-gray-300"
          >
            Buyer
          </label>
          <input
            type="text"
            name="Buyer"
            id="Buyer"
            className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
            defaultValue={tool?.Buyer || ""}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Pricing
          </label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-800 border border-gray-600 p-4 rounded-md">
            {pricingOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`pricing-${option}`}
                  name="Pricing"
                  value={option}
                  defaultChecked={tool?.Pricing?.includes(option)}
                  className="h-4 w-4 text-green-300 bg-gray-800 border-gray-600 rounded focus:ring-green-300"
                />
                <label
                  htmlFor={`pricing-${option}`}
                  className="ml-2 text-sm text-gray-200"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label
            htmlFor="Base_Model"
            className="block text-sm font-medium text-gray-300"
          >
            Base Model
          </label>
          <input
            type="text"
            name="Base_Model"
            id="Base_Model"
            className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
            defaultValue={tool?.Base_Model || ""}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-8">
          Categories
        </label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 p-4 rounded-md">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${cat.id}`}
                name="Categories"
                value={cat.id}
                defaultChecked={tool?.Categories?.some(
                  (c) => c === cat.id || c === cat.Name,
                )}
                className="h-4 w-4 text-gray-300 border-gray-600 rounded focus:ring-green-300"
              />
              <label
                htmlFor={`category-${cat.id}`}
                className="ml-2 text-sm text-gray-200"
              >
                {cat.Name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Related Articles
        </label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto  bg-gray-800 border border-gray-600 p-4 rounded-md borderborder-gray-600">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center">
              <input
                type="checkbox"
                id={`article-${article.id}`}
                name="Articles"
                value={article.id}
                defaultChecked={tool?.Articles?.includes(article.id)}
                className="h-4 w-4 text-gray-300 border-gray-600 rounded focus:ring-green-300"
              />
              <label
                htmlFor={`article-${article.id}`}
                className="ml-2 text-sm text-gray-200"
                title={article.Title}
              >
                {article.Title.length > 25
                  ? `${article.Title.substring(0, 25)}...`
                  : article.Title}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-6  bg-gray-800 border border-gray-600 p-4 rounded-md">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="Active"
            id="Active"
            className="h-4 w-4 text-gray-300 border-gray-600 rounded focus:ring-green-300"
            defaultChecked={tool?.Active || false}
          />
          <label htmlFor="Active" className="ml-2 block text-sm text-gray-300">
            Active
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="Featured"
            id="Featured"
            className="h-4 w-4 text-green-300 bg-gray-700 border-gray-600 rounded focus:ring-green-300"
            defaultChecked={tool?.Featured || false}
          />
          <label
            htmlFor="Featured"
            className="ml-2 block text-sm text-gray-300"
          >
            Featured
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Link
          href="/tools"
          className="bg-gray-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="bg-emerald-500 text-gray-100 font-bold py-2 px-4 rounded hover:bg-emerald-600 transition-colors"
        >
          {isNew ? "Create Tool" : "Update Tool"}
        </button>
      </div>
    </form>
  );
}
