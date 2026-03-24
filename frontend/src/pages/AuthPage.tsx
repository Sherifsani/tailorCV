import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const switchMode = () => {
    setError('');
    reset();
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post(`/auth/${mode}`, data);
      setAuth(res.data.token, res.data.user);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0f172a] text-white p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-2">
          <Sparkles size={20} className="text-blue-400" />
          <span className="text-lg font-semibold tracking-tight">tailorCV</span>
        </div>

        <div className="relative space-y-8">
          <blockquote className="text-2xl font-medium leading-snug text-white/90">
            "Stop sending the same resume to every job. Let AI make every application your best one."
          </blockquote>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'Three AI models compared side-by-side',
              'Before & after fit score for every role',
              'Download-ready PDFs in one click',
              'Skill gap roadmaps to close the gap fast',
              'Kanban board to track your pipeline',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 text-xs text-white/40">
            <span className="px-2 py-1 rounded border border-white/10 bg-white/5">GPT-4o</span>
            <span className="px-2 py-1 rounded border border-white/10 bg-white/5">Claude Sonnet</span>
            <span className="px-2 py-1 rounded border border-white/10 bg-white/5">Gemini 2.0</span>
          </div>
        </div>

        <div className="relative flex gap-6 text-xs text-white/30">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex items-center justify-center px-6 py-12 bg-background overflow-hidden">
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1.5' fill='%23cbd5e1'/%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px',
          }}
        />
        {/* fade edges */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background pointer-events-none" />
        <div className="relative w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles size={18} className="text-primary" />
            <span className="text-lg font-semibold">tailorCV</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to your account to continue'
                : 'Get started — it only takes a minute'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full name</label>
                <input
                  {...register('name')}
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
              />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors mt-2"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isSubmitting
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
