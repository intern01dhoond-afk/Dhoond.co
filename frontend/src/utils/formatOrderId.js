/**
 * Formats an order ID in Dhoond's canonical format:
 *   DHD-DD.MM-####
 * Example: order id=8, created 2026-04-16 → "DHD-16.04-0008"
 *
 * @param {number|string} id            - The fallback database ID
 * @param {string|Date}   createdAt     - ISO date string or Date object
 * @param {number}        dailySequence - Optional daily sequence number
 * @returns {string}
 */
export const formatOrderId = (id, createdAt, dailySequence) => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const day   = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Use dailySequence if provided, otherwise fallback to DB id
  const seqValue = dailySequence !== undefined && dailySequence !== null ? dailySequence : id;
  const seq   = String(seqValue).padStart(4, '0');
  
  return `DHD-${day}.${month}-${seq}`;
};
