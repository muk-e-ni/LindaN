import React, { useState, useEffect } from 'react';
import {
  Utensils,
  History,
  FilePlus,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  Copy,
  Wifi,
  ChevronRight,
  ShieldCheck,
  Building,
  MapPin,
  Send,
  CreditCard,
  Store,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  Student,
  Vendor,
  MenuItem,
  MealVoucher,
  HardshipReport,
  HardshipCategory,
} from '../types/lindanyota';
import { lindaStore, CAMPUS_MENU_ITEMS } from '../services/lindaService';

interface StudentPortalProps {
  onGoToVendorPoS?: (token: string) => void;
  onGoToUSSD?: () => void;
}

type SubTab = 'pass' | 'history' | 'hardship' | 'fvi' | 'bursaries';

export const StudentPortal: React.FC<StudentPortalProps> = ({ onGoToVendorPoS, onGoToUSSD }) => {
  const [students, setStudents] = useState<Student[]>(lindaStore.students);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('pass');
  const [activeVoucher, setActiveVoucher] = useState<MealVoucher | null>(null);

  // Vendor & Menu selection
  const [selectedVendorId, setSelectedVendorId] = useState<string>(lindaStore.vendors[0]?.id || 'vnd-001');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
  const [canAffordCopay, setCanAffordCopay] = useState<boolean>(true);

  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isPayingCopay, setIsPayingCopay] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(0);
  const [copiedToken, setCopiedToken] = useState(false);
  const [nfcTapped, setNfcTapped] = useState(false);

  // Self-report hardship form
  const [hardshipCategory, setHardshipCategory] = useState<HardshipCategory>('HELB_DELAY');
  const [hardshipTitle, setHardshipTitle] = useState('');
  const [hardshipDescription, setHardshipDescription] = useState('');
  const [hardshipImpactKes, setHardshipImpactKes] = useState('15000');
  const [isSubmittingHardship, setIsSubmittingHardship] = useState(false);

  const student = students.find((s) => s.id === selectedStudentId) || students[0];
  const selectedVendor = lindaStore.vendors.find((v) => v.id === selectedVendorId) || lindaStore.vendors[0];

  // Vendor's actual menu items
  const vendorMenu: MenuItem[] =
    selectedVendor && selectedVendor.menu && selectedVendor.menu.length > 0
      ? selectedVendor.menu
      : CAMPUS_MENU_ITEMS;

  // Selected meal
  const selectedMeal: MenuItem =
    vendorMenu.find((m) => m.id === selectedMenuItemId && m.isAvailable) ||
    vendorMenu.find((m) => m.isAvailable) ||
    vendorMenu[0];

  // Default menu item if none selected or vendor changed
  useEffect(() => {
    if (vendorMenu.length > 0) {
      const available = vendorMenu.find((m) => m.isAvailable) || vendorMenu[0];
      setSelectedMenuItemId(available.id);
    }
  }, [selectedVendorId]);

  // Refresh active voucher for current student
  useEffect(() => {
    if (!student) return;
    const v = lindaStore.vouchers.find(
      (item) => item.studentId === student.id && item.status === 'ISSUED'
    );
    setActiveVoucher(v || null);
  }, [student, students]);

  // Countdown timer for 2-hour TTL
  useEffect(() => {
    if (!activeVoucher) {
      setTimeRemainingSec(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(activeVoucher.expiresAt).getTime() - Date.now()) / 1000)
      );
      setTimeRemainingSec(diff);
      if (diff === 0 && activeVoucher.status === 'ISSUED') {
        activeVoucher.status = 'EXPIRED';
        setActiveVoucher(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeVoucher]);

  // Check 24-hour limit
  const recent24hCount = lindaStore.vouchers.filter(
    (v) =>
      v.studentId === student.id &&
      new Date(v.issuedAt).getTime() >= Date.now() - 24 * 3600 * 1000
  ).length;

  const handleRequestVoucher = async () => {
    if (!student) return;
    setIsRequesting(true);
    setFeedback(null);

    const result = await lindaStore.requestMealVoucher(
      student.id,
      selectedVendorId,
      selectedMenuItemId,
      'WEB_APP',
      canAffordCopay
    );
    setIsRequesting(false);

    if (result.success && result.voucher) {
      setActiveVoucher(result.voucher);
      setStudents([...lindaStore.students]);
      setFeedback({
        message: `Meal pass issued for '${result.voucher.mealName}' at ${result.voucher.vendorName}! Subsidy: KES ${result.voucher.subsidyKes}, Co-Pay: KES ${result.voucher.copayKes}. Valid for 2 hours.`,
        type: 'success',
      });
    } else {
      setFeedback({
        message: result.error || 'Failed to issue voucher.',
        type: 'error',
      });
    }
  };

  const handlePayCopay = () => {
    if (!activeVoucher) return;
    setIsPayingCopay(true);

    setTimeout(() => {
      const res = lindaStore.payVoucherCopay(activeVoucher.id, 'MPESA');
      setIsPayingCopay(false);
      if (res.success) {
        setActiveVoucher({ ...activeVoucher, copayStatus: 'PAID' });
        setFeedback({
          message: res.message,
          type: 'success',
        });
      }
    }, 700);
  };

  const handleAddHardshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hardshipTitle.trim() || !hardshipDescription.trim()) {
      setFeedback({
        message: 'Please provide both a title and description for your emergency circumstance.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingHardship(true);
    const res = lindaStore.addStudentHardship(
      student.id,
      hardshipCategory,
      hardshipTitle,
      hardshipDescription,
      parseFloat(hardshipImpactKes) || 0
    );
    setIsSubmittingHardship(false);

    if (res.success) {
      setStudents([...lindaStore.students]);
      setHardshipTitle('');
      setHardshipDescription('');
      setFeedback({
        message: res.message,
        type: 'success',
      });
      setActiveSubTab('fvi');
    } else {
      setFeedback({
        message: res.message,
        type: 'error',
      });
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const voucherHistory = lindaStore.getStudentVoucherHistory(student.id);

  const matchingBursaries = lindaStore.bursaries.filter(
    (b) =>
      b.targetConstituency?.toLowerCase() === student.constituency.toLowerCase() ||
      b.targetCounty?.toLowerCase() === student.countyOfOrigin.toLowerCase() ||
      b.type === 'ALUMNI'
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Student Profile Card */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-7 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-sage)]" />
              <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-muted)]">
                Student Portal · {student.universityId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {student.fullName} <span className="font-editorial italic font-normal text-[var(--accent-sage)]">({student.regNo})</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Constituency: {student.constituency} · Home County: {student.countyOfOrigin} · HEF Band {student.hefBand}
            </p>
          </div>

          {/* Persona Switcher & Usage Guard Indicator */}
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Switch Persona:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setFeedback(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName.split(' ')[0]} ({s.universityId} · Band {s.hefBand})
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Usage Limit Badge (Max 2 Meals/Day) */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px]">
              <span className="text-[var(--text-muted)]">Daily Allocation:</span>
              <span className={`font-bold font-mono ${recent24hCount >= 2 ? 'text-amber-500' : 'text-[var(--accent-sage)]'}`}>
                {recent24hCount} of 2 Meals Used Today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border-color)]">
        {[
          { id: 'pass', label: 'Meal Pass', icon: Utensils },
          { id: 'history', label: `Transaction History (${voucherHistory.length})`, icon: History },
          { id: 'hardship', label: 'Report Emergency Hardship', icon: FilePlus },
          { id: 'fvi', label: 'Welfare Index', icon: Activity },
          { id: 'bursaries', label: 'Bursary Matching', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: EMERGENCY MEAL PASS (VENDOR SELECTION, MENU CHOICE & CO-PAY)
      ========================================================================= */}
      {activeSubTab === 'pass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] text-[var(--accent-sage)] flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">Emergency Meal Pass</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Max 2 Meals / 24 Hours</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                  Co-Pay Enabled
                </span>
              </div>

              {activeVoucher ? (
                /* Active Voucher Card */
                <div className="bg-[var(--bg-secondary)] border-2 border-[var(--accent-sage)]/50 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-[var(--border-color)] pb-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Active Voucher #{activeVoucher.token}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expires in: {formatCountdown(timeRemainingSec)}</span>
                    </div>
                  </div>

                  {/* Meal Breakdown & Target Vendor */}
                  <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[var(--text-primary)] text-sm block">{activeVoucher.mealName}</span>
                        <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                          <Store className="w-3 h-3 text-[var(--accent-sage)]" />
                          Redeemable at: <strong>{activeVoucher.vendorName}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[var(--text-muted)] text-[10px] block">Full Menu Price:</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          KES {activeVoucher.mealPriceKes}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs">
                      <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                          Fund Covers: KES {activeVoucher.subsidyKes}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-600 dark:text-amber-400 font-bold block">
                          Student Co-Pay: KES {activeVoucher.copayKes}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Co-Pay Settlement Status & Gate */}
                  {activeVoucher.copayRequired ? (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            {activeVoucher.copayStatus === 'PAID'
                              ? 'Co-Pay Settled via M-Pesa'
                              : `Student Co-Pay Pending: KES ${activeVoucher.copayKes}`}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          activeVoucher.copayStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {activeVoucher.copayStatus === 'PAID' ? 'PAID' : 'PAY FIRST'}
                        </span>
                      </div>

                      {activeVoucher.copayStatus !== 'PAID' ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                            Students must pay their nominal co-pay before funds are sent to the vendor.
                            You can settle via M-Pesa prompt now or pay cash at the merchant counter.
                          </p>
                          <button
                            onClick={handlePayCopay}
                            disabled={isPayingCopay}
                            className="w-full py-2.5 px-3 rounded-lg bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>
                              {isPayingCopay
                                ? 'Simulating M-Pesa prompt...'
                                : `Pay Co-Pay (KES ${activeVoucher.copayKes}) via M-Pesa`}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          Payment confirmed. Show your 4-digit code to the merchant to receive your meal!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>100% Emergency Subsidy Applied: Zero co-pay required today.</span>
                    </div>
                  )}

                  {/* 4-Digit Code Display */}
                  <div className="text-center py-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest block font-medium">
                      Show Code to Canteen Merchant
                    </span>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <span className="font-mono text-5xl font-black text-[var(--text-primary)] tracking-widest">
                        {activeVoucher.token}
                      </span>
                      <button
                        onClick={() => copyToClipboard(activeVoucher.token)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedToken && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                        Copied to clipboard!
                      </span>
                    )}
                  </div>

                  {/* QR & NFC Representation */}
                  <div className="flex items-center justify-around pt-1 border-t border-[var(--border-color)]">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shadow-sm">
                        <QrCode className="w-10 h-10 text-slate-800" />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">Scan at PoS</span>
                    </div>

                    <div className="h-10 w-px bg-[var(--border-color)]" />

                    <div className="flex flex-col items-center gap-1 text-center">
                      <button
                        onClick={() => {
                          setNfcTapped(true);
                          setTimeout(() => setNfcTapped(false), 2500);
                        }}
                        className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          nfcTapped
                            ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] scale-105'
                            : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-sage)]'
                        }`}
                      >
                        <Wifi className="w-5 h-5 rotate-90" />
                        <span className="text-[8px] font-mono mt-0.5">NFC TAP</span>
                      </button>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {nfcTapped ? 'Emitted' : 'Tap Phone'}
                      </span>
                    </div>
                  </div>

                  {onGoToVendorPoS && (
                    <button
                      onClick={() => onGoToVendorPoS(activeVoucher.token)}
                      className="w-full py-2.5 px-3 rounded-lg bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Simulate Merchant Redemption</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                /* Meal Selection & Request View */
                <div className="space-y-5">
                  {/* STEP 1: Pick Available Vendor */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                        Step 1: Pick Available Campus Vendor
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {lindaStore.vendors.filter((v) => v.isOpenToday).length} Open Today
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {lindaStore.vendors.map((v) => {
                        const isSelected = selectedVendorId === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVendorId(v.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--bg-secondary)] border-[var(--accent-sage)] shadow-sm'
                                : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent-sage)]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[var(--text-primary)] block truncate">{v.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)] shrink-0">
                                {v.type === 'MAMA_MBOGA' ? 'Mama Mboga' : 'Canteen'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-3 h-3 text-[var(--accent-sage)] shrink-0" />
                              {v.location}
                            </span>
                            <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1.5 border-t border-[var(--border-color)]">
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ● Open ({v.operatingHours.split('–')[0]?.trim() || 'Day'})
                              </span>
                              <span className="text-[var(--text-muted)] font-mono">
                                Till: {v.mpesaTillOrPhone}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 2: Pick Available Menu Item from Selected Vendor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                        Step 2: Choose What {selectedVendor.name.split(' ')[0]} is Offering
                      </label>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        What's on the menu is what the vendor gets
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {vendorMenu.map((item) => {
                        const isSelected = selectedMenuItemId === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (item.isAvailable) setSelectedMenuItemId(item.id);
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              !item.isAvailable
                                ? 'opacity-40 cursor-not-allowed bg-[var(--bg-surface)] border-[var(--border-color)]'
                                : isSelected
                                ? 'bg-[var(--bg-secondary)] border-[var(--accent-sage)] shadow-sm cursor-pointer'
                                : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent-sage)]/50 cursor-pointer'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
                                {!item.isAvailable && (
                                  <span className="text-[9px] text-rose-500 font-mono">Sold Out</span>
                                )}
                              </div>
                              <span className="text-[11px] text-[var(--text-muted)] block">
                                Menu Price: KES {item.priceKes}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold block text-xs">
                                Fund Covers: KES {canAffordCopay ? item.subsidyKes : item.priceKes}
                              </span>
                              <span className="text-amber-600 dark:text-amber-400 font-semibold text-[10px] block">
                                {canAffordCopay ? `Co-Pay: KES ${item.copayKes}` : 'Zero Co-Pay (100% Subsidy)'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 3: Co-Pay Ability Choice */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2 text-xs">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Co-Pay Capability (Co-Pay is for students who can afford to pay):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCanAffordCopay(true)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          canAffordCopay
                            ? 'bg-[var(--bg-surface)] border-[var(--accent-sage)] text-[var(--text-primary)] font-semibold shadow-xs'
                            : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        <span className="block font-bold">Standard Co-Pay (KES {selectedMeal.copayKes})</span>
                        <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                          I can pay the nominal fee to stretch funds for others.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCanAffordCopay(false)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          !canAffordCopay
                            ? 'bg-[var(--bg-surface)] border-[var(--accent-sage)] text-[var(--text-primary)] font-semibold shadow-xs'
                            : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        <span className="block font-bold">100% Emergency Subsidy (KES 0 Co-Pay)</span>
                        <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                          Acute zero-cash hardship today; emergency pool covers 100%.
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[var(--text-muted)] text-[11px] block">Selected Order:</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {selectedMeal.name} at {selectedVendor.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--text-muted)] text-[10px] block">Vendor Settlement:</span>
                      <span className="font-bold text-[var(--text-primary)] font-mono text-sm">
                        KES {selectedMeal.priceKes}
                      </span>
                    </div>
                  </div>

                  {/* Request Button */}
                  <button
                    onClick={handleRequestVoucher}
                    disabled={isRequesting || recent24hCount >= 2}
                    className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 disabled:opacity-50 text-[var(--accent-sage-text)] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>
                      {recent24hCount >= 2
                        ? 'Daily Limit Reached (Max 2 Meals/Day)'
                        : isRequesting
                        ? 'Generating Pass...'
                        : `Confirm & Generate Pass for ${selectedMeal.name}`}
                    </span>
                  </button>

                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] space-y-1">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                      Equitable Use Policy
                    </span>
                    <p className="leading-relaxed">
                      To prevent misuse and protect donor capital, each student is strictly limited
                      to a maximum of <strong>2 subsidized meals per day</strong>. If co-pay is selected,
                      students must pay the small contribution before funds are disbursed to the merchant's till.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Campus Vendors & Status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span>Accredited Campus Merchants</span>
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Verified</span>
              </div>

              <div className="space-y-2.5">
                {lindaStore.vendors.map((v) => {
                  const isSelected = selectedVendorId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVendorId(v.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--bg-secondary)] border-[var(--accent-sage)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent-sage)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)] block text-xs">{v.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)]">
                          {v.type === 'MAMA_MBOGA' ? 'Mama Mboga' : 'Canteen'}
                        </span>
                      </div>

                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[var(--accent-sage)] shrink-0" />
                        {v.location}
                      </span>

                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono mt-2 pt-1.5 border-t border-[var(--border-color)]">
                        <span>Meals Served: {v.totalMealsServed}</span>
                        <span>Till: {v.mpesaTillOrPhone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TRANSACTION HISTORY VIEW (WITH EXACT MEAL DETAILS & CO-PAY)
      ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[var(--accent-sage)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Your Transaction History</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Full transparency into your past meal voucher redemptions, exact menu selections, co-pay, and merchant settlements.
              </p>
            </div>

            <div className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
              Total Redemptions: {voucherHistory.filter((v) => v.status === 'REDEEMED').length} meals
            </div>
          </div>

          {voucherHistory.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)] space-y-2">
              <Utensils className="w-8 h-8 mx-auto text-[var(--border-color)]" />
              <p>No past meal redemptions found for this account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[11px]">
                    <th className="py-2.5 px-3">Voucher Code</th>
                    <th className="py-2.5 px-3">Menu Choice & Vendor</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Co-Pay</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Merchant</th>
                    <th className="py-2.5 px-3">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-mono text-xs">
                  {voucherHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[var(--text-primary)]">#{item.token}</span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-medium text-[var(--text-primary)] block">{item.mealName}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {item.vendorName || 'Campus Merchant'} · Via {item.issuedVia}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-300">
                        KES {item.mealPriceKes || item.amountKes}
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-600 dark:text-amber-400">
                        KES {item.copayKes ?? 10}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'REDEEMED'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : item.status === 'ISSUED'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">
                        {new Date(item.issuedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        {item.status === 'REDEEMED' ? (
                          <div>
                            <span className="font-semibold text-[var(--text-primary)] block">
                              {item.redeemedByVendorName || item.vendorName || 'Campus Merchant'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {new Date(item.redeemedAt || '').toLocaleTimeString()}
                            </span>
                          </div>
                        ) : item.status === 'EXPIRED' ? (
                          <span className="text-slate-400">Expired unspent</span>
                        ) : (
                          <span className="text-amber-500">Awaiting redemption</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {item.darajaReceipt ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold">{item.darajaReceipt}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: SELF-REPORT HARDSHIP (DYNAMIC LIVE TELEMETRY)
      ========================================================================= */}
      {activeSubTab === 'hardship' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <FilePlus className="w-4 h-4 text-[var(--accent-sage)]" />
                    Report Emergency Hardship
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Log acute changes in family circumstances to update your welfare vulnerability status in real-time.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddHardshipSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[var(--text-primary)] font-semibold block">Hardship Category:</label>
                  <select
                    value={hardshipCategory}
                    onChange={(e) => setHardshipCategory(e.target.value as HardshipCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none"
                  >
                    <option value="HELB_DELAY">HEF / HELB Disbursement Delay (No upkeep)</option>
                    <option value="BEREAVEMENT">Bereavement / Loss of Parent or Sponsor</option>
                    <option value="MEDICAL_EMERGENCY">Medical Emergency / Severe Family Illness</option>
                    <option value="DROUGHT_SHOCK">Drought / Environmental Shock / Crop Failure</option>
                    <option value="JOB_LOSS">Single Breadwinner Retrenchment or Income Loss</option>
                    <option value="ACCOMMODATION_EVICTION">Threat of Room / Hostel Eviction</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--text-primary)] font-semibold block">Hardship Summary / Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Upkeep loan delayed by over 6 weeks"
                    value={hardshipTitle}
                    onChange={(e) => setHardshipTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--text-primary)] font-semibold block">Estimated Financial Shock (KES):</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={hardshipImpactKes}
                    onChange={(e) => setHardshipImpactKes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--text-primary)] font-semibold block">Detailed Narrative / Circumstance:</label>
                  <textarea
                    rows={4}
                    placeholder="Describe how this event impacts your meals and campus attendance..."
                    value={hardshipDescription}
                    onChange={(e) => setHardshipDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingHardship}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingHardship ? 'Updating...' : 'Submit Hardship & Recalculate Index'}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Your Logged Circumstances</h3>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                  {student.hardships?.length || 0} Records
                </span>
              </div>

              <div className="space-y-3">
                {(student.hardships || []).map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-primary)]">{h.title}</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono text-[10px] border border-[var(--border-color)]">
                        {h.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{h.description}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">
                      <span>Impact: KES {h.estimatedImpactKes.toLocaleString()}</span>
                      <span className="font-mono">
                        {new Date(h.reportedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: WELFARE INDEX & LIVE TELEMETRY
      ========================================================================= */}
      {activeSubTab === 'fvi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">
                    Telemetry Index
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Welfare Vulnerability Status</h3>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-rose-500 block">
                    {student.fviScore} / 100
                  </span>
                  <span className="text-[10px] font-bold uppercase text-amber-500">
                    {student.riskCategory} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-[10px] block">HEF Band (Baseline)</span>
                  <span className="font-mono font-bold text-[var(--text-primary)] text-sm">
                    Band {student.hefBand} / 5
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-[10px] block">Tuition Arrears</span>
                  <span className="font-mono font-bold text-rose-500 text-sm">
                    KES {student.feeBalanceKes.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-[10px] block">7-Day Usage Velocity</span>
                  <span className="font-mono font-bold text-amber-500 text-sm">
                    {student.totalRequestsLast7Days} requests
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-[10px] block">Reported Hardships</span>
                  <span className="font-mono font-bold text-[var(--accent-sage)] text-sm">
                    {student.hardships?.length || student.hardshipEvents} events
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] space-y-2 border border-[var(--border-color)] text-xs">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span>Welfare Review Status</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Student is classified as <strong>{student.riskCategory}</strong>. Emergency meal vouchers
                  remain active (max 2 per day). Automated matching connects eligible profiles to available
                  NG-CDF and county bursary pipelines.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Usage Telemetry</span>
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Platform usage is reviewed dynamically. Students utilizing vouchers regularly and logging
                hardships receive priority review when bursary pools become available.
              </p>

              <div className="space-y-3 font-mono text-xs text-[var(--text-muted)]">
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex justify-between">
                  <span>Last Meal Request:</span>
                  <span className="text-[var(--text-primary)]">
                    {student.lastMealRequestTimestamp ? new Date(student.lastMealRequestTimestamp).toLocaleTimeString() : 'None today'}
                  </span>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex justify-between">
                  <span>30-Day Total Requests:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.totalRequestsLast30Days} vouchers</span>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex justify-between">
                  <span>Completed Redemptions:</span>
                  <span className="text-amber-500 font-bold">{student.totalRedemptions} meals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BURSARY MATCHES
      ========================================================================= */}
      {activeSubTab === 'bursaries' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Bursary Pool Matching</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Matched against your home constituency (<strong>{student.constituency}</strong>) and welfare status.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]">
              {matchingBursaries.length} Pools Available
            </span>
          </div>

          <div className="space-y-3">
            {matchingBursaries.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)] text-sm">{b.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)]">
                      {b.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] block">Sponsor: {b.sponsorName}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] block">Max Award</span>
                    <span className="font-mono font-bold text-amber-500">
                      KES {b.maxAwardPerStudentKes.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setFeedback({
                        message: `Application submitted for ${b.name}! Dean of Students office will review.`,
                        type: 'success',
                      });
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Apply Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
