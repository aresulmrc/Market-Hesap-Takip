import {
  getPayersFromLocalStorage,
  savePayersToLocalStorage,
  getPaymentsFromLocalStorage,
  savePaymentsToLocalStorage,
  STORAGE_KEYS,
} from "./storage.js";
import {
  showAlert,
  loadPayers,
  displayPayments,
  populateForm,
  resetForm as resetUiForm,
  setMaxDate,
  setFormMode,
  displaySummary,
  formatCurrency,
} from "./ui.js";

// --- State Variables ---
let isEditing = false;
let editingIndex = null;
let itemToDelete = { type: null, value: null };

// --- DOM Referansları ---
const addPayerForm = document.getElementById("addPayerForm");
const newPayerInput = document.getElementById("newPayer");
const paymentForm = document.getElementById("form");
const deleteConfirmModalElement = document.getElementById("deleteConfirmModal");
const deleteConfirmModal = deleteConfirmModalElement
  ? new bootstrap.Modal(deleteConfirmModalElement)
  : null;
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const clearAllDataButton = document.getElementById("clearAllDataButton");
const deleteModalBody = deleteConfirmModalElement?.querySelector(".modal-body");
const payerInput = document.getElementById("payer");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");
const dahilOlanlarContainer = document.getElementById("dahilOlanlarContainer");
const dahilOlanlarFeedback = document.getElementById("dahilOlanlarFeedback");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  setMaxDate();
  setupEventListeners();
  setFormMode("add");
  loadPayers(handleEditPayerClick, handleRemovePayerClick);
  displayPayments(
    handleBorcDurumuChange,
    handleEditPaymentClick,
    handleDeletePaymentClick
  );
  updateSummary();
}

function setupEventListeners() {
  paymentForm.addEventListener("submit", handleFormSubmit);
  addPayerForm.addEventListener("submit", handleAddPayerSubmit);

  if (clearAllDataButton) {
    clearAllDataButton.addEventListener("click", handleClearAllDataClick);
  }

  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", performDelete);
  }
}

// --- Form Handlers ---

function handleFormSubmit(event) {
  event.preventDefault();
  const paymentData = getFormData();

  if (!validateFormData(paymentData)) {
    return;
  }

  if (isEditing) {
    updatePayment(editingIndex, paymentData);
    showAlert("Ödeme başarıyla güncellendi.", "success");
  } else {
    savePayment(paymentData);
    showAlert("Ödeme başarıyla kaydedildi.", "success");
  }

  resetForm();
  displayPayments(
    handleBorcDurumuChange,
    handleEditPaymentClick,
    handleDeletePaymentClick
  );
  updateSummary();
}

function handleAddPayerSubmit(event) {
  event.preventDefault();
  const payerName = newPayerInput.value.trim();
  if (!payerName) {
    newPayerInput.classList.add("is-invalid");
    showAlert("Lütfen geçerli bir kişi adı girin.", "danger");
    return;
  }
  newPayerInput.classList.remove("is-invalid");

  if (addPayer(payerName)) {
    showAlert(`${payerName} başarıyla eklendi.`, "success");
    addPayerForm.reset();
    loadPayers(handleEditPayerClick, handleRemovePayerClick);
    updateSummary();
  }
}

// --- Data Getters and Validators ---

function getFormData() {
  const dahilOlanlarCheckboxes = document.querySelectorAll(
    '#dahilOlanlarContainer input[type="checkbox"]'
  );
  const dahilOlanlar = Array.from(dahilOlanlarCheckboxes)
    .filter((checkbox) => checkbox.checked || checkbox.disabled)
    .map((checkbox) => checkbox.id.replace("dahil", ""));

  return {
    payer: payerInput.value,
    amount: parseFloat(amountInput.value) || 0,
    split: dahilOlanlar.length,
    date: dateInput.value,
    type: typeInput.value.trim(),
    dahilOlanlar: dahilOlanlar,
  };
}

