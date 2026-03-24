import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ResumeUpload from '@/components/resume/ResumeUpload';
import ResumeList from '@/components/resume/ResumeList';
import { Sparkles, ClipboardList, Map } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: resumes = [], refetch } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.get('/tracker').then((r) => r.data),
  });

  const stats = [
    { label: 'Resumes', value: resumes.length },
    { label: 'Applications', value: applications.length },
    { label: 'Interviews', value: applications.filter((a: any) => a.status === 'interview').length },
    { label: 'Offers', value: applications.filter((a: any) => a.status === 'offer').length },
  ];

  const quickActions = [
    {
      label: 'Tailor Resume',
      description: 'Compare GPT, Claude & Gemini outputs',
      icon: Sparkles,
      to: '/compare',
      primary: true,
    },
    {
      label: 'View Applications',
      description: 'Track your job pipeline',
      icon: ClipboardList,
      to: '/tracker',
      primary: false,
    },
    {
      label: 'Learning Roadmaps',
      description: 'Close skill gaps for your target roles',
      icon: Map,
      to: '/roadmap',
      primary: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">
          Welcome back, {user?.name ?? user?.email?.split('@')[0]}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">Let's get you that job.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-card border rounded-xl p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumes */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Your Resumes</h3>
          <ResumeUpload onUploaded={refetch} />
          <ResumeList resumes={resumes} onDeleted={refetch} />
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map(({ label, description, icon: Icon, to, primary }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={[
                  'w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left',
                  primary
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border bg-card hover:bg-accent',
                ].join(' ')}
              >
                <Icon size={18} className={primary ? '' : 'text-muted-foreground'} />
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className={['text-xs mt-0.5', primary ? 'opacity-75' : 'text-muted-foreground'].join(' ')}>
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
