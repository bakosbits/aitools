import { getAllTools, updateToolTags } from "@/lib/airtable/tools";
import { generateToolTags } from "@/lib/model/providers";
import { getAllTags } from "@/lib/airtable/tags";

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

    const [allTools, tags] = await Promise.all([getAllTools(), getAllTags()]);

    const tagMap = new Map(tags.map((tag) => [tag.Name, tag.id]));
    const availableTags = tags.map((tag) => tag.Name);

    for (const tool of allTools) {
      try {
        const generatedTags = await generateToolTags(
          tool,
          availableTags,
          model,
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
            await updateToolTags(tool.id, tagIdsToUpdate);
          }
        }
      } catch (error) {
        console.error(`Error processing tool ${tool.Name}:`, error);
      }
    }
    sendEvent("status", {
      message: "The bulk update for tool tags is complete. ",
    });
    res.end();
    return;
  } catch (error) {
    console.error("Error during bulk update for tool tags:", error);
    res.end();
    return;
  }
}

export default handler;
