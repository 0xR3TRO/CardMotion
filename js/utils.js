/**
 * Clamp helper for bounded animation values.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Linear interpolation helper.
 * @param {number} start
 * @param {number} end
 * @param {number} amount
 * @returns {number}
 */
export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

/**
 * Keep only numeric characters.
 * @param {string} value
 * @returns {string}
 */
export function digitsOnly(value) {
  return String(value ?? "").replace(/\D+/g, "");
}

/**
 * Join a string into chunks (e.g. 4-4-4-4).
 * @param {string} value
 * @param {number} size
 * @returns {string}
 */
export function chunkString(value, size = 4) {
  const chunks = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks.join(" ");
}

/**
 * Format card number shown on the card with masked groups.
 * Example: **** **** **** 1234
 * @param {string} value
 * @returns {string}
 */
export function formatMaskedCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 19);
  const visible = digits.slice(-4);
  const targetLength = Math.max(16, digits.length || 16);
  const maskedLength = Math.max(targetLength - visible.length, 0);
  const masked = `${"*".repeat(maskedLength)}${visible}`;
  return chunkString(masked, 4);
}

/**
 * Format card number shown in text inputs (groups of 4 for readability).
 * @param {string} value
 * @returns {string}
 */
export function formatInputCardNumber(value) {
  return chunkString(digitsOnly(value).slice(0, 19), 4);
}

/**
 * Normalize cardholder display value.
 * @param {string} value
 * @returns {string}
 */
export function normalizeCardholder(value) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 26);

  return normalized ? normalized.toUpperCase() : "CARD HOLDER";
}

/**
 * Normalize expiry value to MM/YY.
 * @param {string} value
 * @returns {string}
 */
export function normalizeExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);

  if (!digits) {
    return "MM/YY";
  }

  const monthRaw = digits.slice(0, 2);
  let month = Number(monthRaw);

  if (Number.isNaN(month)) {
    month = 1;
  }

  month = clamp(month, 1, 12);
  const monthText = String(month).padStart(2, "0");
  const yearText = digits.slice(2, 4);

  return yearText ? `${monthText}/${yearText}` : monthText;
}

/**
 * Normalize CVV value.
 * @param {string} value
 * @returns {string}
 */
export function normalizeCVV(value) {
  const digits = digitsOnly(value).slice(0, 4);
  return digits || "000";
}

/**
 * Validate if a CSS gradient string is syntactically accepted by the browser.
 * @param {string} value
 * @returns {boolean}
 */
export function isGradient(value) {
  const candidate = String(value ?? "").trim();

  if (!candidate || !/gradient\(/i.test(candidate)) {
    return false;
  }

  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return true;
  }

  return CSS.supports("background-image", candidate);
}
