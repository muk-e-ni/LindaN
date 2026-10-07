import React, { useState } from 'react';
import {
  UserPlus,
  LogIn,
  Store,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Key,
  X,
  Sparkles,
} from 'lucide-react';
import { HEFBand, VendorType } from '../types/lindanyota';
import { lindaStore } from '../services/lindaService';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated: () => void;
}

type AuthMode = 'login' | 'register_student' | 'register_vendor';

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSessionUpdated,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('F17/84920/2023');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState<'STUDENT' | 'VENDOR' | 'DEAN_ADMIN' | 'DONOR'>('STUDENT');

  // Student onboarding state
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('254712000000');
  const [studentHefBand, setStudentHefBand] = useState<HEFBand>(1);
  const [studentUniversity, setStudentUniversity] = useState<'UoN' | 'KU' | 'JKUAT' | 'Moi' | 'Egerton'>('UoN');
  const [studentCounty, setStudentCounty] = useState('Kajiado');
  const [studentConstituency, setStudentConstituency] = useState('Kajiado South');
  const [studentFeeBalance, setStudentFeeBalance] = useState('45000');

  // Vendor onboarding state
  const [vendorName, setVendorName] = useState('');
  const [vendorType, setVendorType] = useState<VendorType>('MAMA_MBOGA');
  const [vendorMpesa, setVendorMpesa] = useState('254711000000');
  const [vendorLocation, setVendorLocation] = useState('Gate B Kiosk, Main Campus');
  const [vendorUniversity, setVendorUniversity] = useState('UoN');

  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = lindaStore.loginUser(loginIdentifier, loginRole);
    setFeedback(`Logged in successfully as ${session.user.name} (${session.user.role})!`);
    onSessionUpdated();
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 1200);
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentRegNo || !studentName) {
      setFeedback('Please enter registration number and full name.');
      return;
    }

    const newStudent = lindaStore.onboardStudent({
      regNo: studentRegNo,
      fullName: studentName,
      phone: studentPhone,
      hefBand: studentHefBand,
      universityId: studentUniversity,
      countyOfOrigin: studentCounty,
      constituency: studentConstituency,
      feeBalanceKes: parseFloat(studentFeeBalance) || 30000,
    });

    lindaStore.loginUser(newStudent.regNo, 'STUDENT');
    setFeedback(`Student ${newStudent.fullName} pre-registered and onboarded! Initial welfare rating: ${newStudent.fviScore}/100.`);
    onSessionUpdated();
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 1500);
  };

  const handleVendorRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vendorMpesa) {
      setFeedback('Please enter vendor name and M-Pesa line/till.');
      return;
    }

    const newVendor = lindaStore.onboardVendor({
      name: vendorName,
      type: vendorType,
      mpesaTillOrPhone: vendorMpesa,
      location: vendorLocation,
      universityId: vendorUniversity,
    });

    lindaStore.loginUser(newVendor.id, 'VENDOR');
    setFeedback(`Merchant ${newVendor.name} onboarded for automated M-Pesa settlements!`);
    onSessionUpdated();
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl relative animate-in zoom-in-95 transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-sage)]" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)]">
              Authentication & Onboarding
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            LindaNyota Access Portal
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Verified campus identity and role-based access with student privacy protection.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-medium">
          <button
            onClick={() => {
              setMode('login');
              setFeedback(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-bold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register_student');
              setFeedback(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register_student'
                ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-bold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            New Student
          </button>
          <button
            onClick={() => {
              setMode('register_vendor');
              setFeedback(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register_vendor'
                ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-bold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            New Merchant
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[var(--text-primary)] font-semibold block">Select Role:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'STUDENT', label: 'Student' },
                  { id: 'VENDOR', label: 'Mama Mboga / Vendor' },
                  { id: 'DEAN_ADMIN', label: 'Dean Welfare Admin' },
                  { id: 'DONOR', label: 'Alumni Donor' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setLoginRole(r.id as any);
                      if (r.id === 'STUDENT') setLoginIdentifier('F17/84920/2023');
                      if (r.id === 'VENDOR') setLoginIdentifier('ven-001');
                      if (r.id === 'DEAN_ADMIN') setLoginIdentifier('dean@uonbi.ac.ke');
                      if (r.id === 'DONOR') setLoginIdentifier('alumni@kenyatta.ac.ke');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      loginRole === r.id
                        ? 'bg-[var(--accent-sage)]/20 border-[var(--accent-sage)] text-[var(--text-primary)] font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[var(--text-primary)] font-semibold block">
                Identifier (Reg No, Vendor ID or Email):
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[var(--text-primary)] font-semibold block">Password / PIN:</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate Session</span>
            </button>
          </form>
        )}

        {/* MODE 2: STUDENT REGISTRATION */}
        {mode === 'register_student' && (
          <form onSubmit={handleStudentRegister} className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">University Reg No:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C01/49102/2024"
                  value={studentRegNo}
                  onChange={(e) => setStudentRegNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">Full Student Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faith Chebet Korir"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">Phone (M-Pesa):</label>
                <input
                  type="text"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">University:</label>
                <select
                  value={studentUniversity}
                  onChange={(e) => setStudentUniversity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                >
                  <option value="UoN">University of Nairobi (UoN)</option>
                  <option value="KU">Kenyatta University (KU)</option>
                  <option value="JKUAT">JKUAT</option>
                  <option value="Moi">Moi University</option>
                  <option value="Egerton">Egerton University</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">HEF Band:</label>
                <select
                  value={studentHefBand}
                  onChange={(e) => setStudentHefBand(parseInt(e.target.value) as HEFBand)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                >
                  <option value={1}>Band 1 (Extreme)</option>
                  <option value={2}>Band 2 (Very High)</option>
                  <option value={3}>Band 3 (Moderate)</option>
                  <option value={4}>Band 4 (Low)</option>
                  <option value={5}>Band 5 (Least)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">Home County:</label>
                <input
                  type="text"
                  value={studentCounty}
                  onChange={(e) => setStudentCounty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">Constituency:</label>
                <input
                  type="text"
                  value={studentConstituency}
                  onChange={(e) => setStudentConstituency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[var(--text-primary)] font-semibold block">Tuition Arrears (KES):</label>
              <input
                type="number"
                value={studentFeeBalance}
                onChange={(e) => setStudentFeeBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Pre-Register Student & Calculate Initial Welfare</span>
            </button>
          </form>
        )}

        {/* MODE 3: VENDOR ONBOARDING */}
        {mode === 'register_vendor' && (
          <form onSubmit={handleVendorRegister} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[var(--text-primary)] font-semibold block">Merchant / Kiosk Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Mama Mboga Jane Kiosk"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">Merchant Type:</label>
                <select
                  value={vendorType}
                  onChange={(e) => setVendorType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                >
                  <option value="MAMA_MBOGA">Mama Mboga / Informal Vendor</option>
                  <option value="CANTEEN">University Campus Canteen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-semibold block">M-Pesa Till or Phone:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Till 891234 or 254711..."
                  value={vendorMpesa}
                  onChange={(e) => setVendorMpesa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[var(--text-primary)] font-semibold block">Physical Location / Gate:</label>
              <input
                type="text"
                value={vendorLocation}
                onChange={(e) => setVendorLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Store className="w-4 h-4" />
              <span>Register Merchant for Instant Settlements</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
