import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { HEFBand } from '../types/lindanyota';
import { lindaStore } from '../services/lindaService';

export const FVIModelPlayground: React.FC = () => {
  const [hefBand, setHefBand] = useState<HEFBand>(1);
  const [feeBalance, setFeeBalance] = useState<number>(48000);
  const [annualTuition, setAnnualTuition] = useState<number>(65000);
  const [weeklyMealRequests, setWeeklyMealRequests] = useState<number>(4);
  const [hardshipEvents, setHardshipEvents] = useState<number>(3);
  const [totalRedemptions, setTotalRedemptions] = useState<number>(11);
  const [isOrphan, setIsOrphan] = useState<boolean>(true);
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [constituency, setConstituency] = useState<string>('Kajiado South');
  const [county, setCounty] = useState<string>('Kajiado');

  // Compute live FVI score using dynamic telemetry model
  const evaluation = lindaStore.calculateFVI({
    hefBand,
    feeBalanceKes: feeBalance,
    annualTuitionKes: annualTuition,
    weeklyMealRequests,
    totalRequestsLast7Days: weeklyMealRequests,
    totalRedemptions,
    hardshipEvents,
    isOrphan,
    hasChronicIllnessOrDisability: hasDisability,
    countyOfOrigin: county,
    constituency,
  });

  const matchingBursaries = lindaStore.bursaries.filter((b) => {
    if (evaluation.fviScore < b.minimumFviThreshold) return false;
    if (b.type === 'CDF') {
      return b.targetConstituency?.toLowerCase() === constituency.toLowerCase();
    }
    if (b.type === 'COUNTY') {
      return b.targetCounty?.toLowerCase() === county.toLowerCase();
    }
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-rose-500';
    if (score >= 55) return 'text-amber-500';
    if (score >= 35) return 'text-emerald-500';
    return 'text-[var(--text-muted)]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-rose-500';
    if (score >= 55) return 'bg-amber-500';
    if (score >= 35) return 'bg-emerald-500';
    return 'bg-slate-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Intro Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[var(--accent-sage)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Live Telemetry Welfare Index — Financial Vulnerability Simulator
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-3xl leading-relaxed">
              Unlike static bursary questionnaires, LindaNyota runs on real, actual actionable usage data:
              tracking active weekly meal requests, completed canteen redemptions, and student self-reported
              hardships to prevent attrition before dropouts occur.
            </p>
          </div>

          <button
            onClick={() => {
              setHefBand(1);
              setFeeBalance(48000);
              setAnnualTuition(65000);
              setWeeklyMealRequests(4);
              setTotalRedemptions(11);
              setHardshipEvents(3);
              setIsOrphan(true);
              setHasDisability(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] text-[var(--text-primary)] text-xs flex items-center gap-1.5 transition-colors border border-[var(--border-color)] cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
            <span>Reset Demo Student</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Telemetry Feature Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--accent-sage)]" />
                Feature Weights & Live Indicators
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                Real-Time Inference
              </span>
            </div>

            {/* Slider 1: HEF Band */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)]">Higher Education Fund (HEF) Band:</span>
                <span className="font-bold text-[var(--accent-sage)] font-mono">Band {hefBand} of 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={hefBand}
                onChange={(e) => setHefBand(parseInt(e.target.value) as HEFBand)}
                className="w-full accent-[var(--accent-sage)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Band 1 (Extreme Vulnerability)</span>
                <span>Band 5 (Least Vulnerable)</span>
              </div>
            </div>

            {/* Slider 2: Fee Balance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)]">Tuition Arrears / Debt:</span>
                <span className="font-mono font-bold text-rose-500">
                  KES {feeBalance.toLocaleString()} ({Math.round((feeBalance / annualTuition) * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120000"
                step="5000"
                value={feeBalance}
                onChange={(e) => setFeeBalance(parseInt(e.target.value))}
                className="w-full accent-[var(--accent-sage)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>KES 0 (Cleared)</span>
                <span>KES 120,000 (Deregistration Threat)</span>
              </div>
            </div>

            {/* Slider 3: 7-Day Meal Request Velocity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)]">Weekly Meal Requests (Past 7 Days):</span>
                <span className="font-mono font-bold text-amber-500">{weeklyMealRequests} requests</span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={weeklyMealRequests}
                onChange={(e) => setWeeklyMealRequests(parseInt(e.target.value))}
                className="w-full accent-[var(--accent-sage)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>0 (Infrequent)</span>
                <span>7 (Daily Crisis Rate)</span>
              </div>
            </div>

            {/* Slider 4: Completed Canteen Redemptions (Platform Usage Telemetry) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)]">Total Verified Redemptions (Platform Usage):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {totalRedemptions} redeemed meals
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={totalRedemptions}
                onChange={(e) => setTotalRedemptions(parseInt(e.target.value))}
                className="w-full accent-[var(--accent-sage)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>0 redemptions</span>
                <span>25+ redemptions (Consistent Reliance)</span>
              </div>
            </div>

            {/* Slider 5: Hardship Events (Self-Reported Shocks) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)]">Emergency Hardship Events Logged:</span>
                <span className="font-mono font-bold text-rose-500">{hardshipEvents} emergency shocks</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={hardshipEvents}
                onChange={(e) => setHardshipEvents(parseInt(e.target.value))}
                className="w-full accent-[var(--accent-sage)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>0 events</span>
                <span>5 severe shocks (HELB Delay, Bereavement, Eviction)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOrphan}
                  onChange={(e) => setIsOrphan(e.target.checked)}
                  className="rounded accent-[var(--accent-sage)]"
                />
                <span className="font-medium">Total / Partial Orphan (+5 pts)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="rounded accent-[var(--accent-sage)]"
                />
                <span className="font-medium">Chronic Illness / PWD (+3 pts)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Score Breakdown & Live Bursary Matching */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Score Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-sage)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Live Vulnerability Score
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  evaluation.riskCategory === 'CRITICAL'
                    ? 'bg-rose-950/20 text-rose-500 border border-rose-500/30'
                    : evaluation.riskCategory === 'HIGH'
                    ? 'bg-amber-950/20 text-amber-500 border border-amber-500/30'
                    : 'bg-emerald-950/20 text-emerald-500 border border-emerald-500/30'
                }`}
              >
                {evaluation.riskCategory} SEVERITY
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span
                    className={`font-mono text-5xl font-black ${getScoreColor(evaluation.fviScore)}`}
                  >
                    {evaluation.fviScore}
                  </span>
                  <span className="text-sm text-[var(--text-muted)] font-mono">/100</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] mt-1 block">
                  Priority Tier {evaluation.bursaryPriorityTier} for Emergency Allocations
                </span>
              </div>

              {/* Progress bar gauge */}
              <div className="w-full sm:w-48 space-y-1.5">
                <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Low (0)</span>
                  <span>Critical (100)</span>
                </div>
                <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div
                    className={`h-full transition-all duration-300 ${getScoreBg(evaluation.fviScore)}`}
                    style={{ width: `${evaluation.fviScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Narrative Explanation */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] leading-relaxed">
              {evaluation.narrative}
            </div>

            {/* Attribution Waterfall */}
            <div className="space-y-2 pt-1 border-t border-[var(--border-color)]">
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                Model Feature Contribution Breakdown:
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">HEF Vulnerability Band:</span>
                  <span className="font-mono text-[var(--text-primary)] font-bold">
                    +{evaluation.featureContributions.hefBandContrib} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Tuition Debt & Deregistration Risk:</span>
                  <span className="font-mono text-[var(--text-primary)] font-bold">
                    +{evaluation.featureContributions.feeDebtContrib} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">7-Day Meal Request Velocity:</span>
                  <span className="font-mono text-[var(--text-primary)] font-bold">
                    +{evaluation.featureContributions.mealVelocityContrib} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Self-Reported Hardship Events:</span>
                  <span className="font-mono text-[var(--text-primary)] font-bold">
                    +{evaluation.featureContributions.hardshipShockContrib} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Historical Redemptions Telemetry:</span>
                  <span className="font-mono text-[var(--text-primary)] font-bold">
                    +{evaluation.featureContributions.platformUsageContrib} pts
                  </span>
                </div>
                {evaluation.featureContributions.vulnerabilityContrib > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Demographic Hardship Multipliers:</span>
                    <span className="font-mono text-[var(--text-primary)] font-bold">
                      +{evaluation.featureContributions.vulnerabilityContrib} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Bursary Matching Engine */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--accent-sage)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Matched Bursary Programs ({matchingBursaries.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Auto-Pipeline</span>
            </div>

            {matchingBursaries.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                Score is below the required threshold for automated bursary matching.
              </div>
            ) : (
              <div className="space-y-2.5">
                {matchingBursaries.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">{b.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {b.type} · Sponsored by {b.sponsorName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block text-xs">
                        Up to KES {b.maxAwardPerStudentKes.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600">Eligible</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
