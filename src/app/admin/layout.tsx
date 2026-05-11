import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?returnTo=/admin');
  if (!isAdmin(user)) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#070708] p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-semibold">Bạn không có quyền truy cập.</h1>
          <p className="mt-3 text-sm text-foreground/65">
            Chỉ tài khoản có email khớp <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px]">ADMIN_EMAIL</code> mới vào được khu vực này.
          </p>
          <form action="/auth/signout" method="post" className="mt-6">
            <button type="submit" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-foreground/80 transition hover:bg-white/[0.04]">
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#070708] text-foreground">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="px-6 pb-12 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
