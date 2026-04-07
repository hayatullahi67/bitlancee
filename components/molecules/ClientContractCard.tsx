interface ClientContractCardProps {
  title: string;
  freelancer: string;
  progress: number;
  nextMilestone: string;
  status: "Active" | "Review" | "Completed";
  showDetailsHint?: boolean;
}

export default function ClientContractCard({
  title,
  freelancer,
  progress,
  nextMilestone,
  status,
  showDetailsHint = true,
}: ClientContractCardProps) {
  const statusStyles = {
    Active: "bg-[#E6F4EA] text-[#2E7D32]",
    Review: "bg-[#E8F0FE] text-[#1565C0]",
    Completed: "bg-[#F5EFE8] text-[#8C4F00]",
  } as const;

  return (
    <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-[#1a1a1a]">{title}</div>
          <div className="mt-1 text-[11px] text-[#9e9690]">Freelancer: {freelancer}</div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-[#9e9690]">
          <span>Progress</span>
          <span className="text-[#1a1a1a] font-semibold">{progress}%</span>
        </div>
        <div className="mt-2 h-[6px] rounded-full bg-[#F1EEEA]">
          <div
            className="h-[6px] rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="mt-3 text-[11px] text-[#6b6762]">
        Next milestone: <span className="font-semibold text-[#1a1a1a]">{nextMilestone}</span>
      </div>
      {showDetailsHint && (
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C4F00]">
          View details
        </div>
      )}
    </div>
  );
}
