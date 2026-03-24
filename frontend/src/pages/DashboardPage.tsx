import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ResumeUpload from '@/components/resume/ResumeUpload';
import ResumeList from '@/components/resume/ResumeList';
import {
  Sparkles, ClipboardList, Map, FileText, Trophy, Users,
  ArrowRight, TrendingUp, Zap, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  applied:   'bg-blue-400',
  screening: 'bg-purple-400',
  interview: 'bg-amber-400',
  offer:     'bg-green-400',
  rejected:  'bg-red-300',
};

const STATUS_LABEL: Record<string, string> = {
  applied: 'Applied', screening: 'Screening', interview: 'Interview',
  offer: 'Offer', rejected: 'Rejected',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: resumes = [], refetch } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ['applications'],
    queryFn: () => api.get('/tracker').then((r) => r.data),
  });

  const { data: roadmaps = [] } = useQuery<any[]>({
    queryKey: ['roadmaps'],
    queryFn: () => api.get('/roadmap').then((r) => r.data),
  });

  const interviewCount = applications.filter((a) => a.status === 'interview').length;
  const offerCount = applications.filter((a) => a.status === 'offer').length;
  const recentApps = applications.slice(0, 4);

  const stats = [
    {
      label: 'Resumes',
      value: resumes.length,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-l-blue-400',
      description: resumes.length === 1 ? '1 resume uploaded' : `${resumes.length} resumes uploaded`,
    },
    {
      label: 'Applications',
      value: applications.length,
      icon: ClipboardList,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-l-purple-400',
      description: 'tracked in pipeline',
    },
    {
      label: 'Interviews',
      value: interviewCount,
      icon: Users,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-l-amber-400',
      description: interviewCount > 0 ? 'active interviews' : 'keep applying!',
    },
    {
      label: 'Offers',
      value: offerCount,
      icon: Trophy,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-l-green-400',
      description: offerCount > 0 ? '🎉 Congratulations!' : 'offers received',
    },
  ];

  const quickActions = [
    {
      label: 'Tailor Resume',
      description: 'Compare GPT-4o, Claude & Gemini outputs side-by-side',
      icon: Sparkles,
      to: '/app/compare',
      primary: true,
      badge: 'Most popular',
    },
    {
      label: 'Application Tracker',
      description: 'Manage your job pipeline with drag-and-drop Kanban',
      icon: ClipboardList,
      to: '/app/tracker',
      primary: false,
      badge: null,
    },
    {
      label: 'Learning Roadmaps',
      description: 'Close skill gaps for your target roles with AI plans',
      icon: Map,
      to: '/app/roadmap',
      primary: false,
      badge: roadmaps.length > 0 ? `${roadmaps.length} saved` : null,
    },
  ];

  const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Welcome header */}
      <div className="relative overflow-hidden bg-card border rounded-2xl p-5 sm:p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-5%] w-48 h-48 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[40%] w-36 h-36 bg-blue-500/6 rounded-full blur-2xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Welcome back, {firstName} 👋
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {applications.length === 0
                ? "Let's land you that job. Upload a resume to get started."
                : `You have ${applications.length} application${applications.length === 1 ? '' : 's'} in your pipeline.`}
            </p>
          </div>
          <button
            onClick={() => navigate('/app/compare')}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 shadow-md shadow-primary/20"
          >
            <Zap size={14} />
            Tailor a Resume
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, border, description }) => (
          <div
            key={label}
            className={cn('bg-card border border-l-4 rounded-xl p-4', border)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 hidden sm:block">{description}</p>
          </div>
        ))}
      </div>

      {/* Onboarding banner — only if no resumes yet */}
      {resumes.length === 0 && (
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold">Get started in 3 steps</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              {[
                { n: 1, text: 'Upload your resume below' },
                { n: 2, text: 'Go to Compare & Tailor' },
                { n: 3, text: 'Download your tailored PDF' },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px] shrink-0">
                    {n}
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <CheckCircle2 size={32} className="text-primary/30 shrink-0 hidden sm:block" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Your Resumes</h3>
            {resumes.length > 0 && (
              <span className="text-xs text-muted-foreground">{resumes.length} file{resumes.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <ResumeUpload onUploaded={refetch} />
          <ResumeList resumes={resumes} onDeleted={refetch} />
        </div>

        {/* Right column: quick actions + recent apps */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map(({ label, description, icon: Icon, to, primary, badge }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left hover:-translate-y-0.5',
                    primary
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20'
                      : 'border bg-card hover:bg-accent hover:shadow-sm'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    primary ? 'bg-white/20' : 'bg-muted'
                  )}>
                    <Icon size={16} className={primary ? 'text-white' : 'text-muted-foreground'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{label}</p>
                      {badge && (
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
                          primary ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                        )}>
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className={cn('text-xs mt-0.5 truncate', primary ? 'text-white/75' : 'text-muted-foreground')}>
                      {description}
                    </p>
                  </div>
                  <ArrowRight size={14} className={primary ? 'text-white/60' : 'text-muted-foreground'} />
                </button>
              ))}
            </div>
          </div>

          {/* Recent applications */}
          {recentApps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Recent Applications</h3>
                <button
                  onClick={() => navigate('/app/tracker')}
                  className="text-xs text-primary hover:underline underline-offset-4"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-2">
                {recentApps.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => navigate('/app/tracker')}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">
                        {app.company?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{app.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('w-2 h-2 rounded-full', STATUS_COLOR[app.status] ?? 'bg-gray-300')} />
                      <span className="text-xs text-muted-foreground">{STATUS_LABEL[app.status] ?? app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips card if no applications */}
          {applications.length === 0 && resumes.length > 0 && (
            <div className="border rounded-xl p-4 bg-card space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                <p className="text-sm font-semibold">Pro tip</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                After tailoring a resume in Compare & Tailor, hit "Save Application" to automatically add it to your tracker with the company and role pre-filled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
