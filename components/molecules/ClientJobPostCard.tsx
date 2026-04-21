// import Tag from "@/components/atoms/Tag";

// interface ClientJobPostCardProps {
//   id?: string;
//   title: string;
//   description?: string;
//   status: "Open" | "Paused" | "In Review";
//   budget: string;
//   proposals: number;
//   tags: string[];
//   isSelected?: boolean;
//   onSelect?: () => void;
//   onEdit?: () => void;
//   showDetailsHint?: boolean;
// }

// export default function ClientJobPostCard({
//   id,
//   title,
//   description,
//   status,
//   budget,
//   proposals,
//   tags,
//   isSelected = false,
//   onSelect,
//   onEdit,
//   showDetailsHint = true,
// }: ClientJobPostCardProps) {
//   const statusStyles = {
//     Open: "bg-[#E6F4EA] text-[#2E7D32]",
//     Paused: "bg-[#FDECEA] text-[#C62828]",
//     "In Review": "bg-[#E8F0FE] text-[#1565C0]",
//   } as const;

//   const budgetLabel = budget.toLowerCase().includes("sats") ? budget : `${budget} sats`;

//   return (
//     <div
//       className={`w-full rounded-[12px] border bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all ${
//         isSelected ? "border-[#F5A623] ring-1 ring-[#F5A623]/30" : "border-[#EAE7E2] hover:border-[#F2D8AA]"
//       }`}
//       data-job-id={id}
//     >
//       <div className="flex items-start justify-between gap-3">
//         <button
//           type="button"
//           onClick={onSelect}
//           className="flex-1 text-left"
//           aria-pressed={isSelected}
//         >
//           <div className="text-[14px] font-semibold text-[#1a1a1a] break-words">
//             {title}
//           </div>
//           {description ? (
//             <div className="mt-1 text-[11px] text-[#6b6762] line-clamp-2 break-words">
//               {description}
//             </div>
//           ) : null}
//           <div className="mt-2 flex flex-wrap gap-2">
//             {tags.map((tag) => (
//               <Tag key={tag} label={tag} />
//             ))}
//           </div>
//         </button>
//         <div className="flex flex-col items-end gap-2">
//           <span
//             className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
//           >
//             {status}
//           </span>
//           <span className="text-[12px] font-semibold text-[#8C4F00]">{budgetLabel}</span>
//           {onEdit ? (
//             <button
//               type="button"
//               onClick={onEdit}
//               className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#EAE7E2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b6762] hover:bg-[#F7F4F0]"
//               aria-label="Edit job"
//             >
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M12 20h9" />
//                 <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
//               </svg>
//               Edit
//             </button>
//           ) : null}
//         </div>
//       </div>
//       <div className="mt-3 text-[11px] text-[#9e9690]">
//         {proposals} proposals received
//       </div>
//       {showDetailsHint && (
//         <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C4F00]">
//           View details
//         </div>
//       )}
//     </div>
//   );
// }




import Tag from "@/components/atoms/Tag";

interface ClientJobPostCardProps {
  id?: string;
  title: string;
  description?: string;
  status: "Open" | "Paused" | "In Review";
  budget: string;
  proposals: number;
  tags: string[];
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  showDetailsHint?: boolean;
}

export default function ClientJobPostCard({
  id,
  title,
  description,
  status,
  budget,
  proposals,
  tags,
  isSelected = false,
  onSelect,
  onEdit,
  showDetailsHint = true,
}: ClientJobPostCardProps) {
  const statusStyles = {
    Open: "bg-[#E6F4EA] text-[#2E7D32]",
    Paused: "bg-[#FDECEA] text-[#C62828]",
    "In Review": "bg-[#E8F0FE] text-[#1565C0]",
  } as const;

  const budgetLabel = budget?.trim()
    ? budget.toLowerCase().includes("sats")
      ? budget
      : `${budget} sats`
    : null;

  const cleanDescription = description?.trim()
    ? description.replace(/\s{2,}/g, " ").trim()
    : null;

  return (
    <div
      className={`w-full rounded-[12px] border bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all ${isSelected
          ? "border-[#F5A623] ring-1 ring-[#F5A623]/30"
          : "border-[#EAE7E2] hover:border-[#F2D8AA]"
        }`}
      data-job-id={id}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 min-w-0 text-left"
          aria-pressed={isSelected}
        >
          <div className="text-[14px] font-semibold text-[#1a1a1a] break-words">
            {title}
          </div>
          {cleanDescription ? (
            <div className="mt-1 text-[11px] text-[#6b6762] line-clamp-2 overflow-hidden break-words max-w-full">
              {cleanDescription}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </button>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusStyles[status]}`}
          >
            {status}
          </span>
          {budgetLabel ? (
            <span className="text-[12px] font-semibold text-[#8C4F00]">
              {budgetLabel}
            </span>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#EAE7E2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b6762] hover:bg-[#F7F4F0]"
              aria-label="Edit job"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Edit
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-3 text-[11px] text-[#9e9690]">
        {proposals} proposal{proposals !== 1 ? "s" : ""} received
      </div>
      {showDetailsHint && (
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C4F00]">
          View details
        </div>
      )}
    </div>
  );
}
