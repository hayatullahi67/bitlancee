import Image from 'next/image';

interface JobCardProps {
  icon?: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
}

export default function JobCard({ icon, title, description, price, tags }: JobCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        {icon && (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F3F1]">
            <Image src={icon} alt="" width={40} height={40} className="rounded-lg" />
          </div>
        )}
        <div className="text-2xl font-bold text-[black]">{price}</div>
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
