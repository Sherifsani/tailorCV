import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ResumeUpload from '@/components/resume/ResumeUpload';
import ResumeList from '@/components/resume/ResumeList';
import { Sparkles } from 'lucide-react';

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

  const stats = {
    resumes: resumes.length,
    applications: applications.length,
    interviews: applications.filter((a: any) => a.status === 'interview').length,
    offers: applications.filter((a: any) => a.status === 'offer').length,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name ?? user?.email}</h2>
        <p className="text-muted-foreground mt-1">Let's get you that job.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Resumes', value: stats.resumes },
          { label: 'Applications', value: stats.applications },
          { label: 'Interviews', value: stats.interviews },
          { label: 'Offers', value: stats.offers },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border rounded-lg p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Resumes</h3>
          <ResumeUpload onUploaded={refetch} />
          <ResumeList resumes={resumes} onDeleted={refetch} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <button
            onClick={() => navigate('/compare')}
            className="w-full flex items-center gap-3 p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Sparkles size={20} />
            <div className="text-left">
              <p className="font-medium">Tailor Resume</p>
              <p className="text-xs opacity-80">Compare GPT, Claude & Gemini outputs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
