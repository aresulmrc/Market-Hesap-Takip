import {
  getPayersFromLocalStorage,
  getPaymentsFromLocalStorage,
} from "./storage.js";

const alertElement = document.getElementById("alert");
const payerSelect = document.getElementById("payer");
const payerListElement = document.getElementById("payerList");
const dahilOlanlarContainer = document.getElementById("dahilOlanlarContainer");
const tableBody = document.getElementById("table");
const formElement = document.getElementById("form");
const dateInput = document.getElementById("date");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const submitButton = formElement.querySelector('button[type="submit"]');
const summaryCardBody = document.getElementById("summaryBody");

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

/**
 * Verilen sayıyı TL para birimi formatına çevirir.
 * @param {number} amount Formatlanacak tutar.
 * @returns {string} Formatlanmış para birimi string'i.
 */
export function formatCurrency(amount) {
  if (isNaN(amount)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(amount);
}

/**
 * Kullanıcıya bir uyarı mesajı gösterir.
 * @param {string} message Gösterilecek mesaj.
 * @param {'success' | 'danger' | 'warning' | 'info'} type Uyarı türü.
 */
export function showAlert(message, type) {
  alertElement.className = `alert alert-${type} alert-dismissible fade show`;
  alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  alertElement.style.display = "block";
  alertElement.style.opacity = "1";
}

/**
 * Tarih input alanı için maksimum tarihi bugüne ayarlar.
 */
export function setMaxDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("max", today);
}

/**
 * Ödeme tablosunu oluşturur ve görüntüler.
 * @param {function} updateBorcCallback Borç durumu checkbox değiştiğinde çağrılacak fonksiyon.
 * @param {function} editCallback Düzenle butonu tıklandığında çağrılacak fonksiyon.
 * @param {function} deleteCallback Sil butonu tıklandığında çağrılacak fonksiyon.
 */
