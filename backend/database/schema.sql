-- ==============================================================================
-- LindaNyota Database Schema (PostgreSQL 16+)
-- Kenya EdTech & FinTech Student Emergency Meal & Bursary Ecosystem
-- Compliance: Kenya Data Protection Act 2019 (AES-256 field encryption for PII)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for idempotency if running fresh
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS donations CASCADE;
-- DROP TABLE IF EXISTS bursary_applications_and_matches CASCADE;
-- DROP TABLE IF EXISTS bursaries_and_sponsorships CASCADE;
-- DROP TABLE IF EXISTS meal_vouchers CASCADE;
-- DROP TABLE IF EXISTS vendors CASCADE;
-- DROP TABLE IF EXISTS fvi_scores CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;

-- Enums
DO $$ BEGIN
    CREATE TYPE hef_band_enum AS ENUM ('BAND_1', 'BAND_2', 'BAND_3', 'BAND_4', 'BAND_5');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_category_enum AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vendor_type_enum AS ENUM ('CANTEEN', 'MAMA_MBOGA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE voucher_status_enum AS ENUM ('ISSUED', 'REDEEMED', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bursary_type_enum AS ENUM ('CDF', 'COUNTY', 'ALUMNI', 'INSTITUTIONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status_enum AS ENUM ('FLAGGED', 'RECOMMENDED', 'APPROVED', 'DISBURSED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 1. Students Table
-- All PII (National ID, Phone, Reg No) encrypted at rest via AES-256
-- -----------------------------------------------------------------------------
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_no_encrypted BYTEA NOT NULL,
    reg_no_blind_index VARCHAR(64) UNIQUE NOT NULL, -- HMAC-SHA256 blind index for exact matches without decrypting
    full_name_encrypted BYTEA NOT NULL,
    phone_number_encrypted BYTEA NOT NULL,
    phone_number_blind_index VARCHAR(64) UNIQUE NOT NULL, -- For USSD lookup
    national_id_encrypted BYTEA,
    hef_band INT NOT NULL CHECK (hef_band BETWEEN 1 AND 5),
    university_id VARCHAR(50) NOT NULL, -- e.g., 'UON', 'KU', 'JKUAT', 'MOI', 'EGERTON'
    faculty VARCHAR(100),
    county_of_origin VARCHAR(60) NOT NULL, -- e.g., 'Kajiado', 'Turkana', 'Kakamega', 'Nairobi'
    constituency VARCHAR(80) NOT NULL, -- e.g., 'Kajiado South', 'Westlands', 'Embakasi East'
    is_active_semester BOOLEAN DEFAULT TRUE NOT NULL,
    fee_balance_kes DECIMAL(12, 2) DEFAULT 0.00,
    annual_tuition_kes DECIMAL(12, 2) DEFAULT 100000.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_students_university ON students(university_id);
CREATE INDEX idx_students_hef_band ON students(hef_band);
CREATE INDEX idx_students_constituency ON students(constituency);
CREATE INDEX idx_students_phone_blind ON students(phone_number_blind_index);

-- -----------------------------------------------------------------------------
-- 2. FVI Scores Table (Financial Vulnerability Index)
-- -----------------------------------------------------------------------------
CREATE TABLE fvi_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score DECIMAL(5, 2) NOT NULL CHECK (score BETWEEN 0.00 AND 100.00),
    risk_category risk_category_enum NOT NULL,
    features_snapshot JSONB NOT NULL,
    ai_explanation TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX idx_fvi_student_latest ON fvi_scores(student_id);
CREATE INDEX idx_fvi_score_desc ON fvi_scores(score DESC);
CREATE INDEX idx_fvi_risk_category ON fvi_scores(risk_category);

-- -----------------------------------------------------------------------------
-- 3. Vendors Table
-- Registered Canteens & Informal Mama Mbogas around campus
-- -----------------------------------------------------------------------------
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    type vendor_type_enum NOT NULL,
    mpesa_till_or_phone VARCHAR(15) NOT NULL, -- e.g., '254712345678' or Till '543210'
    location_desc VARCHAR(200) NOT NULL,
    university_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    total_meals_served INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_vendors_university ON vendors(university_id);
CREATE INDEX idx_vendors_phone ON vendors(mpesa_till_or_phone);

-- -----------------------------------------------------------------------------
-- 4. Meal Vouchers Table
-- Single-use cryptographically hashed token (SHA-256) with 2-hour TTL
-- -----------------------------------------------------------------------------
CREATE TABLE meal_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of the 4-digit code + student_id salt
    amount DECIMAL(10, 2) DEFAULT 100.00 NOT NULL, -- Standard dignity meal cap (KES 100)
    status voucher_status_enum DEFAULT 'ISSUED' NOT NULL,
    issued_via VARCHAR(20) DEFAULT 'USSD' NOT NULL, -- 'USSD' or 'WEB_APP'
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ,
    redeemed_by_vendor_id UUID REFERENCES vendors(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_meal_vouchers_token_hash ON meal_vouchers(token_hash);
CREATE INDEX idx_meal_vouchers_student_created ON meal_vouchers(student_id, created_at DESC);
CREATE INDEX idx_meal_vouchers_status_expires ON meal_vouchers(status, expires_at);

-- -----------------------------------------------------------------------------
-- 5. Bursaries and Sponsorships Table
-- CDF, County, Institutional & Alumni pools with criteria
-- -----------------------------------------------------------------------------
CREATE TABLE bursaries_and_sponsorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    type bursary_type_enum NOT NULL,
    total_budget DECIMAL(14, 2) NOT NULL,
    remaining_budget DECIMAL(14, 2) NOT NULL CHECK (remaining_budget >= 0),
    minimum_fvi_threshold DECIMAL(5, 2) DEFAULT 60.00 NOT NULL,
    target_county VARCHAR(60),
    target_constituency VARCHAR(80),
    eligibility_criteria JSONB NOT NULL,
    is_accepting_applications BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_bursaries_type ON bursaries_and_sponsorships(type);
CREATE INDEX idx_bursaries_constituency ON bursaries_and_sponsorships(target_constituency);

-- -----------------------------------------------------------------------------
-- 6. Bursary Applications and Matches Table
-- AI-matched candidate allocations with Dean verification workflow
-- -----------------------------------------------------------------------------
CREATE TABLE bursary_applications_and_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    bursary_id UUID NOT NULL REFERENCES bursaries_and_sponsorships(id) ON DELETE RESTRICT,
    fvi_score_at_match DECIMAL(5, 2) NOT NULL,
    amount_allocated DECIMAL(12, 2) NOT NULL,
    status application_status_enum DEFAULT 'FLAGGED' NOT NULL,
    approved_by_admin_id UUID,
    approved_at TIMESTAMPTZ,
    disbursement_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_bursary_matches_student ON bursary_applications_and_matches(student_id);
CREATE INDEX idx_bursary_matches_bursary ON bursary_applications_and_matches(bursary_id);
CREATE INDEX idx_bursary_matches_status ON bursary_applications_and_matches(status);

-- -----------------------------------------------------------------------------
-- 7. Donations Table (Alumni & Public Support Pool)
-- -----------------------------------------------------------------------------
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(120) DEFAULT 'Anonymous Friend of LindaNyota' NOT NULL,
    donor_phone_masked VARCHAR(20),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    mpesa_receipt_number VARCHAR(30) UNIQUE NOT NULL,
    target_bursary_id UUID REFERENCES bursaries_and_sponsorships(id) ON DELETE SET NULL,
    channel VARCHAR(30) DEFAULT 'STK_PUSH' NOT NULL,
    checkout_request_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_donations_mpesa_receipt ON donations(mpesa_receipt_number);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. Transactions Table
-- Instant Daraja B2C settlement logs to vendors upon meal voucher redemption
-- -----------------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID NOT NULL UNIQUE REFERENCES meal_vouchers(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    amount_settled DECIMAL(10, 2) NOT NULL,
    daraja_conversation_id VARCHAR(80),
    daraja_originator_conversation_id VARCHAR(80),
    daraja_b2c_response_code VARCHAR(10),
    daraja_receipt_number VARCHAR(40),
    status VARCHAR(20) DEFAULT 'SUCCESS' NOT NULL,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_transactions_vendor ON transactions(vendor_id);
CREATE INDEX idx_transactions_receipt ON transactions(daraja_receipt_number);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);

-- -----------------------------------------------------------------------------
-- Anti-Abuse Constraint:
-- Double-spend row-lock function used by PostgreSQL transactions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION redeem_voucher_atomic(
    p_token_hash VARCHAR(64),
    p_vendor_id UUID,
    p_amount DECIMAL(10, 2)
)
RETURNS TABLE (
    success BOOLEAN,
    voucher_id UUID,
    student_id UUID,
    message TEXT
) AS $$
DECLARE
    v_voucher meal_vouchers%ROWTYPE;
BEGIN
    -- Acquire exclusive row lock to prevent race conditions & double-spend
    SELECT * INTO v_voucher
    FROM meal_vouchers
    WHERE token_hash = p_token_hash
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Voucher token not found or invalid.';
        RETURN;
    END IF;

    IF v_voucher.status = 'REDEEMED' THEN
        RETURN QUERY SELECT FALSE, v_voucher.id, v_voucher.student_id, 'Voucher has already been redeemed.';
        RETURN;
    END IF;

    IF v_voucher.status = 'EXPIRED' OR v_voucher.expires_at < CURRENT_TIMESTAMP THEN
        UPDATE meal_vouchers SET status = 'EXPIRED' WHERE id = v_voucher.id;
        RETURN QUERY SELECT FALSE, v_voucher.id, v_voucher.student_id, 'Voucher has expired (2-hour TTL exceeded).';
        RETURN;
    END IF;

    -- Update voucher status to REDEEMED atomically
    UPDATE meal_vouchers
    SET status = 'REDEEMED',
        redeemed_at = CURRENT_TIMESTAMP,
        redeemed_by_vendor_id = p_vendor_id
    WHERE id = v_voucher.id;

    -- Update vendor stats
    UPDATE vendors
    SET total_meals_served = total_meals_served + 1
    WHERE id = p_vendor_id;

    RETURN QUERY SELECT TRUE, v_voucher.id, v_voucher.student_id, 'Voucher redeemed successfully.';
END;
$$ LANGUAGE plpgsql;
