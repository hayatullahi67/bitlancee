import Tag from '../atoms/Tag';

interface FeaturedJobProps {
  badge?: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
  icon?: string;
  profileName: string;
  profileTitle: string;
  rate: string;
  completed: number;
  rating?: number;
  buttonText?: string;
}

export default function FeaturedJob({
  badge = 'FEATURED',
  title,
  description,
  price,
  tags,
  icon,
  profileName,
  profileTitle,
  rate,
  completed,
  rating = 5,
  buttonText = 'View Profile',
}: FeaturedJobProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
      {/* Job Card (2/3) */}
      <div className="flex-1 rounded-2xl bg-white p-4 md:p-8 shadow-sm flex gap-4 md:gap-6 relative">
        {/* Price at top right */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 text-lg md:text-2xl font-bold text-[#8C4F00]">{price}</div>

        {/* Child div 1: Profile image */}
        <div className="flex-shrink-0">
          {icon && <div className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#E8DCC8]">{icon}</div>}
        </div>

        {/* Child div 2: Job content */}
        <div className="flex-1">
          <div className="mb-3 md:mb-4 inline-block rounded-full bg-[#FFF3E0] px-2 md:px-3 py-1 text-xs font-bold text-[#F7931A]">
            {badge}
          </div>
          <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-bold text-[#1a1a1a]">{title}</h3>
          <p className="mb-3 md:mb-4 text-sm text-[#666] leading-5 md:leading-6">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-block rounded-full bg-[#F6F3F1] px-2 md:px-3 py-1 text-xs font-semibold text-[#666]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Card (1/3) */}
      <div className="w-full md:w-[350px] lg:w-[400px] rounded-2xl bg-white p-4 md:p-6 shadow-sm">
        <div className="mb-3 md:mb-4 flex items-center gap-3">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-[#E8C9A0]" />
          <div className="text-left">
            <h4 className="text-base md:text-lg font-bold text-[#1a1a1a]">{profileName}</h4>
            <p className="text-xs uppercase tracking-widest text-[#999]">{profileTitle}</p>
          </div>
        </div>

        <div className="my-4 md:my-5 border-t border-[#F0F0F0] pt-3 md:pt-4">
          <div className="mb-2 md:mb-3 flex items-center justify-between">
            <span className="text-xs uppercase text-[#999]">Rate</span>
            <span className="font-bold text-[#1a1a1a]">{rate}</span>
          </div>
          <div className="mb-3 md:mb-4 flex items-center justify-between">
            <span className="text-xs uppercase text-[#999]">Completed</span>
            <span className="font-bold text-[#1a1a1a]">{completed} Jobs</span>
          </div>
          {rating > 0 && (
            <div className="mb-3 md:mb-4 flex items-center gap-1 text-base md:text-lg text-[#8C4F00]">
              {Array.from({ length: rating }).map((_, idx) => (
                <span key={idx} className="text-[#8C4F00]">★</span>
              ))}
            </div>
          )}
        </div>

        <button className="w-full rounded-full bg-[#1B1C1B] py-2 md:py-3 text-sm font-bold text-white transition-all hover:bg-[#2a2b2b]">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
