import { redirect } from 'next/navigation';
import { Footer } from '@/components/footer';
import { ProfileForm } from '@/components/profile-form';
import { getCurrentUserWithProfile } from '@/lib/profile';

export const metadata = {
  title: 'Tài khoản — SkillForge VN',
  description: 'Cập nhật ảnh đại diện, tên và thông tin cá nhân của bạn.',
};

export default async function AccountPage() {
  const session = await getCurrentUserWithProfile();
  if (!session) {
    redirect('/login?returnTo=/account');
  }

  return (
    <>
      <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-32 md:pt-36">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-brand-orange">Tài khoản</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Hồ sơ của bạn
          </h1>
          <p className="mt-3 max-w-xl text-sm text-foreground/65">
            Thông tin này giúp mình liên hệ nhanh và cá nhân hoá trải nghiệm. Bạn có thể cập nhật bất cứ lúc nào.
          </p>
        </div>

        <div className="glass-solid rounded-3xl p-6 md:p-8">
          <ProfileForm
            profile={session.profile}
            email={session.user.email ?? ''}
            mode="settings"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
