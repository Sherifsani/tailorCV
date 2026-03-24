import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, FileText, BarChart3, ClipboardList, Map,
  CheckCircle2, Zap, Brain, Target, TrendingUp, Star, Shield, Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Three AI models, one click',
    description: 'GPT-4o, Claude Sonnet, and Gemini 2.0 Flash run in parallel. Compare their outputs side-by-side and pick the best-tailored resume for each role.',
    gradient: 'from-yellow-400/20 to-orange-400/10',
    iconColor: 'text-yellow-500',
  },
  {
    icon: Target,
    title: 'Fit score before & after',
    description: 'See your original resume's match score against the JD, then watch it climb after AI tailoring. Know exactly where you stand before applying.',
    gradient: 'from-green-400/20 to-emerald-400/10',
    iconColor: 'text-green-500',
  },
  {
    icon: FileText,
    title: 'Download-ready PDFs',
    description: 'Three polished resume templates — Jake\'s, Classic, and Minimal. Edit the JSON, preview instantly, and export to PDF in one click.',
    gradient: 'from-blue-400/20 to-sky-400/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Brain,
    title: 'Learning roadmaps',
    description: 'AI identifies your exact skill gaps for each role and builds a prioritised study plan complete with specific resources and realistic timeframes.',
    gradient: 'from-purple-400/20 to-violet-400/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: ClipboardList,
    title: 'Application tracker',
    description: 'Drag-and-drop Kanban board to track every application across Applied, Screening, Interview, Offer, and Rejected columns.',
    gradient: 'from-pink-400/20 to-rose-400/10',
    iconColor: 'text-pink-500',
  },
  {
    icon: Map,
    title: 'Full application package',
    description: 'Get a tailored resume, cover letter, and interview prep guide — all generated from a single job description paste.',
    gradient: 'from-teal-400/20 to-cyan-400/10',
    iconColor: 'text-teal-500',
  },
];

