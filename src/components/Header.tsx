import React from 'react';
import {
  ShieldAlert,
  Utensils,
  PhoneCall,
  Store,
  GraduationCap,
  HeartHandshake,
  Cpu,
  Code2,
  Key,
  Sun,
  Moon,
} from 'lucide-react';
import { lindaStore } from '../services/lindaService';

export type NavTab =
  | 'student'
  | 'ussd'
  | 'vendor'
  | 'dean'
  | 'donor'
  | 'playground'
  | 'architecture';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  totalMealsServed: number;
  criticalCount: number;
  onOpenAuthModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  totalMealsServed,
  criticalCount,
  onOpenAuthModal,
  isDarkMode,
  onToggleTheme,
}) => {
  const session = lindaStore.currentUserSession;

  return (
    <header className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] sticky top-0 z-40 backdrop-blur transition-colors">
      {/* Top Banner with Clean Live Counters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-sage)] animate-pulse" />
            <span className="text-[var(--text-muted)] font-medium tracking-wide">
              Student Welfare, Nutrition Access & Bursary Support
            </span>
          </div>
        </div>

        {/* Live Counters: ONLY Meals Served & Critical Students (No Escrow here) */}
        <div className="flex items-center gap-5 text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
            <span>Meals Served:</span>
            <span className="font-semibold text-[var(--text-primary)] font-mono">
              {totalMealsServed.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Students Flagged:</span>
            <span className="font-semibold text-rose-500 font-mono">{criticalCount}</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onSelectTab('student')}
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-sage)] shadow-sm">
              <span className="font-editorial text-xl font-bold italic">LN</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">LindaNyota</h1>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Early-Intervention Campus Meals & Bursary Allocation
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 py-1 rounded-lg bg-[var(--accent-sage)] text-[var(--accent-sage-text)] text-[10px] font-bold"
            >
              Account
            </button>
          </div>
        </div>

        {/* Tab Buttons, Theme Toggle & Auth */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => onSelectTab('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'student'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Student Pass
            </button>

            <button
              onClick={() => onSelectTab('ussd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'ussd'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              USSD (*384#)
            </button>

            <button
              onClick={() => onSelectTab('vendor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'vendor'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Merchant PoS
            </button>

            <button
              onClick={() => onSelectTab('dean')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'dean'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Dean & Welfare
            </button>

            <button
              onClick={() => onSelectTab('donor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'donor'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Donors (from KES 50)
            </button>

            <button
              onClick={() => onSelectTab('playground')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'playground'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Vulnerability Index
            </button>

            <button
              onClick={() => onSelectTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'architecture'
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              System Specs
            </button>
          </nav>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="hidden md:flex p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-sage)] transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          {/* Onboarding & Auth CTA */}
          <button
            onClick={onOpenAuthModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
            <span>{session ? session.user.name.split(' ')[0] : 'Sign In'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
