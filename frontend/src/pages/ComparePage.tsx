import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import JobInputPanel from '@/components/jobs/JobInputPanel';
import ComparePanel from '@/components/ai/ComparePanel';
import { Loader2, TrendingUp, Sparkles, FileText, ClipboardList, Map, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AICompareResult {
  id: string;
  gpt: ModelResult;
  claude: ModelResult;
  gemini: ModelResult;
}

export interface ModelResult {
  data: ModelOutput | null;
  error: string | null;
}

export interface ResumeData {
  name: string;
  contact: string[];
  sections: Array<{
    title: string;
    items: unknown[];
  }>;
}

export interface ModelOutput {
  fitScore: number;
  strengths: string[];
  gaps: string[];
  resume: ResumeData;
  coverLetter: string;
  reasoning: string;
}

export interface OriginalScore {
  score: number;
  summary: string;
}

const TIPS = [
  { icon: FileText, tip: 'Use a focused 1-page resume for the best AI tailoring results.' },
  { icon: Sparkles, tip: 'Models score independently — the highest fit wins, not the most verbose.' },
  { icon: Map, tip: 'After comparing, generate a Learning Roadmap to close skill gaps fast.' },
  { icon: ClipboardList, tip: 'Save applications to the Tracker directly from compare results.' },
];

const LOADING_MSGS = [
  'Sending to GPT-4o…',
  'Sending to Claude Sonnet…',
  'Sending to Gemini 2.0 Flash…',
  'Scoring fit against JD…',
  'Compiling results…',
];

export default function ComparePage() {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [pendingJdId, setPendingJdId] = useState<string | null>(null);
  const [originalScore, setOriginalScore] = useState<OriginalScore | null>(null);
  const [scoringOriginal, setScoringOriginal] = useState(false);
  const [result, setResult] = useState<AICompareResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes]);

  // Cycle loading messages while comparing
  useEffect(() => {
    if (!comparing) return;
    setLoadingMsgIdx(0);
    const iv = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MSGS.length);
    }, 4000);
    return () => clearInterval(iv);
  }, [comparing]);

  const handleCompare = async (jobDescriptionId: string) => {
    if (!selectedResumeId) { setError('Please select a resume first'); return; }
    setError('');
    setResult(null);
    setOriginalScore(null);
    setPendingJdId(jobDescriptionId);
    setScoringOriginal(true);
    setComparing(true);

    const [scoreRes, compareRes] = await Promise.allSettled([
      api.post('/ai/score', { resumeId: selectedResumeId, jobDescriptionId }),
      api.post('/ai/compare', { resumeId: selectedResumeId, jobDescriptionId }),
    ]);

    setScoringOriginal(false);
    setComparing(false);

    if (scoreRes.status === 'fulfilled') setOriginalScore(scoreRes.value.data);
    if (compareRes.status === 'fulfilled') {
      setResult(compareRes.value.data);
    } else {
      setError((compareRes.reason as any)?.response?.data?.error ?? 'Comparison failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Compare & Tailor</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Run GPT-4o, Claude Sonnet, and Gemini 2.0 Flash in parallel — pick the best result.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Resume selector */}
          <div>
            <label className="text-sm font-medium block mb-2">Select Resume</label>
            {resumes.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-4 text-center space-y-2">
                <FileText size={24} className="text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
                <p className="text-xs text-muted-foreground/60">Go to Dashboard to upload a resume first.</p>
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="">— choose resume —</option>
                {resumes.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>
            )}
          </div>

          <JobInputPanel onJobReady={handleCompare} disabled={comparing || !selectedResumeId} />

          {/* Original score */}
          {(scoringOriginal || originalScore) && (
            <div className="border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                  <TrendingUp size={12} className="text-muted-foreground" />
                </div>
                <span className="text-xs font-semibold">Original Resume Score</span>
              </div>
              {scoringOriginal ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={11} className="animate-spin" /> Scoring your resume…
                </div>
              ) : originalScore && (
                <>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-4xl font-black">{originalScore.score}</p>
                    <p className="text-sm text-muted-foreground mb-1">/100</p>
                    <div className="flex-1 mb-2">
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all',
                            originalScore.score >= 70 ? 'bg-green-500' :
                            originalScore.score >= 50 ? 'bg-amber-500' : 'bg-red-400'
                          )}
                          style={{ width: `${originalScore.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {originalScore.summary}
                  </p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Tips */}
          {!result && !comparing && (
            <div className="border rounded-xl p-4 bg-card space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tips</p>
              <div className="space-y-3">
                {TIPS.map(({ icon: Icon, tip }, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={10} className="text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {comparing ? (
            <div className="flex flex-col items-center justify-center h-72 gap-5 border-2 border-dashed rounded-2xl bg-muted/10">
              {/* Model indicators */}
              <div className="flex items-center gap-3">
                {[
                  { name: 'GPT-4o', color: 'bg-green-400' },
                  { name: 'Claude', color: 'bg-blue-400' },
                  { name: 'Gemini', color: 'bg-purple-400' },
                ].map(({ name, color }) => (
                  <div key={name} className="flex flex-col items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full animate-pulse', color)} />
                    <span className="text-[10px] text-muted-foreground">{name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">{LOADING_MSGS[loadingMsgIdx]}</p>
              </div>
              <p className="text-xs text-muted-foreground">Typically takes 20–40 seconds</p>
            </div>
          ) : result ? (
            <ComparePanel result={result} originalScore={originalScore} jobDescriptionId={pendingJdId!} />
          ) : (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-2xl gap-4 bg-muted/10 px-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles size={24} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Ready to tailor</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Select a resume, paste or link a job description, and three AI models will tailor it simultaneously.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />GPT-4o
                </span>
                <ArrowRight size={10} />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />Claude
                </span>
                <ArrowRight size={10} />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />Gemini
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
