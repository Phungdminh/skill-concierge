import { cn } from '@/lib/utils';

const styles = {
  completed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  pending: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  failed: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  new: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  contacted: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  qualified: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  won: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  lost: 'border-zinc-400/20 bg-zinc-400/10 text-zinc-400',
} as const;

const labels = {
  completed: 'Hoàn tất',
  pending: 'Đang chạy',
  failed: 'Lỗi',
  new: 'Mới',
  contacted: 'Đã liên hệ',
  qualified: 'Tiềm năng',
  won: 'Chốt',
  lost: 'Hủy',
} as const;

export function StatusPill({ status }: { status: keyof typeof styles }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {labels[status]}
    </span>
  );
}
