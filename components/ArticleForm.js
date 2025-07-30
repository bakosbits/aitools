import Link from "next/link";

export default function ArticleForm({ article, error }) {
    const isNew = !article?.id;

    // Helper to format date for input type="date"
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <form method="POST" className="space-y-6 bg-cardDark p-8 rounded-lg">
            {error && <div className="bg-red-800 text-gray-100 p-3 rounded mb-4">Error: {error}</div>}

            <div>
                <label htmlFor="Title" className="block text-sm font-medium text-gray-300">Title</label>
                <input type="text" name="Title" id="Title" required className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600" defaultValue={article?.Title || ''} />
            </div>

            <div>
                <label htmlFor="Summary" className="block text-sm font-medium text-gray-300">Summary</label>
                <textarea name="Summary" id="Summary" rows="3" className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600" defaultValue={article?.Summary || ''}></textarea>
            </div>

            <div>
                <label htmlFor="Content" className="block text-sm font-medium text-gray-300">Content (Markdown)</label>
                <textarea name="Content" id="Content" rows="10" className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600" defaultValue={article?.Content || ''}></textarea>
            </div>

            <div className="flex items-center">
                <input type="checkbox" name="Published" id="Published" className="h-4 w-4 text-green-300 bg-gray-700 border-gray-600 rounded focus:ring-green-300" defaultChecked={article?.Published || false} />
                <label htmlFor="Published" className="ml-2 block text-sm text-gray-300">Published</label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Link href="/articles" className="bg-gray-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors">Cancel</Link>
                <button type="submit" className="bg-emerald-500 text-gray-100 font-bold py-2 px-4 rounded hover:bg-emerald-600 transition-colors">{isNew ? 'Create Article' : 'Update Article'}</button>
            </div>
        </form>
    );
}