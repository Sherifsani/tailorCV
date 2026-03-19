import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-purple-100 text-purple-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
};

const STATUSES = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'];

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  status: string;
  appliedAt: string;
  notes?: string;
  resume?: { filename: string };
}

export default function TrackerPage() {
  const location = useLocation();
  const qc = useQueryClient();
  const aiResultId = (location.state as any)?.aiResultId;

  const [showForm, setShowForm] = useState(!!aiResultId);
  const [form, setForm] = useState({
    company: '',
    jobTitle: '',
    jobUrl: '',
    status: 'applied',
    notes: '',
    aiResultId: aiResultId ?? '',
  });

  const { data: apps = [] } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => api.get('/tracker').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/tracker', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      setShowForm(false);
      setForm({ company: '', jobTitle: '', jobUrl: '', status: 'applied', notes: '', aiResultId: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/tracker/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tracker/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Tracker</h2>
          <p className="text-muted-foreground mt-1">{apps.length} applications tracked</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={14} />
          Add Application
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="bg-card border rounded-lg p-4 space-y-3"
        >
          <h3 className="font-medium">New Application</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company *"
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              required
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              placeholder="Job Title *"
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={form.jobUrl}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              placeholder="Job URL (optional)"
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 rounded-md text-sm border hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {apps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No applications yet. Tailor a resume and start applying!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {['Company', 'Role', 'Status', 'Applied', 'Resume', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    {app.jobUrl ? (
                      <a href={app.jobUrl} target="_blank" rel="noreferrer" className="hover:underline text-primary">
                        {app.company}
                      </a>
                    ) : app.company}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{app.jobTitle}</td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus.mutate({ id: app.id, status: e.target.value })}
                      className={cn('text-xs rounded-full px-2 py-0.5 font-medium border-0 cursor-pointer', STATUS_COLORS[app.status])}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {app.resume?.filename ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMutation.mutate(app.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
