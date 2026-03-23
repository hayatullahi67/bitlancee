'use client';

import { useState } from 'react';
import SearchInput from '../atoms/SearchInput';
import CategoryCard from '../atoms/CategoryCard';
import CategoryFilter from '../molecules/CategoryFilter';

const CATEGORIES = [
  { id: 1, icon: '/assets/ai.png', title: 'AI & Automation', description: 'GPT Specialists, Agents' },
  { id: 2, icon: '/assets/dev.png', title: 'Development', description: 'Web, Mobile, Bitcoin L2' },
  { id: 3, icon: '/assets/creative.png', title: 'Creative & Design', description: 'UI/UX, Brand, Motion' },
  { id: 4, icon: '/assets/sales.png', title: 'Sales & Marketing', description: 'Growth, SEO, Social' },
  { id: 5, icon: '/assets/writting.png', title: 'Writing & Translation', description: 'Content, Technical, Copy' },
  { id: 6, icon: '/assets/admin.png', title: 'Admin & Support', description: 'Virtual Assistants, CSR' },
  { id: 7, icon: '/assets/finance.png', title: 'Finance & Accounting', description: 'Bookkeeping, BTC Tax' },
  { id: 8, icon: '/assets/hr.png', title: 'HR & Training', description: 'Recruitment, Onboarding' },
];

export default function BrowseCategory() {
  const [activeFilter, setActiveFilter] = useState<string>('AI');

  return (
    <section className="bg-[#FCF9F7] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex justify-center pb-[40px]">
          <div className="w-full sm:w-3/4 lg:w-1/2">
            <div className="mb-8">
              <SearchInput />
            </div>
            <div className="pt-[20px] mb-12">
              <CategoryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-[99%]">
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-8">Browse by Category</h2>
            <div className="pt-[10px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((category) => (
                <CategoryCard key={category.id} icon={category.icon} title={category.title} description={category.description} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
