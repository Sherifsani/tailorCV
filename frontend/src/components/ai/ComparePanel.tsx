import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { AICompareResult } from '@/pages/ComparePage';
import ModelCard from './ModelCard';
import { ClipboardList } from 'lucide-react';
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
  const navigate = useNavigate();

  const handleSelect = async (model: string) => {
    setSelectedModel(model);
    await api.patch(`/ai/results/${result.id}/select`, { model });
  };

  // Only show models that actually ran (filter out "not configured" ones)
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
          <button
            onClick={() => navigate('/tracker', { state: { aiResultId: result.id } })}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <ClipboardList size={14} />
            Save Application
          </button>
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
