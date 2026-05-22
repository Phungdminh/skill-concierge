import { Hero } from '@/components/hero';
import { LandingShowcase } from '@/components/landing-showcase';
import { Promises } from '@/components/promises';
import { Faq } from '@/components/faq';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';
import { FAQ_GENERAL } from '@/lib/faq-data';

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <main className="relative min-h-svh">
        <Hero />
        <LandingShowcase />
        <Promises />
        <Contact />
        <Faq items={FAQ_GENERAL.slice(0, 6)} id="faq" />
      </main>
      <Footer />
    </>
  );
}
