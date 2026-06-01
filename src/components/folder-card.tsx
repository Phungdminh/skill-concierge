import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { type LucideIcon, type LucideProps, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptFolder } from '@/lib/prompt-folder-types';

interface FolderCardProps {
  folder: PromptFolder;
  promptCount: number;
}

function FolderIconRenderer({ name, ...iconProps }: { name?: string } & LucideProps) {
  const dict = LucideIcons as unknown as Record<string, LucideIcon>;
  const candidate = name ? dict[name] : undefined;
  const Icon: LucideIcon = typeof candidate === 'function' ? candidate : Folder;
  return <Icon {...iconProps} />;
}

export function FolderCard({ folder, promptCount }: FolderCardProps) {
  const href = `/prompts/folder/${folder.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 transition',
        'hover:border-brand-orange/40 hover:bg-surface-muted',
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,122,24,0.18),transparent_70%)] opacity-60 transition group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)]">
          <FolderIconRenderer name={folder.icon ?? undefined} className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] uppercase tracking-widest text-foreground/55 ring-1 ring-[var(--ring-subtle)]">
          {promptCount === 0 ? 'Sắp có' : `${promptCount} prompt`}
        </span>
      </div>

      <h3 className="relative mt-5 text-balance text-base font-semibold tracking-tight transition group-hover:text-brand-orange md:text-lg">
        {folder.name}
      </h3>
      {folder.description && (
        <p className="relative mt-2 line-clamp-2 text-sm text-foreground/60">{folder.description}</p>
      )}

      <span className="relative mt-auto pt-5 text-[11px] uppercase tracking-widest text-foreground/45 transition group-hover:text-brand-orange/80">
        Xem folder →
      </span>
    </Link>
  );
}
