import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, static on desktop */}
      <div className={[
        'fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out',
        'lg:static lg:z-auto lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-card lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-primary" />
            <span className="font-semibold text-sm">tailorCV</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
