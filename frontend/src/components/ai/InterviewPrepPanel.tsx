import { useState } from 'react';
import { Loader2, Map, ChevronDown, ChevronUp, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapGap {
  skill: string;
  priority: 'critical' | 'important' | 'nice-to-have';
  why: string;
  steps: string[];
  resources: string[];
  timeframe: string;
}

interface LearningRoadmap {
  summary: string;
  gaps: RoadmapGap[];
}

const PRIORITY = {
  critical:       { label: 'Critical',       cls: 'bg-red-50 text-red-700 border-red-200',    bar: 'bg-red-400' },
  important:      { label: 'Important',      cls: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400' },
  'nice-to-have': { label: 'Nice to have',  cls: 'bg-blue-50 text-blue-700 border-blue-200',  bar: 'bg-blue-300' },
};

const getToken = () =>
  JSON.parse(localStorage.getItem('tailorcv-auth') ?? '{}')?.state?.token ?? '';

export default function InterviewPrepPanel({ resultId }: { resultId: string }) {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/ai/results/${resultId}/interview-prep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data: LearningRoadmap = await res.json();
      setRoadmap(data);
      setOpenIdx(0);
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <Map size={14} className="text-primary" />
          <span className="text-sm font-semibold">Learning Roadmap</span>
          {roadmap && (
            <span className="text-xs text-muted-foreground">· {roadmap.gaps.length} gap{roadmap.gaps.length !== 1 ? 's' : ''} identified</span>
          )}
        </div>
        {!roadmap && (
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Map size={12} />}
            {loading ? 'Generating...' : 'Generate Roadmap'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 text-xs text-destructive bg-destructive/5 border-b">
          {error}
        </div>
      )}

      {/* Idle state */}
      {!roadmap && !loading && !error && (
        <p className="text-xs text-muted-foreground px-4 py-3">
          Analyzes your resume against the JD and builds a concrete study plan to close skill gaps — with resources and timeframes.
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="p-4 space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {/* Roadmap */}
      {roadmap && (
        <div>
          {/* Summary */}
          <div className="px-4 py-3 bg-muted/20 border-b text-xs text-muted-foreground italic leading-relaxed">
            {roadmap.summary}
          </div>

          {/* Gap list */}
          <div className="divide-y">
            {roadmap.gaps.map((gap, i) => {
              const p = PRIORITY[gap.priority] ?? PRIORITY['nice-to-have'];
              const isOpen = openIdx === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    {/* Priority bar */}
                    <span className={cn('w-1 self-stretch rounded-full shrink-0', p.bar)} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{gap.skill}</span>
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', p.cls)}>
                          {p.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                          <Clock size={10} />
                          {gap.timeframe}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{gap.why}</p>
                    </div>

                    {isOpen ? <ChevronUp size={13} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={13} className="shrink-0 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-4">
                      {/* Steps */}
                      <div>
                        <p className="text-xs font-semibold mb-2 text-foreground">Action steps</p>
                        <ol className="space-y-1.5">
                          {gap.steps.map((step, j) => (
                            <li key={j} className="flex gap-2 text-xs text-muted-foreground">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-semibold">
                                {j + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Resources */}
                      <div>
                        <p className="text-xs font-semibold mb-2 text-foreground">Resources</p>
                        <ul className="space-y-1.5">
                          {gap.resources.map((res, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
