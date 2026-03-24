import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { AICompareResult, OriginalScore } from '@/pages/ComparePage';
import ModelCard from './ModelCard';
import { ClipboardList, Check, Loader2, ArrowRight, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  result: AICompareResult;
  originalScore: OriginalScore | null;
  jobDescriptionId: string;
}

const MODELS = [
  { key: 'gpt' as const, name: 'GPT-4o' },
  { key: 'claude' as const, name: 'Claude Sonnet' },
  { key: 'gemini' as const, name: 'Gemini 2.0 Flash' },
];

export default function ComparePanel({ result, originalScore, jobDescriptionId: _jobDescriptionId }: Props) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapSaved, setRoadmapSaved] = useState(false);
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
      navigate('/app/tracker', { state: { aiResultId: result.id } });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      await api.post('/roadmap', { aiResultId: result.id });
      setRoadmapSaved(true);
    } catch {
      alert('Failed to generate roadmap. Please try again.');
    } finally {
      setGeneratingRoadmap(false);
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
    activeModels.length === 2 ? 'sm:grid-cols-2' :
    'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">AI Results</h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {originalScore ? (
              <div className="flex items-center gap-1.5 text-sm flex-wrap">
                <span className="text-muted-foreground text-xs">Original:</span>
                <span className="font-semibold text-muted-foreground text-xs">{originalScore.score}</span>
                <ArrowRight size={11} className="text-muted-foreground" />
                <span className="text-muted-foreground text-xs">Best:</span>
                <span className={cn('font-bold text-sm', maxScore >= originalScore.score ? 'text-green-600' : 'text-red-500')}>
                  {maxScore}
                </span>
                {maxScore > originalScore.score && (
                  <span className="text-xs text-green-600 font-medium">(+{maxScore - originalScore.score})</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Best: <span className="font-bold text-foreground">{maxScore}%</span>
                {skippedModels.length > 0 && (
                  <span className="ml-2 opacity-60">· {skippedModels.map(m => m.name).join(', ')} not configured</span>
                )}
              </p>
            )}
          </div>
        </div>

        {selectedModel && (
          saved ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check size={13} />
              Saved!
              <button onClick={() => navigate('/app/tracker')} className="ml-1 text-primary underline underline-offset-4 text-xs">
                View tracker
              </button>
            </div>
          ) : (
            <button
              onClick={handleSaveApplication}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors shrink-0"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <ClipboardList size={13} />}
              {saving ? 'Saving...' : 'Save Application'}
            </button>
          )
        )}
      </div>

      {/* Model cards */}
      <div className={cn('grid grid-cols-1 gap-4', gridCols)}>
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

      {/* Roadmap action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl px-4 py-3 bg-muted/20">
        <div>
          <div className="flex items-center gap-2">
            <Map size={14} className="text-primary" />
            <span className="text-sm font-medium">Learning Roadmap</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Identify skill gaps and get a personalised study plan</p>
        </div>
        {roadmapSaved ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium shrink-0">
            <Check size={13} />
            Saved!
            <button onClick={() => navigate('/app/roadmap')} className="ml-1 text-primary underline underline-offset-4 text-xs">
              View roadmaps
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateRoadmap}
            disabled={generatingRoadmap}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors shrink-0"
          >
            {generatingRoadmap ? <Loader2 size={12} className="animate-spin" /> : <Map size={12} />}
            {generatingRoadmap ? 'Generating...' : 'Generate Roadmap'}
          </button>
        )}
      </div>
    </div>
  );
}
