"""
LindaNyota Database Models (SQLAlchemy 2.0 Async ORM)
Kenyan University Student Early-Intervention, Meal Access & Bursary Matching Ecosystem
Compatible with PostgreSQL 16+ & Alembic.
"""

from datetime import datetime, timezone
import enum
from typing import List, Optional
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    LargeBinary,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from pydantic import BaseModel, Field, ConfigDict


class Base(DeclarativeBase):
    pass


# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------
class RiskCategory(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class VendorType(str, enum.Enum):
    CANTEEN = "CANTEEN"
    MAMA_MBOGA = "MAMA_MBOGA"


class VoucherStatus(str, enum.Enum):
    ISSUED = "ISSUED"
    REDEEMED = "REDEEMED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class BursaryType(str, enum.Enum):
    CDF = "CDF"
    COUNTY = "COUNTY"
    ALUMNI = "ALUMNI"
    INSTITUTIONAL = "INSTITUTIONAL"


class ApplicationStatus(str, enum.Enum):
    FLAGGED = "FLAGGED"
    RECOMMENDED = "RECOMMENDED"
    APPROVED = "APPROVED"
    DISBURSED = "DISBURSED"
    REJECTED = "REJECTED"


# -----------------------------------------------------------------------------
# SQLAlchemy Models
# -----------------------------------------------------------------------------
class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reg_no_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    reg_no_blind_index: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    full_name_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    phone_number_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    phone_number_blind_index: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    national_id_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)

    hef_band: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5
    university_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    faculty: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    county_of_origin: Mapped[str] = mapped_column(String(60), nullable=False)
    constituency: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    is_active_semester: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fee_balance_kes: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    annual_tuition_kes: Mapped[float] = mapped_column(Numeric(12, 2), default=100000.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    fvi_score: Mapped[Optional["FVIScore"]] = relationship(
        "FVIScore", back_populates="student", uselist=False, cascade="all, delete-orphan"
    )
    vouchers: Mapped[List["MealVoucher"]] = relationship(
        "MealVoucher", back_populates="student", cascade="all, delete-orphan"
    )
    bursary_matches: Mapped[List["BursaryApplicationAndMatch"]] = relationship(
        "BursaryApplicationAndMatch", back_populates="student"
    )


class FVIScore(Base):
    __tablename__ = "fvi_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    score: Mapped[float] = mapped_column(Numeric(5, 2), index=True, nullable=False)
    risk_category: Mapped[RiskCategory] = mapped_column(
        SAEnum(RiskCategory), index=True, nullable=False
    )
    features_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    student: Mapped["Student"] = relationship("Student", back_populates="fvi_score")


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[VendorType] = mapped_column(SAEnum(VendorType), nullable=False)
    mpesa_till_or_phone: Mapped[str] = mapped_column(
        String(15), index=True, nullable=False
    )  # e.g., '254712345678' or Till number
    location_desc: Mapped[str] = mapped_column(String(200), nullable=False)
    university_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    total_meals_served: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    vouchers_redeemed: Mapped[List["MealVoucher"]] = relationship(
        "MealVoucher", back_populates="vendor"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="vendor"
    )


class MealVoucher(Base):
    __tablename__ = "meal_vouchers"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("students.id"), index=True, nullable=False
    )
    token_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), default=100.0, nullable=False)
    status: Mapped[VoucherStatus] = mapped_column(
        SAEnum(VoucherStatus), default=VoucherStatus.ISSUED, nullable=False
    )
    issued_via: Mapped[str] = mapped_column(String(20), default="USSD", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    redeemed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    redeemed_by_vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("vendors.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    student: Mapped["Student"] = relationship("Student", back_populates="vouchers")
    vendor: Mapped[Optional["Vendor"]] = relationship(
        "Vendor", back_populates="vouchers_redeemed"
    )
    transaction: Mapped[Optional["Transaction"]] = relationship(
        "Transaction", back_populates="voucher", uselist=False
    )


class BursaryAndSponsorship(Base):
    __tablename__ = "bursaries_and_sponsorships"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[BursaryType] = mapped_column(SAEnum(BursaryType), index=True, nullable=False)
    total_budget: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    remaining_budget: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    minimum_fvi_threshold: Mapped[float] = mapped_column(
        Numeric(5, 2), default=60.0, nullable=False
    )
    target_county: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    target_constituency: Mapped[Optional[str]] = mapped_column(
        String(80), index=True, nullable=True
    )
    eligibility_criteria: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_accepting_applications: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    matches: Mapped[List["BursaryApplicationAndMatch"]] = relationship(
        "BursaryApplicationAndMatch", back_populates="bursary"
    )


class BursaryApplicationAndMatch(Base):
    __tablename__ = "bursary_applications_and_matches"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("students.id"), index=True, nullable=False
    )
    bursary_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("bursaries_and_sponsorships.id"),
        index=True,
        nullable=False,
    )
    fvi_score_at_match: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    amount_allocated: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus), default=ApplicationStatus.FLAGGED, nullable=False
    )
    approved_by_admin_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    disbursement_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    student: Mapped["Student"] = relationship("Student", back_populates="bursary_matches")
    bursary: Mapped["BursaryAndSponsorship"] = relationship(
        "BursaryAndSponsorship", back_populates="matches"
    )


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    donor_name: Mapped[str] = mapped_column(
        String(120), default="Anonymous Supporter", nullable=False
    )
    donor_phone_masked: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    mpesa_receipt_number: Mapped[str] = mapped_column(
        String(30), unique=True, index=True, nullable=False
    )
    target_bursary_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bursaries_and_sponsorships.id"), nullable=True
    )
    channel: Mapped[str] = mapped_column(String(30), default="STK_PUSH", nullable=False)
    checkout_request_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    voucher_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("meal_vouchers.id"), unique=True, nullable=False
    )
    vendor_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("vendors.id"), index=True, nullable=False
    )
    amount_settled: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    daraja_conversation_id: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    daraja_originator_conversation_id: Mapped[Optional[str]] = mapped_column(
        String(80), nullable=True
    )
    daraja_b2c_response_code: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True
    )
    daraja_receipt_number: Mapped[Optional[str]] = mapped_column(
        String(40), index=True, nullable=True
    )
    status: Mapped[str] = mapped_column(String(20), default="SUCCESS", nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    voucher: Mapped["MealVoucher"] = relationship("MealVoucher", back_populates="transaction")
    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="transactions")


# -----------------------------------------------------------------------------
# Pydantic v2 Serialization Schemas
# -----------------------------------------------------------------------------
class StudentReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    masked_reg_no: str
    masked_phone: str
    hef_band: int
    university_id: str
    county_of_origin: str
    constituency: str
    is_active_semester: bool
    fee_balance_kes: float
    fvi_score: Optional[float] = None
    risk_category: Optional[RiskCategory] = None


class VoucherCreateRequest(BaseModel):
    student_id: uuid.UUID
    channel: str = Field(default="WEB_APP", description="'USSD' or 'WEB_APP'")


class VoucherVerifyRequest(BaseModel):
    token: str = Field(..., min_length=4, max_length=4, description="4-digit numeric voucher code")
    vendor_id: uuid.UUID
    meal_amount_kes: float = Field(default=100.0, ge=10.0, le=200.0)


class DarajaSTKPushRequest(BaseModel):
    phone_number: str = Field(..., pattern=r"^2547\d{8}$")
    amount: float = Field(..., gt=0)
    donor_name: str = "Anonymous Supporter"
    target_bursary_id: Optional[uuid.UUID] = None
