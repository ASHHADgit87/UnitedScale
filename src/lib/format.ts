export const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "US";

export const formatPkr = (value: number) =>
  `PKR ${Math.round(value).toLocaleString("en-US")}`;

export const formatUnits = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
