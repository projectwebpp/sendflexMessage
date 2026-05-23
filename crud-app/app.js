import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3ypzC7xegyQhbZl6sPa7IyLWIM_QFeSc",
  authDomain: "sendflex-e6b9a.firebaseapp.com",
  databaseURL: "https://sendflex-e6b9a-default-rtdb.firebaseio.com",
  projectId: "sendflex-e6b9a",
  storageBucket: "sendflex-e6b9a.firebasestorage.app",
  messagingSenderId: "369349573672",
  appId: "1:369349573672:web:4e5f748c7067336168c91d",
  measurementId: "G-8F0J3MXZ6J",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const contactsRef = ref(db, "contacts");
const demoStorageKey = "crud-app-demo-contacts";

const form = document.querySelector("#contactForm");
const formTitle = document.querySelector("#formTitle");
const submitButton = document.querySelector("#submitButton");
const resetButton = document.querySelector("#resetButton");
const contactId = document.querySelector("#contactId");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const statusInput = document.querySelector("#status");
const notesInput = document.querySelector("#notes");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const contactsTable = document.querySelector("#contactsTable");
const emptyState = document.querySelector("#emptyState");
const totalCount = document.querySelector("#totalCount");
const activeCount = document.querySelector("#activeCount");
const inactiveCount = document.querySelector("#inactiveCount");
const loadingOverlay = document.querySelector("#loadingOverlay");
const captchaSlider = document.querySelector("#captchaSlider");
const captchaStatus = document.querySelector("#captchaStatus");
const captchaValue = document.querySelector("#captchaValue");

let contacts = [];
let useDemoStorage = false;
let captchaVerified = false;

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  timer: 2200,
  showConfirmButton: false,
  timerProgressBar: true,
  background: "#0f172a",
  color: "#f8fafc",
});

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getFormData() {
  return {
    name: cleanText(nameInput.value),
    email: cleanText(emailInput.value).toLowerCase(),
    phone: cleanText(phoneInput.value),
    status: statusInput.value,
    notes: notesInput.value.trim(),
  };
}

