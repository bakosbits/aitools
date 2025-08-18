import { getToolBySlug } from "@/lib/airtable/tools";

export async function getServerSideProps(context) {
    const { slug } = context.params;
    const tool = await getToolBySlug(slug);

    if (!tool || !tool.Website) {
        return {
            notFound: true,
        };
    }

    return {
        redirect: {
            destination: tool.Website,
            permanent: false,
        },
    };
}

export default function GoRedirect() {
    return null; // page never renders
}
