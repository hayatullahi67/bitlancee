import Image from 'next/image';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-[#323332] bg-[#222422] p-6 text-left transition-all hover:-translate-y-1 hover:border-[#8C4F00] hover:bg-[#2e2f2e]">
      <div className="mb-4 flex h-11 w-11 flex-shrink-0 items-center justify-center ">
        <Image src={icon} alt="" width={24} height={24} className="object-contain" quality={100} />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#d4d5d3]">{description}</p>
    </article>
  );
}
