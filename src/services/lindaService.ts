import {
  Student,
  MealVoucher,
  Vendor,
  Bursary,
  BursaryMatchApplication,
  Donation,
  Transaction,
  FVIEvaluationResult,
  RiskCategory,
  HardshipReport,
  HardshipCategory,
  AuthSession,
  MenuItem,
} from '../types/lindanyota';

// Official Campus Menu with Exact Pricing and Co-Pay Structure
export const CAMPUS_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Githeri Special (Greens & Potato)',
    priceKes: 70,
    subsidyKes: 60,
    copayKes: 10,
    isAvailable: true,
    category: 'HOT_MEAL',
  },
  {
    id: 'm-2',
    name: 'Chapati (2) & Ndengu Stew',
    priceKes: 80,
    subsidyKes: 70,
    copayKes: 10,
    isAvailable: true,
    category: 'HOT_MEAL',
  },
  {
    id: 'm-3',
    name: 'Rice & Minji / Bean Stew',
    priceKes: 90,
    subsidyKes: 75,
    copayKes: 15,
    isAvailable: true,
    category: 'HOT_MEAL',
  },
  {
    id: 'm-4',
    name: 'Ugali Sukuma Beef Stew',
    priceKes: 100,
    subsidyKes: 80,
    copayKes: 20,
    isAvailable: true,
    category: 'HOT_MEAL',
  },
  {
    id: 'm-5',
    name: 'Hot Milk Tea & 2 Mandazi',
    priceKes: 40,
    subsidyKes: 35,
    copayKes: 5,
    isAvailable: true,
    category: 'BREAKFAST',
  },
];

// Server-side pepper key simulation for voucher verification
const SERVER_PEPPER = 'lindanyota-secret-verification-pepper';

