export function mapRecord(record, type) {
    const recordMappings = {
        article: (record) => ({
            id: record.id,
            Title: record.get("Title") || "",
            Summary: record.get("Summary") || "",
            Content: record.get("Content") || "",
            Slug: record.get("Slug") || null,
            Date: record.get("Date") || null,
            Author: record.get("Author") || null,
            Published: record.get("Published") || false,
        }),
        category: (record) => {
            if (!record) return null;
            return {
                id: record.id,
                Name: record.fields["Name"],
                Slug: record.fields["Slug"] ?? null,
                Description: record.fields["Description"] ?? null,
                Tools: record.fields["Tools"] ?? [],
                ToolLookup: record.fields["Tool Lookup"] ?? [],
            };
        },
        caution: (record) => ({
            id: record.id,
            Tool: record.get("Tool") || "",
            Caution: record.get("Caution") || "",
        }),
        cautionTag: (record) => ({
            id: record.id,
            Name: record.get("Name"),
            Tools: record.get("Tools")
        }),
        feature: (record) => ({
            id: record.id,
            Tool: record.get("Tool") || "",
            Feature: record.get("Feature") || "",
        }),
        toolSummary: (record) => {
            return {
                id: record.id,
                Slug: record.get("Slug") || "",
                Name: record.get("Name") || "",
                Logo: record.get("Logo") || "",
                Description: record.get("Description") || "",
                Why: record.get("Why") || "",
            };
        },
        newestTool: (record) => {
            return {
                id: record.id,
                Slug: record.get("Slug") || "",
                Logo: record.get("Logo") || "",
                Name: record.get("Name") || "",
                Why: record.get("Why") || "",
            };
        },
        tool: (record) => {
            return {
                id: record.id,
                Slug: record.get("Slug") || "",
                Logo: record.get("Logo") || "",
                Name: record.get("Name") || "",
                Domain: record.get("Domain") || "",
                Website: record.get("Website") || "",
                Description: record.get("Description") || "",
                Why: record.get("Why") || "",
                Details: record.get("Details") || "",
                UseCaseTags: record.get("UseCaseTags") || [], // Array of Tag record IDs
                CautionTags: record.get("CautionTags") || [], // Array of Caution record IDs
                Buyer: record.get("Buyer") || "",
                Pricing: Array.isArray(record.get("Pricing"))
                    ? record.get("Pricing")
                    : record.get("Pricing")
                      ? [record.get("Pricing")]
                      : [],
                Base_Model: record.get("Base_Model") || "",
                Categories: record.get("Categories") || [],
                Active: record.get("Active") || false, // Array of Article record IDs
            };
        },
        useCase: (record) => ({
            id: record.id,
            Tool: record.get("Tool") || "",
            UseCase: record.get("UseCase") || ""
        }),
        useCaseTag: (record) => ({
            id: record.id,
            Name: record.get("Name") || "",
            Tools: record.get("Tools") || ""
        }),
        useCasePillar: (record) => ({
            id: record.id,
            Name: record.get("Name"),
            UseCaseTag: record.get("UseCaseTags")
        }),
    };

    const mapping = recordMappings[type];
    if (!mapping) {
        throw new Error(`Invalid record type: ${type}`);
    }
    return mapping(record);
}
