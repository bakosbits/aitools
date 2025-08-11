import { getAllUseCases, updateUseCaseTags } from "@/lib/airtable/use-cases";
import { getAllTags } from "@/lib/airtable/tags";
import { getTagTools } from "@/lib/airtable/tools";
import { generateUseCaseTags } from "@/lib/model/providers";

async function handler(req, res) {
  // Set the headers for Server-Sent Events (SSE) immediately
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    // This header can be crucial if you are behind a proxy like Nginx
    // that might buffer responses by default.
    "X-Accel-Buffering": "no",
  });

  res.flushHeaders();

  // Helper function to send SSE messages
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const model = req.query.model;

    if (!model) {
      sendEvent("fatal_error", { message: "Model is required." });
      res.end();
      return;
    }

    if (req.method !== "GET") {
      sendEvent("fatal_error", {
        message: "Method Not Allowed. Please use GET for stream.",
      });
      res.end();
      return;
    }

    const [useCases, tags, tagTools] = await Promise.all([
      getAllUseCases(),
      getAllTags(),
      getTagTools(25),
    ]);

    const tagMap = new Map(tags.map((tag) => [tag.Name, tag.id]));
    const availableTags = tags.map((tag) => tag.Name);

    // This loop will now send updates as each use case is processed
    for (const useCase of useCases) {
      try {
        const generatedTags = await generateUseCaseTags(
          useCase,
          availableTags,
          model,
          tagTools,
        );
        if (
          generatedTags &&
          generatedTags.Tags &&
          generatedTags.Tags.length > 0
        ) {
          const tagIdsToUpdate = generatedTags.Tags.map((tagName) => {
            const sanitizedTagName = tagName.toLowerCase().trim();
            return tagMap.get(sanitizedTagName);
          }).filter((id) => id);

          if (tagIdsToUpdate.length > 0) {
            await updateUseCaseTags(useCase.id, tagIdsToUpdate);
          }
        }
      } catch (error) {
        console.error(`Error processing use case ${useCase.Name}:`, error);
      }
    }
    sendEvent("status", {
      message: "Bulk update for use case tags completed. ",
    });
    res.end();
    return;
  } catch (error) {
    console.error("Error during bulk update for use case tags:", error);
    res.end();
    return;
  }
}

export default handler;
