import { redirect } from 'next/navigation';
import { Footer } from '@/components/footer';
import { ProfileForm } from '@/components/profile-form';
import { getCurrentUserWithProfile } from '@/lib/profile';
import { profileNeedsOnboarding, safeReturnTo } from '@/lib/profile-types';

export const metadata = {
  title: 'Hoàn tất hồ sơ — SkillForge VN',
  description: 'Thêm ảnh đại diện và tên để hoàn tất tài khoản.',
};

interface OnboardingPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const next = safeReturnTo(params.next, '/');
  const session = await getCurrentUserWithProfile();
  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(`/account/onboarding?next=${next}`)}`);
  }
  if (!profileNeedsOnboarding(session.profile)) {
    redirect(next);
  }

  return (
    <>
      <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-32 md:pt-36">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-widest text-brand-orange">Chào mừng</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Hoàn tất hồ sơ của bạn
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/65">
            Chỉ tên là bắt buộc. Các phần khác bạn có thể để trống hoặc cập nhật sau ở trang Hồ sơ.
          </p>
        </div>

        <div className="glass-solid rounded-3xl p-6 md:p-8">
          <ProfileForm
            profile={session.profile}
            email={session.user.email ?? ''}
            mode="onboarding"
            redirectTo={next}
            submitLabel="Hoàn tất và tiếp tục"
            hideAvatar
            skipHref={next}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
