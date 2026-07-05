/**
 * Format angka ke string Rupiah
 * @param {number} num
 * @returns {string} contoh: "Rp 1.500.000"
 */
export function toRupiah(num) {
  return "Rp " + Math.round(num || 0).toLocaleString("id-ID");
}

/**
 * Parse string Rupiah ke number
 * @param {string|number} value
 * @returns {number}
 */
export function parseRupiah(value) {
  const cleaned = String(value ?? "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Escape HTML untuk mencegah XSS pada innerHTML
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format angka ke string singkat (contoh: 1.5jt)
 * @param {number} num
 * @returns {string}
 */
export function toShortRupiah(num) {
  const n = Math.round(num || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
}
