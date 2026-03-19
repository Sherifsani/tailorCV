import { FileText, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Resume {
  id: string;
  filename: string;
  createdAt: string;
}

interface Props {
  resumes: Resume[];
  onDeleted: () => void;
}

export default function ResumeList({ resumes, onDeleted }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/resumes/${id}`);
      onDeleted();
    } finally {
      setDeleting(null);
    }
  };

  if (!resumes.length) {
    return <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {resumes.map((r) => (
        <li key={r.id} className="flex items-center justify-between p-3 bg-card border rounded-md">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <span className="text-sm truncate max-w-[180px]">{r.filename}</span>
          </div>
          <button
            onClick={() => handleDelete(r.id)}
            disabled={deleting === r.id}
            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
