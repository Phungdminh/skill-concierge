import { notFound } from 'next/navigation';
import { PromptFolderForm } from '@/components/admin/prompt-folder-form';
import { getPromptFolderById } from '@/lib/admin-prompt-folders';

export const metadata = { title: 'Sửa folder — Admin' };
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPromptFolderPage({ params }: PageProps) {
  const { id } = await params;
  const folder = await getPromptFolderById(id);
  if (!folder) notFound();
  return <PromptFolderForm mode="edit" initial={folder} />;
}
