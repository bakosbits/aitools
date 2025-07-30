import Link from "next/link";

export default function CategoryForm({ category, error }) {
    const isNew = !category?.id;

    return (
        <form method="POST" className="space-y-6 bg-cardDark p-8 rounded-lg">
            {error && <div className="bg-red-800 text-gray-100 p-3 rounded mb-4">Error: {error}</div>}

            <div>
                <label htmlFor="Name" className="block text-sm font-medium text-gray-300">Name</label>
                <input type="text" name="Name" id="Name" required className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600" defaultValue={category?.Name || ''} />
            </div>

            <div>
                <label htmlFor="Description" className="block text-sm font-medium text-gray-300">Description</label>
                <textarea name="Description" id="Description" rows="4" className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600" defaultValue={category?.Description || ''}></textarea>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Link href="/categories" className="bg-gray-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors">Cancel</Link>
                <button type="submit" className="bg-emerald-500 text-gray-100 font-bold py-2 px-4 rounded hover:bg-emerald-600 transition-colors">{isNew ? 'Create Category' : 'Update Category'}</button>
            </div>
        </form>
    );
}