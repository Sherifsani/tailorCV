import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Trash2, X, ExternalLink, ClipboardList } from 'lucide-react';
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
  useDraggable,
} from '@dnd-kit/core';

const COLUMNS: { id: string; label: string; color: string; dot: string; bar: string; description: string }[] = [
  { id: 'applied',   label: 'Applied',   color: 'border-t-blue-400',   dot: 'bg-blue-400',   bar: 'bg-blue-400',   description: 'Submitted applications' },
  { id: 'screening', label: 'Screening', color: 'border-t-purple-400', dot: 'bg-purple-400', bar: 'bg-purple-400', description: 'Initial review stage' },
  { id: 'interview', label: 'Interview', color: 'border-t-amber-400',  dot: 'bg-amber-400',  bar: 'bg-amber-400',  description: 'Active interview rounds' },
  { id: 'offer',     label: 'Offer',     color: 'border-t-green-400',  dot: 'bg-green-400',  bar: 'bg-green-400',  description: 'Offer received!' },
  { id: 'rejected',  label: 'Rejected',  color: 'border-t-red-300',    dot: 'bg-red-300',    bar: 'bg-red-300',    description: 'Not selected' },
];

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  status: string;
  appliedAt: string;
  notes?: string;
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
        'bg-background border rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all select-none group',
        isDragging && 'opacity-30 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground">
              {app.company?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{app.company}</p>
            <p className="text-[10px] text-muted-foreground truncate">{app.jobTitle}</p>
          </div>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="shrink-0 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground/60">
          {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={10} />
          </a>
        )}
      </div>
      {app.notes && (
        <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 italic border-t pt-1.5">
          {app.notes}
        </p>
      )}
    </div>
  );
}

function Column({
  col,
  apps,
  onDelete,
}: {
  col: typeof COLUMNS[0];
  apps: Application[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className={cn('flex flex-col border-t-4 rounded-xl bg-muted/20 min-w-[210px]', col.color)}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-card/60 rounded-t-xl">
        <span className={cn('w-2 h-2 rounded-full shrink-0', col.dot)} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold">{col.label}</span>
          <p className="text-[9px] text-muted-foreground/60 truncate hidden lg:block">{col.description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground bg-background border rounded-full w-5 h-5 flex items-center justify-center font-medium shrink-0">
          {apps.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 min-h-[200px] rounded-b-xl transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/20 ring-inset'
        )}
      >
        {apps.length === 0 && (
          <div className="flex items-center justify-center h-16 rounded-lg border border-dashed border-muted-foreground/20">
            <p className="text-[10px] text-muted-foreground/40">Drop here</p>
          </div>
        )}
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
  const [form, setForm] = useState({
    company: '',
    jobTitle: '',
    jobUrl: '',
    status: 'applied',
    notes: '',
  });

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
        old?.map((a) => (a.id === id ? { ...a, status } : a)) ?? []
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
    const app = apps.find((a) => a.id === active.id);
    if (app && app.status !== over.id) {
      updateStatus.mutate({ id: app.id, status: over.id as string });
    }
  };

  // Pipeline summary stats
  const activeCount = apps.filter((a) => !['rejected'].includes(a.status)).length;
  const offerCount = apps.filter((a) => a.status === 'offer').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Application Tracker</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {apps.length === 0
              ? 'Track every job application in one place.'
              : `${apps.length} application${apps.length !== 1 ? 's' : ''} · ${activeCount} active · ${offerCount} offer${offerCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Application'}</span>
          <span className="sm:hidden">{showForm ? 'Cancel' : 'Add'}</span>
        </button>
      </div>

      {/* Pipeline bar */}
      {apps.length > 0 && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline</p>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            {COLUMNS.map((col) => {
              const count = apps.filter((a) => a.status === col.id).length;
              const pct = apps.length ? (count / apps.length) * 100 : 0;
              return pct > 0 ? (
                <div
                  key={col.id}
                  className={cn('h-full rounded-full transition-all', col.bar)}
                  style={{ width: `${pct}%` }}
                  title={`${col.label}: ${count}`}
                />
              ) : null;
            })}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {COLUMNS.map((col) => {
              const count = apps.filter((a) => a.status === col.id).length;
              return count > 0 ? (
                <div key={col.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn('w-2 h-2 rounded-full', col.dot)} />
                  {col.label}: <span className="font-semibold text-foreground">{count}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="bg-card border rounded-xl p-4 sm:p-5 space-y-3"
        >
          <h3 className="font-semibold text-sm">New Application</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company *"
              className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <input
              required
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              placeholder="Job Title *"
              className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <input
              value={form.jobUrl}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              placeholder="Job URL (optional)"
              className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none transition"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Saving…' : 'Save Application'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Kanban */}
      {apps.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl gap-4 bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <ClipboardList size={24} className="text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground">No applications yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Tailor a resume in Compare & Tailor and hit "Save Application", or add one manually above.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex gap-3 min-w-max md:grid md:grid-cols-5 md:min-w-0">
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
                <div className="bg-background border rounded-xl p-3 shadow-2xl rotate-1 opacity-95 cursor-grabbing w-52">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {activeApp.company?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{activeApp.company}</p>
                      <p className="text-[10px] text-muted-foreground">{activeApp.jobTitle}</p>
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
