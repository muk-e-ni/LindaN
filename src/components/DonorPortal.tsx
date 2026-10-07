import React, { useState } from 'react';
import {
  HeartHandshake,
  Utensils,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Receipt,
  Layers,
  Lock,
  ArrowRight,
  EyeOff,
  User,
} from 'lucide-react';
import { Donation } from '../types/lindanyota';
import { lindaStore } from '../services/lindaService';

export const DonorPortal: React.FC = () => {
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('254722894102');
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkModal, setStkModal] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);
  const [donations, setDonations] = useState<Donation[]>(lindaStore.donations);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amountToDonate = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const mealsSubsidized = Math.max(0.5, Math.round((amountToDonate / 75) * 10) / 10);

  const handleTriggerSTK = () => {
    setErrorMessage(null);
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMessage('Please enter a valid phone number (e.g. 2547XXXXXXXX)');
      return;
    }
    if (amountToDonate < 50) {
      setErrorMessage('Minimum contribution is KES 50 so all students, alumni and well-wishers can participate.');
      return;
    }

    setIsProcessing(true);
    setStkModal(true);

    setTimeout(() => {
      const finalName = isAnonymous ? '' : donorName;
      const res = lindaStore.donateViaMpesaSTK(phoneNumber, amountToDonate, finalName, isAnonymous);
      setIsProcessing(false);
      if (res.success) {
        setLastReceipt(res.receipt);
        setDonations([...lindaStore.donations]);
      } else {
        setErrorMessage(res.message);
      }
    }, 1800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Impact Banner */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
            <span>Alumni Micro-Sponsorship & Student-to-Student Pool</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            Protect Student Dignity with Fresh Campus Meals.{' '}
            <span className="font-editorial italic font-normal text-[var(--accent-sage)]">From Just KES 50.</span>
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            In Kenyan universities, acute hunger is a primary cause of exam dropouts. You don't need
            thousands to make a difference: <strong>KES 50</strong> provides a nourishing hot meal subsidy
            at university canteens and campus food merchants via instant M-Pesa.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Meals Subsidized</span>
              <span className="text-3xl font-black text-[var(--text-primary)] font-mono mt-0.5 block">
                {lindaStore.totalMealsServedCounter.toLocaleString()}
              </span>
            </div>

            <div className="h-10 w-px bg-[var(--border-color)] hidden sm:block" />

            <div>
              <span className="text-xs text-[var(--text-muted)] block">Transparent Escrow Pool</span>
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
                KES {lindaStore.escrowBalanceKes.toLocaleString()}
              </span>
            </div>

            <div className="h-10 w-px bg-[var(--border-color)] hidden sm:block" />

            <div>
              <span className="text-xs text-[var(--text-muted)] block">Minimum Contribution</span>
              <span className="text-xl font-bold text-[var(--accent-sage)] font-mono mt-1 block">
                KES 50.00
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: M-Pesa Donation Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[var(--accent-sage)]" />
                Lipa Na M-Pesa Online
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                Min: KES 50
              </span>
            </div>

            {/* Quick Amount Tier Selector (Starting at KES 50) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Choose Contribution Amount:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { kes: 50, label: 'Micro-Pledge (Half Meal)' },
                  { kes: 100, label: '1 Full Campus Meal' },
                  { kes: 250, label: '3 Subsidized Meals' },
                  { kes: 500, label: '6 Full Meals' },
                  { kes: 1000, label: '12 Full Meals' },
                  { kes: 2500, label: '30 Full Meals' },
                ].map((tier) => (
                  <button
                    key={tier.kes}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(tier.kes);
                      setCustomAmount('');
                      setErrorMessage(null);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedAmount === tier.kes && !customAmount
                        ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-bold shadow-sm'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-sage)]'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono block">KES {tier.kes}</span>
                    <span className="text-[9px] font-medium block mt-0.5 opacity-90">
                      {tier.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)]">Or Enter Custom Amount (KES ≥ 50):</label>
              <input
                type="number"
                min={50}
                placeholder="e.g. 50, 75, 150, 300"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            {/* Donor Information (Name is Optional) */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                    <span>Donor Name / Alumni Handle (Optional):</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded accent-[var(--accent-sage)]"
                    />
                    <span>Donate Anonymously</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? 'Anonymous Well-Wisher' : 'e.g. Grace Wambui (or leave empty)'}
                  value={isAnonymous ? '' : donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] disabled:opacity-50 focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-primary)] font-medium">M-Pesa Phone Number:</label>
                <input
                  type="text"
                  placeholder="2547XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>
            </div>

            {/* Impact Projection Card */}
            <div className="p-3.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[var(--accent-sage)]" />
                <span className="font-semibold">Direct Impact:</span>
              </div>
              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {mealsSubsidized} Dignified Campus Meals Funded
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={handleTriggerSTK}
              disabled={isProcessing}
              className="w-full py-4 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 disabled:opacity-50 text-[var(--accent-sage-text)] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>
                {isProcessing
                  ? 'Sending M-Pesa Prompt to Your Phone...'
                  : `Contribute KES ${amountToDonate.toLocaleString()} via M-Pesa`}
              </span>
            </button>

            <div className="text-[11px] text-[var(--text-muted)] text-center flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[var(--accent-sage)]" />
              <span>Direct M-Pesa Payment · 100% directly to Student Meal Pool</span>
            </div>
          </div>
        </div>

        {/* Right Column: Public Transparency Ledger */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--accent-sage)]" />
                Public Transparency Ledger (Alumni & Student Supporters)
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Live Pool Feed</span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every cent is accounted for. Disbursements are strictly tied to single-use student voucher
              redemptions with zero intermediary fees.
            </p>

            <div className="space-y-2.5">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">
                        {d.isAnonymous ? 'Anonymous Supporter' : d.donorName}
                      </span>
                      {d.isAnonymous && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)]">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {d.phoneMasked} · {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 block text-sm">
                      +KES {d.amountKes.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {d.mpesaReceiptNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Phone Prompt Notification Modal */}
      {stkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-sage)]/20 border border-[var(--accent-sage)] flex items-center justify-center mx-auto text-[var(--accent-sage)]">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">M-Pesa Prompt Sent</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Check phone handset <strong>{phoneNumber}</strong> and enter your M-Pesa PIN to authorize
                payment of <strong>KES {amountToDonate}</strong>.
              </p>
            </div>

            {isProcessing ? (
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-sage)] animate-ping" />
                <span>Awaiting M-Pesa confirmation...</span>
              </div>
            ) : lastReceipt ? (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
                <span className="font-bold block">Payment Received!</span>
                <span className="font-mono text-[11px] block">Receipt: {lastReceipt}</span>
              </div>
            ) : null}

            <button
              onClick={() => {
                setStkModal(false);
                setLastReceipt(null);
              }}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
