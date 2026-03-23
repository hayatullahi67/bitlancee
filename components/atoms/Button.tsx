import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // I'll need to create this utility function

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow-md active:scale-95',
        ghost: 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50',
        outline: 'border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900',
      },
      size: {
        default: 'h-10 px-6',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  children: React.ReactNode;
}

export default function Button({ className, variant, size, href, children, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={cn(buttonVariants({ variant, size, className }))}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
}
