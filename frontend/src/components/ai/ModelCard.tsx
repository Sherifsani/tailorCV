import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertCircle } from 'lucide-react';
import { ModelResult } from '@/pages/ComparePage';
import FitScoreBadge from './FitScoreBadge';
import { cn } from '@/lib/utils';

interface Props {
  modelName: string;
  modelKey: 'gpt' | 'claude' | 'gemini';
  result: ModelResult;
  isSelected: boolean;
  onSelect: () => void;
}

const MODEL_COLORS = {
  gpt: 'border-t-[#10a37f]',
  claude: 'border-t-[#d97706]',
  gemini: 'border-t-[#4285f4]',
};

export default function ModelCard({ modelName, modelKey, result, isSelected, onSelect }: Props) {
  const [expanded, setExpanded] = useState<'resume' | 'cover' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (result.error) {
    return (
      <div className="border rounded-lg p-4 border-t-4 border-t-red-300">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-sm font-semibold">{modelName}</span>
        </div>
        <p className="text-xs text-red-600">{result.error}</p>
      </div>
    );
  }

  const data = result.data!;

  return (
    <div className={cn('border rounded-lg border-t-4 overflow-hidden', MODEL_COLORS[modelKey],
      isSelected && 'ring-2 ring-primary'
    )}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{modelName}</span>
          <FitScoreBadge score={data.fitScore} size="lg" />
        </div>

        <p className="text-xs text-muted-foreground italic">{data.reasoning}</p>

        <div className="space-y-1">
          <p className="text-xs font-medium text-green-700">Strengths</p>
          <ul className="space-y-0.5">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-green-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-red-700">Gaps</p>
          <ul className="space-y-0.5">
            {data.gaps.map((g, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-red-400 mt-0.5">-</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        {(['resume', 'cover'] as const).map((section) => {
          const isOpen = expanded === section;
          const content = section === 'resume' ? data.tailoredResume : data.coverLetter;
          const label = section === 'resume' ? 'Tailored Resume' : 'Cover Letter';

          return (
            <div key={section} className="border-b last:border-b-0">
              <button
                onClick={() => setExpanded(isOpen ? null : section)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium hover:bg-muted/50 transition-colors"
              >
                {label}
                {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  <div className="relative">
                    <pre className="text-xs bg-muted rounded p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {content}
                    </pre>
                    <button
                      onClick={() => copy(content, `${modelKey}-${section}`)}
                      className="absolute top-2 right-2 p-1 bg-background border rounded text-muted-foreground hover:text-foreground"
                    >
                      {copied === `${modelKey}-${section}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t bg-muted/30">
        <button
          onClick={onSelect}
          className={cn(
            'w-full py-1.5 rounded-md text-xs font-medium transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-background border hover:bg-accent'
          )}
        >
          {isSelected ? 'Selected' : 'Use This Version'}
        </button>
      </div>
    </div>
  );
}
