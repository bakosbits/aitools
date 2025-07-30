import Link from "next/link";
import { createAlias } from "@/lib/airtable/aliases";
import AliasForm from "@/components/AliasForm";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
    if (req.method === "POST") {
        try {
            const aliasData = await parseFormBody(req);
            await createAlias(aliasData);

            res.writeHead(302, { Location: "/admin/aliases" });
            res.end();
            return { props: {} };
        } catch (error) {
            console.error("Failed to create alias:", error);
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

export default function NewAliasPage({ error }) {
    return (
        <div className="w-full w-[80%] mx-auto">
            <Link href="/admin/aliases" className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Aliases</Link>
            <h1 className="text-3xl font-bold mb-6">New Alias</h1>
            <AliasForm error={error} />
        </div>
    );
}