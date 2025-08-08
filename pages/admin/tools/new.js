import { useState } from "react";
import Link from "next/link";
import { createTool } from "@/lib/airtable/tools";
import { parseFormBody } from "@/lib/form-helpers";
import ToolForm from "@/components/ToolForm";
import AiResearchAssistant from "@/components/AiResearchAssistant";

export async function getServerSideProps({ req, res }) {
  if (req.method === "POST") {
    try {
      const data = await parseFormBody(req);
      await createTool(data);
      res.writeHead(302, { Location: "/admin/tools" });
      res.end();
      return { props: {} };
    } catch (error) {
      console.error("Failed to create tool:", error);
      return { props: { error: "Failed to create tool." } };
    }
  }
  return { props: {} };
}

export default function NewToolPage({ error }) {
  const [formData, setFormData] = useState({});

  const handleResearchComplete = (researchedData) => {
    setFormData((prevData) => ({
      ...prevData,
      Name: researchedData.name || prevData.Name || "",
      Description: researchedData.description || prevData.Description || "",
      // Map other fields as necessary
    }));
  };

  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin/tools"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Tools
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-300 mb-6">Add New Tool</h1>
      <AiResearchAssistant onResearchComplete={handleResearchComplete} />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ToolForm initialData={formData} />
    </div>
  );
}
