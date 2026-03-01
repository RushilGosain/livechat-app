import { format, isToday, isYesterday, isSameYear } from "date-fns";

/**
 * Format a timestamp for message bubbles:
 * - Today: "2:34 PM"
 * - Yesterday: "Yesterday"
 * - This year: "Feb 15"
 * - Other years: "Feb 15, 2023"
 */
export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  if (isSameYear(date, new Date())) return format(date, "MMM d");
  return format(date, "MMM d, yyyy");
}

/**
 * Format for message bubble timestamp:
 * - Today: "2:34 PM"
 * - Older: "Feb 15, 2:34 PM"
 * - Different year: "Feb 15, 2023, 2:34 PM"
 */
export function formatMessageTime(ts: number): string {
  const date = new Date(ts);
  if (isToday(date)) return format(date, "h:mm a");
  if (isSameYear(date, new Date())) return format(date, "MMM d, h:mm a");
  return format(date, "MMM d, yyyy, h:mm a");
}

/**
 * Format for date dividers in chat:
 * - Today / Yesterday / "February 15" / "February 15, 2023"
 */
export function formatDateDivider(ts: number): string {
  const date = new Date(ts);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isSameYear(date, new Date())) return format(date, "MMMM d");
  return format(date, "MMMM d, yyyy");
}
