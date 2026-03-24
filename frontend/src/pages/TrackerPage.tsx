import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

const COLUMNS: { id: string; label: string; color: string; dot: string }[] = [
  { id: 'applied',   label: 'Applied',   color: 'border-t-blue-400',   dot: 'bg-blue-400' },
  { id: 'screening', label: 'Screening', color: 'border-t-purple-400', dot: 'bg-purple-400' },
  { id: 'interview', label: 'Interview', color: 'border-t-amber-400',  dot: 'bg-amber-400' },
  { id: 'offer',     label: 'Offer',     color: 'border-t-green-400',  dot: 'bg-green-400' },
  { id: 'rejected',  label: 'Rejected',  color: 'border-t-red-300',    dot: 'bg-red-300' },
];

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

function AppCard({ app, onDelete }: { app: Application; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined}
      className={cn(
        'bg-background border rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow select-none',
        isDragging && 'opacity-30'
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{app.company}</p>
          <p className="text-xs text-muted-foreground truncate">{app.jobTitle}</p>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">
          {new Date(app.appliedAt).toLocaleDateString()}
        </span>
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={11} />
          </a>
        )}
      </div>
      {app.notes && (
        <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 italic">{app.notes}</p>
      )}
    </div>
  );
}

function Column({ col, apps, onDelete }: { col: typeof COLUMNS[0]; apps: Application[]; onDelete: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className={cn('flex flex-col border-t-4 rounded-lg bg-muted/20 min-h-[400px]', col.color)}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/30 rounded-t-lg">
        <span className={cn('w-2 h-2 rounded-full', col.dot)} />
        <span className="text-xs font-semibold">{col.label}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-background border rounded-full w-5 h-5 flex items-center justify-center">
          {apps.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 transition-colors rounded-b-lg',
          isOver && 'bg-primary/5'
        )}
      >
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onDelete={() => onDelete(app.id)} />
        ))}
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [form, setForm] = useState({ company: '', jobTitle: '', jobUrl: '', status: 'applied', notes: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: apps = [] } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => api.get('/tracker').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/tracker', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      setShowForm(false);
      setForm({ company: '', jobTitle: '', jobUrl: '', status: 'applied', notes: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/tracker/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['applications'] });
      const prev = qc.getQueryData<Application[]>(['applications']);
      qc.setQueryData<Application[]>(['applications'], (old) =>
        old?.map((a) => a.id === id ? { ...a, status } : a) ?? []
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['applications'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tracker/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const onDragStart = (e: DragStartEvent) => {
    setActiveApp(apps.find((a) => a.id === e.active.id) ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id as string;
    const app = apps.find((a) => a.id === active.id);
    if (app && app.status !== newStatus) {
      updateStatus.mutate({ id: app.id as string, status: newStatus });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Tracker</h2>
          <p className="text-muted-foreground mt-1">{apps.length} applications tracked</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'Add Application'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="bg-card border rounded-lg p-4 space-y-3"
        >
          <h3 className="font-medium text-sm">New Application</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              required value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company *"
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              required value={form.jobTitle}
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
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-5 gap-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              col={col}
              apps={apps.filter((a) => a.status === col.id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp && (
            <div className="bg-background border rounded-lg p-3 shadow-xl rotate-2 opacity-95 cursor-grabbing">
              <p className="text-sm font-semibold">{activeApp.company}</p>
              <p className="text-xs text-muted-foreground">{activeApp.jobTitle}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
