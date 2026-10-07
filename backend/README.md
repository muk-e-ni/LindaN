# LindaNyota — Full-Stack Backend Architecture & Security Manual

LindaNyota is an early-intervention, dignified meal access, and bursary-matching ecosystem tailored for Kenyan public and private university students.

---

## 1. Directory Structure

```text
/backend
├── database/
│   ├── schema.sql           # PostgreSQL 16+ DDL with row-level locks, indexes, triggers
│   └── models.py            # SQLAlchemy 2.0 Async ORM models & Pydantic v2 schemas
├── core/
│   └── security.py          # AES-256-GCM PII encryption, HMAC blind indexes, Argon2id, SHA-256 voucher hashing
├── api/
│   └── ussd.py              # Africa's Talking USSD Gateway (*384#) session state machine
├── integrations/
│   └── daraja.py            # Safaricom Daraja 2.0 (C2B STK Push, B2C automated vendor payouts)
├── ml/
│   └── fvi_engine.py        # Financial Vulnerability Index (FVI) ML model & Bursary Matcher
├── main.py                  # Primary FastAPI application with dependency injection & routers
├── requirements.txt         # Production Python 3.11+ dependencies
└── README.md                # System documentation
```

---

## 2. Key Security Mechanisms (Kenya Data Protection Act 2019)

1. **PII Field-Level Encryption:**
   - National IDs, Phone Numbers, and Registration Numbers are encrypted at rest using `AES-256-GCM`.
   - Deterministic HMAC-SHA256 blind indexing allows rapid $O(1)$ lookups without decrypting entire student tables.
2. **Double-Spend & Concurrency Protection:**
   - PostgreSQL `SELECT FOR UPDATE` row-level locks are used inside `redeem_voucher_atomic`.
   - Single-use 4-digit tokens generated via Python `secrets`.
   - Hashed with student-specific salt using SHA-256 before storage in PostgreSQL.
   - Vouchers enforce a strict 2-hour TTL and maximum 1 active voucher request per student every 24 hours.
3. **M-Pesa Daraja 2.0 Webhook Validation:**
   - C2B STK callbacks verify checkout request IDs, transaction codes, and metadata signatures.
   - B2C disbursements use dedicated security credentials and asynchronous result URLs.

---

## 3. Quickstart & Deployment

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply PostgreSQL Schema
psql -h localhost -U postgres -d lindanyota_db -f database/schema.sql

# 4. Start FastAPI Async Server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
