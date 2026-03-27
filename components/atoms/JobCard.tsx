import Image from 'next/image';

interface JobCardProps {
  icon?: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
  variant?: 'default' | 'findwork';
  titleClassName?: string;
  descriptionClassName?: string;
  priceClassName?: string;
  tagsClassName?: string;
  isFreelancer?: boolean;
}

export default function JobCard({ icon, title, description, price, tags, variant = 'default', titleClassName, descriptionClassName, priceClassName, tagsClassName, isFreelancer = false }: JobCardProps) {
  if (variant === 'findwork') {
    return (
      <div className="rounded-[34px] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-3">
          {!isFreelancer && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#8C4F001A] px-2.5 py-1 text-[10px] font-bold uppercase text-[#8C4F00]">Urgent</span>
              <span className="text-xs text-[#8C4F00]">2 hours ago</span>
            </div>
          )}
          <div className={`text-[20px] font-bold text-[#8C4F00] ${priceClassName || ''}`}>{price}</div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h4 className={`text-xl font-semibold text-[#1a1a1a] ${titleClassName || ''}`}>{title}</h4>
          {!isFreelancer && <span className="text-xs font-bold uppercase text-[#554335]">Fixed</span>}
        </div>

        <p className={`mb-4 text-sm leading-6 text-[#555] ${descriptionClassName || ''}`}>{description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className={`inline-block rounded-full bg-[#F0EDEB] px-3 py-1 text-xs font-semibold text-[#554335] uppercase ${tagsClassName || ''}`}>
              {tag}
            </span>
          ))}
        </div>

        {!isFreelancer && (
          <div className="flex justify-end">
            <button className="rounded-full bg-[#8C4F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a15f00]">
              Apply Now
            </button>
          </div>
        )}
        {isFreelancer && (
          <div className="flex justify-end">
            <button className="rounded-full bg-[#8C4F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a15f00]">
              View Profile
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        {icon && (
          <div className="inline-flex h-10 w-10 items-center justify-center">
            <Image src={icon} alt="" width={35} height={35} className="rounded-lg" />
          </div>
        )}
        <div className="text-[15px] font-bold text-[black]">{price}</div>
      </div>
      <h4 className="mb-2 text-base font-semibold text-[#1a1a1a]">{title}</h4>
      <p className="mb-4 text-sm text-[#666] leading-5">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-block rounded-full bg-[#F6F3F1] px-3 py-1 text-xs font-semibold text-[#666] uppercase">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
