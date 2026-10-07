export type HEFBand = 1 | 2 | 3 | 4 | 5;

export type RiskCategory = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type VendorType = 'CANTEEN' | 'MAMA_MBOGA';

export type VoucherStatus = 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';

export type BursaryType = 'CDF' | 'COUNTY' | 'ALUMNI' | 'INSTITUTIONAL';

export type ApplicationStatus = 'FLAGGED' | 'RECOMMENDED' | 'APPROVED' | 'DISBURSED' | 'REJECTED';

export type HardshipCategory =
  | 'BEREAVEMENT'
  | 'MEDICAL_EMERGENCY'
  | 'HELB_DELAY'
  | 'DROUGHT_SHOCK'
  | 'JOB_LOSS'
  | 'ACCOMMODATION_EVICTION';

export interface MenuItem {
  id: string;
  name: string;
  priceKes: number;
  subsidyKes: number; // Covered by LindaNyota emergency pool
  copayKes: number;   // Student co-pay amount if able to contribute
  isAvailable: boolean;
  category?: string;
  description?: string;
}

export interface HardshipReport {
  id: string;
  studentId: string;
  category: HardshipCategory;
  title: string;
  description: string;
  estimatedImpactKes: number;
  reportedAt: string;
  status: 'SELF_REPORTED' | 'VERIFIED' | 'FLAGGED';
}

export interface Student {
  id: string;
  regNo: string;
  fullName: string;
  phone: string;
  nationalId: string;
  hefBand: HEFBand;
  universityId: 'UoN' | 'KU' | 'JKUAT' | 'Moi' | 'Egerton';
  faculty: string;
  countyOfOrigin: string;
  constituency: string;
  isActiveSemester: boolean;
  feeBalanceKes: number;
  annualTuitionKes: number;
  weeklyMealRequests: number;
  hardshipEvents: number;
  isOrphan: boolean;
  hasChronicIllnessOrDisability: boolean;
  hardships: HardshipReport[];
  // Daily and Telemetry Limits (Max 2 meals per day)
  dailyMealsRequestedToday: number;
  lastMealRequestTimestamp?: string;
  totalRequestsLast7Days: number;
  totalRequestsLast30Days: number;
  totalRedemptions: number;
  lastActiveDate: string;
  fviScore?: number;
  riskCategory?: RiskCategory;
}

export interface MealVoucher {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  token: string; // 4-digit numeric code
  tokenHash: string;
  vendorId: string;
  vendorName: string;
  mealId?: string;
  mealName: string;
  mealPriceKes: number;
  subsidyKes: number; // Amount covered by fund voucher
  copayKes: number;   // Student co-pay portion (0 if waived/unable)
  copayRequired: boolean;
  copayStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID';
  copayPaidAt?: string;
  copayMethod?: 'MPESA' | 'CASH_CONFIRMED';
  amountKes: number; // Total settled to vendor = mealPriceKes
  status: VoucherStatus;
  issuedVia: 'USSD' | 'WEB_APP' | 'NFC';
  issuedAt: string;
  expiresAt: string;
  redeemedAt?: string;
  redeemedByVendorId?: string;
  redeemedByVendorName?: string;
  darajaReceipt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  mpesaTillOrPhone: string;
  location: string;
  universityId: string;
  isActive: boolean;
  isOpenToday: boolean;
  operatingHours: string;
  menu: MenuItem[];
  totalMealsServed: number;
  totalPayoutsKes: number;
}

export interface Bursary {
  id: string;
  name: string;
  type: BursaryType;
  totalBudgetKes: number;
  remainingBudgetKes: number;
  minimumFviThreshold: number;
  targetCounty?: string;
  targetConstituency?: string;
  maxAwardPerStudentKes: number;
  sponsorName: string;
}

export interface BursaryMatchApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  bursaryId: string;
  bursaryName: string;
  bursaryType: BursaryType;
  fviScoreAtMatch: number;
  recommendedAmountKes: number;
  status: ApplicationStatus;
  matchedAt: string;
  approvedAt?: string;
  disbursementRef?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  isAnonymous: boolean;
  amountKes: number;
  mpesaReceiptNumber: string;
  phoneMasked: string;
  channel: 'STK_PUSH' | 'PAYBILL';
  timestamp: string;
  targetBursaryId?: string;
}

export interface Transaction {
  id: string;
  voucherId: string;
  studentRegNo?: string;
  vendorId: string;
  vendorName: string;
  mealName: string;
  amountKes: number; // Exact amount paid to vendor
  subsidyKes: number;
  copayKes: number;
  darajaReceipt: string;
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface FVIEvaluationResult {
  fviScore: number;
  riskCategory: RiskCategory;
  emergencyMealEligible: boolean;
  bursaryPriorityTier: number;
  featureContributions: {
    hefBandContrib: number;
    feeDebtContrib: number;
    mealVelocityContrib: number;
    hardshipShockContrib: number;
    vulnerabilityContrib: number;
    platformUsageContrib: number;
  };
  telemetrySnapshot: {
    totalRequests7d: number;
    redemptionsCount: number;
    hardshipsCount: number;
    activityTier: string;
  };
  narrative: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    identifier: string;
    name: string;
    role: 'STUDENT' | 'VENDOR' | 'DEAN_ADMIN' | 'DONOR';
  };
}
