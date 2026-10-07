import React, { useState } from 'react';
import {
  PhoneCall,
  Delete,
  RotateCcw,
  MessageSquare,
  Terminal,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { lindaStore } from '../services/lindaService';

export const USSDSimulator: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('254712984102');
  const [dialInput, setDialInput] = useState('*384#');
  const [isInSession, setIsInSession] = useState(false);
  const [sessionScreenText, setSessionScreenText] = useState('');
  const [isSessionFinal, setIsSessionFinal] = useState(false);
  const [currentInputStep, setCurrentInputStep] = useState('');
  const [historyText, setHistoryText] = useState('');
  const [smsDrawer, setSmsDrawer] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(`SES_${Date.now()}`);

  const handleKeyPress = (char: string) => {
    if (!isInSession) {
      setDialInput((prev) => prev + char);
    } else if (!isSessionFinal) {
      setCurrentInputStep((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    if (!isInSession) {
      setDialInput((prev) => prev.slice(0, -1));
    } else if (!isSessionFinal) {
      setCurrentInputStep((prev) => prev.slice(0, -1));
    }
  };

  const handleStartSession = async () => {
    if (!dialInput.startsWith('*') || !dialInput.endsWith('#')) {
      alert("Invalid USSD code. Please dial a code like '*384#'");
      return;
    }

    const newSesId = `SES_${Math.floor(100000 + Math.random() * 900000)}`;
    setSessionId(newSesId);
    setHistoryText('');
    setCurrentInputStep('');
    setSmsDrawer(null);

    const result = await lindaStore.processUSSD(phoneNumber, '');
    setIsInSession(true);
    setSessionScreenText(result.response);
    setIsSessionFinal(result.isFinal);
    if (result.smsNotification) {
      setSmsDrawer(result.smsNotification);
    }
  };

  const handleSendInput = async () => {
    if (!currentInputStep && !isSessionFinal) return;

    if (isSessionFinal) {
      handleEndSession();
      return;
    }

    const newHistory = historyText ? `${historyText}*${currentInputStep}` : currentInputStep;
    setHistoryText(newHistory);
    setCurrentInputStep('');

    const result = await lindaStore.processUSSD(phoneNumber, newHistory);
    setSessionScreenText(result.response);
    setIsSessionFinal(result.isFinal);
    if (result.smsNotification) {
      setSmsDrawer(result.smsNotification);
    }
  };

  const handleEndSession = () => {
    setIsInSession(false);
    setSessionScreenText('');
    setIsSessionFinal(false);
    setCurrentInputStep('');
    setHistoryText('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Intro Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-sage)] animate-pulse" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                USSD Terminal Simulator (*384#)
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              LindaNyota operates over universal USSD channels across Kenya. Students on feature phones
              or without internet access can instantly request subsidized meals, check their welfare
              rating, and match with emergency bursaries.
            </p>
          </div>

          {/* Quick Dial Presets */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDialInput('*384#');
                handleEndSession();
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] text-[var(--text-primary)] text-xs font-mono transition-colors border border-[var(--border-color)] cursor-pointer"
            >
              *384# (Student Menu)
            </button>
            <button
              onClick={() => {
                setDialInput('*384*4#');
                handleEndSession();
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] text-xs font-mono font-bold transition-colors cursor-pointer shadow-sm"
            >
              *384*4# (Merchant Fast Dial)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feature Phone Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[320px] bg-[var(--bg-surface)] border-4 border-[var(--border-color)] rounded-[38px] p-5 shadow-xl space-y-4 transition-colors">
            {/* Phone Speaker */}
            <div className="flex justify-center items-center gap-2 pb-1">
              <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[var(--border-color)] rounded-full" />
            </div>

            {/* LCD Screen */}
            <div className="bg-[#1f271f] text-[#a4fba6] border-2 border-[#2f3d2f] rounded-xl p-4 font-mono text-xs min-h-[175px] flex flex-col justify-between shadow-inner select-none relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-[#71af73] border-b border-[#2f3d2f] pb-1 mb-2">
                <span>SIM 1 · SAF</span>
                <span>{isInSession ? 'ACTIVE SESSION' : 'IDLE'}</span>
              </div>

              {/* Screen Content */}
              <div className="flex-1 whitespace-pre-line leading-relaxed text-[11px] overflow-y-auto max-h-[110px]">
                {isInSession ? (
                  sessionScreenText
                ) : (
                  <div className="space-y-2 py-2">
                    <p className="text-[10px] text-[#71af73]">DIAL TO COMMENCE:</p>
                    <p className="text-xl text-[#c1ffc3] tracking-widest font-black">
                      {dialInput || '...'}
                    </p>
                    <p className="text-[9px] text-[#71af73]">Press Call below to initiate session.</p>
                  </div>
                )}
              </div>

              {/* Current Input inside Session */}
              {isInSession && !isSessionFinal && (
                <div className="mt-2 pt-1 border-t border-[#2f3d2f] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#71af73]">Input:</span>
                  <span className="font-bold text-[#c1ffc3] px-2 py-0.5 rounded bg-[#162016]">
                    {currentInputStep || '_'}
                  </span>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {!isInSession ? (
                <button
                  onClick={handleStartSession}
                  className="py-3 px-3 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call (*384#)</span>
                </button>
              ) : (
                <button
                  onClick={handleSendInput}
                  className="py-3 px-3 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSessionFinal ? 'OK (Dismiss)' : 'Send Input'}</span>
                </button>
              )}

              <button
                onClick={handleEndSession}
                className="py-3 px-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>End / Cancel</span>
              </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className="py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Backspace button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleBackspace}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs flex items-center gap-1 border border-[var(--border-color)] cursor-pointer"
              >
                <Delete className="w-3.5 h-3.5" />
                <span>Backspace</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live SMS Dispatch Drawer & Webhook Payload Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* SMS Notification Banner */}
          {smsDrawer && (
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-5 space-y-2 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  SMS Dispatch Alert (Delivered)
                </span>
                <span className="font-mono text-[10px]">TO: {phoneNumber}</span>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-emerald-500/30 text-xs text-[var(--text-primary)] font-mono leading-relaxed">
                {smsDrawer}
              </div>
            </div>
          )}

          {/* Webhook Payload Inspector */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--accent-sage)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  USSD Session Webhook Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">HTTP POST Payload</span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Telecom gateway invokes your backend endpoint via standard form-encoded POST
              parameters. State machine decodes history paths like <code>1*2</code>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1.5">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>POST Endpoint:</span>
                  <span className="text-[var(--accent-sage)] font-bold">/api/v1/ussd</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>sessionId:</span>
                  <span className="text-[var(--text-primary)]">{sessionId}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>serviceCode:</span>
                  <span className="text-[var(--text-primary)]">*384#</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>phoneNumber:</span>
                  <span className="text-[var(--text-primary)]">{phoneNumber}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>text (session string):</span>
                  <span className="text-amber-500 font-bold">{historyText || '(empty: initial)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
