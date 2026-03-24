import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Map, ChevronDown, ChevronUp, Trash2, Clock, ExternalLink,
  Building2, Calendar, AlertCircle, TrendingUp, Sparkles,
} from 'lucide-react';
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
  critical:       { label: 'Critical',      cls: 'bg-red-50 text-red-700 border-red-200',       bar: 'bg-red-400',    dot: 'bg-red-400' },
  important:      { label: 'Important',     cls: 'bg-amber-50 text-amber-700 border-amber-200',  bar: 'bg-amber-400',  dot: 'bg-amber-400' },
  'nice-to-have': { label: 'Nice to have', cls: 'bg-blue-50 text-blue-700 border-blue-200',     bar: 'bg-blue-300',   dot: 'bg-blue-300' },
};

function GapAccordion({ gap, defaultOpen = false }: { gap: RoadmapGap; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const p = PRIORITY[gap.priority] ?? PRIORITY['nice-to-have'];

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className={cn('w-1 self-stretch rounded-full shrink-0', p.bar)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{gap.skill}</span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md border', p.cls)}>
              {p.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto shrink-0">
              <Clock size={9} />{gap.timeframe}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{gap.why}</p>
        </div>
        {open
          ? <ChevronUp size={13} className="shrink-0 text-muted-foreground" />
          : <ChevronDown size={13} className="shrink-0 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-muted/10 border-t">
          {/* Why */}
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Why it matters</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{gap.why}</p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">Action steps</p>
            <ol className="space-y-2">
              {gap.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-muted-foreground">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">Resources</p>
            <ul className="space-y-2">
              {gap.resources.map((res, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ExternalLink size={10} className="shrink-0 mt-1 text-primary/60" />
                  <span className="leading-relaxed">{res}</span>
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
  const importantCount = roadmap.gaps.filter((g) => g.priority === 'important').length;

  return (
    <div className="border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
      <div className="p-5 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {roadmap.jobTitle
                ? <span className="text-base font-bold">{roadmap.jobTitle}</span>
                : <span className="text-base font-bold text-muted-foreground">Untitled Roadmap</span>
              }
              {roadmap.company && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  <Building2 size={10} />{roadmap.company}
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar size={9} />{new Date(roadmap.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-muted-foreground">{roadmap.gaps.length} skill gaps</span>
              {criticalCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600">
                  <AlertCircle size={9} />{criticalCount} critical
                </span>
              )}
              {importantCount > 0 && (
                <span className="text-[10px] font-semibold text-amber-600">{importantCount} important</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              {expanded ? 'Collapse' : 'View Plan'}
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic mt-3 leading-relaxed border-l-2 border-muted pl-3">
          {roadmap.summary}
        </p>

        {/* Priority pills */}
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {roadmap.gaps.map((g, i) => {
            const p = PRIORITY[g.priority] ?? PRIORITY['nice-to-have'];
            return (
              <span key={i} className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', p.cls)}>
                {g.skill}
              </span>
            );
          })}
        </div>

        {/* Gap breakdown bar */}
        {roadmap.gaps.length > 0 && (
          <div className="mt-3 flex h-1.5 rounded-full overflow-hidden gap-0.5">
            {criticalCount > 0 && (
              <div className="bg-red-400 rounded-full" style={{ width: `${(criticalCount / roadmap.gaps.length) * 100}%` }} />
            )}
            {importantCount > 0 && (
              <div className="bg-amber-400 rounded-full" style={{ width: `${(importantCount / roadmap.gaps.length) * 100}%` }} />
            )}
            {(roadmap.gaps.length - criticalCount - importantCount) > 0 && (
              <div className="bg-blue-300 rounded-full flex-1" />
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="p-5 space-y-2.5 bg-muted/5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Learning Plan — {roadmap.gaps.length} items
          </p>
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

  const totalGaps = roadmaps.reduce((sum, r) => sum + r.gaps.length, 0);
  const totalCritical = roadmaps.reduce((sum, r) => sum + r.gaps.filter((g) => g.priority === 'critical').length, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Learning Roadmaps</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          AI-generated skill gap analyses tied to your target roles.
        </p>
      </div>

      {/* Summary stats — only when roadmaps exist */}
      {roadmaps.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Roadmaps', value: roadmaps.length, icon: Map, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Skill Gaps', value: totalGaps, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Critical', value: totalCritical, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl gap-4 bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Map size={24} className="text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground">No roadmaps yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs leading-relaxed">
              Go to Compare & Tailor, run a comparison against a job description, then click "Generate Roadmap" to create your first plan.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border rounded-xl px-4 py-2.5">
            <Sparkles size={12} className="text-primary" />
            AI identifies your exact skill gaps for each role
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
