import { getToolBySlug } from "@/lib/shared/tools";

export async function getServerSideProps(context) {
    const { slug } = context.params;
    const tool = await getToolBySlug(slug);

    console.log("Redirecting to:", tool.Website);
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
    console.log("Redirecting to:", tool.Website);
    return null; // page never renders
}
