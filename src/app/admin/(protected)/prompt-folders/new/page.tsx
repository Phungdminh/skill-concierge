import { PromptFolderForm } from '@/components/admin/prompt-folder-form';

export const metadata = { title: 'Tạo folder mới — Admin' };

export default function NewPromptFolderPage() {
  return <PromptFolderForm mode="create" />;
}
