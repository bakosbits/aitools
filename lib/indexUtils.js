export function getLatestSortedTools(tools, count = 8) {
  return tools
    .filter((tool) => !!tool.Created)
    .sort((a, b) => new Date(b.Created) - new Date(a.Created))
    .slice(0, count)
    .sort((a, b) => a.Name.localeCompare(b.Name));
}
