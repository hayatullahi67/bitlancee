interface ClientProposalCardProps {
  id: string;
  name: string;
  title: string;
  rate: string;
  cover: string;
  rating: number;
  availability: string;
  status?: string;
  isSelected?: boolean;
  onToggle?: () => void;
  onMessage?: () => void;
}

export default function ClientProposalCard({
  id,
  name,
  title,
  rate,
  cover,
  rating,
  availability,
  status,
  isSelected = false,
  onToggle,
  onMessage,
}: ClientProposalCardProps) {
  const rateLabel = rate.toLowerCase().includes("sats") ? rate : `${rate} sats`;
  const isAccepted = status === "accepted";

  return (
    <div className={`rounded-[12px] border p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all ${
      isAccepted ? "border-green-200 bg-green-50/30" : "border-[#EAE7E2] bg-white"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-semibold text-[#1a1a1a]">{name}</div>
            {isAccepted && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700">
                Hired
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#9e9690]">{title}</div>
        </div>
        <div className="text-[12px] font-semibold text-[#8C4F00]">{rateLabel}</div>
      </div>
      <div className="mt-3 text-[12px] leading-[1.7] text-[#6b6762] line-clamp-2 overflow-hidden break-words">
        {cover}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#9e9690]">
        <span>Rating: {rating.toFixed(1)}</span>
        <span>•</span>
        <span>{availability}</span>
        {isAccepted && (
          <>
            <span>•</span>
            <span className="text-green-600 font-medium">Contract active</span>
          </>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
          isAccepted ? "text-gray-400 cursor-not-allowed" : "text-[#6b6762] cursor-pointer"
        }`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            disabled={isAccepted}
            className="h-4 w-4 rounded border-[#E0DDD8] text-orange-500 focus:ring-orange-400 disabled:opacity-50"
          />
          {isAccepted ? "Member of Team" : "Select"}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={onMessage}
            className="w-full rounded-full border border-[#E0DDD8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6762] hover:bg-[#F7F4F0] sm:w-auto"
          >
            Message
          </button>
          {!isAccepted && (
            <div className="text-[9px] uppercase tracking-wider text-gray-400 sm:ml-2">
              Select to Hire 
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
