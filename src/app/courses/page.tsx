import { ProductListing } from '@/components/product-listing';
import { KIND_META } from '@/lib/product-types';

const META = KIND_META.course;

export const metadata = {
  title: `${META.pluralLabel} — SkillForge VN`,
  description: META.description,
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  return <ProductListing kind="course" category={category} />;
}