function validateFormData(payment) {
  let isValid = true;
  [
    payerInput,
    amountInput,
    dateInput,
    typeInput,
    dahilOlanlarContainer,
  ].forEach((el) => el?.classList.remove("is-invalid"));
  if (dahilOlanlarFeedback) dahilOlanlarFeedback.textContent = "";

  if (!payment.payer) {
    payerInput?.classList.add("is-invalid");
    isValid = false;
  }
  if (isNaN(payment.amount) || payment.amount <= 0) {
    amountInput?.classList.add("is-invalid");
    isValid = false;
  }
  if (!payment.date) {
    dateInput?.classList.add("is-invalid");
    isValid = false;
  }
  if (!payment.type) {
    typeInput?.classList.add("is-invalid");
    isValid = false;
  }
  if (payment.split < 1) {
    dahilOlanlarContainer?.classList.add("is-invalid");
    if (dahilOlanlarFeedback)
      dahilOlanlarFeedback.textContent = "Hesaba en az 1 kişi dahil olmalıdır.";
    isValid = false;
  }
  if (payment.split > 1 && payment.dahilOlanlar.length < 2) {
    dahilOlanlarContainer?.classList.add("is-invalid");
    if (dahilOlanlarFeedback)
      dahilOlanlarFeedback.textContent =
        "Hesabı bölüştürmek için en az 2 kişi seçilmelidir.";
    isValid = false;
  }

  return isValid;
}

// --- Payer Management ---

/**
 * Yeni bir kişiyi listeye ve localStorage'a ekler.
 * @param {string} payerName Eklenecek kişinin adı.
 * @returns {boolean} Ekleme başarılıysa true, değilse false.
 */
function addPayer(payerName) {
  const payers = getPayersFromLocalStorage();
  if (!payers.includes(payerName)) {
    payers.push(payerName);
    savePayersToLocalStorage(payers);
    return true;
  } else {
    showAlert(`${payerName} zaten listede mevcut.`, "warning");
    return false;
  }
}

/**
 * Mevcut bir kişinin adını günceller (hem kişi listesinde hem de ödemelerde).
 * @param {string} oldName Eski kişi adı.
 * @param {string} newName Yeni kişi adı.
 */
function editPayer(oldName, newName) {
  let payers = getPayersFromLocalStorage();
  const index = payers.indexOf(oldName);

  if (index === -1) return;

  if (payers.includes(newName) && oldName !== newName) {
    showAlert(`${newName} ismi zaten kullanılıyor.`, "danger");
    return;
  }

  payers[index] = newName;
  savePayersToLocalStorage(payers);

  let payments = getPaymentsFromLocalStorage();
  let updated = false;
  payments = payments.map((p) => {
    let paymentUpdated = false;
    if (p.payer === oldName) {
      p.payer = newName;
      paymentUpdated = true;
    }
    if (p.dahilOlanlar.includes(oldName)) {
      p.dahilOlanlar = p.dahilOlanlar.map((d) => (d === oldName ? newName : d));
      paymentUpdated = true;
    }
    if (p.borclu && p.borclu.hasOwnProperty(oldName)) {
      p.borclu[newName] = p.borclu[oldName];
      delete p.borclu[oldName];
      paymentUpdated = true;
    }
    if (paymentUpdated) {
      p.editedDate = new Date().toISOString();
      updated = true;
    }
    return p;
  });

  if (updated) {
    savePaymentsToLocalStorage(payments);
    displayPayments(
      handleBorcDurumuChange,
      handleEditPaymentClick,
      handleDeletePaymentClick
    );
    updateSummary();
  }
  showAlert(
    `${oldName} başarıyla ${newName} olarak güncellendi. Ödemelerdeki ilgili kayıtlar da değiştirildi.`,
    "success"
  );
  loadPayers(handleEditPayerClick, handleRemovePayerClick);
}

/**
 * Belirtilen kişiyi siler (eğer hiçbir ödemede yer almıyorsa).
 * @param {string} payerName Silinecek kişinin adı.
 * @returns {boolean} Silme başarılıysa true, değilse false.
 */
function performRemovePayer(payerName) {
  let payers = getPayersFromLocalStorage();
  payers = payers.filter((p) => p !== payerName);
  savePayersToLocalStorage(payers);
  showAlert(`${payerName} başarıyla silindi.`, "success");
  loadPayers(handleEditPayerClick, handleRemovePayerClick);
  updateSummary();
  return true;
}

// --- Payment Management ---

