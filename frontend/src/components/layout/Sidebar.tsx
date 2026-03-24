import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, ClipboardList, Map, LogOut, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/compare', icon: Sparkles, label: 'Compare & Tailor' },
  { to: '/tracker', icon: ClipboardList, label: 'Applications' },
  { to: '/roadmap', icon: Map, label: 'Roadmaps' },
];

interface Props {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 h-full border-r bg-card flex flex-col">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">tailorCV</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your application, optimized</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground truncate mb-3">{user?.name ?? user?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
