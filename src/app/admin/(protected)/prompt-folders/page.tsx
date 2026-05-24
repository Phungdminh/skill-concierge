import Link from 'next/link';
import { FolderPlus, Pencil, FolderTree } from 'lucide-react';
import { listPromptFolders } from '@/lib/admin-prompt-folders';

export const metadata = { title: 'Folder prompt — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPromptFoldersPage() {
  const folders = await listPromptFolders();

  return (
    <section className="pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Folder prompt</h1>
          <p className="mt-2 max-w-2xl text-foreground/65">
            Tổ chức prompt theo từng chủ đề. Khi tạo/sửa prompt, chọn folder để khách dễ tìm.
            Xóa folder không xóa prompts — prompts sẽ thành &ldquo;Chưa phân loại&rdquo;.
          </p>
        </div>
        <Link
          href="/admin/prompt-folders/new"
          className="bg-brand-gradient inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-black"
        >
          <FolderPlus className="h-4 w-4" /> Tạo folder mới
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/5 bg-[#0d0d10]">
        {folders.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-foreground/55">
            <FolderTree className="mx-auto mb-3 h-8 w-8 text-foreground/30" strokeWidth={1.5} />
            Chưa có folder nào. Bấm &ldquo;Tạo folder mới&rdquo; để bắt đầu.
          </div>
        ) : (
          <table className="min-w-[640px] w-full text-sm">
            <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Folder</th>
                <th className="px-4 py-3 font-normal">Slug</th>
                <th className="px-4 py-3 font-normal">Số prompt</th>
                <th className="px-4 py-3 font-normal">Thứ tự</th>
                <th className="px-4 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {folders.map((folder) => (
                <tr key={folder.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{folder.name}</div>
                    {folder.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-foreground/55">
                        {folder.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/70">{folder.slug}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground/80">{folder.prompt_count}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground/55">{folder.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/prompts/folder/${folder.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-foreground/65 transition hover:bg-white/[0.05] hover:text-foreground"
                      >
                        Xem public
                      </Link>
                      <Link
                        href={`/admin/prompt-folders/${folder.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs text-foreground/85 transition hover:bg-white/[0.1]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Sửa
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
