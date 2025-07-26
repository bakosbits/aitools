import Link from "next/link";

export default function UseCaseCard({ tool, compareList = [], toggleCompare,}) {

    const isChecked = compareList.some((t) => t.id === tool.id);

    return (
        <Link
            href={`/tool/${tool.Slug}`}
            className="block h-full group"
            title={tool.Name}
            passHref
        >
            <div className="h-full bg-cardDark p-4 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
                <div className="w-full flex items-center space-x-4">
                    <img
                        src={tool.Logo}
                        alt={`${tool.Name} logo`}
                        title={tool.Name}
                        className="object-contain bg-headingWhite h-12 w-12"
                    />
                    <h1 className="text-lg font-bold text-headingWhite">
                        {tool.Name}
                    </h1>
                </div>
                <p className="text-sm text-whiteText mb-4 mt-4">
                    {tool.Why?.length > 100
                        ? tool.Why.slice(0, 100) + "..."
                        : tool.Why}
                </p>
                <label
                    className="flex items-center gap-2 cursor-pointer mt-auto"
                    // Important: `e.stopPropagation()` prevents the click from bubbling up to the parent <Link>
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={isChecked} // Use the derived `isChecked` state
                        onChange={() => toggleCompare(tool)} // `onChange` is for input elements
                    />
                    <span className="text-accentGreen font-medium">
                        Compare
                    </span>
                </label>
            </div>
        </Link>
    );
}
