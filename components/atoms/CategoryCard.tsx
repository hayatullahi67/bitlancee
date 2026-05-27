import Image from 'next/image';

interface CategoryCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function CategoryCard({ icon, title, description }: CategoryCardProps) {
  return (
    <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F6F3F1]">
        <Image src={icon} alt={title} width={32} height={32} className="object-contain" />
      </div>
      <h3 className="text-lg font-semibold text-[#1a1a1a]">{title}</h3>
      <p className="mt-1 text-sm text-[#666]">{description}</p>
    </div>
  );
}
