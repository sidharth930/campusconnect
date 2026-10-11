export function formatDate(value) {
  if (!value) return "Just now";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Just now"; // guards against legacy posts missing createdAt
  return d.toLocaleString();
}