function loadDemoContacts() {
  try {
    return JSON.parse(localStorage.getItem(demoStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveDemoContacts(nextContacts) {
  localStorage.setItem(demoStorageKey, JSON.stringify(nextContacts));
  contacts = nextContacts;
  renderContacts();
}

function createDemoId() {
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getTimeValue(value) {
  if (typeof value === "number") return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function hideLoadingOverlay() {
  loadingOverlay?.classList.add("is-hidden");
}

function resetCaptcha() {
  captchaVerified = false;
  if (captchaSlider) captchaSlider.value = "0";
  submitButton.disabled = true;
  if (captchaValue) captchaValue.textContent = "0%";
  if (captchaStatus) {
    captchaStatus.textContent = "เลื่อนให้สุดเพื่อยืนยัน";
    captchaStatus.classList.remove("text-emerald-300");
    captchaStatus.classList.add("text-slate-400");
  }
}

function verifyCaptchaProgress() {
  const progress = Number(captchaSlider?.value || 0);
  if (captchaValue) captchaValue.textContent = `${progress}%`;

  if (progress >= 100) {
    captchaVerified = true;
    captchaSlider.value = "100";
    captchaValue.textContent = "100%";
    captchaStatus.textContent = "ยืนยันเรียบร้อย";
    captchaStatus.classList.remove("text-slate-400");
    captchaStatus.classList.add("text-emerald-300");
    submitButton.disabled = false;
  } else {
    captchaVerified = false;
    captchaStatus.textContent = "เลื่อนให้สุดเพื่อยืนยัน";
    captchaStatus.classList.remove("text-emerald-300");
    captchaStatus.classList.add("text-slate-400");
    submitButton.disabled = true;
  }
}

function setSaving(isSaving) {
  submitButton.disabled = isSaving || !captchaVerified;
  submitButton.textContent = isSaving ? "กำลังบันทึก..." : contactId.value ? "อัปเดตรายชื่อ" : "บันทึกรายชื่อ";
}

function resetForm() {
  form.reset();
  contactId.value = "";
  formTitle.textContent = "เพิ่มรายชื่อ";
  submitButton.textContent = "บันทึกรายชื่อ";
  resetButton.classList.add("hidden");
  resetCaptcha();
  nameInput.focus();
}

function switchToDemoMode(error) {
  useDemoStorage = true;
  contacts = loadDemoContacts();
  renderContacts();
  hideLoadingOverlay();
  Swal.fire(
    "เชื่อมต่อฐานข้อมูลไม่สำเร็จ",
    `${error.message} ระบบจะเปลี่ยนไปใช้โหมดทดลองในเบราว์เซอร์นี้ก่อน`,
    "error",
  );
}

function updateCounts() {
  const active = contacts.filter((contact) => contact.status === "active").length;
  totalCount.textContent = contacts.length;
  activeCount.textContent = active;
  inactiveCount.textContent = contacts.length - active;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name) {
  return cleanText(name || "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getFilteredContacts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return contacts.filter((contact) => {
    const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus;
    const searchable = [contact.name, contact.email, contact.phone, contact.notes].join(" ").toLowerCase();
    return matchesStatus && (!searchTerm || searchable.includes(searchTerm));
  });
}

function renderContacts() {
  updateCounts();

  const filteredContacts = getFilteredContacts();
  emptyState.classList.toggle("hidden", filteredContacts.length > 0);
  contactsTable.innerHTML = filteredContacts
    .map((contact, index) => {
      const isActive = contact.status === "active";
      const statusLabel = isActive ? "ใช้งาน" : "ไม่ใช้งาน";
      const badgeClass = isActive
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
        : "border-amber-400/20 bg-amber-400/10 text-amber-300";

      return `
        <article class="glass-panel animate-fade-up overflow-hidden rounded-[30px] transition duration-300 active:scale-[0.99]" style="animation-delay: ${Math.min(index * 45, 240)}ms">
          <div class="h-1.5 ${isActive ? "bg-emerald-400" : "bg-amber-300"}"></div>
          <div class="p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-300 to-cyan-300 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-950/30">
                ${escapeHtml(getInitials(contact.name))}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="truncate text-base font-semibold text-white">${escapeHtml(contact.name)}</h3>
                    <div class="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                      <i data-lucide="mail" class="h-3.5 w-3.5 shrink-0"></i>
                      <a class="truncate transition hover:text-emerald-300" href="mailto:${escapeHtml(contact.email)}">
                        ${escapeHtml(contact.email)}
                      </a>
                    </div>
                  </div>
                  <span class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}">
                    ${statusLabel}
                  </span>
                </div>

                <div class="mt-4 grid gap-2">
                  <a class="flex items-center gap-2 rounded-2xl bg-slate-950/70 px-3 py-2 text-sm text-slate-300" href="tel:${escapeHtml(contact.phone)}">
                    <i data-lucide="phone" class="h-4 w-4 text-emerald-300"></i>
                    <span class="truncate">${escapeHtml(contact.phone)}</span>
                  </a>
                  <div class="flex items-start gap-2 rounded-2xl bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                    <i data-lucide="sticky-note" class="mt-0.5 h-4 w-4 shrink-0 text-slate-500"></i>
                    <span class="line-clamp-2">${escapeHtml(contact.notes || "ไม่มีหมายเหตุ")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3">
              <a
                class="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm font-medium text-slate-200 transition active:scale-95"
                href="tel:${escapeHtml(contact.phone)}"
              >
                <i data-lucide="phone-call" class="h-4 w-4"></i>
                โทร
              </a>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="edit-button flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 text-slate-200 transition active:scale-95"
                  data-id="${contact.id}"
                  title="แก้ไข"
                >
                  <i data-lucide="pencil" class="h-4 w-4 pointer-events-none"></i>
                </button>
                <button
                  type="button"
                  class="delete-button flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300 transition active:scale-95"
                  data-id="${contact.id}"
                  title="ลบ"
                >
                  <i data-lucide="trash-2" class="h-4 w-4 pointer-events-none"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
  window.lucide?.createIcons();
}

function editContact(id) {
  const contact = contacts.find((item) => item.id === id);
  if (!contact) return;

  contactId.value = contact.id;
  nameInput.value = contact.name;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
  statusInput.value = contact.status;
  notesInput.value = contact.notes || "";
  formTitle.textContent = "แก้ไขรายชื่อ";
  submitButton.textContent = "อัปเดตรายชื่อ";
  resetButton.classList.remove("hidden");
  resetCaptcha();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  nameInput.focus();
}

async function deleteContact(id) {
  const contact = contacts.find((item) => item.id === id);
  if (!contact) return;

  const result = await Swal.fire({
    title: "ลบรายชื่อนี้?",
    text: `${contact.name} จะถูกลบออกถาวร`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#475569",
    cancelButtonText: "ยกเลิก",
    confirmButtonText: "ลบ",
    background: "#0f172a",
    color: "#f8fafc",
  });

  if (!result.isConfirmed) return;

  try {
    if (useDemoStorage) {
      saveDemoContacts(contacts.filter((item) => item.id !== id));
    } else {
      await remove(ref(db, `contacts/${id}`));
    }
    if (contactId.value === id) resetForm();
    toast.fire({ icon: "success", title: "ลบรายชื่อแล้ว" });
  } catch (error) {
    Swal.fire("ลบไม่สำเร็จ", error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = getFormData();
  if (!data.name || !data.email || !data.phone || !data.status) {
    Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "info");
    return;
  }

  if (Number(captchaSlider?.value || 0) < 100) {
    captchaVerified = false;
    submitButton.disabled = true;
    Swal.fire("กรุณายืนยันก่อนบันทึก", "เลื่อน reCAPTCHA Slider ให้ครบ 100% ก่อนบันทึกข้อมูล", "info");
    return;
  }

  setSaving(true);

  try {
    if (useDemoStorage) {
      const now = new Date().toISOString();
      if (contactId.value) {
        saveDemoContacts(
          contacts.map((contact) =>
            contact.id === contactId.value ? { ...contact, ...data, updatedAt: now } : contact,
          ),
        );
        toast.fire({ icon: "success", title: "อัปเดตรายชื่อแล้ว" });
      } else {
        saveDemoContacts([
          {
            id: createDemoId(),
            ...data,
            createdAt: now,
            updatedAt: now,
          },
          ...contacts,
        ]);
        toast.fire({ icon: "success", title: "เพิ่มรายชื่อแล้ว" });
      }
    } else if (contactId.value) {
      await update(ref(db, `contacts/${contactId.value}`), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast.fire({ icon: "success", title: "อัปเดตรายชื่อแล้ว" });
    } else {
      await push(contactsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.fire({ icon: "success", title: "เพิ่มรายชื่อแล้ว" });
    }
    resetForm();
  } catch (error) {
    Swal.fire("บันทึกไม่สำเร็จ", error.message, "error");
  } finally {
    setSaving(false);
  }
});

contactsTable.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  if (button.classList.contains("edit-button")) {
    editContact(button.dataset.id);
  }

  if (button.classList.contains("delete-button")) {
    deleteContact(button.dataset.id);
  }
});

resetButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderContacts);
statusFilter.addEventListener("change", renderContacts);
captchaSlider?.addEventListener("input", verifyCaptchaProgress);
resetCaptcha();

onValue(
  contactsRef,
  (snapshot) => {
    const data = snapshot.val() || {};
    contacts = Object.entries(data)
      .map(([id, contact]) => ({
        id,
        ...contact,
      }))
      .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt));
    renderContacts();
    hideLoadingOverlay();
  },
  switchToDemoMode,
);
