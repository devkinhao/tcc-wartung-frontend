type Props = {
  active: boolean;
  direction: "asc" | "desc";
};

export function SortIcon({ active, direction }: Props) {
  return (
    <span className="ml-1 text-xs opacity-60">
      {active ? (direction === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );
}