export function displayPayments(
  updateBorcCallback,
  editCallback,
  deleteCallback
) {
  const payments = getPaymentsFromLocalStorage();
  if (payments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted p-4">
          <i class="fas fa-folder-open fs-4 mb-2 d-block"></i>
          Henüz kayıtlı ödeme bulunmuyor.
        </td>
      </tr>`;
    return;
  }
  tableBody.innerHTML = payments
    .map((payment, index) => createTableRow(payment, index))
    .join("");

  tableBody
    .querySelectorAll('input[type="checkbox"][data-index]')
    .forEach((checkbox) => {
      checkbox.removeEventListener("change", updateBorcCallback);
      checkbox.addEventListener("change", updateBorcCallback);
    });
  tableBody
    .querySelectorAll("button.btn-edit[data-index]")
    .forEach((button) => {
      button.removeEventListener("click", editCallback);
      button.addEventListener("click", editCallback);
    });
  tableBody
    .querySelectorAll("button.btn-delete[data-index]")
    .forEach((button) => {
      button.removeEventListener("click", deleteCallback);
      button.addEventListener("click", deleteCallback);
    });
}

/**
 * Ödeme tablosu için tek bir satır HTML'i oluşturur.
 * @param {object} payment Ödeme nesnesi.
 * @param {number} index Ödemenin dizideki indeksi.
 * @returns {string} Tablo satırı HTML'i.
 */
function createTableRow(payment, index) {
  const payers = getPayersFromLocalStorage();
  const borcluDurumu = payers
    .filter(
      (payer) => payment.dahilOlanlar && payment.dahilOlanlar.includes(payer)
    )
    .map((payer) => {
      if (payer === payment.payer) {
        return `<div class="mb-1"><span class="badge bg-primary text-wrap">${payer}: Ödeyen</span></div>`;
      }
      const isPaid = payment.borclu && payment.borclu[payer] === false;
      const durumText = isPaid ? "Ödedi" : "Ödemedi";
      const badgeClass = isPaid ? "bg-success" : "bg-warning text-dark";
      return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="borc-${index}-${payer}" data-payer="${payer}" data-index="${index}" ${
        isPaid ? "checked" : ""
      }>
                <label class="form-check-label" for="borc-${index}-${payer}">
                    ${payer}: <span class="badge ${badgeClass} text-wrap">${durumText}</span>
                </label>
            </div>`;
    })
    .join("");

  const formattedDate = payment.date
    ? new Date(payment.date).toLocaleDateString()
    : "-";
  const formattedAmount = formatCurrency(payment.amount);
  const splitCount =
    !isNaN(payment.split) && payment.split > 0 ? payment.split : "-";
  const perPersonAmount =
    !isNaN(payment.amount) && !isNaN(payment.split) && payment.split > 0
      ? formatCurrency(payment.amount / payment.split)
      : "-";

  const editedDateStr = payment.editedDate
    ? new Date(payment.editedDate).toLocaleString()
    : "-";

  return `
        <tr>
            <td>${index + 1}</td>
            <td>${payment.payer || "-"}</td>
            <td class="text-end">${formattedAmount}</td>
            <td class="text-center">${splitCount}</td>
            <td class="text-end">${perPersonAmount}</td>
            <td>${formattedDate}</td>
            <td>${payment.type || "-"}</td>
            <td>${borcluDurumu || "-"}</td>
            <td>${editedDateStr === "Invalid Date" ? "-" : editedDateStr}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-warning btn-sm btn-edit" data-index="${index}" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete" data-index="${index}" title="Sil">
                         <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Formu verilen ödeme bilgileriyle doldurur (düzenleme için).
 * @param {object} payment Formu dolduracak ödeme nesnesi.
 */
export function populateForm(payment) {
  payerSelect.value = payment.payer;
  amountInput.value = payment.amount;
  dateInput.value = payment.date;
  typeInput.value = payment.type;

  document
    .querySelectorAll('#dahilOlanlarContainer input[type="checkbox"]')
    .forEach((cb) => {
      cb.checked = false;
      cb.disabled = false;
    });

  const payers = getPayersFromLocalStorage();
  payers.forEach((payer) => {
    const checkbox = document.getElementById(`dahil${payer}`);
    if (checkbox) {
      checkbox.checked = payment.dahilOlanlar.includes(payer);
      checkbox.disabled = payer === payment.payer;
    }
  });
}

/**
 * Ödeme formunu sıfırlar ve 'Ekle' moduna geçer.
 */
export function resetForm() {
  formElement.reset();
  setFormMode("add");
  const selectedPayer = payerSelect.value;
  updateDahilOlanlarCheckboxes(selectedPayer);
}

/**
 * Kişi listesini (`select`, `ul`, checkbox'lar) yükler ve günceller.
 * @param {function} editPayerCallback Kişi düzenle butonu tıklandığında çağrılacak fonksiyon.
 * @param {function} removePayerCallback Kişi sil butonu tıklandığında çağrılacak fonksiyon.
 */
export function loadPayers(editPayerCallback, removePayerCallback) {
  const payers = getPayersFromLocalStorage();

  const currentPayerValue = payerSelect.value;
  payerSelect.innerHTML =
    payers.length > 0
      ? payers
          .map((payer) => `<option value="${payer}">${payer}</option>`)
          .join("")
      : '<option value="" disabled>Önce kişi ekleyin</option>';

  if (payers.includes(currentPayerValue)) {
    payerSelect.value = currentPayerValue;
  } else if (payers.length > 0) {
    payerSelect.value = payers[0];
  } else {
    payerSelect.value = "";
  }

  const selectedPayer = payerSelect.value;

  dahilOlanlarContainer.innerHTML =
    payers.length > 0
      ? payers
          .map(
            (payer) => `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="dahil${payer}" data-payer-name="${payer}" ${
              payer === selectedPayer ? "checked disabled" : ""
            }>
                <label class="form-check-label" for="dahil${payer}">${payer}</label>
            </div>
        `
          )
          .join("")
      : '<p class="text-muted small mb-0">Ödeme bölüştürmek için kişi eklemelisiniz.</p>';

  payerListElement.innerHTML =
    payers.length > 0
      ? payers
          .map(
            (payer) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${payer}</span>
                <div class="btn-group">
                    <button class="btn btn-outline-warning btn-sm btn-edit-payer" data-payer="${payer}" title="Düzenle">
                        <i class="fas fa-user-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-remove-payer" data-payer="${payer}" title="Sil">
                        <i class="fas fa-user-times"></i>
                    </button>
                </div>
            </li>
        `
          )
          .join("")
      : `<li class="list-group-item text-center text-muted p-3">
           <i class="fas fa-users-slash fs-4 mb-2 d-block"></i>
           Henüz kayıtlı kişi yok.
         </li>`;

  payerListElement.querySelectorAll(".btn-edit-payer").forEach((button) => {
    button.removeEventListener("click", editPayerCallback);
    button.addEventListener("click", editPayerCallback);
  });
  payerListElement.querySelectorAll(".btn-remove-payer").forEach((button) => {
    button.removeEventListener("click", removePayerCallback);
    button.addEventListener("click", removePayerCallback);
  });

  payerSelect.removeEventListener("change", handlePayerChange);
  payerSelect.addEventListener("change", handlePayerChange);

  updateDahilOlanlarCheckboxes(selectedPayer);
}

