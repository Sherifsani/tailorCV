import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { AICompareResult } from '@/pages/ComparePage';
import ModelCard from './ModelCard';
import { ClipboardList, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  result: AICompareResult;
}

const MODELS = [
  { key: 'gpt' as const, name: 'GPT-4o' },
  { key: 'claude' as const, name: 'Claude Sonnet' },
  { key: 'gemini' as const, name: 'Gemini 2.0 Flash' },
];

export default function ComparePanel({ result }: Props) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const handleSelect = async (model: string) => {
    setSelectedModel(model);
    await api.patch(`/ai/results/${result.id}/select`, { model });
  };

  const handleSaveApplication = async () => {
    setSaving(true);
    try {
      await api.post('/tracker/from-result', { aiResultId: result.id });
      setSaved(true);
    } catch {
      navigate('/tracker', { state: { aiResultId: result.id } });
    } finally {
      setSaving(false);
    }
  };

  const activeModels = MODELS.filter(
    (m) => !(result[m.key].error?.toLowerCase().includes('not configured'))
  );

  const skippedModels = MODELS.filter(
    (m) => result[m.key].error?.toLowerCase().includes('not configured')
  );

  const maxScore = Math.max(...activeModels.map((m) => result[m.key].data?.fitScore ?? 0));

  const gridCols =
    activeModels.length === 1 ? 'grid-cols-1 max-w-md' :
    activeModels.length === 2 ? 'grid-cols-2' :
    'grid-cols-3';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI Results</h3>
          <p className="text-xs text-muted-foreground">
            Fit score: <span className="font-bold text-foreground">{maxScore}%</span>
            {skippedModels.length > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                · {skippedModels.map(m => m.name).join(', ')} not configured
              </span>
            )}
          </p>
        </div>
        {selectedModel && (
          saved ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check size={14} />
              Saved!
              <button
                onClick={() => navigate('/tracker')}
                className="ml-2 text-primary underline underline-offset-4 text-xs"
              >
                View in tracker
              </button>
            </div>
          ) : (
            <button
              onClick={handleSaveApplication}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <ClipboardList size={14} />}
              {saving ? 'Saving...' : 'Save Application'}
            </button>
          )
        )}
      </div>

      <div className={cn('grid gap-4', gridCols)}>
        {activeModels.map(({ key, name }) => (
          <ModelCard
            key={key}
            modelKey={key}
            modelName={name}
            result={result[key]}
            resultId={result.id}
            isSelected={selectedModel === key}
            onSelect={() => handleSelect(key)}
          />
        ))}
      </div>
    </div>
  );
}