const STEPS = [
  { step: '01', title: 'Upload your resume', description: 'Upload your existing PDF resume once. We extract the content and store it securely for future use.' },
  { step: '02', title: 'Paste or link a job', description: 'Paste the job description directly or drop the URL — we'll scrape it automatically.' },
  { step: '03', title: 'Compare AI results', description: 'Three models run in parallel in under a minute. Pick the version with the highest fit score.' },
  { step: '04', title: 'Download & apply', description: 'Export your tailored resume and cover letter as polished PDFs. Apply with confidence.' },
];

const TESTIMONIALS = [
  {
    quote: 'Went from an 8% interview rate to 32% after two weeks. The side-by-side AI comparison is unlike anything else.',
    author: 'Sarah K.',
    role: 'UX Designer',
    score: '+24%',
  },
  {
    quote: 'The fit score was eye-opening. My original resume scored 41 against the JD — after GPT-4o tailoring it hit 89.',
    author: 'Marcus T.',
    role: 'Software Engineer',
    score: '+48 pts',
  },
  {
    quote: 'Finally landed my dream role at a top tech company. The learning roadmap showed me exactly what to study in three weeks.',
    author: 'Priya R.',
    role: 'Data Scientist',
    score: 'Hired',
  },
];

const STATS = [
  { value: '3', label: 'AI models compared', icon: Sparkles },
  { value: '< 60s', label: 'Time to tailor', icon: Zap },
  { value: '3', label: 'Resume templates', icon: FileText },
  { value: '100%', label: 'Data private', icon: Shield },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="font-bold text-sm tracking-tight">tailorCV</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get started free
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-[20%] right-[-5%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-5%] left-[30%] w-56 h-56 bg-purple-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12 lg:pb-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border bg-muted/50 text-muted-foreground mb-6">
                <Sparkles size={11} className="text-primary" />
                GPT-4o · Claude Sonnet · Gemini 2.0 — in parallel
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Stop sending the same
                <span className="text-primary"> resume </span>
                to every job
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                tailorCV uses three AI models simultaneously to rewrite your resume for each job — scoring, tailoring, and packaging your application in under a minute.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm w-full sm:w-auto justify-center shadow-lg shadow-primary/25"
                >
                  Start for free
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 border px-6 py-3 rounded-xl font-medium hover:bg-accent transition-colors text-sm w-full sm:w-auto justify-center"
                >
                  Sign in
                </button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">No credit card required · Works with your own API keys</p>
            </div>

            {/* Right: visual mockup */}
            <div className="relative">
              {/* Browser chrome */}
              <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/40">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-3 bg-background/80 border rounded px-3 py-1 text-[11px] text-muted-foreground font-mono">
                    tailorcv.app/compare
                  </div>
                </div>

                {/* App content mock */}
                <div className="p-4">
                  {/* Score bar */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp size={12} />
                      Original score: <span className="font-semibold text-foreground">54</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      Best: 92 <span className="text-green-500 font-bold">(+38)</span>
                    </div>
                  </div>

                  {/* 3 model cards */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {[
                      { name: 'GPT-4o', score: 92, color: 'text-green-500', bg: 'bg-green-500', track: 'bg-green-100', w: '92%', badge: '🏆 Best' },
                      { name: 'Claude', score: 88, color: 'text-blue-500', bg: 'bg-blue-500', track: 'bg-blue-100', w: '88%', badge: null },
                      { name: 'Gemini', score: 85, color: 'text-purple-500', bg: 'bg-purple-500', track: 'bg-purple-100', w: '85%', badge: null },
                    ].map((m) => (
                      <div key={m.name} className="border rounded-xl p-3 bg-background hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-muted-foreground font-medium">{m.name}</p>
                          {m.badge && <span className="text-[9px] text-green-600 font-semibold">{m.badge}</span>}
                        </div>
                        <p className={`text-2xl font-black ${m.color}`}>{m.score}</p>
                        <div className={`h-1.5 ${m.track} rounded-full mt-2`}>
                          <div className={`h-1.5 ${m.bg} rounded-full`} style={{ width: m.w }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1.5">fit score / 100</p>
                      </div>
                    ))}
                  </div>

                  {/* Roadmap hint */}
                  <div className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Map size={12} className="text-primary" />
                      <span className="text-xs font-medium">3 skill gaps identified</span>
                    </div>
                    <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                      Generate Roadmap
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                +38 pts improvement
              </div>
              <div className="absolute -bottom-3 -left-3 bg-card border shadow-lg rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold">PDF Downloaded</p>
                  <p className="text-[9px] text-muted-foreground">Jake's template · 1 page</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-muted/30 mt-12 lg:mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon size={14} className="text-primary" />
                <p className="text-2xl sm:text-3xl font-bold">{value}</p>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border bg-muted/50 text-muted-foreground mb-4">
            <Zap size={11} className="text-primary" />
            Everything in one place
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Everything you need to land the role</h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">From resume tailoring to skill roadmaps — the complete job application toolkit.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, gradient, iconColor }) => (
            <div
              key={title}
              className="border rounded-xl p-5 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon size={18} className={iconColor} />
              </div>
              <h3 className="font-semibold text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" className="text-yellow-400" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Trusted by job seekers</h2>
            <p className="text-muted-foreground mt-2 text-sm">Real results from people who used tailorCV to land their next role.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, author, role, score }) => (
              <div key={author} className="bg-card border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {score}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{author}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
          <p className="text-muted-foreground mt-2 text-sm">From upload to application in four steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {STEPS.map(({ step, title, description }) => (
            <div key={step} className="flex gap-4 p-5 border rounded-xl bg-card hover:shadow-sm transition-shadow">
              <span className="text-3xl font-black text-primary/20 shrink-0 leading-none">{step}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="relative border rounded-2xl p-8 sm:p-12 bg-card overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-primary/8 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-blue-500/8 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <BarChart3 size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to tailor your first resume?</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-sm mx-auto leading-relaxed">
              Create an account, upload your resume, and paste your first job description in under 2 minutes.
            </p>
            <ul className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-5 mb-8 text-xs text-muted-foreground">
              {['Free to use', 'Works with your API keys', 'No data sold', 'Cancel anytime'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm mx-auto shadow-lg shadow-primary/20"
            >
              Get started free
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-semibold">tailorCV</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Built for job seekers who want every edge.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <button
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Sign in →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