/**
 * Ödeyen kişi select box'ı değiştiğinde çağrılır.
 * İlgili checkbox'ları günceller.
 */
function handlePayerChange() {
  const selectedPayer = payerSelect.value;
  updateDahilOlanlarCheckboxes(selectedPayer);
}

/**
 * "Hesaba Dahil Olanlar" checkbox'larını günceller.
 * Seçilen ödeyen kişinin checkbox'ını işaretler ve devre dışı bırakır.
 * @param {string} selectedPayer O an seçili olan ödeyen kişi.
 */
function updateDahilOlanlarCheckboxes(selectedPayer) {
  const payers = getPayersFromLocalStorage();
  payers.forEach((payer) => {
    const checkbox = document.getElementById(`dahil${payer}`);
    if (checkbox) {
      checkbox.disabled = false;
      checkbox.checked = payer === selectedPayer;
      if (payer === selectedPayer) {
        checkbox.disabled = true;
      }
    }
  });
}

/**
 * Formun modunu ayarlar (Ekle veya Güncelle).
 * Gönder butonunun metnini ve stilini değiştirir.
 * @param {'add' | 'edit'} mode Form modu ('add' veya 'edit').
 */
export function setFormMode(mode) {
  if (mode === "edit") {
    submitButton.innerHTML =
      '<i class="fas fa-sync-alt me-1"></i> Ödemeyi Güncelle';
    submitButton.classList.remove("btn-primary");
    submitButton.classList.add("btn-warning");
  } else {
    submitButton.innerHTML = '<i class="fas fa-save me-1"></i> Ödeme Kaydet';
    submitButton.classList.remove("btn-warning");
    submitButton.classList.add("btn-primary");
  }
}

/**
 * Hesaplanan özet bilgilerini (bakiyeler, borçlar, toplam harcama) UI'da gösterir.
 * @param {Map<string, number>} balances Kişi bakiyeleri.
 * @param {Array<{from: string, to: string, amount: number}>} simplifiedDebts Basitleştirilmiş borç işlemleri.
 * @param {number} totalSpending Toplam yapılan harcama.
 */
export function displaySummary(balances, simplifiedDebts, totalSpending) {
  if (!summaryCardBody) return;

  let summaryHtml = `<h6 class="card-subtitle mb-3 text-muted">Genel Durum</h6>`;
  summaryHtml += `<p><strong>Toplam Harcama:</strong> ${formatCurrency(
    totalSpending
  )}</p>`;

  summaryHtml += `<h6 class="mt-4">Kişi Bakiyeleri:</h6>`;
  if (balances.size > 0) {
    summaryHtml += `<ul class="list-group list-group-flush mb-3">`;
    balances.forEach((amount, person) => {
      const balanceClass =
        amount > 0.01
          ? "text-success"
          : amount < -0.01
          ? "text-danger"
          : "text-muted";
      const balanceText =
        amount > 0.01 ? "(Alacaklı)" : amount < -0.01 ? "(Borçlu)" : "(Denge)";
      summaryHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    ${person}:
                    <span class="badge ${
                      balanceClass === "text-success"
                        ? "bg-success-subtle text-success-emphasis"
                        : balanceClass === "text-danger"
                        ? "bg-danger-subtle text-danger-emphasis"
                        : "bg-secondary-subtle text-secondary-emphasis"
                    } rounded-pill">
                        ${formatCurrency(amount)} ${balanceText}
                    </span>
                </li>`;
    });
    summaryHtml += `</ul>`;
  } else {
    summaryHtml += `<p class="text-muted small">Hesaplanacak bakiye yok.</p>`;
  }

  summaryHtml += `<h6 class="mt-4">Ödeme Adımları (Hesap Kapatma):</h6>`;
  if (simplifiedDebts.length > 0) {
    summaryHtml += `<ul class="list-group list-group-flush">`;
    simplifiedDebts.forEach((debt) => {
      summaryHtml += `
                <li class="list-group-item px-0">
                    <i class="fas fa-user text-danger me-1"></i> ${debt.from}
                    <i class="fas fa-long-arrow-alt-right mx-2"></i>
                    <i class="fas fa-user text-success me-1"></i> ${debt.to} :
                    <strong class="ms-2">${formatCurrency(
                      debt.amount
                    )}</strong> ödemeli.
                </li>`;
    });
    summaryHtml += `</ul>`;
  } else {
    summaryHtml += `<p class="text-muted small">Ödenmesi gereken borç bulunmuyor.</p>`;
  }

  summaryCardBody.innerHTML = summaryHtml;
}
