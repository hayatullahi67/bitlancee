'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative py-2 text-sm font-medium transition-colors hover:text-[#F7931A] ${isActive ? 'text-[#F7931A]' : 'text-zinc-600'
        }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 h-0.5 w-8 bg-[#F7931A] rounded-full" />
      )}
    </Link>
  );
}
