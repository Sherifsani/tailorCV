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
    return (
      <p className="text-sm text-muted-foreground py-2">No resumes uploaded yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {resumes.map((r) => (
        <li key={r.id} className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/30 transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText size={14} className="text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm truncate">{r.filename}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDelete(r.id)}
            disabled={deleting === r.id}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 p-1 rounded opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </li>
      ))}
    </ul>
  );
}
