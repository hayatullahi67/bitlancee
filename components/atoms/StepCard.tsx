interface StepCardProps {
  number: number;
  title: string;
  description: string;
  iconSrc?: string;
}

export default function StepCard({ number, title, description, iconSrc }: StepCardProps) {
  return (
    <article className="relative rounded-2xl bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F9E4BF] text-2xl font-bold text-[#8C4F00]">
        {number}
      </div>
      {/* {iconSrc && (
        <img src={iconSrc} alt={`${title} icon`} className="mx-auto mb-4 h-12 w-12 object-contain" />
      )} */}
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{title}</h3>
      <p className="text-sm text-[#666] leading-6">{description}</p>
    </article>
  );
}
