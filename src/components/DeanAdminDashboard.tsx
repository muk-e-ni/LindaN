import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Award,
  Users,
  Search,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, BursaryMatchApplication } from '../types/lindanyota';
import { lindaStore } from '../services/lindaService';

export const DeanAdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(lindaStore.students);
  const [bursaryMatches, setBursaryMatches] = useState<BursaryMatchApplication[]>(
    lindaStore.bursaryMatches
  );
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<{
    count: number;
    amount: number;
  } | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.universityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingMatches = bursaryMatches.filter((m) => m.status !== 'APPROVED');

  const toggleSelectMatch = (id: string) => {
    setSelectedMatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    if (selectedMatchIds.length === pendingMatches.length) {
      setSelectedMatchIds([]);
    } else {
      setSelectedMatchIds(pendingMatches.map((m) => m.id));
    }
  };

  const handleBatchApprove = () => {
    if (selectedMatchIds.length === 0) return;

    const res = lindaStore.approveBatchBursaries(selectedMatchIds);
    setStudents([...lindaStore.students]);
    setBursaryMatches([...lindaStore.bursaryMatches]);
    setApprovalFeedback({ count: res.approvedCount, amount: res.totalDisbursedKes });
    setSelectedMatchIds([]);
    setTimeout(() => setApprovalFeedback(null), 5000);
  };

  const criticalCount = students.filter((s) => s.riskCategory === 'CRITICAL').length;
  const highCount = students.filter((s) => s.riskCategory === 'HIGH').length;
  const totalArrears = students.reduce((acc, curr) => acc + curr.feeBalanceKes, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Overview Banner */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[var(--accent-sage)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Dean of Students & University Welfare Dashboard
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              Multi-source student vulnerability scoring combining HEF Bands, live 7-day meal requests,
              and tuition arrears with 1-click batch allocation to NG-CDF and County Bursaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono font-medium">
              National HEF Integration Active
            </span>
          </div>
        </div>

        {/* Metric Cards (Escrow shown here as authorized) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[11px] text-[var(--text-muted)] block">Critical Risk Students</span>
            <span className="text-2xl font-black text-rose-500 font-mono mt-0.5 block">
              {criticalCount}
            </span>
            <span className="text-[10px] text-rose-500 font-medium">High Hunger & Debt Signals</span>
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[11px] text-[var(--text-muted)] block">High Risk Students</span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-0.5 block">
              {highCount}
            </span>
            <span className="text-[10px] text-amber-500 font-medium">Elevated Need Tier</span>
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[11px] text-[var(--text-muted)] block">Total At-Risk Fee Debt</span>
            <span className="text-2xl font-black text-[var(--text-primary)] font-mono mt-0.5 block">
              KES {totalArrears.toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">Exam Deregistration Threat</span>
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[11px] text-[var(--text-muted)] block">Campus Emergency Escrow</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
              KES {lindaStore.escrowBalanceKes.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Available Meal & Aid Funds</span>
          </div>
        </div>
      </div>

      {/* Batch Bursary Approval Action Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--accent-sage)]" />
              <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                Automated Bursary Batch Allocation Queue
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pre-matched candidates based on Home Constituency, County, and real-time vulnerability severity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllPending}
              className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-sage)] transition-colors flex items-center gap-2 cursor-pointer"
            >
              {selectedMatchIds.length === pendingMatches.length ? (
                <CheckSquare className="w-4 h-4 text-[var(--accent-sage)]" />
              ) : (
                <Square className="w-4 h-4 text-[var(--text-muted)]" />
              )}
              <span>Select All Pending ({pendingMatches.length})</span>
            </button>

            <button
              onClick={handleBatchApprove}
              disabled={selectedMatchIds.length === 0}
              className="px-4 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 disabled:opacity-50 text-[var(--accent-sage-text)] text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>1-Click Disburse Batch ({selectedMatchIds.length})</span>
            </button>
          </div>
        </div>

        {approvalFeedback && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Successfully approved {approvalFeedback.count} bursary allocations totaling KES{' '}
              {approvalFeedback.amount.toLocaleString()}!
            </span>
          </div>
        )}

        {/* Pre-Match Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
                <th className="py-2.5 px-3">Select</th>
                <th className="py-2.5 px-3">Student Name / Reg No</th>
                <th className="py-2.5 px-3">Bursary Fund</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Allocation</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {bursaryMatches.map((m) => {
                const isSelected = selectedMatchIds.includes(m.id);
                return (
                  <tr
                    key={m.id}
                    className={`hover:bg-[var(--bg-secondary)]/50 transition-colors ${
                      isSelected ? 'bg-[var(--bg-secondary)]' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={m.status === 'APPROVED'}
                        onChange={() => toggleSelectMatch(m.id)}
                        className="rounded accent-[var(--accent-sage)] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[var(--text-primary)] block">{m.studentName}</span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">{m.studentRegNo}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-[var(--text-primary)] block">{m.bursaryName}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{m.bursaryType} Fund</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">
                      {m.fviScoreAtMatch}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      KES {m.recommendedAmountKes.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Registry & Telemetry Feed */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent-sage)]" />
              Active University Welfare Registry
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live data from actual student platform activity, 7-day meal requests, and campus hardship reports.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reg no, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">HEF Band</th>
                <th className="py-2.5 px-3">Tuition Arrears</th>
                <th className="py-2.5 px-3">7-Day Meals</th>
                <th className="py-2.5 px-3">Today's Usage</th>
                <th className="py-2.5 px-3">Score & Category</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-[var(--text-primary)] block">{s.fullName}</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      {s.regNo} · {s.universityId}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                    Band {s.hefBand}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold text-rose-500">KES {s.feeBalanceKes.toLocaleString()}</span>
                    <span className="block text-[10px] text-[var(--text-muted)]">
                      of {s.annualTuitionKes.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-[var(--text-primary)]">
                    {s.weeklyMealRequests} requests
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`font-semibold ${
                        s.dailyMealsRequestedToday >= 2 ? 'text-amber-500' : 'text-[var(--accent-sage)]'
                      }`}
                    >
                      {s.dailyMealsRequestedToday || 0}/2 meals
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[var(--text-primary)]">
                        {s.fviScore}/100
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          s.riskCategory === 'CRITICAL'
                            ? 'bg-rose-950/20 text-rose-500 border border-rose-500/30'
                            : s.riskCategory === 'HIGH'
                            ? 'bg-amber-950/20 text-amber-500 border border-amber-500/30'
                            : 'bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {s.riskCategory}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setSelectedStudentForDetail(s)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Audit Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {selectedStudentForDetail.fullName}
                </h4>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {selectedStudentForDetail.regNo} · {selectedStudentForDetail.universityId}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block">County / Constituency</span>
                  <span className="font-bold text-[var(--text-primary)] block mt-0.5">
                    {selectedStudentForDetail.countyOfOrigin} · {selectedStudentForDetail.constituency}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block">Daily Limit</span>
                  <span className="font-bold text-[var(--text-primary)] block mt-0.5">
                    {selectedStudentForDetail.dailyMealsRequestedToday || 0} of 2 Meals Today
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                <span className="font-semibold text-[var(--text-primary)] block">Hardship Circumstances:</span>
                {selectedStudentForDetail.hardships && selectedStudentForDetail.hardships.length > 0 ? (
                  <ul className="space-y-1 text-[11px] text-[var(--text-muted)]">
                    {selectedStudentForDetail.hardships.map((h) => (
                      <li key={h.id} className="flex justify-between">
                        <span>• {h.title} ({h.category})</span>
                        <span className="font-mono">Est: KES {h.estimatedImpactKes}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-[var(--text-muted)]">No self-reported emergency shocks logged.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedStudentForDetail(null)}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