/**
 * Yeni bir ödemeyi localStorage'a kaydeder.
 * @param {object} paymentData Kaydedilecek ödeme verisi.
 */
function savePayment(paymentData) {
  let payments = getPaymentsFromLocalStorage();

  paymentData.borclu = {};
  if (paymentData.split > 1) {
    paymentData.dahilOlanlar.forEach((p) => {
      if (p !== paymentData.payer) {
        paymentData.borclu[p] = true;
      }
    });
  }
  paymentData.editedDate = new Date().toISOString();

  payments.push(paymentData);
  savePaymentsToLocalStorage(payments);
}

/**
 * Belirtilen index'teki ödemeyi siler.
 * @param {number} index Silinecek ödemenin index'i.
 * @returns {boolean} Silme başarılıysa true, değilse false.
 */
function performDeletePayment(index) {
  let payments = getPaymentsFromLocalStorage();
  if (index >= 0 && index < payments.length) {
    payments.splice(index, 1);
    savePaymentsToLocalStorage(payments);
    showAlert("Ödeme başarıyla silindi.", "success");
    if (isEditing && editingIndex === index) {
      resetForm();
    }
    displayPayments(
      handleBorcDurumuChange,
      handleEditPaymentClick,
      handleDeletePaymentClick
    );
    updateSummary();
    return true;
  }
  showAlert("Ödeme silinirken bir hata oluştu.", "danger");
  return false;
}

/**
 * Belirtilen index'teki ödemeyi günceller.
 * @param {number} index Güncellenecek ödemenin index'i.
 * @param {object} updatedPaymentData Yeni ödeme verileri.
 */
function updatePayment(index, updatedPaymentData) {
  let payments = getPaymentsFromLocalStorage();
  if (index >= 0 && index < payments.length) {
    const originalPayment = payments[index];

    const updatedPayment = {
      ...originalPayment,
      ...updatedPaymentData,
      editedDate: new Date().toISOString(),
    };

    updatedPayment.borclu = {};
    if (updatedPayment.split > 1) {
      updatedPayment.dahilOlanlar.forEach((p) => {
        if (p !== updatedPayment.payer) {
          const wasPaidBefore =
            originalPayment.dahilOlanlar.includes(p) &&
            originalPayment.borclu &&
            originalPayment.borclu[p] === false;
          updatedPayment.borclu[p] = !wasPaidBefore;
        }
      });
    }

    payments[index] = updatedPayment;
    savePaymentsToLocalStorage(payments);
  }
}

// --- Event Handlers for Dynamic Content (Callbacks) ---

/**
 * Borç durumu checkbox'ı değiştiğinde çağrılır.
 * @param {Event} event Change olayı nesnesi.
 */
function handleBorcDurumuChange(event) {
  const checkbox = event.target;
  const payer = checkbox.dataset.payer;
  const index = parseInt(checkbox.dataset.index, 10);

  if (isNaN(index)) return;

  let payments = getPaymentsFromLocalStorage();
  if (
    payments[index] &&
    payments[index].borclu &&
    payments[index].borclu.hasOwnProperty(payer)
  ) {
    payments[index].borclu[payer] = !checkbox.checked;
    payments[index].editedDate = new Date().toISOString();
    savePaymentsToLocalStorage(payments);
    displayPayments(
      handleBorcDurumuChange,
      handleEditPaymentClick,
      handleDeletePaymentClick
    );
    updateSummary();
  }
}

/**
 * Ödeme düzenle butonu tıklandığında çağrılır.
 * @param {Event} event Click olayı nesnesi.
 */
