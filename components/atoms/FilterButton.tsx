import { useState } from 'react';

interface FilterButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function FilterButton({ label, isActive = false, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
        isActive
          ? 'bg-[#F7931A] text-white'
          : 'bg-[#F6F3F1] text-[#1a1a1a] hover:bg-[#EFE8E0]'
      }`}
    >
      {label}
    </button>
  );
}
