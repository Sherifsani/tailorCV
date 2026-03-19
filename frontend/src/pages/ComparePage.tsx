import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import JobInputPanel from '@/components/jobs/JobInputPanel';
import ComparePanel from '@/components/ai/ComparePanel';
import { Loader2 } from 'lucide-react';

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

export interface ModelOutput {
  fitScore: number;
  strengths: string[];
  gaps: string[];
  tailoredResume: string;
  coverLetter: string;
  reasoning: string;
}

export default function ComparePage() {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [result, setResult] = useState<AICompareResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  // Auto-select the first resume
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes]);

  const handleCompare = async (jobDescriptionId: string) => {
    if (!selectedResumeId) {
      setError('Please select a resume first');
      return;
    }
    setError('');
    setComparing(true);
    setResult(null);
    try {
      const res = await api.post('/ai/compare', { resumeId: selectedResumeId, jobDescriptionId });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Comparison failed');
    } finally {
      setComparing(false);
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
              <p className="text-sm text-muted-foreground">
                Upload a resume on the dashboard first.
              </p>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— choose resume —</option>
                {resumes.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.filename}
                  </option>
                ))}
              </select>
            )}
          </div>

          <JobInputPanel onJobReady={handleCompare} disabled={comparing || !selectedResumeId} />

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
            <ComparePanel result={result} />
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
