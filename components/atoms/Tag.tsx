interface TagProps {
  label: string;
  variant?: 'default' | 'dark';
}

export default function Tag({ label, variant = 'default' }: TagProps) {
  const baseClass = 'inline-block px-3 py-1 rounded-full text-xs font-semibold';
  const variants = {
    default: 'bg-[#F6F3F1] text-[#666]',
    dark: 'bg-[#1a1a1a] text-white',
  };

  return <span className={`${baseClass} ${variants[variant]}`}>{label}</span>;
}
