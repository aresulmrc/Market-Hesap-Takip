// Sabitler: localStorage anahtarları
export const STORAGE_KEYS = {
  PAYERS: "payers",
  PAYMENTS: "payments",
};

/**
 * Kişi listesini localStorage'dan alır. Hata durumunda boş dizi döner.
 * @returns {string[]} Kişi isimlerinin dizisi.
 */
export function getPayersFromLocalStorage() {
  try {
    const payersData = localStorage.getItem(STORAGE_KEYS.PAYERS);
    return payersData ? JSON.parse(payersData) : [];
  } catch (error) {
    console.error("Error parsing payers from localStorage:", error);
    return [];
  }
}

/**
 * Kişi listesini localStorage'a kaydeder.
 * @param {string[]} payers Kaydedilecek kişi isimlerinin dizisi.
 */
export function savePayersToLocalStorage(payers) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYERS, JSON.stringify(payers));
  } catch (error) {
    console.error("Error saving payers to localStorage:", error);
  }
}

/**
 * Ödeme listesini localStorage'dan alır. Hata durumunda boş dizi döner.
 * @returns {object[]} Ödeme nesnelerinin dizisi.
 */
export function getPaymentsFromLocalStorage() {
  try {
    const paymentsData = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return paymentsData ? JSON.parse(paymentsData) : [];
  } catch (error) {
    console.error("Error parsing payments from localStorage:", error);
    return [];
  }
}

/**
 * Ödeme listesini localStorage'a kaydeder.
 * @param {object[]} payments Kaydedilecek ödeme nesnelerinin dizisi.
 */
export function savePaymentsToLocalStorage(payments) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (error) {
    console.error("Error saving payments to localStorage:", error);
  }
}
