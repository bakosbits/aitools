import { getAliasById, updateAlias } from "@/lib/airtable/aliases";
import AliasForm from "@/components/AliasForm";
import Link from "next/link";
import { parseFormBody } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res, params }) {
    const { id } = params;

    if (req.method === "POST") {
        try {
            const aliasData = await parseFormBody(req);
            await updateAlias(id, aliasData);

            res.writeHead(302, { Location: "/admin/aliases" });
            res.end();
            return { props: {} };
        } catch (error) {
            console.error(`Failed to update alias ${id}:`, error);
            const alias = await getAliasById(id);
            return {
                props: {
                    alias,
                    error: error.message || "Something went wrong.",
                },
            };
        }
    }

    const alias = await getAliasById(id);

    if (!alias) {
        return { notFound: true };
    }

    return {
        props: {
            alias,
            error: null,
        },
    };
}

export default function EditAliasPage({ alias, error }) {
    return (
        <div className="w-[80%] mx-auto">
            <Link href="/admin/aliases" className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Aliases</Link>
            <h1 className="text-3xl font-bold mb-6">Edit Alias</h1>
            <AliasForm alias={alias} error={error} />
        </div>
    );
}