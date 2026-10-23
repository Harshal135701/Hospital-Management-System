/**
 * MedicsPrime IPD Room Stay & Transfer-Day Billing Calculation Engine
 * 
 * Accurately calculates room stay charges across ward/bed/room transfers without
 * duplicate charges or missing days for transfer dates.
 * 
 * Transfer-Day Policies Supported:
 * - 'MIDNIGHT_LOCATION': The ward/room where the patient is situated at 23:59:59
 *   determines the tariff for that calendar day.
 * - 'HIGHER_TARIFF': If multiple wards were occupied on a transfer date, the higher
 *   rate is billed for that calendar day.
 */

export const TRANSFER_DAY_RULES = {
  MIDNIGHT_LOCATION: 'MIDNIGHT_LOCATION',
  HIGHER_TARIFF: 'HIGHER_TARIFF'
};

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function toDateString(d) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compute chronological room stay accrual with transfer-day deduplication.
 * 
 * @param {Object|Array} admissionOrStays - Admission object with .stays array, or stays array directly
 * @param {Object} [policy] - Room billing policy object
 * @param {Date|string} [asOfDate] - Cutoff evaluation date (defaults to current time)
 * @returns {Object} Comprehensive calculation result with breakdown and daily audit trail
 */
export function calculateIpdRoomStayBilling(admissionOrStays, policy = {}, asOfDate = new Date()) {
  const stays = Array.isArray(admissionOrStays)
    ? admissionOrStays
    : (admissionOrStays?.stays || []);

  if (!stays || stays.length === 0) {
    return {
      totalDays: 0,
      totalRoomCharges: 0,
      staysBreakdown: [],
      dailyAuditTrail: []
    };
  }

  const transferRule = policy.transfer_day_rule || TRANSFER_DAY_RULES.MIDNIGHT_LOCATION;
  const evaluationDate = asOfDate instanceof Date ? asOfDate : new Date(asOfDate);

  // Normalize all stays with Date objects
  const parsedStays = stays.map((s, idx) => {
    const start = new Date(s.start_time);
    let end = s.end_time ? new Date(s.end_time) : evaluationDate;
    if (end > evaluationDate) end = evaluationDate;
    return {
      ...s,
      stayIndex: idx,
      startDate: start,
      endDate: end,
      dailyRate: Number(s.daily_rate) || 0
    };
  }).filter(s => !isNaN(s.startDate.getTime()));

  if (parsedStays.length === 0) {
    return {
      totalDays: 0,
      totalRoomCharges: 0,
      staysBreakdown: [],
      dailyAuditTrail: []
    };
  }

  // Find the overall start date and end date
  const earliestDate = new Date(Math.min(...parsedStays.map(s => s.startDate.getTime())));
  const latestDate = new Date(Math.max(...parsedStays.map(s => s.endDate.getTime())));

  const dailyAuditTrail = [];
  const currentCursor = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), earliestDate.getDate());
  const finalCursor = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());

  // Iterate calendar day by calendar day
  while (currentCursor <= finalCursor) {
    const dayStr = toDateString(currentCursor);

    // Day start: 00:00:00 of this calendar day
    const dayStart = new Date(currentCursor.getFullYear(), currentCursor.getMonth(), currentCursor.getDate(), 0, 0, 0, 0);
    // Day end: 23:59:59.999 of this calendar day
    const dayEnd = new Date(currentCursor.getFullYear(), currentCursor.getMonth(), currentCursor.getDate(), 23, 59, 59, 999);

    // Find all stays active during any part of this calendar day
    const activeStaysForDay = parsedStays.filter(s => {
      return s.startDate <= dayEnd && s.endDate >= dayStart;
    });

    if (activeStaysForDay.length > 0) {
      let billedStay = null;
      let isTransfer = activeStaysForDay.length > 1;
      let transferNote = null;

      if (!isTransfer) {
        billedStay = activeStaysForDay[0];
      } else {
        // Patient transferred wards during this calendar day!
        // Stays sorted by start time
        const sorted = [...activeStaysForDay].sort((a, b) => a.startDate - b.startDate);
        const fromStay = sorted[0];
        const toStay = sorted[sorted.length - 1];
        transferNote = `Transferred from ${fromStay.ward_name} to ${toStay.ward_name}`;

        if (transferRule === TRANSFER_DAY_RULES.HIGHER_TARIFF) {
          // Billed at the highest tariff among occupied wards
          billedStay = sorted.reduce((max, s) => s.dailyRate > max.dailyRate ? s : max, sorted[0]);
        } else {
          // Default: MIDNIGHT_LOCATION (Location at 23:59:59 determines transfer day tariff)
          // The stay whose end date is past or at dayEnd is the midnight location
          const midnightStay = sorted.find(s => s.endDate >= dayEnd) || toStay;
          billedStay = midnightStay;
        }
      }

      dailyAuditTrail.push({
        date: dayStr,
        wardCode: billedStay.ward_code,
        wardName: billedStay.ward_name,
        dailyRate: billedStay.dailyRate,
        isTransferDay: isTransfer,
        transferDetails: transferNote,
        appliedRule: isTransfer ? transferRule : 'STANDARD_CENSUS',
        chargeAmount: billedStay.dailyRate
      });
    }

    // Move to next calendar day
    currentCursor.setDate(currentCursor.getDate() + 1);
  }

  // Aggregate breakdown per ward
  const wardMap = {};
  for (const day of dailyAuditTrail) {
    const key = day.wardCode;
    if (!wardMap[key]) {
      wardMap[key] = {
        wardCode: day.wardCode,
        wardName: day.wardName,
        dailyRate: day.dailyRate,
        daysCharged: 0,
        totalCharge: 0,
        dates: []
      };
    }
    wardMap[key].daysCharged += 1;
    wardMap[key].totalCharge += day.chargeAmount;
    wardMap[key].dates.push(day.date);
  }

  const staysBreakdown = Object.values(wardMap);
  const totalDays = dailyAuditTrail.length;
  const totalRoomCharges = dailyAuditTrail.reduce((sum, d) => sum + d.chargeAmount, 0);

  return {
    totalDays,
    totalRoomCharges,
    staysBreakdown,
    dailyAuditTrail
  };
}