function handleEditPaymentClick(event) {
  const button = event.currentTarget;
  const index = parseInt(button.dataset.index, 10);
  if (isNaN(index)) return;

  const payments = getPaymentsFromLocalStorage();
  if (index >= 0 && index < payments.length) {
    const paymentToEdit = payments[index];
    populateForm(paymentToEdit);

    isEditing = true;
    editingIndex = index;
    setFormMode("edit");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Ödeme sil butonu tıklandığında çağrılır (Modalı tetikler).
 * @param {Event} event Click olayı nesnesi.
 */
function handleDeletePaymentClick(event) {
  const button = event.currentTarget;
  const index = parseInt(button.dataset.index, 10);
  if (isNaN(index) || !deleteConfirmModal) return;

  const payments = getPaymentsFromLocalStorage();
  if (index >= 0 && index < payments.length) {
    const payment = payments[index];
    if (deleteModalBody) {
      deleteModalBody.textContent = `"${
        payment.type || "İsimsiz"
      }" (${formatCurrency(payment.amount)}) başlıklı ${new Date(
        payment.date
      ).toLocaleDateString()} tarihli ödemeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
    }
    itemToDelete = { type: "payment", value: index };
    deleteConfirmModal.show();
  }
}

/**
 * Kişi düzenle butonu tıklandığında çağrılır.
 * @param {Event} event Click olayı nesnesi.
 */
function handleEditPayerClick(event) {
  const button = event.currentTarget;
  const oldName = button.dataset.payer;
  const newName = prompt("Yeni isim girin:", oldName);

  if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
    editPayer(oldName, newName.trim());
  } else if (newName !== null && newName.trim() === oldName) {
    // İsim aynıysa bir şey yapma
  } else if (newName !== null) {
    showAlert("Geçersiz isim girdiniz.", "warning");
  }
}

/**
 * Kişi sil butonu tıklandığında çağrılır (Modalı tetikler).
 * @param {Event} event Click olayı nesnesi.
 */
function handleRemovePayerClick(event) {
  const button = event.currentTarget;
  const payerName = button.dataset.payer;
  if (!payerName || !deleteConfirmModal) return;

  const payments = getPaymentsFromLocalStorage();
  const isPayerInvolved = payments.some(
    (p) => p.payer === payerName || p.dahilOlanlar.includes(payerName)
  );

  if (isPayerInvolved) {
    showAlert(
      `${payerName} isimli kişi bazı ödemelerde kayıtlı olduğu için silinemez. Önce ilgili ödemeleri düzenleyin veya silin.`,
      "warning"
    );
    return;
  }

  if (deleteModalBody) {
    deleteModalBody.textContent = `"${payerName}" isimli kişiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
  }
  itemToDelete = { type: "payer", value: payerName };
  deleteConfirmModal.show();
}

/**
 * Modal onaylandığında çağrılır ve ilgili silme işlemini gerçekleştirir.
 */
function performDelete() {
  if (!itemToDelete.type || !deleteConfirmModal) {
    return;
  }

  let success = false;
  if (itemToDelete.type === "payment") {
    success = performDeletePayment(itemToDelete.value);
  } else if (itemToDelete.type === "payer") {
    success = performRemovePayer(itemToDelete.value);
  } else if (itemToDelete.type === "all") {
    success = performClearAllData();
  }

  deleteConfirmModal.hide();
  itemToDelete = { type: null, value: null };
}

/**
 * "Tüm Verileri Temizle" butonu tıklandığında çağrılır (Modalı tetikler).
 */
function handleClearAllDataClick() {
  if (!deleteConfirmModal) return;

  if (deleteModalBody) {
    deleteModalBody.textContent = `Tüm kişileri ve ödeme geçmişini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`;
  }
  itemToDelete = { type: "all", value: null };
  deleteConfirmModal.show();
}

/**
 * localStorage'daki tüm kişi ve ödeme verilerini temizler.
 * @returns {boolean} Temizleme başarılıysa true, değilse false.
 */
function performClearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PAYERS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    showAlert("Tüm veriler başarıyla temizlendi.", "success");
    resetForm();
    loadPayers(handleEditPayerClick, handleRemovePayerClick);
    displayPayments(
      handleBorcDurumuChange,
      handleEditPaymentClick,
      handleDeletePaymentClick
    );
    updateSummary();
    return true;
  } catch (error) {
    console.error("Veri temizlenirken hata oluştu:", error);
    showAlert("Veriler temizlenirken bir hata oluştu.", "danger");
    return false;
  }
}

// --- Utility Functions ---

/**
 * Formu sıfırlar, düzenleme modunu kapatır ve validasyon stillerini temizler.
 */
function resetForm() {
  resetUiForm();
  isEditing = false;
  editingIndex = null;
  [
    payerInput,
    amountInput,
    dateInput,
    typeInput,
    dahilOlanlarContainer,
  ].forEach((el) => el?.classList.remove("is-invalid"));
  if (dahilOlanlarFeedback) dahilOlanlarFeedback.textContent = "";
  newPayerInput?.classList.remove("is-invalid");
}

// --- Summary Calculation ---

/**
 * Ödemeleri ve 'borclu' durumunu analiz ederek her kişinin
 * *ödenmemiş* net bakiyesini hesaplar.
 * Bu, özetin "Kişi Bakiyeleri" ve "Ödeme Adımları (Hesap Kapatma)"
 * kısımları için kullanılır.
 * @returns {Map<string, number>} Kişi isimlerine göre ödenmemiş bakiye haritası.
 */
function calculateOutstandingBalances() {
  const payments = getPaymentsFromLocalStorage();
  const payers = getPayersFromLocalStorage();
  const outstandingBalances = new Map();

  payers.forEach((payer) => outstandingBalances.set(payer, 0));

  payments.forEach((payment) => {
    const amount = payment.amount;
    const payerName = payment.payer;
    const splitCount = payment.split;
    const includedPayers = payment.dahilOlanlar;
    const borcluStatus = payment.borclu || {};

    if (
      isNaN(amount) ||
      amount <= 0 ||
      !payers.includes(payerName) ||
      splitCount <= 0 ||
      !includedPayers ||
      includedPayers.length !== splitCount
    ) {
      if (
        !isNaN(amount) &&
        amount > 0 &&
        payers.includes(payerName) &&
        splitCount > 0
      ) {
        console.warn(
          "Tutarsız bölüşüm verisi (dahilOlanlar/split), ödenmemiş bakiye hesaplamasında atlanıyor:",
          payment
        );
      }
      return;
    }

    const amountPerPerson = amount / splitCount;

    includedPayers.forEach((includedPayer) => {
      if (includedPayer === payerName) {
        return;
      }

      const hasPaid = borcluStatus[includedPayer] === false;

      if (!hasPaid) {
        if (outstandingBalances.has(payerName)) {
          outstandingBalances.set(
            payerName,
            outstandingBalances.get(payerName) + amountPerPerson
          );
        }
        if (outstandingBalances.has(includedPayer)) {
          outstandingBalances.set(
            includedPayer,
            outstandingBalances.get(includedPayer) - amountPerPerson
          );
        }
      }
    });
  });

  return outstandingBalances;
}

/**
 * Hesaplanan bakiyeleri kullanarak kimin kime ne kadar ödeme yapması gerektiğini
 * minimum işlem sayısıyla belirler. (Greedy Algorithm)
 * @param {Map<string, number>} balances - Hesaplanmış bakiye haritası.
 * @returns {Array<{from: string, to: string, amount: number}>} Yapılması gereken ödeme işlemlerinin listesi.
 */
function simplifyDebts(balances) {
  const transactions = [];
  const epsilon = 0.01;

  const balancesCopy = new Map(balances);

  const debtors = [];
  const creditors = [];
  balancesCopy.forEach((amount, person) => {
    if (amount < -epsilon) {
      debtors.push({ person, amount: amount });
    } else if (amount > epsilon) {
      creditors.push({ person, amount: amount });
    }
  });

  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const debtAmount = Math.abs(debtor.amount);
    const creditAmount = creditor.amount;

    const transferAmount = Math.min(debtAmount, creditAmount);

    if (transferAmount > epsilon) {
      transactions.push({
        from: debtor.person,
        to: creditor.person,
        amount: transferAmount,
      });

      debtor.amount += transferAmount;
      creditor.amount -= transferAmount;
    }

    if (Math.abs(debtor.amount) < epsilon) {
      debtorIndex++;
    }
    if (creditor.amount < epsilon) {
      creditorIndex++;
    }
  }

  return transactions;
}

/**
 * Özeti hesaplar ve UI'da gösterir.
 */
function updateSummary() {
  const outstandingBalances = calculateOutstandingBalances();
  const simplifiedOutstandingDebts = simplifyDebts(
    new Map(outstandingBalances)
  );

  const payments = getPaymentsFromLocalStorage();
  const calculatedTotalSpending = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  displaySummary(
    outstandingBalances,
    simplifiedOutstandingDebts,
    calculatedTotalSpending
  );
}
