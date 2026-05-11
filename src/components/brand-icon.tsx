import { cn } from '@/lib/utils';

type Brand = 'gmail' | 'telegram' | 'zalo';

interface BrandIconProps {
  brand: Brand;
  className?: string;
}

export function BrandIcon({ brand, className }: BrandIconProps) {
  if (brand === 'gmail') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('h-5 w-5', className)}>
        <path fill="#EA4335" d="M3.5 6.8v10.4c0 .7.6 1.3 1.3 1.3h2.1V10.9L3.5 8.4V6.8Z" />
        <path fill="#34A853" d="M17.1 18.5h2.1c.7 0 1.3-.6 1.3-1.3V6.8l-3.4 2.5v9.2Z" />
        <path fill="#FBBC04" d="M17.1 6.8v2.5l3.4-2.5c0-1.6-1.8-2.5-3-1.5l-.4.3v1.2Z" />
        <path fill="#4285F4" d="M6.9 10.9v7.6h10.2V10.9L12 14.7l-5.1-3.8Z" />
        <path fill="#C5221F" d="M6.9 10.9 3.5 8.4V6.8l.4-.3c.5-.4 1.2-.4 1.7 0L12 11.3l6.4-4.8c.5-.4 1.2-.4 1.7 0l.4.3v1.6L12 14.7l-5.1-3.8Z" />
      </svg>
    );
  }

  if (brand === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('h-5 w-5', className)}>
        <circle cx="12" cy="12" r="10" fill="#26A5E4" />
        <path
          fill="white"
          d="M17.1 7.4c.3-.1.7.1.6.6l-1.6 8.2c-.1.6-.5.8-1 .5l-2.7-2-1.3 1.3c-.1.1-.3.3-.6.3l.2-2.8 5.1-4.6c.2-.2 0-.3-.3-.2l-6.3 4-2.7-.9c-.6-.2-.6-.6.1-.8l10.5-3.6Z"
        />
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid h-5 w-5 place-items-center rounded-[5px] bg-[#0068ff] text-[7px] font-black tracking-[-0.08em] text-white',
        className,
      )}
    >
      Zalo
    </span>
  );
}
