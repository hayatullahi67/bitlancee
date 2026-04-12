interface ClientProposalCardProps {
  name: string;
  title: string;
  rate: string;
  cover: string;
  rating: number;
  availability: string;
  isSelected?: boolean;
  onToggle?: () => void;
  onMessage?: () => void;
}

export default function ClientProposalCard({
  name,
  title,
  rate,
  cover,
  rating,
  availability,
  isSelected = false,
  onToggle,
  onMessage,
}: ClientProposalCardProps) {
  const rateLabel = rate.toLowerCase().includes("sats") ? rate : `${rate} sats`;

  return (
    <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-[#1a1a1a]">{name}</div>
          <div className="text-[11px] text-[#9e9690]">{title}</div>
        </div>
        <div className="text-[12px] font-semibold text-[#8C4F00]">{rateLabel}</div>
      </div>
      <div className="mt-3 text-[12px] leading-[1.7] text-[#6b6762]">
        {cover}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#9e9690]">
        <span>Rating: {rating.toFixed(1)}</span>
        <span>•</span>
        <span>{availability}</span>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-[11px] font-semibold text-[#6b6762] uppercase tracking-[0.08em]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="h-4 w-4 rounded border-[#E0DDD8] text-orange-500 focus:ring-orange-400"
          />
          Select
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={onMessage}
            className="w-full rounded-full border border-[#E0DDD8] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6762] hover:bg-[#F7F4F0] sm:w-auto"
          >
            Message
          </button>
          <button className="w-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:opacity-90 sm:w-auto">
            Hire
          </button>
        </div>
      </div>
    </div>
  );
}
