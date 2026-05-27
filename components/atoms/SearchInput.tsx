interface SearchInputProps {
  placeholder?: string;
}

export default function SearchInput({ placeholder = 'Search for jobs or talent...' }: SearchInputProps) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border-0 bg-[#F6F3F1] px-5 py-4 pl-12 text-base text-[#1a1a1a] placeholder:text-[#999] outline-none shadow-sm backdrop-blur-sm transition-all focus:ring-2 focus:ring-[#F7931A]/40"
      />
      <svg
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
