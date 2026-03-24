import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import JobInputPanel from '@/components/jobs/JobInputPanel';
import ComparePanel from '@/components/ai/ComparePanel';
import { Loader2, TrendingUp } from 'lucide-react';

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

export default function ComparePage() {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [pendingJdId, setPendingJdId] = useState<string | null>(null);
  const [originalScore, setOriginalScore] = useState<OriginalScore | null>(null);
  const [scoringOriginal, setScoringOriginal] = useState(false);
  const [result, setResult] = useState<AICompareResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes]);

  const handleCompare = async (jobDescriptionId: string) => {
    if (!selectedResumeId) { setError('Please select a resume first'); return; }
    setError('');
    setResult(null);
    setOriginalScore(null);
    setPendingJdId(jobDescriptionId);

    // Score original resume first (non-blocking — runs in parallel with comparison)
    setScoringOriginal(true);
    setComparing(true);

    const [scoreRes, compareRes] = await Promise.allSettled([
      api.post('/ai/score', { resumeId: selectedResumeId, jobDescriptionId }),
      api.post('/ai/compare', { resumeId: selectedResumeId, jobDescriptionId }),
    ]);

    setScoringOriginal(false);
    setComparing(false);

    if (scoreRes.status === 'fulfilled') {
      setOriginalScore(scoreRes.value.data);
    }

    if (compareRes.status === 'fulfilled') {
      setResult(compareRes.value.data);
    } else {
      setError((compareRes.reason as any)?.response?.data?.error ?? 'Comparison failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold">Compare & Tailor</h2>
        <p className="text-muted-foreground mt-1">
          Run GPT-4o, Claude, and Gemini in parallel — pick the best result.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Select Resume</label>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Upload a resume on the dashboard first.</p>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— choose resume —</option>
                {resumes.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>
            )}
          </div>

          <JobInputPanel onJobReady={handleCompare} disabled={comparing || !selectedResumeId} />

          {/* Original score card */}
          {(scoringOriginal || originalScore) && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={13} className="text-muted-foreground" />
                <span className="text-xs font-medium">Original Resume Score</span>
              </div>
              {scoringOriginal ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={11} className="animate-spin" /> Scoring...
                </div>
              ) : originalScore && (
                <>
                  <p className="text-2xl font-bold">{originalScore.score}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                  <p className="text-xs text-muted-foreground mt-1 italic">{originalScore.summary}</p>
                </>
              )}
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="col-span-2">
          {comparing ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-muted-foreground">Running GPT-4o, Claude & Gemini in parallel...</p>
              <p className="text-xs text-muted-foreground">This takes 20–40 seconds</p>
            </div>
          ) : result ? (
            <ComparePanel result={result} originalScore={originalScore} jobDescriptionId={pendingJdId!} />
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">
                Select a resume and add a job description to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