export async function hmacSha256PepperHex(token: string, studentId: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(SERVER_PEPPER);
  const msgData = enc.encode(`${token.trim()}:${studentId.trim()}`);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback
    }
  }

  let hash = 0x811c9dc5;
  const combined = `${SERVER_PEPPER}:${token}:${studentId}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// -----------------------------------------------------------------------------
// Initial Mock Data
// -----------------------------------------------------------------------------
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    regNo: 'F17/84920/2023',
    fullName: 'Brian Mwangi Kibet',
    phone: '254712984102',
    nationalId: '38910482',
    hefBand: 1,
    universityId: 'UoN',
    faculty: 'Faculty of Engineering (Mechanical)',
    countyOfOrigin: 'Kajiado',
    constituency: 'Kajiado South',
    isActiveSemester: true,
    feeBalanceKes: 48000,
    annualTuitionKes: 65000,
    weeklyMealRequests: 4,
    hardshipEvents: 3,
    isOrphan: true,
    hasChronicIllnessOrDisability: false,
    dailyMealsRequestedToday: 1,
    lastMealRequestTimestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    totalRequestsLast7Days: 4,
    totalRequestsLast30Days: 12,
    totalRedemptions: 11,
    lastActiveDate: new Date().toISOString(),
    hardships: [
      {
        id: 'hd-001',
        studentId: 'std-001',
        category: 'DROUGHT_SHOCK',
        title: 'Livestock Loss in Kajiado South',
        description: 'Family lost primary milking livestock due to prolonged regional drought.',
        estimatedImpactKes: 35000,
        reportedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        status: 'VERIFIED',
      },
      {
        id: 'hd-002',
        studentId: 'std-001',
        category: 'HELB_DELAY',
        title: 'HEF / HELB Semester Upkeep Delay',
        description: 'Semester maintenance disbursement delayed by over 6 weeks.',
        estimatedImpactKes: 18000,
        reportedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'std-002',
    regNo: 'C01/45192/2022',
    fullName: 'Faith Chepkemoi Langat',
    phone: '254722819034',
    nationalId: '39201948',
    hefBand: 1,
    universityId: 'KU',
    faculty: 'School of Education',
    countyOfOrigin: 'Bomet',
    constituency: 'Bomet Central',
    isActiveSemester: true,
    feeBalanceKes: 32000,
    annualTuitionKes: 52000,
    weeklyMealRequests: 5,
    hardshipEvents: 2,
    isOrphan: false,
    hasChronicIllnessOrDisability: false,
    dailyMealsRequestedToday: 0,
    totalRequestsLast7Days: 5,
    totalRequestsLast30Days: 14,
    totalRedemptions: 14,
    lastActiveDate: new Date().toISOString(),
    hardships: [
      {
        id: 'hd-003',
        studentId: 'std-002',
        category: 'MEDICAL_EMERGENCY',
        title: 'Guardian Hospitalization Arrears',
        description: 'Emergency medical bills exhausted all family sustenance reserves.',
        estimatedImpactKes: 25000,
        reportedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'std-003',
    regNo: 'B14/19823/2024',
    fullName: 'Emmanuel Otieno Onyango',
    phone: '254790184729',
    nationalId: '40192837',
    hefBand: 2,
    universityId: 'JKUAT',
    faculty: 'College of Computing & IT',
    countyOfOrigin: 'Kisumu',
    constituency: 'Kisumu Central',
    isActiveSemester: true,
    feeBalanceKes: 25000,
    annualTuitionKes: 75000,
    weeklyMealRequests: 3,
    hardshipEvents: 1,
    isOrphan: false,
    hasChronicIllnessOrDisability: false,
    dailyMealsRequestedToday: 0,
    totalRequestsLast7Days: 3,
    totalRequestsLast30Days: 8,
    totalRedemptions: 8,
    lastActiveDate: new Date().toISOString(),
    hardships: [],
  },
  {
    id: 'std-004',
    regNo: 'A22/30491/2023',
    fullName: 'Mercy Njeri Kamau',
    phone: '254743901284',
    nationalId: '38729104',
    hefBand: 1,
    universityId: 'UoN',
    faculty: 'Faculty of Agriculture',
    countyOfOrigin: 'Nairobi',
    constituency: 'Westlands',
    isActiveSemester: true,
    feeBalanceKes: 56000,
    annualTuitionKes: 60000,
    weeklyMealRequests: 6,
    hardshipEvents: 3,
    isOrphan: true,
    hasChronicIllnessOrDisability: true,
    dailyMealsRequestedToday: 2, // At daily limit
    lastMealRequestTimestamp: new Date().toISOString(),
    totalRequestsLast7Days: 6,
    totalRequestsLast30Days: 18,
    totalRedemptions: 17,
    lastActiveDate: new Date().toISOString(),
    hardships: [],
  },
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-001',
    name: 'Mama Njoroge Canteen & Meals',
    type: 'MAMA_MBOGA',
    mpesaTillOrPhone: '254722894109',
    location: 'Gate A Annex, Chiromo Campus, UoN',
    universityId: 'UoN',
    isActive: true,
    isOpenToday: true,
    operatingHours: '7:00 AM – 9:00 PM',
    totalMealsServed: 312,
    totalPayoutsKes: 25480,
    menu: [
      { id: 'm-101', name: 'Githeri Special (Greens & Potato)', priceKes: 70, subsidyKes: 60, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-102', name: 'Chapati (2) & Ndengu Stew', priceKes: 80, subsidyKes: 70, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-103', name: 'Rice & Minji Stew', priceKes: 90, subsidyKes: 75, copayKes: 15, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-104', name: 'Hot Milk Tea & 2 Mandazi', priceKes: 40, subsidyKes: 35, copayKes: 5, isAvailable: true, category: 'BREAKFAST' },
    ],
  },
  {
    id: 'vnd-002',
    name: 'Mama Mboga Faith - Club 36',
    type: 'MAMA_MBOGA',
    mpesaTillOrPhone: '254711928374',
    location: 'Club 36 Kiosk #14, Main Campus, UoN',
    universityId: 'UoN',
    isActive: true,
    isOpenToday: true,
    operatingHours: '8:00 AM – 10:00 PM',
    totalMealsServed: 541,
    totalPayoutsKes: 43280,
    menu: [
      { id: 'm-201', name: 'Ugali Sukuma Beef Stew', priceKes: 100, subsidyKes: 80, copayKes: 20, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-202', name: 'Ugali Managu / Traditional Greens', priceKes: 70, subsidyKes: 60, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-203', name: 'Chapati (2) & Yellow Beans', priceKes: 75, subsidyKes: 65, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-204', name: 'Fresh Fruit Salad & Boiled Egg', priceKes: 50, subsidyKes: 45, copayKes: 5, isAvailable: true, category: 'SNACK' },
      { id: 'm-205', name: 'Githeri Plain with Avocado', priceKes: 65, subsidyKes: 55, copayKes: 10, isAvailable: false, category: 'HOT_MEAL' },
    ],
  },
  {
    id: 'vnd-003',
    name: 'KU Ruiru Canteen Hub',
    type: 'CANTEEN',
    mpesaTillOrPhone: 'Till 894102',
    location: 'Nyayo Hostels Court, Kenyatta University',
    universityId: 'KU',
    isActive: true,
    isOpenToday: true,
    operatingHours: '6:30 AM – 9:30 PM',
    totalMealsServed: 420,
    totalPayoutsKes: 33600,
    menu: [
      { id: 'm-301', name: 'Rice Beef Stew & Cabbage', priceKes: 100, subsidyKes: 80, copayKes: 20, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-302', name: 'Chapati Ndengu Stew', priceKes: 80, subsidyKes: 70, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-303', name: 'Githeri Special & Greens', priceKes: 70, subsidyKes: 60, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-304', name: 'Spiced Pilau with Kachumbari', priceKes: 110, subsidyKes: 85, copayKes: 25, isAvailable: true, category: 'HOT_MEAL' },
    ],
  },
  {
    id: 'vnd-004',
    name: 'Juja Green Grocers & Food Court',
    type: 'MAMA_MBOGA',
    mpesaTillOrPhone: '254790382910',
    location: 'Gate C Bypass, JKUAT Juja',
    universityId: 'JKUAT',
    isActive: true,
    isOpenToday: true,
    operatingHours: '7:00 AM – 8:30 PM',
    totalMealsServed: 278,
    totalPayoutsKes: 22240,
    menu: [
      { id: 'm-401', name: 'Ugali Sukuma & Eggs (2)', priceKes: 80, subsidyKes: 70, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-402', name: 'Rice & Bean Stew', priceKes: 85, subsidyKes: 75, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-403', name: 'Chapati (2) with Dengu', priceKes: 75, subsidyKes: 65, copayKes: 10, isAvailable: true, category: 'HOT_MEAL' },
      { id: 'm-404', name: 'Hot Milk Tea & 2 Mandazi', priceKes: 40, subsidyKes: 35, copayKes: 5, isAvailable: true, category: 'BREAKFAST' },
    ],
  },
];

const INITIAL_BURSARIES: Bursary[] = [
  {
    id: 'bur-001',
    name: 'Kajiado South NG-CDF Tertiary Bursary',
    type: 'CDF',
    totalBudgetKes: 2500000,
    remainingBudgetKes: 1850000,
    minimumFviThreshold: 60,
    targetCounty: 'Kajiado',
    targetConstituency: 'Kajiado South',
    maxAwardPerStudentKes: 30000,
    sponsorName: 'Hon. Member of Parliament, Kajiado South',
  },
  {
    id: 'bur-002',
    name: 'Westlands Constituency Tertiary Education Fund',
    type: 'CDF',
    totalBudgetKes: 3000000,
    remainingBudgetKes: 2400000,
    minimumFviThreshold: 55,
    targetCounty: 'Nairobi',
    targetConstituency: 'Westlands',
    maxAwardPerStudentKes: 25000,
    sponsorName: 'Westlands NG-CDF Committee',
  },
  {
    id: 'bur-003',
    name: 'Turkana County Pastoralist Emergency Education Grant',
    type: 'COUNTY',
    totalBudgetKes: 4000000,
    remainingBudgetKes: 3100000,
    minimumFviThreshold: 65,
    targetCounty: 'Turkana',
    maxAwardPerStudentKes: 35000,
    sponsorName: 'County Government of Turkana',
  },
  {
    id: 'bur-004',
    name: 'UoN Alumni Emergency Meal & Welfare Endowment',
    type: 'ALUMNI',
    totalBudgetKes: 5000000,
    remainingBudgetKes: 4120000,
    minimumFviThreshold: 50,
    maxAwardPerStudentKes: 40000,
    sponsorName: 'University of Nairobi Alumni Association (UONAA)',
  },
];

const INITIAL_VOUCHERS: MealVoucher[] = [
  {
    id: 'vch-101',
    studentId: 'std-001',
    studentRegNo: 'F17/84920/2023',
    studentName: 'Brian Mwangi Kibet',
    token: '4819',
    tokenHash: 'vch_token_hash_4819',
    vendorId: 'vnd-001',
    vendorName: 'Mama Njoroge Canteen & Meals',
    mealId: 'm-101',
    mealName: 'Githeri Special (Greens & Potato)',
    mealPriceKes: 70,
    subsidyKes: 60,
    copayKes: 10,
    copayRequired: true,
    copayStatus: 'PENDING',
    amountKes: 70,
    status: 'ISSUED',
    issuedVia: 'USSD',
    issuedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 85 * 60 * 1000).toISOString(),
  },
  {
    id: 'vch-102',
    studentId: 'std-001',
    studentRegNo: 'F17/84920/2023',
    studentName: 'Brian Mwangi Kibet',
    token: '7291',
    tokenHash: 'vch_token_hash_7291',
    vendorId: 'vnd-001',
    vendorName: 'Mama Njoroge Canteen & Meals',
    mealId: 'm-102',
    mealName: 'Chapati (2) & Ndengu Stew',
    mealPriceKes: 80,
    subsidyKes: 70,
    copayKes: 10,
    copayRequired: true,
    copayStatus: 'PAID',
    copayPaidAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    copayMethod: 'MPESA',
    amountKes: 80,
    status: 'REDEEMED',
    issuedVia: 'WEB_APP',
    issuedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    redeemedAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    redeemedByVendorId: 'vnd-001',
    redeemedByVendorName: 'Mama Njoroge Canteen & Meals',
    darajaReceipt: 'QJ8492819X',
  },
  {
    id: 'vch-103',
    studentId: 'std-001',
    studentRegNo: 'F17/84920/2023',
    studentName: 'Brian Mwangi Kibet',
    token: '3190',
    tokenHash: 'vch_token_hash_3190',
    vendorId: 'vnd-002',
    vendorName: 'Mama Mboga Faith - Club 36',
    mealId: 'm-201',
    mealName: 'Ugali Sukuma Beef Stew',
    mealPriceKes: 100,
    subsidyKes: 80,
    copayKes: 20,
    copayRequired: true,
    copayStatus: 'PAID',
    copayPaidAt: new Date(Date.now() - 49 * 3600 * 1000).toISOString(),
    copayMethod: 'CASH_CONFIRMED',
    amountKes: 100,
    status: 'REDEEMED',
    issuedVia: 'USSD',
    issuedAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    redeemedAt: new Date(Date.now() - 49 * 3600 * 1000).toISOString(),
    redeemedByVendorId: 'vnd-002',
    redeemedByVendorName: 'Mama Mboga Faith - Club 36',
    darajaReceipt: 'QK2910481Y',
  },
  {
    id: 'vch-104',
    studentId: 'std-001',
    studentRegNo: 'F17/84920/2023',
    studentName: 'Brian Mwangi Kibet',
    token: '8821',
    tokenHash: 'vch_token_hash_8821',
    vendorId: 'vnd-001',
    vendorName: 'Mama Njoroge Canteen & Meals',
    mealId: 'm-104',
    mealName: 'Hot Milk Tea & 2 Mandazi',
    mealPriceKes: 40,
    subsidyKes: 35,
    copayKes: 5,
    copayRequired: true,
    copayStatus: 'PENDING',
    amountKes: 40,
    status: 'EXPIRED',
    issuedVia: 'WEB_APP',
    issuedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 70 * 3600 * 1000).toISOString(),
  },
];


const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-001',
    donorName: 'Dr. James Kariuki',
    isAnonymous: false,
    amountKes: 15000,
    mpesaReceiptNumber: 'QJ9102839A',
    phoneMasked: '254722***491',
    channel: 'STK_PUSH',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'don-002',
    donorName: 'Anonymous Supporter',
    isAnonymous: true,
    amountKes: 25000,
    mpesaReceiptNumber: 'QK3819201B',
    phoneMasked: '254733***102',
    channel: 'STK_PUSH',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'don-003',
    donorName: 'Anonymous Student Supporter',
    isAnonymous: true,
    amountKes: 50,
    mpesaReceiptNumber: 'QK4819205S',
    phoneMasked: '254712***009',
    channel: 'STK_PUSH',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_BURSARY_MATCHES: BursaryMatchApplication[] = [
  {
    id: 'mat-001',
    studentId: 'std-001',
    studentName: 'Brian Mwangi Kibet',
    studentRegNo: 'F17/84920/2023',
    bursaryId: 'bur-001',
    bursaryName: 'Kajiado South NG-CDF Tertiary Bursary',
    bursaryType: 'CDF',
    fviScoreAtMatch: 86.4,
    recommendedAmountKes: 30000,
    status: 'RECOMMENDED',
    matchedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mat-002',
    studentId: 'std-004',
    studentName: 'Mercy Njeri Kamau',
    studentRegNo: 'A22/30491/2023',
    bursaryId: 'bur-002',
    bursaryName: 'Westlands Constituency Tertiary Education Fund',
    bursaryType: 'CDF',
    fviScoreAtMatch: 92.1,
    recommendedAmountKes: 25000,
    status: 'FLAGGED',
    matchedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

// -----------------------------------------------------------------------------
// LindaNyota Ecosystem State Manager
// -----------------------------------------------------------------------------
class LindaNyotaStore {
  students: Student[] = [...INITIAL_STUDENTS];
  vendors: Vendor[] = [...INITIAL_VENDORS];
  vouchers: MealVoucher[] = [...INITIAL_VOUCHERS];
  bursaries: Bursary[] = [...INITIAL_BURSARIES];
  bursaryMatches: BursaryMatchApplication[] = [...INITIAL_BURSARY_MATCHES];
  donations: Donation[] = [...INITIAL_DONATIONS];
  transactions: Transaction[] = [];
  escrowBalanceKes: number = 485250;
  totalMealsServedCounter: number = 1553;
  currentUserSession: AuthSession | null = {
    token: 'auth_token_std_001',
    user: {
      id: 'std-001',
      identifier: 'F17/84920/2023',
      name: 'Brian Mwangi Kibet',
      role: 'STUDENT',
    },
  };

  constructor() {
    this.refreshAllFviScores();
  }

  // 1. Dynamic Welfare Vulnerability Index using Live Telemetry Data
  calculateFVI(student: Partial<Student>): FVIEvaluationResult {
    const hefBand = student.hefBand || 3;
    const feeBalance = student.feeBalanceKes || 0;
    const annualTuition = student.annualTuitionKes || 100000;

    const req7d = student.totalRequestsLast7Days ?? (student.weeklyMealRequests || 0);
    const redemptionsCount = student.totalRedemptions || 0;
    const hardshipCount = (student.hardships?.length ?? student.hardshipEvents) || 0;

    const hefBandContrib = ((6 - hefBand) / 5) * 26.0;
    const feeRatio = Math.min(feeBalance / Math.max(annualTuition, 1), 1.2);
    const feeDebtContrib = Math.min(feeRatio * 24.0, 24.0);
    const mealVelocityContrib = Math.min(req7d / 7.0, 1.0) * 20.0;
    const hardshipShockContrib = Math.min(hardshipCount / 4.0, 1.0) * 15.0;
    const platformUsageContrib = Math.min(redemptionsCount / 15.0, 1.0) * 7.0;

    let vulnerabilityContrib = 0;
    if (student.isOrphan) vulnerabilityContrib += 5.0;
    if (student.hasChronicIllnessOrDisability) vulnerabilityContrib += 3.0;

    const raw =
      hefBandContrib +
      feeDebtContrib +
      mealVelocityContrib +
      hardshipShockContrib +
      platformUsageContrib +
      vulnerabilityContrib;

    const finalScore = Math.min(99.5, Math.max(5.0, Math.round(raw * 10) / 10));

    let riskCategory: RiskCategory = 'LOW';
    let priorityTier = 3;
    let emergencyEligible = false;
    let narrative = '';

    if (finalScore >= 75) {
      riskCategory = 'CRITICAL';
      priorityTier = 1;
      emergencyEligible = true;
      narrative = `CRITICAL RISK (${finalScore}/100): High academic attrition risk. Unpaid fees (${Math.round(
        feeRatio * 100
      )}%) and acute hunger signals. Prioritized for bursary allocations.`;
    } else if (finalScore >= 55) {
      riskCategory = 'HIGH';
      priorityTier = 2;
      emergencyEligible = true;
      narrative = `HIGH RISK (${finalScore}/100): Elevated financial distress in HEF Band ${hefBand}. Eligible for subsidized daily meal vouchers.`;
    } else if (finalScore >= 35) {
      riskCategory = 'MEDIUM';
      priorityTier = 3;
      emergencyEligible = false;
      narrative = `MODERATE RISK (${finalScore}/100): Stable profile. Standard university bursary queues advised.`;
    } else {
      riskCategory = 'LOW';
      priorityTier = 3;
      emergencyEligible = false;
      narrative = `LOW RISK (${finalScore}/100): Normal academic standing.`;
    }

    return {
      fviScore: finalScore,
      riskCategory,
      emergencyMealEligible: emergencyEligible,
      bursaryPriorityTier: priorityTier,
      featureContributions: {
        hefBandContrib: Math.round(hefBandContrib * 10) / 10,
        feeDebtContrib: Math.round(feeDebtContrib * 10) / 10,
        mealVelocityContrib: Math.round(mealVelocityContrib * 10) / 10,
        hardshipShockContrib: Math.round(hardshipShockContrib * 10) / 10,
        vulnerabilityContrib: Math.round(vulnerabilityContrib * 10) / 10,
        platformUsageContrib: Math.round(platformUsageContrib * 10) / 10,
      },
      telemetrySnapshot: {
        totalRequests7d: req7d,
        redemptionsCount,
        hardshipsCount: hardshipCount,
        activityTier: req7d >= 4 ? 'HIGH_USAGE' : req7d >= 2 ? 'MODERATE_USAGE' : 'LOW_USAGE',
      },
      narrative,
    };
  }

  refreshAllFviScores() {
    this.students.forEach((s) => {
      const res = this.calculateFVI(s);
      s.fviScore = res.fviScore;
      s.riskCategory = res.riskCategory;
    });
  }

  // 2. Meal Voucher Request with Strict Daily Limit (Max 2 Meals/Day), Vendor Picking, and Co-Pay Flexibility
  async requestMealVoucher(
    studentId: string,
    vendorId?: string,
    menuItemId?: string,
    channel: 'USSD' | 'WEB_APP' | 'NFC' = 'WEB_APP',
    canAffordCopay: boolean = true
  ): Promise<{ success: boolean; voucher?: MealVoucher; error?: string }> {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, error: 'Student record not found.' };
    }

    // Identify target vendor
    const targetVendor = this.vendors.find((v) => v.id === vendorId) || this.vendors[0];

    // Identify selected menu item from vendor's offerings
    const vendorMenu = targetVendor.menu && targetVendor.menu.length > 0 ? targetVendor.menu : CAMPUS_MENU_ITEMS;
    const selectedMenu =
      vendorMenu.find((m) => m.id === menuItemId && m.isAvailable) ||
      vendorMenu.find((m) => m.isAvailable) ||
      vendorMenu[0];

    // RULE 1: Only 1 active unredeemed voucher at a time
    const activeUnredeemed = this.vouchers.find(
      (v) =>
        v.studentId === studentId &&
        v.status === 'ISSUED' &&
        new Date(v.expiresAt).getTime() > Date.now()
    );

    if (activeUnredeemed) {
      return {
        success: false,
        error: `You already have an active voucher (#${activeUnredeemed.token} for ${activeUnredeemed.mealName} at ${activeUnredeemed.vendorName}). Please redeem or wait for it to expire before requesting another.`,
      };
    }

    // RULE 2: Max 2 meals per day limit (ensures anti-abuse and equitable access)
    const nowTs = Date.now();
    const twentyFourHoursAgo = nowTs - 24 * 3600 * 1000;
    const recent24hRequests = this.vouchers.filter(
      (v) =>
        v.studentId === studentId &&
        new Date(v.issuedAt).getTime() >= twentyFourHoursAgo
    );

    if (recent24hRequests.length >= 2) {
      return {
        success: false,
        error: `Daily limit reached: Maximum 2 subsidized meals per day. You have already requested 2 meals in the last 24 hours.`,
      };
    }

    // RULE 3: Guard against high vulnerability index misuse
    if (student.riskCategory === 'CRITICAL' && student.weeklyMealRequests >= 12) {
      return {
        success: false,
        error: `Unusually high request velocity detected. To safeguard funds and connect you with sustained welfare, please speak with the Dean of Students office.`,
      };
    }

    // Co-pay calculation: Co-pay is for students who can afford to pay; acute hardship students get 100% emergency subsidy
    let subsidyKes: number;
    let copayKes: number;
    let copayRequired: boolean;
    let copayStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID';

    if (!canAffordCopay) {
      // 100% Emergency Subsidy - zero co-pay for student
      subsidyKes = selectedMenu.priceKes;
      copayKes = 0;
      copayRequired = false;
      copayStatus = 'NOT_REQUIRED';
    } else {
      // Standard co-pay subsidy
      subsidyKes = selectedMenu.subsidyKes;
      copayKes = selectedMenu.copayKes;
      copayRequired = selectedMenu.copayKes > 0;
      copayStatus = selectedMenu.copayKes > 0 ? 'PENDING' : 'NOT_REQUIRED';
    }

    // Generate 4-digit code
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    const tokenHash = await hmacSha256PepperHex(token, student.id);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours TTL

    const voucher: MealVoucher = {
      id: `vch-${Date.now()}-${token}`,
      studentId: student.id,
      studentRegNo: student.regNo,
      studentName: student.fullName,
      token,
      tokenHash,
      vendorId: targetVendor.id,
      vendorName: targetVendor.name,
      mealId: selectedMenu.id,
      mealName: selectedMenu.name,
      mealPriceKes: selectedMenu.priceKes,
      subsidyKes,
      copayKes,
      copayRequired,
      copayStatus,
      amountKes: selectedMenu.priceKes, // Total value settled to vendor
      status: 'ISSUED',
      issuedVia: channel,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.vouchers.unshift(voucher);

    // Update student activity
    student.weeklyMealRequests += 1;
    student.totalRequestsLast7Days += 1;
    student.totalRequestsLast30Days += 1;
    student.dailyMealsRequestedToday = (student.dailyMealsRequestedToday || 0) + 1;
    student.lastMealRequestTimestamp = now.toISOString();
    student.lastActiveDate = now.toISOString();

    this.refreshAllFviScores();

    return { success: true, voucher };
  }

  // Settle Co-Pay by student (via M-Pesa or counter pre-payment)
  payVoucherCopay(
    voucherId: string,
    method: 'MPESA' | 'CASH_CONFIRMED' = 'MPESA'
  ): { success: boolean; message: string; receipt?: string } {
    const voucher = this.vouchers.find((v) => v.id === voucherId);
    if (!voucher) return { success: false, message: 'Voucher not found.' };
    if (voucher.copayStatus === 'PAID') {
      return { success: true, message: 'Co-pay has already been settled.' };
    }

    voucher.copayStatus = 'PAID';
    voucher.copayPaidAt = new Date().toISOString();
    voucher.copayMethod = method;
    const receipt = `CP${Math.floor(100000 + Math.random() * 900000)}KES`;

    return {
      success: true,
      message: `Student co-pay of KES ${voucher.copayKes} settled successfully via ${
        method === 'MPESA' ? 'M-Pesa' : 'Merchant Counter'
      }! Voucher is now unlocked for vendor payout.`,
      receipt,
    };
  }

  // 3. Exact Menu Pricing Redemption with Co-Pay Settlement Gate
  redeemVoucherAtomic(
    tokenInput: string,
    vendorId: string,
    confirmCopayCollectedAtCounter: boolean = false
  ): {
    success: boolean;
    voucher?: MealVoucher;
    darajaReceipt?: string;
    message: string;
    settledAmountKes?: number;
    subsidyKes?: number;
    copayKes?: number;
    requireCopayFirst?: boolean;
  } {
    const token = tokenInput.trim();
    const vendor = this.vendors.find((v) => v.id === vendorId);
    if (!vendor) {
      return { success: false, message: 'Vendor not registered or invalid ID.' };
    }

    const voucher = this.vouchers.find((v) => v.token === token);
    if (!voucher) {
      return {
        success: false,
        message: 'Invalid Voucher Code. Please verify the 4-digit code.',
      };
    }

    if (voucher.status === 'REDEEMED') {
      return {
        success: false,
        message: `ALREADY REDEEMED: Voucher #${token} was already processed at ${new Date(
          voucher.redeemedAt || ''
        ).toLocaleTimeString()} by ${voucher.redeemedByVendorName}.`,
      };
    }

    if (new Date() > new Date(voucher.expiresAt)) {
      voucher.status = 'EXPIRED';
      return {
        success: false,
        message: 'EXPIRED VOUCHER: 2-hour validity window has elapsed.',
      };
    }

    // STRICT CO-PAY RULE: If co-pay is enabled/required, student must pay first before funds are sent to vendor!
    if (voucher.copayRequired && voucher.copayStatus !== 'PAID') {
      if (!confirmCopayCollectedAtCounter) {
        return {
          success: false,
          requireCopayFirst: true,
          voucher,
          copayKes: voucher.copayKes,
          subsidyKes: voucher.subsidyKes,
          message: `STUDENT CO-PAY PENDING: Voucher code #${token} covers KES ${voucher.subsidyKes} fund subsidy. Student must pay KES ${voucher.copayKes} co-pay first before fund payout can be disbursed to your till!`,
        };
      }
      // Merchant confirms collecting student co-pay at counter
      voucher.copayStatus = 'PAID';
      voucher.copayPaidAt = new Date().toISOString();
      voucher.copayMethod = 'CASH_CONFIRMED';
    }

    const exactMealPrice = voucher.mealPriceKes;
    const exactSubsidy = voucher.subsidyKes;
    const exactCopay = voucher.copayKes;

    // Simulated M-Pesa receipt
    const darajaReceipt = `QK${Math.floor(100000 + Math.random() * 900000)}B2C`;
    voucher.status = 'REDEEMED';
    voucher.redeemedAt = new Date().toISOString();
    voucher.redeemedByVendorId = vendor.id;
    voucher.redeemedByVendorName = vendor.name;
    voucher.darajaReceipt = darajaReceipt;

    // Vendor receives EXACT meal price (Subsidy + Co-pay)
    vendor.totalMealsServed += 1;
    vendor.totalPayoutsKes += exactMealPrice;
    this.totalMealsServedCounter += 1;

    // Escrow ONLY pays the exact subsidy portion calculated
    this.escrowBalanceKes = Math.max(0, this.escrowBalanceKes - exactSubsidy);

    const student = this.students.find((s) => s.id === voucher.studentId);
    if (student) {
      student.totalRedemptions += 1;
      this.refreshAllFviScores();
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      voucherId: voucher.id,
      studentRegNo: voucher.studentRegNo,
      vendorId: vendor.id,
      vendorName: vendor.name,
      mealName: voucher.mealName,
      amountKes: exactMealPrice,
      subsidyKes: exactSubsidy,
      copayKes: exactCopay,
      darajaReceipt,
      status: 'SETTLED',
      timestamp: new Date().toISOString(),
    };
    this.transactions.unshift(tx);

    return {
      success: true,
      voucher,
      darajaReceipt,
      settledAmountKes: exactMealPrice,
      subsidyKes: exactSubsidy,
      copayKes: exactCopay,
      message: `Voucher #${token} verified! Meal: ${voucher.mealName}. Disbursed KES ${exactSubsidy} subsidy from fund (Student Co-Pay: KES ${exactCopay} ${
        voucher.copayRequired ? 'collected & settled' : 'waived'
      }). Total till earnings: KES ${exactMealPrice}.`,
    };
  }

  // 4. Student Self-Reported Hardship
  addStudentHardship(
    studentId: string,
    category: HardshipCategory,
    title: string,
    description: string,
    estimatedImpactKes: number
  ): { success: boolean; hardship?: HardshipReport; message: string } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Student record not found.' };
    }

    const newHardship: HardshipReport = {
      id: `hd-${Date.now()}`,
      studentId: student.id,
      category,
      title: title.trim(),
      description: description.trim(),
      estimatedImpactKes: Number(estimatedImpactKes) || 0,
      reportedAt: new Date().toISOString(),
      status: 'SELF_REPORTED',
    };

    if (!student.hardships) {
      student.hardships = [];
    }
    student.hardships.unshift(newHardship);
    student.hardshipEvents = student.hardships.length;
    student.lastActiveDate = new Date().toISOString();

    this.refreshAllFviScores();

    return {
      success: true,
      hardship: newHardship,
      message: `Hardship '${title}' recorded. Vulnerability score updated dynamically.`,
    };
  }

  // 5. Transaction History
  getStudentVoucherHistory(studentId: string): MealVoucher[] {
    return this.vouchers.filter((v) => v.studentId === studentId);
  }

  // 6. USSD Gateway Simulation
  async processUSSD(
    phoneNumber: string,
    text: string
  ): Promise<{ response: string; isFinal: boolean; smsNotification?: string }> {
    const inputs = text ? text.split('*') : [];
    const depth = inputs.length;

    if (depth === 0 || text === '') {
      return {
        response:
          'CON LindaNyota Student Welfare\n' +
          '1. Request Meal Voucher (Max 2/day)\n' +
          '2. Check Welfare Status\n' +
          '3. Apply for Bursary Match\n' +
          '4. Merchant Redemptions\n' +
          '5. Dean Emergency Hotline',
        isFinal: false,
      };
    }

    const first = inputs[0];

    if (first === '1') {
      if (depth === 1) {
        return {
          response:
            'CON Select Campus Merchant:\n' +
            '1. Mama Njoroge (Chiromo Gate A)\n' +
            '2. Mama Mboga Faith (Club 36 Kiosk)\n' +
            '3. KU Ruiru Canteen Hub\n' +
            '4. Juja Grocers (JKUAT Gate C)',
          isFinal: false,
        };
      }
      if (depth === 2) {
        const vendorKey = inputs[1];
        if (vendorKey === '2') {
          return {
            response:
              'CON Mama Mboga Faith Offerings:\n' +
              '1. Ugali Beef Stew (KES 100)\n' +
              '2. Ugali Managu Greens (KES 70)\n' +
              '3. Chapati & Yellow Beans (KES 75)\n' +
              '4. Fruit Salad & Egg (KES 50)',
            isFinal: false,
          };
        }
        return {
          response:
            'CON Mama Njoroge Offerings:\n' +
            '1. Githeri Special (KES 70)\n' +
            '2. Chapati Ndengu (KES 80)\n' +
            '3. Rice Minji Stew (KES 90)\n' +
            '4. Tea & 2 Mandazi (KES 40)',
          isFinal: false,
        };
      }
      if (depth === 3) {
        return {
          response:
            'CON Student Co-Pay Option:\n' +
            '1. Able to contribute Co-Pay\n' +
            '2. Request 100% Emergency Subsidy (KES 0 Co-Pay)',
          isFinal: false,
        };
      }
      if (depth === 4) {
        const vendorKey = inputs[1];
        const mealChoice = inputs[2];
        const copayChoice = inputs[3];
        const targetVendorId = vendorKey === '2' ? 'vnd-002' : vendorKey === '3' ? 'vnd-003' : vendorKey === '4' ? 'vnd-004' : 'vnd-001';
        const targetVendor = this.vendors.find(v => v.id === targetVendorId) || this.vendors[0];
        const selectedMeal = targetVendor.menu[parseInt(mealChoice) - 1] || targetVendor.menu[0];
        const canPayCopay = copayChoice === '1';

        const student = this.students[0];
        const result = await this.requestMealVoucher(
          student.id,
          targetVendor.id,
          selectedMeal.id,
          'USSD',
          canPayCopay
        );

        if (!result.success || !result.voucher) {
          return {
            response: `END Notice: ${result.error || 'Daily limit reached.'}`,
            isFinal: true,
          };
        }

        const v = result.voucher;
        const expiryTime = new Date(v.expiresAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const sms = `LindaNyota: Pass for ${v.mealName} at ${v.vendorName} is #${v.token}. Fund subsidy covers KES ${v.subsidyKes}, student co-pay KES ${v.copayKes} (${v.copayStatus}). Valid until ${expiryTime}.`;

        return {
          response:
            `END Meal Pass Confirmed:\n\n` +
            `*** ${v.token} ***\n\n` +
            `Merchant: ${v.vendorName}\n` +
            `Meal: ${v.mealName}\n` +
            `Fund Covers: KES ${v.subsidyKes}\n` +
            `Co-Pay: KES ${v.copayKes} (${v.copayStatus})\n` +
            `Valid: 2 Hours`,
          isFinal: true,
          smsNotification: sms,
        };
      }
    }

    if (first === '2') {
      const student = this.students[0];
      return {
        response:
          `END Welfare Status:\n` +
          `- Reg No: ${student.regNo}\n` +
          `- HEF Band: Band ${student.hefBand}\n` +
          `- Score: ${student.fviScore}/100 (${student.riskCategory})\n` +
          `- Today's Usage: ${student.dailyMealsRequestedToday}/2 meals\n` +
          `Welfare support active.`,
        isFinal: true,
      };
    }

    if (first === '3') {
      if (depth === 1) {
        return {
          response:
            'CON Select Bursary Fund:\n' +
            '1. Kajiado South NG-CDF Pool\n' +
            '2. Westlands NG-CDF Pool\n' +
            '3. Turkana Emergency Pool\n' +
            '4. Alumni Welfare Endowment',
          isFinal: false,
        };
      }
      if (depth === 2) {
        const poolNames: Record<string, string> = {
          '1': 'Kajiado South NG-CDF',
          '2': 'Westlands NG-CDF',
          '3': 'Turkana Emergency Pool',
          '4': 'Alumni Welfare Endowment',
        };
        const pool = poolNames[inputs[1]] || 'National Pool';
        return {
          response:
            `END Application for ${pool} recorded.\n` +
            `Dean of Students will review within 24 hours.`,
          isFinal: true,
        };
      }
    }

    if (first === '4') {
      if (depth === 1) {
        return {
          response:
            'CON Merchant Redemption\n' +
            'Enter 4-digit student voucher code:',
          isFinal: false,
        };
      }
      if (depth === 2) {
        const tokenInput = inputs[1];
        const res = this.redeemVoucherAtomic(tokenInput, this.vendors[0].id);

        if (!res.success) {
          return {
            response: `END Error: ${res.message}`,
            isFinal: true,
          };
        }

        return {
          response:
            `END VOUCHER REDEEMED!\n` +
            `Meal: ${res.voucher?.mealName}\n` +
            `Total Settled: KES ${res.settledAmountKes}\n` +
            `Ref: ${res.darajaReceipt}.`,
          isFinal: true,
          smsNotification: `M-PESA: Payment of KES ${res.settledAmountKes} received for ${res.voucher?.mealName} (Ref: ${res.darajaReceipt}).`,
        };
      }
    }

    if (first === '5') {
      return {
        response:
          'END Welfare Support:\n' +
          'Toll-Free Helpline: 0800 720 001\n' +
          'Dean\'s Office: Room 104, Student Center.',
        isFinal: true,
      };
    }

    return {
      response: 'END Invalid choice. Dial *384# to start over.',
      isFinal: true,
    };
  }

  // 7. M-Pesa STK Push Donation (MINIMUM 50 KES, OPTIONAL DONOR NAME)
  donateViaMpesaSTK(
    phone: string,
    amountKes: number,
    donorName: string = '',
    isAnonymous: boolean = false
  ): {
    success: boolean;
    receipt: string;
    checkoutRequestId: string;
    message: string;
  } {
    if (amountKes < 50) {
      return {
        success: false,
        receipt: '',
        checkoutRequestId: '',
        message: 'Minimum contribution is KES 50 so all students and supporters can participate.',
      };
    }

    const receipt = `QK${Math.floor(100000 + Math.random() * 900000)}STK`;
    const checkoutRequestId = `ws_CO_${Date.now()}`;
    const displayName = isAnonymous || !donorName.trim() ? 'Anonymous Supporter' : donorName.trim();

    const donation: Donation = {
      id: `don-${Date.now()}`,
      donorName: displayName,
      isAnonymous: isAnonymous || !donorName.trim(),
      amountKes,
      mpesaReceiptNumber: receipt,
      phoneMasked: phone.slice(0, 6) + '***' + phone.slice(-3),
      channel: 'STK_PUSH',
      timestamp: new Date().toISOString(),
    };

    this.donations.unshift(donation);
    this.escrowBalanceKes += amountKes;

    return {
      success: true,
      receipt,
      checkoutRequestId,
      message: `M-Pesa payment of KES ${amountKes} successful! Receipt: ${receipt}. Added to emergency food fund.`,
    };
  }

  // 8. Onboarding Endpoints
  onboardStudent(data: Partial<Student>): Student {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      regNo: data.regNo || `F17/${Math.floor(10000 + Math.random() * 90000)}/2024`,
      fullName: data.fullName || 'New Enrolled Student',
      phone: data.phone || '254712000000',
      nationalId: data.nationalId || '39000000',
      hefBand: data.hefBand || 2,
      universityId: data.universityId || 'UoN',
      faculty: data.faculty || 'School of Sciences',
      countyOfOrigin: data.countyOfOrigin || 'Nairobi',
      constituency: data.constituency || 'Westlands',
      isActiveSemester: true,
      feeBalanceKes: data.feeBalanceKes || 30000,
      annualTuitionKes: data.annualTuitionKes || 65000,
      weeklyMealRequests: 0,
      hardshipEvents: 0,
      isOrphan: data.isOrphan || false,
      hasChronicIllnessOrDisability: data.hasChronicIllnessOrDisability || false,
      hardships: [],
      dailyMealsRequestedToday: 0,
      totalRequestsLast7Days: 0,
      totalRequestsLast30Days: 0,
      totalRedemptions: 0,
      lastActiveDate: new Date().toISOString(),
    };

    this.students.unshift(newStudent);
    this.refreshAllFviScores();
    return newStudent;
  }

  onboardVendor(data: Partial<Vendor>): Vendor {
    const newVendor: Vendor = {
      id: `vnd-${Date.now()}`,
      name: data.name || 'New Campus Mama Mboga',
      type: data.type || 'MAMA_MBOGA',
      mpesaTillOrPhone: data.mpesaTillOrPhone || '254700000000',
      location: data.location || 'Campus Gate B',
      universityId: data.universityId || 'UoN',
      isActive: true,
      isOpenToday: true,
      operatingHours: data.operatingHours || '7:00 AM – 9:00 PM',
      menu: data.menu || [...CAMPUS_MENU_ITEMS],
      totalMealsServed: 0,
      totalPayoutsKes: 0,
    };

    this.vendors.unshift(newVendor);
    return newVendor;
  }

  // 9. Login Simulation
  loginUser(identifier: string, role: 'STUDENT' | 'VENDOR' | 'DEAN_ADMIN' | 'DONOR'): AuthSession {
    let userName = 'Authenticated User';
    let entityId = `usr-${Date.now()}`;

    if (role === 'STUDENT') {
      const match = this.students.find(
        (s) => s.regNo.toLowerCase() === identifier.toLowerCase() || s.phone === identifier
      );
      if (match) {
        userName = match.fullName;
        entityId = match.id;
      } else {
        userName = 'Student ' + identifier;
      }
    } else if (role === 'VENDOR') {
      const match = this.vendors.find((v) => v.mpesaTillOrPhone === identifier);
      if (match) {
        userName = match.name;
        entityId = match.id;
      } else {
        userName = 'Merchant ' + identifier;
      }
    } else if (role === 'DEAN_ADMIN') {
      userName = 'Dean of Students Directorate';
    } else {
      userName = 'Supporter';
    }

    const session: AuthSession = {
      token: `auth_token_${Date.now()}_${entityId}`,
      user: {
        id: entityId,
        identifier,
        name: userName,
        role,
      },
    };

    this.currentUserSession = session;
    return session;
  }

  // 10. Dean Batch Approvals
  approveBatchBursaries(matchIds: string[]): {
    approvedCount: number;
    totalDisbursedKes: number;
  } {
    let approvedCount = 0;
    let totalDisbursedKes = 0;

    this.bursaryMatches.forEach((m) => {
      if (matchIds.includes(m.id) && m.status !== 'APPROVED') {
        m.status = 'APPROVED';
        m.approvedAt = new Date().toISOString();
        m.disbursementRef = `BUR-DISB-${Date.now()}-${m.id.slice(-3)}`;
        approvedCount++;
        totalDisbursedKes += m.recommendedAmountKes;

        const b = this.bursaries.find((item) => item.id === m.bursaryId);
        if (b) {
          b.remainingBudgetKes = Math.max(0, b.remainingBudgetKes - m.recommendedAmountKes);
        }

        const s = this.students.find((item) => item.id === m.studentId);
        if (s) {
          s.feeBalanceKes = Math.max(0, s.feeBalanceKes - m.recommendedAmountKes);
        }
      }
    });

    this.refreshAllFviScores();
    return { approvedCount, totalDisbursedKes };
  }
}

export const lindaStore = new LindaNyotaStore();
