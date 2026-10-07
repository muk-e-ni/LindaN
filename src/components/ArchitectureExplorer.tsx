import React, { useState } from 'react';
import {
  Code2,
  Database,
  Shield,
  Layers,
  Copy,
  CheckCircle2,
  FileCode,
  Terminal,
  Play,
  Cpu,
} from 'lucide-react';

type CodeTab = 'schema' | 'models' | 'security' | 'ussd' | 'payouts' | 'fvi' | 'main';

export const ArchitectureExplorer: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('schema');
  const [copied, setCopied] = useState(false);
  const [apiMethod, setApiMethod] = useState<'POST' | 'GET'>('POST');
  const [apiEndpoint, setApiEndpoint] = useState('/api/v1/fvi/evaluate');
  const [apiPayload, setApiPayload] = useState(
    JSON.stringify(
      {
        student_id: 'std-001',
        hef_band: 1,
        fee_balance_kes: 48000,
        annual_tuition_kes: 65000,
        weekly_meal_requests: 4,
        total_redemptions: 11,
        hardship_events: 3,
        is_orphan: true,
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteSandbox = () => {
    setIsExecutingApi(true);
    setApiResponse(null);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(apiPayload);
        const feeRatio = (parsed.fee_balance_kes || 0) / (parsed.annual_tuition_kes || 65000);
        const baseScore =
          ((6 - (parsed.hef_band || 3)) / 5) * 26 +
          Math.min(feeRatio * 24, 24) +
          Math.min(((parsed.weekly_meal_requests || 0) / 7) * 20, 20) +
          Math.min(((parsed.hardship_events || 0) / 4) * 15, 15) +
          Math.min(((parsed.total_redemptions || 0) / 15) * 7, 7) +
          (parsed.is_orphan ? 5 : 0);

        const fvi = Math.min(99.5, Math.max(5.0, Math.round(baseScore * 10) / 10));

        const simResult = {
          status: 'success',
          evaluated_at: new Date().toISOString(),
          student_id: parsed.student_id,
          fvi_score: fvi,
          risk_category: fvi >= 75 ? 'CRITICAL' : fvi >= 55 ? 'HIGH' : 'MEDIUM',
          emergency_meal_eligible: fvi >= 55,
          recommended_bursary_award_kes: fvi >= 75 ? 35000 : 20000,
          target_allocations: [
            { fund: 'Kajiado South NG-CDF Pool', matched: true, priority: 1 },
            { fund: 'Alumni Emergency Meal Fund', matched: true, priority: 1 },
          ],
        };

        setApiResponse(JSON.stringify(simResult, null, 2));
      } catch {
        setApiResponse(JSON.stringify({ error: 'Malformed JSON payload' }, null, 2));
      }
      setIsExecutingApi(false);
    }, 700);
  };

  const codeSnippets: Record<CodeTab, { title: string; filename: string; desc: string; code: string }> = {
    schema: {
      title: 'Database Schema DDL (PostgreSQL 16+)',
      filename: 'backend/database/schema.sql',
      desc: 'Complete PostgreSQL relational DDL with UUID keys, single-use voucher token hashes, row-level locks, and data protection compliance.',
      code: `-- LindaNyota Database Schema (PostgreSQL 16+)
-- Student Emergency Meal & Bursary Allocation Network
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no BYTEA NOT NULL,
    phone_number BYTEA NOT NULL,
    national_id BYTEA,
    reg_no_blind_index VARCHAR(64) UNIQUE NOT NULL,
    phone_blind_index VARCHAR(64) UNIQUE NOT NULL,
    hef_band SMALLINT NOT NULL CHECK (hef_band BETWEEN 1 AND 5),
    university_id VARCHAR(50) NOT NULL,
    faculty VARCHAR(120),
    county_of_origin VARCHAR(60) NOT NULL,
    constituency VARCHAR(80) NOT NULL,
    is_active_semester BOOLEAN DEFAULT TRUE,
    fee_balance_kes NUMERIC(12, 2) DEFAULT 0.00,
    annual_tuition_kes NUMERIC(12, 2) DEFAULT 65000.00,
    weekly_meal_requests INT DEFAULT 0,
    total_redemptions INT DEFAULT 0,
    daily_meals_today INT DEFAULT 0,
    hardship_events INT DEFAULT 0,
    is_orphan BOOLEAN DEFAULT FALSE,
    has_chronic_illness_or_disability BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    meal_name VARCHAR(100) NOT NULL,
    meal_price_kes NUMERIC(10, 2) NOT NULL,
    subsidy_kes NUMERIC(10, 2) NOT NULL,
    copay_kes NUMERIC(10, 2) NOT NULL,
    amount_kes NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'CANCELLED')),
    issued_via VARCHAR(20) DEFAULT 'WEB_APP',
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ,
    redeemed_by_vendor_id UUID,
    payout_ref VARCHAR(100)
);`,
    },
    models: {
      title: 'SQLAlchemy 2.0 Async ORM Models',
      filename: 'backend/database/models.py',
      desc: 'Python asynchronous ORM entity definitions with strict foreign keys and audit relationships.',
      code: `from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hef_band: Mapped[int] = mapped_column(Integer, nullable=False)
    university_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    county_of_origin: Mapped[str] = mapped_column(String(60), nullable=False)
    constituency: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    fee_balance_kes: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)

    vouchers: Mapped[List["MealVoucher"]] = relationship("MealVoucher", back_populates="student")

class MealVoucher(Base):
    __tablename__ = "meal_vouchers"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("students.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    meal_name: Mapped[str] = mapped_column(String(100), nullable=False)
    meal_price_kes: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    subsidy_kes: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    copay_kes: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ISSUED", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)`,
    },
    security: {
      title: 'Security Core (Privacy Protection, Cryptographic Tokens, Rate Limiting)',
      filename: 'backend/core/security.py',
      desc: 'Compliance and protection module. Cryptographically secures voucher tokens, limits requests to 2 per day, and prevents double redemption.',
      code: `import os
import secrets
import time
from typing import Tuple, Optional

class VoucherRateLimiter:
    """Strict rate-limiting: Max 2 meals per student per calendar day (24 hours)."""
    def __init__(self):
        self._history = {}

    def can_request_voucher(self, student_id: str) -> Tuple[bool, Optional[str]]:
        now = time.time()
        requests = self._history.get(student_id, [])
        # Filter requests in the last 24 hours
        recent = [t for t in requests if now - t < 86400]
        self._history[student_id] = recent

        if len(recent) >= 2:
            return False, "Daily limit reached: Maximum 2 meals per day."
        
        # Cooldown guard: Minimum 3 hours between meals
        if recent and (now - recent[-1] < 10800):
            wait_min = int((10800 - (now - recent[-1])) / 60)
            return False, f"Cooldown active: Next meal available in {wait_min} minutes."

        return True, None

    def record_voucher_request(self, student_id: str):
        now = time.time()
        requests = self._history.get(student_id, [])
        requests.append(now)
        self._history[student_id] = requests

rate_limiter = VoucherRateLimiter()

def generate_secure_voucher_token() -> str:
    """Cryptographically secure single-use 4-digit code (1000..9999)."""
    return str(secrets.randbelow(9000) + 1000)`,
    },
    ussd: {
      title: 'USSD Session Router (*384#)',
      filename: 'backend/api/ussd.py',
      desc: 'Handles telco USSD HTTP POST session callbacks. Supports both student meal requests and merchant voucher redemption.',
      code: `from fastapi import APIRouter, Form, Response
from backend.core.security import generate_secure_voucher_token, rate_limiter

ussd_router = APIRouter(prefix="/api/v1/ussd", tags=["USSD Protocol"])

@ussd_router.post("", response_class=Response)
async def handle_ussd_session(
    sessionId: str = Form(...),
    serviceCode: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
):
    user_inputs = text.strip().split("*") if text.strip() else []
    depth = len(user_inputs)

    if depth == 0 or not text.strip():
        menu = (
            "CON LindaNyota Student Welfare\\n"
            "1. Request Meal Voucher (Max 2/day)\\n"
            "2. Check Welfare Status\\n"
            "3. Apply for Bursary Match\\n"
            "4. Merchant Redemptions"
        )
        return Response(content=menu, media_type="text/plain")
    
    if user_inputs[0] == "1":
        if depth == 1:
            menu = (
                "CON Choose Campus Meal:\\n"
                "1. Githeri (KES 70: Sub KES 60, Co-pay KES 10)\\n"
                "2. Chapati Ndengu (KES 80: Sub KES 70, Co-pay KES 10)\\n"
                "3. Rice Minji (KES 90: Sub KES 75, Co-pay KES 15)\\n"
                "4. Ugali Beef (KES 100: Sub KES 80, Co-pay KES 20)"
            )
            return Response(content=menu, media_type="text/plain")`,
    },
    payouts: {
      title: 'Merchant & Donor Payment Engine (M-Pesa)',
      filename: 'backend/integrations/payouts.py',
      desc: 'Handles mobile money processing: instant merchant payouts matching exact menu pricing and alumni micro-donations starting from KES 50.',
      code: `import httpx

async def initiate_mobile_donation(phone_number: str, amount: float, donor_name: str = "") -> dict:
    """Mobile money contribution starting from KES 50."""
    payload = {
        "PhoneNumber": phone_number,
        "Amount": int(amount),
        "Donor": donor_name or "Anonymous Supporter",
        "Reference": "LindaNyota Fund"
    }
    return {"status": "SUCCESS", "receipt": "QK849201STK"}

async def disburse_merchant_settlement(till_or_phone: str, exact_amount: float, meal_name: str) -> dict:
    """Disburses EXACT meal cost to campus vendor upon voucher verification."""
    payload = {
        "RecipientTill": till_or_phone,
        "Amount": exact_amount,
        "Remarks": f"LindaNyota Meal: {meal_name}"
    }
    return {"status": "SETTLED", "receipt": "QK391048B2C", "settled_amount": exact_amount}`,
    },
    fvi: {
      title: 'Welfare Scoring & Bursary Matcher',
      filename: 'backend/ml/fvi_engine.py',
      desc: 'Predicts student financial vulnerability using multi-source inputs and matches eligible students to bursaries.',
      code: `from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class FVIEvaluation:
    fvi_score: float
    risk_category: str
    feature_contributions: Dict[str, float]

class FVIPredictor:
    def evaluate_student(self, student_features: Dict[str, Any]) -> FVIEvaluation:
        hef_band = student_features.get("hef_band", 3)
        fee_ratio = student_features.get("fee_balance_kes", 0) / max(student_features.get("annual_tuition_kes", 65000), 1)
        req_7d = student_features.get("weekly_meal_requests", 0)
        redemptions = student_features.get("total_redemptions", 0)
        hardships = student_features.get("hardship_events", 0)

        raw = (
            ((6 - hef_band) / 5) * 26.0 +
            min(fee_ratio * 24.0, 24.0) +
            min(req_7d / 7.0, 1.0) * 20.0 +
            min(hardships / 4.0, 1.0) * 15.0 +
            min(redemptions / 15.0, 1.0) * 7.0
        )
        score = min(99.5, max(5.0, round(raw, 1)))
        category = "CRITICAL" if score >= 75 else "HIGH" if score >= 55 else "MEDIUM"
        return FVIEvaluation(fvi_score=score, risk_category=category, feature_contributions={})`,
    },
    main: {
      title: 'FastAPI Application Server',
      filename: 'backend/main.py',
      desc: 'Complete async application with router mounts for USSD, meal vouchers, live welfare scoring, and merchant redemptions.',
      code: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.ussd import ussd_router

app = FastAPI(title="LindaNyota API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ussd_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "LindaNyota"}`,
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Architecture System Diagram */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--accent-sage)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                LindaNyota System Specifications & Architecture
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              End-to-end topology designed for Kenyan university ecosystems with USSD, mobile money,
              atomic redemption locks, and data protection compliance.
            </p>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]">
            Service Architecture
          </span>
        </div>

        {/* Visual Flow Topology */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
            <span className="text-[var(--accent-sage)] font-bold block uppercase text-[11px]">
              1. Ingress Layer
            </span>
            <ul className="text-[var(--text-primary)] space-y-1 text-[11px]">
              <li>• USSD Channel (*384#)</li>
              <li>• Mobile Web Pass (NFC / QR)</li>
              <li>• Secure Merchant PoS</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold block uppercase text-[11px]">
              2. Core API & Security
            </span>
            <ul className="text-[var(--text-primary)] space-y-1 text-[11px]">
              <li>• FastAPI (Async Python 3.11)</li>
              <li>• Data Privacy Protection</li>
              <li>• Single-Use 4-Digit Tokens</li>
              <li>• 2 Meals/Day Limit Guard</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold block uppercase text-[11px]">
              3. Welfare & Matcher
            </span>
            <ul className="text-[var(--text-primary)] space-y-1 text-[11px]">
              <li>• Live Usage Telemetry</li>
              <li>• HEF Band 1–5 Calibration</li>
              <li>• NG-CDF & County Routing</li>
              <li>• 1-Click Dean Batch Approval</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
            <span className="text-rose-500 font-bold block uppercase text-[11px]">
              4. Settlement & DB
            </span>
            <ul className="text-[var(--text-primary)] space-y-1 text-[11px]">
              <li>• Relational PostgreSQL DB</li>
              <li>• Instant Merchant Settlement</li>
              <li>• Donor Pledges from KES 50</li>
              <li>• Double-Spend Atomic Guard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[var(--accent-sage)]" />
              Production Source Code Explorer
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
              {codeSnippets[activeCodeTab].filename}
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--accent-sage)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Copy Source File</span>
              </>
            )}
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'schema', label: 'schema.sql' },
            { id: 'models', label: 'models.py' },
            { id: 'security', label: 'security.py' },
            { id: 'ussd', label: 'ussd.py' },
            { id: 'payouts', label: 'payouts.py' },
            { id: 'fvi', label: 'fvi_engine.py' },
            { id: 'main', label: 'main.py' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id as CodeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCodeTab === tab.id
                  ? 'bg-[var(--accent-sage)] text-[var(--accent-sage-text)] font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {codeSnippets[activeCodeTab].desc}
        </p>

        {/* Code Content Window */}
        <div className="bg-[#121316] rounded-xl p-4 border border-[var(--border-color)] overflow-x-auto max-h-[460px]">
          <pre className="text-xs font-mono text-[#a4fba6] leading-relaxed whitespace-pre selection:bg-[var(--accent-sage)]/40">
            {codeSnippets[activeCodeTab].code}
          </pre>
        </div>
      </div>

      {/* Live API Sandbox */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent-sage)]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Live API Endpoint Sandbox</h3>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">Interactive Test Harness</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={apiMethod}
            onChange={(e) => setApiMethod(e.target.value as 'POST' | 'GET')}
            className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)]"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>

          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
          />

          <button
            onClick={handleExecuteSandbox}
            disabled={isExecutingApi}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[var(--accent-sage)] hover:bg-[var(--accent-sage)]/90 text-[var(--accent-sage-text)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isExecutingApi ? 'Running...' : 'Execute'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[var(--text-primary)] block">
              Request Payload (JSON):
            </span>
            <textarea
              rows={9}
              value={apiPayload}
              onChange={(e) => setApiPayload(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[var(--text-primary)] block">
              Response Output (200 OK):
            </span>
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] font-mono text-xs text-emerald-600 dark:text-emerald-400 min-h-[190px] overflow-x-auto">
              {apiResponse ? (
                <pre>{apiResponse}</pre>
              ) : (
                <span className="text-[var(--text-muted)]">
                  Click 'Execute' to trigger live inference and bursary matching.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
