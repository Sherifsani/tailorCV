import { cn } from '@/lib/utils';

interface Props {
  score: number;
  size?: 'sm' | 'lg';
}

export default function FitScoreBadge({ score, size = 'sm' }: Props) {
  const color =
    score >= 75 ? 'text-green-700 bg-green-100 border-green-300' :
    score >= 50 ? 'text-amber-700 bg-amber-100 border-amber-300' :
    'text-red-700 bg-red-100 border-red-300';

  return (
    <span className={cn('font-bold border rounded-full inline-block text-center', color,
      size === 'lg' ? 'text-2xl px-4 py-1' : 'text-sm px-2.5 py-0.5'
    )}>
      {score}%
    </span>
  );
}
