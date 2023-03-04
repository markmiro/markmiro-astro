import { formatDistanceToNow } from "date-fns";

export function RelativeDate({ date }: { date: Date }) {
  return <span>{formatDistanceToNow(date, { addSuffix: true })}</span>;
}
