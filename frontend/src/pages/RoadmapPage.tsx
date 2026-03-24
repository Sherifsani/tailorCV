import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Map, ChevronDown, ChevronUp, Trash2, Clock, ExternalLink, Building2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapGap {
  skill: string;
  priority: 'critical' | 'important' | 'nice-to-have';
  why: string;
  steps: string[];
  resources: string[];
  timeframe: string;
}

interface Roadmap {
  id: string;
  jobTitle: string | null;
  company: string | null;
  summary: string;
  gaps: RoadmapGap[];
  createdAt: string;
}

const PRIORITY = {
  critical:       { label: 'Critical',      cls: 'bg-red-50 text-red-700 border-red-200',       bar: 'bg-red-400' },
  important:      { label: 'Important',     cls: 'bg-amber-50 text-amber-700 border-amber-200',  bar: 'bg-amber-400' },
  'nice-to-have': { label: 'Nice to have', cls: 'bg-blue-50 text-blue-700 border-blue-200',     bar: 'bg-blue-300' },
};

function GapAccordion({ gap, defaultOpen = false }: { gap: RoadmapGap; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const p = PRIORITY[gap.priority] ?? PRIORITY['nice-to-have'];

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className={cn('w-1 self-stretch rounded-full shrink-0', p.bar)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{gap.skill}</span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', p.cls)}>
              {p.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <Clock size={10} />{gap.timeframe}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{gap.why}</p>
        </div>
        {open
          ? <ChevronUp size={13} className="shrink-0 text-muted-foreground" />
          : <ChevronDown size={13} className="shrink-0 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/10">
          <div>
            <p className="text-xs font-semibold mb-2">Action steps</p>
            <ol className="space-y-1.5">
              {gap.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2">Resources</p>
            <ul className="space-y-1.5">
              {gap.resources.map((res, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink size={10} className="shrink-0 mt-0.5 text-primary/60" />
                  {res}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapCard({ roadmap, onDelete }: { roadmap: Roadmap; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const criticalCount = roadmap.gaps.filter((g) => g.priority === 'critical').length;

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {roadmap.company && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 size={11} />{roadmap.company}
                </span>
              )}
              {roadmap.company && roadmap.jobTitle && (
                <span className="text-muted-foreground/40 text-xs">·</span>
              )}
              {roadmap.jobTitle
                ? <span className="text-sm font-semibold">{roadmap.jobTitle}</span>
                : !roadmap.company && <span className="text-sm font-semibold text-muted-foreground">Untitled Roadmap</span>
              }
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar size={10} />{new Date(roadmap.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[10px] text-muted-foreground">{roadmap.gaps.length} gaps</span>
              {criticalCount > 0 && (
                <span className="text-[10px] font-medium text-red-600">{criticalCount} critical</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs flex items-center gap-1 px-2.5 py-1.5 border rounded-lg hover:bg-accent transition-colors"
            >
              {expanded ? 'Collapse' : 'View'}
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic mt-2.5 leading-relaxed">{roadmap.summary}</p>

        {/* Priority pills */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {roadmap.gaps.map((g, i) => {
            const p = PRIORITY[g.priority] ?? PRIORITY['nice-to-have'];
            return (
              <span key={i} className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', p.cls)}>
                {g.skill}
              </span>
            );
          })}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-2 bg-muted/10">
          {roadmap.gaps.map((gap, i) => (
            <GapAccordion key={i} gap={gap} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const qc = useQueryClient();

  const { data: roadmaps = [], isLoading } = useQuery<Roadmap[]>({
    queryKey: ['roadmaps'],
    queryFn: () => api.get('/roadmap').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/roadmap/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roadmaps'] }),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Learning Roadmaps</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Skill gap analyses generated from your AI comparisons.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl gap-3">
          <Map size={28} className="text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">No roadmaps yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Run a comparison and click "Generate Roadmap" to create one.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmaps.map((r) => (
            <RoadmapCard
              key={r.id}
              roadmap={r}
              onDelete={() => deleteMutation.mutate(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
