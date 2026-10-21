/**
 * Reusable Indian Currency and Date Formatting Utilities
 * Standardized for Hospital Management System (HMS/HIS)
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const inrNoDecimalsFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format any numerical amount into Indian Rupee currency (₹)
 * @param {number|string} amount
 * @param {boolean} [showDecimals=false]
 * @returns {string} e.g. "₹1,500" or "₹1,500.50"
 */
export function formatINR(amount, showDecimals = false) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  return showDecimals ? inrFormatter.format(num) : inrNoDecimalsFormatter.format(num);
}

/**
 * Format date to standard Indian hospital display: e.g. "19 Oct 2026"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateIN(dateInput) {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date & time to standard Indian display: e.g. "19 Oct 2026, 11:30 AM"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateTimeIN(dateInput) {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format 24h time to 12h AM/PM time: e.g. "14:30" -> "02:30 PM"
 * @param {string} timeStr
 * @returns {string}
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '-';
  const clean = String(timeStr).slice(0, 5);
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return clean;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const padHours = hours < 10 ? `0${hours}` : hours;
  return `${padHours}:${minutes} ${ampm}`;
}
