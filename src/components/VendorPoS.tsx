import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Utensils,
  DollarSign,
  Coffee,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Vendor, MealVoucher, Transaction, MenuItem } from '../types/lindanyota';
import { lindaStore, CAMPUS_MENU_ITEMS } from '../services/lindaService';

interface VendorPoSProps {
  initialToken?: string;
}

export const VendorPoS: React.FC<VendorPoSProps> = ({ initialToken = '' }) => {
  const [vendors, setVendors] = useState<Vendor[]>(lindaStore.vendors);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
  const [tokenInput, setTokenInput] = useState<string>(initialToken);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    voucher?: MealVoucher;
    darajaReceipt?: string;
    settledAmountKes?: number;
    subsidyKes?: number;
    copayKes?: number;
    requireCopayFirst?: boolean;
  } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(lindaStore.transactions);

  const vendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Active unredeemed vouchers for quick-fill demo
  const activeVouchersList = lindaStore.vouchers.filter((v) => v.status === 'ISSUED');

  // Detect voucher if 4-digit token matches an active issued voucher
  const matchedVoucher = lindaStore.vouchers.find(
    (v) => v.token === tokenInput.trim() && v.status === 'ISSUED'
  );

  const vendorMenu: MenuItem[] =
    vendor && vendor.menu && vendor.menu.length > 0 ? vendor.menu : CAMPUS_MENU_ITEMS;

  const handleRedeem = (confirmCashAtCounter: boolean = false) => {
    if (!tokenInput || tokenInput.length !== 4) {
      setResult({
        success: false,
        message: 'Please enter a valid 4-digit numeric voucher code.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      // Calls exact voucher redemption with co-pay gating
      const res = lindaStore.redeemVoucherAtomic(tokenInput, vendor.id, confirmCashAtCounter);
      setIsLoading(false);
      setResult(res);
      setVendors([...lindaStore.vendors]);
      setTransactions([...lindaStore.transactions]);

      if (res.success) {
        setTokenInput('');
      }
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Vendor Selector & Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[var(--accent-sage)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Campus Food Merchant & Canteen PoS
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl">
              Informal campus food vendors accept 4-digit meal vouchers. Payouts are calculated strictly
              based on the student's actual menu choice (e.g. KES 70, 80, 100) and disbursed instantly to your till.
            </p>
          </div>

          {/* Active Vendor Card */}
          <div className="flex items-center gap-3 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono font-medium">
                Active Merchant Line
              </span>
              <select
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value);
                  setResult(null);
                }}
                className="bg-transparent text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {v.name} ({v.type === 'MAMA_MBOGA' ? 'Mama Mboga' : 'Canteen'})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[var(--text-muted)] block font-mono mt-0.5">
                M-Pesa Till: {vendor.mpesaTillOrPhone} · {vendor.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Voucher Redemption Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[var(--accent-sage)]" />
                Voucher Verification Terminal
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                Instant Verification
              </span>
            </div>

            {/* Token Input Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Enter Student 4-Digit Voucher Code:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4819"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value.replace(/\D/g, ''));
                    setResult(null);
                  }}
                  className="w-full text-center font-mono text-3xl font-black tracking-widest py-3 px-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] focus:border-[var(--accent-sage)] focus:outline-none text-[var(--text-primary)] transition-colors"
                />
              </div>

              {/* Quick fill chips */}
              {activeVouchersList.length > 0 && (
                <div className="pt-1 flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">Active Vouchers:</span>
                  {activeVouchersList.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setTokenInput(v.token);
                        setResult(null);
                      }}
                      className="px-2 py-1 rounded bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] text-[var(--text-primary)] font-mono text-[11px] shrink-0 border border-[var(--border-color)] transition-colors cursor-pointer"
                    >
                      #{v.token} ({v.mealName.split(' ')[0]} · KES {v.mealPriceKes})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Matched Voucher Card with Exact Menu Pricing */}
            {matchedVoucher ? (
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--accent-sage)]/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Voucher #{matchedVoucher.token} ({matchedVoucher.studentName})
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Reg: {matchedVoucher.studentRegNo}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] text-sm block">
                        {matchedVoucher.mealName}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Designated Merchant: {matchedVoucher.vendorName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--text-muted)] block">Total Menu Value:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                        KES {matchedVoucher.mealPriceKes}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-color)] text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Fund Subsidy: <strong>KES {matchedVoucher.subsidyKes}</strong>
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Student Co-Pay: <strong>KES {matchedVoucher.copayKes}</strong> ({matchedVoucher.copayStatus})
                    </span>
                  </div>
                </div>

                {matchedVoucher.copayRequired && matchedVoucher.copayStatus !== 'PAID' && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Student co-pay of <strong>KES {matchedVoucher.copayKes}</strong> is pending.
                      Verify cash collected before honoring order.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-1">
                <span className="font-semibold text-[var(--text-primary)] block">
                  Current Menu for {vendor.name}:
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {vendorMenu.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]"
                    >
                      <span className="font-bold text-[var(--text-primary)] block truncate">{item.name}</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                        Menu: KES {item.priceKes} (Co-Pay: KES {item.copayKes})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button: Disburses EXACT amount calculated for the meal */}
            <button
              onClick={() => handleRedeem(false)}
              disabled={isLoading || tokenInput.length !== 4}
              className="w-full py-4 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 disabled:opacity-50 text-[var(--accent-sage-text)] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isLoading
                  ? 'Verifying & Processing Instant Payout...'
                  : matchedVoucher
                  ? `Redeem & Receive Exactly KES ${matchedVoucher.mealPriceKes}`
                  : 'Enter 4-Digit Code to Redeem Meal'}
              </span>
            </button>

            {/* Result Alert */}
            {result && (
              <div
                className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
                  result.success
                    ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-950/20 border-rose-600/40 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{result.success ? 'VOUCHER CONFIRMED & SETTLED' : 'REDEMPTION PENDING / REJECTED'}</span>
                </div>
                <p className="text-xs leading-relaxed">{result.message}</p>

                {/* If co-pay was pending, give merchant the option to collect cash at counter */}
                {result.requireCopayFirst && result.copayKes && (
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => handleRedeem(true)}
                      className="w-full py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Confirm KES {result.copayKes} Cash Collected at Counter & Settle Payout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {result.success && result.darajaReceipt && (
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-emerald-500/30 text-[11px] font-mono text-emerald-800 dark:text-emerald-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Receipt:</span>
                      <span className="font-bold">{result.darajaReceipt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exact Amount Disbursed:</span>
                      <span className="font-bold">KES {result.settledAmountKes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meal Honored:</span>
                      <span className="font-sans font-medium">{result.voucher?.mealName}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vendor Ledger */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--accent-sage)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Live Merchant Payout Ledger
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-emerald-700 dark:text-emerald-300 border border-[var(--border-color)] font-bold">
                Till: {vendor.mpesaTillOrPhone}
              </span>
            </div>

            {/* Merchant Cumulative Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] text-[10px] block">Total Meals Served</span>
                <span className="font-mono text-xl font-bold text-[var(--text-primary)]">
                  {vendor.totalMealsServed} meals
                </span>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] text-[10px] block">Total Payouts Settled</span>
                <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  KES {vendor.totalPayoutsKes.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                Recent Settlements for this Till:
              </span>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono text-[10px]">
                      <th className="py-2 px-2">Meal Selection</th>
                      <th className="py-2 px-2">Student</th>
                      <th className="py-2 px-2">Amount Paid</th>
                      <th className="py-2 px-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] font-mono text-xs">
                    {transactions
                      .filter((tx) => tx.vendorId === vendor.id)
                      .slice(0, 8)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                          <td className="py-2.5 px-2 font-sans">
                            <span className="font-medium text-[var(--text-primary)] block text-xs">
                              {tx.mealName || 'Campus Meal'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-[var(--text-muted)] text-[11px]">
                            {tx.studentRegNo}
                          </td>
                          <td className="py-2.5 px-2 font-bold text-emerald-700 dark:text-emerald-300">
                            KES {tx.amountKes}
                          </td>
                          <td className="py-2.5 px-2 text-[11px] text-[var(--text-muted)]">
                            {tx.darajaReceipt}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
