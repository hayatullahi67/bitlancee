import Tag from "@/components/atoms/Tag";

interface ClientJobPostCardProps {
  id?: string;
  title: string;
  status: "Open" | "Paused" | "In Review";
  budget: string;
  proposals: number;
  tags: string[];
  isSelected?: boolean;
  onSelect?: () => void;
  showDetailsHint?: boolean;
}

export default function ClientJobPostCard({
  id,
  title,
  status,
  budget,
  proposals,
  tags,
  isSelected = false,
  onSelect,
  showDetailsHint = true,
}: ClientJobPostCardProps) {
  const statusStyles = {
    Open: "bg-[#E6F4EA] text-[#2E7D32]",
    Paused: "bg-[#FDECEA] text-[#C62828]",
    "In Review": "bg-[#E8F0FE] text-[#1565C0]",
  } as const;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-[12px] border bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all ${
        isSelected ? "border-[#F5A623] ring-1 ring-[#F5A623]/30" : "border-[#EAE7E2] hover:border-[#F2D8AA]"
      }`}
      aria-pressed={isSelected}
      data-job-id={id}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-[#1a1a1a]">{title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
          >
            {status}
          </span>
          <span className="text-[12px] font-semibold text-[#8C4F00]">{budget}</span>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-[#9e9690]">
        {proposals} proposals received
      </div>
      {showDetailsHint && (
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C4F00]">
          View details
        </div>
      )}
    </button>
  );
}
