import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';

/**
 * ShadCN‑style wrapper around Radix UI dropdown menu.
 * Provides a three‑dot trigger and easy composition.
 */
export function KebabDropdown({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function KebabMenuItem({ onSelect, children }: { onSelect?: () => void; children: React.ReactNode }) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 data-[state=checked]:bg-gray-100">
      {children}
    </DropdownMenuItem>
  );
}
