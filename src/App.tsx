/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { USSDSimulator } from './components/USSDSimulator';
import { VendorPoS } from './components/VendorPoS';
import { DeanAdminDashboard } from './components/DeanAdminDashboard';
import { DonorPortal } from './components/DonorPortal';
import { FVIModelPlayground } from './components/FVIModelPlayground';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';
import { lindaStore } from './services/lindaService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('student');
  const [vendorInitialToken, setVendorInitialToken] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ln_theme') === 'dark';
    }
    return false;
  });
  const [, setSessionTick] = useState(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ln_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ln_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleGoToVendorPoS = (token: string) => {
    setVendorInitialToken(token);
    setCurrentTab('vendor');
  };

  const criticalCount = lindaStore.students.filter(
    (s) => s.riskCategory === 'CRITICAL'
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalMealsServed={lindaStore.totalMealsServedCounter}
        criticalCount={criticalCount}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'student' && (
          <StudentPortal
            onGoToVendorPoS={handleGoToVendorPoS}
            onGoToUSSD={() => setCurrentTab('ussd')}
          />
        )}

        {currentTab === 'ussd' && <USSDSimulator />}

        {currentTab === 'vendor' && <VendorPoS initialToken={vendorInitialToken} />}

        {currentTab === 'dean' && <DeanAdminDashboard />}

        {currentTab === 'donor' && <DonorPortal />}

        {currentTab === 'playground' && <FVIModelPlayground />}

        {currentTab === 'architecture' && <ArchitectureExplorer />}
      </main>

      {/* Onboarding & Authentication Modal */}
      <AuthOnboardingModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSessionUpdated={() => setSessionTick((prev) => prev + 1)}
      />

      {/* Footer with clean branding */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-6 text-xs text-[var(--text-muted)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">LindaNyota</span>
            <span>·</span>
            <span>Kenyan University Student Emergency Meal & Bursary Support</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <span>USSD (*384#) Access</span>
            <span>·</span>
            <span>Instant Merchant Settlement</span>
            <span>·</span>
            <span>Data Protection & Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


