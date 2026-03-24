import { useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Link, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onJobReady: (jobDescriptionId: string) => void;
  disabled?: boolean;
}

type Mode = 'paste' | 'url';

export default function JobInputPanel({ onJobReady, disabled }: Props) {
  const [mode, setMode] = useState<Mode>('paste');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapeWarning, setScrapeWarning] = useState('');

  const handleSubmit = async () => {
    setError('');
    setScrapeWarning('');
    setLoading(true);
    try {
      let res;
      if (mode === 'url') {
        res = await api.post('/jobs/scrape', { url });
        if (res.data.success === false) {
          setScrapeWarning(res.data.reason ?? 'Could not scrape this page. Please paste the text manually.');
          return;
        }
      } else {
        res = await api.post('/jobs/manual', {
          text,
          title: title || undefined,
          company: company || undefined,
        });
      }
      onJobReady(res.data.id);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to process job description');
    } finally {
      setLoading(false);
    }
  };

  const isReady = mode === 'url' ? url.trim().length > 0 : text.trim().length > 10;

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-2">
        {(['paste', 'url'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              mode === m
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {m === 'url' ? <Link size={12} /> : <FileText size={12} />}
            {m === 'url' ? 'Job URL' : 'Paste Text'}
          </button>
        ))}
      </div>

      {mode === 'paste' ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title (optional)"
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company (optional)"
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the job description here..."
            rows={8}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.indeed.com/viewjob?jk=..."
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Works best with Indeed. LinkedIn may require manual paste.
          </p>
        </div>
      )}

      {scrapeWarning && (
        <p className="text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {scrapeWarning}
        </p>
      )}
      {error && (
        <p className="text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !isReady}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Processing...' : 'Analyze with AI'}
      </button>
    </div>
  );
}
