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
const statusPieChart = document.querySelector("#statusPieChart");
const pieActivePercent = document.querySelector("#pieActivePercent");
const pieActiveLabel = document.querySelector("#pieActiveLabel");
const pieInactiveLabel = document.querySelector("#pieInactiveLabel");
const loadingOverlay = document.querySelector("#loadingOverlay");
const captchaSlider = document.querySelector("#captchaSlider");
const captchaStatus = document.querySelector("#captchaStatus");
const captchaValue = document.querySelector("#captchaValue");
const editSheet = document.querySelector("#editSheet");
const editSheetBackdrop = document.querySelector("#editSheetBackdrop");
const editForm = document.querySelector("#editForm");
const closeEditSheet = document.querySelector("#closeEditSheet");
const cancelEditButton = document.querySelector("#cancelEditButton");
const saveEditButton = document.querySelector("#saveEditButton");
const editContactId = document.querySelector("#editContactId");
const editNameInput = document.querySelector("#editName");
const editEmailInput = document.querySelector("#editEmail");
const editPhoneInput = document.querySelector("#editPhone");
const editStatusInput = document.querySelector("#editStatus");
const editNotesInput = document.querySelector("#editNotes");
const lineProfileImage = document.querySelector("#lineProfileImage");
const lineProfileFallback = document.querySelector("#lineProfileFallback");
const lineDisplayName = document.querySelector("#lineDisplayName");
const lineEmailText = document.querySelector("#lineEmailText");
const lineProfileStatus = document.querySelector("#lineProfileStatus");
const lineProfileRefresh = document.querySelector("#lineProfileRefresh");

let contacts = [];
let useDemoStorage = false;
let captchaVerified = false;
let lineProfileLoaded = false;

function buildFlexMessage(data, isUpdate = false) {
  const isActive = data.status === "active";
  const statusLabel = isActive ? "ใช้งาน" : "ไม่ใช้งาน";
  const statusColor = isActive ? "#34d399" : "#fbbf24";
  const statusBg = isActive ? "#064e3b" : "#451a03";
  const headerBg = isActive ? "#059669" : "#b45309";
  const actionText = isUpdate ? "อัปเดตรายชื่อ" : "เพิ่มรายชื่อใหม่";

  const now = new Date().toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const infoRows = [
    {
      icon: "👤",
      label: "ชื่อ-นามสกุล",
      value: data.name,
      valueColor: "#f8fafc",
      weight: "bold",
      size: "md",
    },
    {
      icon: "✉",
      label: "อีเมล",
      value: data.email,
      valueColor: "#94a3b8",
      wrap: true,
    },
    {
      icon: "📱",
      label: "เบอร์โทร",
      value: data.phone,
      valueColor: "#94a3b8",
    },
  ];

  if (data.notes) {
    infoRows.push({
      icon: "📝",
      label: "หมายเหตุ",
      value: data.notes,
      valueColor: "#64748b",
      wrap: true,
    });
  }

  const bodyContents = [];

  infoRows.forEach((row, idx) => {
    if (idx > 0) bodyContents.push({ type: "separator", color: "#1e293b" });

    bodyContents.push({
      type: "box",
      layout: "horizontal",
      alignItems: "center",
      paddingTop: "10px",
      paddingBottom: "10px",
      contents: [
        {
          type: "text",
          text: row.icon,
          size: "sm",
          flex: 0,
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          margin: "md",
          contents: [
            {
              type: "text",
              text: row.label,
              color: "#475569",
              size: "xxs",
            },
            {
              type: "text",
              text: row.value || "-",
              color: row.valueColor || "#f8fafc",
              size: row.size || "sm",
              weight: row.weight || "regular",
              wrap: row.wrap || false,
            },
          ],
        },
      ],
    });
  });

  bodyContents.push({ type: "separator", color: "#1e293b" });
  bodyContents.push({
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    paddingTop: "10px",
    paddingBottom: "4px",
    contents: [
      { type: "text", text: "🏷", size: "sm", flex: 0 },
      {
        type: "box",
        layout: "horizontal",
        flex: 1,
        margin: "md",
        alignItems: "center",
        justifyContent: "space-between",
        contents: [
          { type: "text", text: "สถานะ", color: "#475569", size: "xxs" },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: statusBg,
            cornerRadius: "12px",
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingStart: "10px",
            paddingEnd: "10px",
            contents: [
              {
                type: "text",
                text: statusLabel,
                color: statusColor,
                size: "xxs",
                weight: "bold",
              },
            ],
          },
        ],
      },
    ],
  });

  bodyContents.push({
    type: "text",
    text: `บันทึกเมื่อ ${now}`,
    color: "#334155",
    size: "xxs",
    align: "end",
    margin: "lg",
  });

  return {
    type: "flex",
    altText: `${actionText}สำเร็จ ✓ ${data.name}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: headerBg,
        paddingAll: "20px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            alignItems: "center",
            contents: [
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: "SENDFLEX CRM",
                    color: "#d1fae5",
                    size: "xxs",
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: actionText,
                    color: "#ffffff",
                    size: "xl",
                    weight: "bold",
                    margin: "xs",
                  },
                ],
              },
              {
                type: "box",
                layout: "vertical",
                width: "48px",
                height: "48px",
                cornerRadius: "24px",
                backgroundColor: "#ffffff25",
                justifyContent: "center",
                alignItems: "center",
                contents: [
                  {
                    type: "text",
                    text: "✓",
                    color: "#ffffff",
                    size: "xxl",
                    weight: "bold",
                    align: "center",
                  },
                ],
              },
            ],
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#0f172a",
        paddingAll: "16px",
        contents: bodyContents,
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        backgroundColor: "#0f172a",
        paddingAll: "12px",
        contents: [
          {
            type: "button",
            action: { type: "uri", label: "📞 โทรออก", uri: `tel:${data.phone}` },
            style: "secondary",
            height: "sm",
            color: "#1e293b",
          },
          {
            type: "button",
            action: { type: "uri", label: "✉ ส่งอีเมล", uri: `mailto:${data.email}` },
            style: "primary",
            height: "sm",
            color: "#059669",
          },
        ],
      },
      styles: {
        footer: { separator: true, separatorColor: "#1e293b" },
      },
    },
  };
}

async function sendFlexAndClose(data, isUpdate = false) {
  if (!window.liff) return;
  const flexMessage = buildFlexMessage(data, isUpdate);
  try {
    if (window.liff.isInClient()) {
      await window.liff.sendMessages([flexMessage]);
    }
    window.liff.closeWindow();
  } catch {
    try { window.liff.closeWindow(); } catch { /* noop */ }
  }
}

async function showSaveSuccessAndClose(data, isUpdate = false) {
  const isActive = data.status === "active";
  const statusLabel = isActive ? "ใช้งาน" : "ไม่ใช้งาน";
  const statusColor = isActive ? "#34d399" : "#fbbf24";
  const actionText = isUpdate ? "อัปเดต" : "เพิ่ม";
  const inLiff = window.liff?.isInClient?.() || false;

  const liffHint = inLiff
    ? `<p style="color:#64748b;font-size:12px;margin:12px 0 0;display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0"></span>
        กำลังส่ง Flex Message ลงแชทและปิดหน้าต่าง
      </p>`
    : "";

  await Swal.fire({
    html: `
      <div style="text-align:left;font-family:'Prompt',sans-serif">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
          <div style="width:50px;height:50px;background:linear-gradient(135deg,#22c55e,#059669);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;box-shadow:0 8px 24px #05966940">✓</div>
          <div>
            <p style="color:#86efac;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px">${actionText}รายชื่อสำเร็จ</p>
            <p style="color:#fff;font-size:19px;font-weight:700;margin:0;line-height:1.2">${escapeHtml(data.name)}</p>
          </div>
        </div>
        <div style="background:#1e293b;border-radius:16px;overflow:hidden;font-size:13px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px">
            <span style="color:#64748b">อีเมล</span>
            <span style="color:#cbd5e1;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(data.email)}</span>
          </div>
          <div style="height:1px;background:#0f172a"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px">
            <span style="color:#64748b">เบอร์โทร</span>
            <span style="color:#cbd5e1">${escapeHtml(data.phone)}</span>
          </div>
          <div style="height:1px;background:#0f172a"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px">
            <span style="color:#64748b">สถานะ</span>
            <span style="color:${statusColor};font-weight:700">${statusLabel}</span>
          </div>
        </div>
        ${liffHint}
      </div>
    `,
    background: "#0f172a",
    color: "#f8fafc",
    confirmButtonText: inLiff ? "ส่งแชทและปิด &nbsp;→" : "ตกลง",
    confirmButtonColor: "#22c55e",
    showConfirmButton: true,
    timer: inLiff ? 3000 : undefined,
    timerProgressBar: inLiff,
    customClass: { popup: "swal-dark-popup", confirmButton: "swal-green-btn" },
  });

  await sendFlexAndClose(data, isUpdate);
}

const liffId =
  new URLSearchParams(window.location.search).get("liffId") ||
  window.LIFF_ID ||
  document.querySelector('meta[name="liff-id"]')?.content ||
  "2010029314-R9ysVoiR";

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

function getEditFormData() {
  return {
    name: cleanText(editNameInput.value),
    email: cleanText(editEmailInput.value).toLowerCase(),
    phone: cleanText(editPhoneInput.value),
    status: editStatusInput.value,
    notes: editNotesInput.value.trim(),
  };
}

function setLineProfileFallbackVisible(visible) {
  if (lineProfileFallback) {
    lineProfileFallback.classList.toggle("hidden", !visible);
  }
}

function setLineProfileImage(url) {
  if (!lineProfileImage) return;

  if (url) {
    lineProfileImage.src = url;
    lineProfileImage.classList.remove("hidden");
    setLineProfileFallbackVisible(false);
  } else {
    lineProfileImage.removeAttribute("src");
    lineProfileImage.classList.add("hidden");
    setLineProfileFallbackVisible(true);
  }
}

function setLineProfileText(profile) {
  const displayName = cleanText(profile?.displayName || profile?.name || "");
  const email = cleanText(profile?.email || "");

  if (lineDisplayName) {
    lineDisplayName.textContent = displayName || "ยังไม่ได้เชื่อมต่อ";
  }
  if (lineEmailText) {
    lineEmailText.textContent = email || "-";
  }
  if (lineProfileStatus) {
    lineProfileStatus.textContent = displayName
      ? email
        ? "ดึงข้อมูลโปรไฟล์และอีเมลจาก LINE แล้ว"
        : "ดึงโปรไฟล์ LINE ได้ แต่ยังไม่เห็นอีเมล"
      : "รอข้อมูลจาก LIFF";
  }
}

function prefillInputsFromLine(profile) {
  const displayName = cleanText(profile?.displayName || profile?.name || "");
  const email = cleanText(profile?.email || "").toLowerCase();

  if (displayName && !nameInput.value.trim()) {
    nameInput.value = displayName;
  }
  if (email && !emailInput.value.trim()) {
    emailInput.value = email;
  }
}

async function loadLineProfile() {
  if (!window.liff) {
    setLineProfileText(null);
    if (lineProfileStatus) {
      lineProfileStatus.textContent = "ไม่พบ LIFF SDK";
    }
    return;
  }

  if (!liffId) {
    setLineProfileText(null);
    if (lineProfileStatus) {
      lineProfileStatus.textContent = "ยังไม่ได้กำหนด LIFF ID";
    }
    return;
  }

  if (lineProfileRefresh) {
    lineProfileRefresh.disabled = true;
  }

  try {
    await window.liff.init({ liffId });

    if (!window.liff.isLoggedIn()) {
      lineProfileLoaded = false;
      setLineProfileText(null);
      if (window.liff.isInClient()) {
        if (lineProfileStatus) {
          lineProfileStatus.textContent = "ยังไม่พร้อมดึงข้อมูลใน LINE";
        }
        return;
      }

      if (lineProfileStatus) {
        lineProfileStatus.textContent = "กำลังเข้าสู่ระบบ LINE...";
      }
      window.liff.login({ redirectUri: window.location.href });
      return;
    }

    const [profile, token] = await Promise.all([
      window.liff.getProfile().catch(() => null),
      Promise.resolve(window.liff.getDecodedIDToken?.() || null),
    ]);

    const normalizedProfile = {
      displayName: profile?.displayName || token?.name || token?.displayName || "",
      email: token?.email || "",
      pictureUrl: profile?.pictureUrl || token?.pictureUrl || token?.picture || "",
    };

    lineProfileLoaded = true;
    setLineProfileText(normalizedProfile);
    setLineProfileImage(normalizedProfile.pictureUrl);
    prefillInputsFromLine(normalizedProfile);
    if (lineProfileStatus) {
      lineProfileStatus.textContent = normalizedProfile.email
        ? "โหลดโปรไฟล์ LINE และอีเมลแล้ว"
        : "โหลดโปรไฟล์ LINE แล้ว แต่ไม่พบอีเมล";
    }
  } catch (error) {
    lineProfileLoaded = false;
    setLineProfileText(null);
    if (lineProfileStatus) {
      lineProfileStatus.textContent = error?.message || "โหลดโปรไฟล์ LINE ไม่สำเร็จ";
    }
    setLineProfileImage("");
  } finally {
    if (lineProfileRefresh) {
      lineProfileRefresh.disabled = false;
    }
    window.lucide?.createIcons();
  }
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

function setEditSaving(isSaving) {
  saveEditButton.disabled = isSaving;
  saveEditButton.textContent = isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข";
}

function closeEditModal() {
  editSheet?.classList.add("is-hidden");
  editSheet?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");
  editForm?.reset();
  if (editContactId) editContactId.value = "";
  setEditSaving(false);
}

function openEditModal(contact) {
  editContactId.value = contact.id;
  editNameInput.value = contact.name || "";
  editEmailInput.value = contact.email || "";
  editPhoneInput.value = contact.phone || "";
  editStatusInput.value = contact.status || "active";
  editNotesInput.value = contact.notes || "";
  editSheet?.classList.remove("is-hidden");
  editSheet?.setAttribute("aria-hidden", "false");
  document.body.classList.add("overflow-hidden");
  window.lucide?.createIcons();
  requestAnimationFrame(() => editNameInput.focus());
}

function handleLineProfileRefresh() {
  loadLineProfile();
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
  const inactive = contacts.length - active;
  const activeRatio = contacts.length ? active / contacts.length : 0;
  const activePercent = Math.round(activeRatio * 100);

  totalCount.textContent = contacts.length;
  activeCount.textContent = active;
  inactiveCount.textContent = inactive;
  statusPieChart?.style.setProperty("--active-deg", `${activeRatio * 360}deg`);
  if (pieActivePercent) pieActivePercent.textContent = `${activePercent}%`;
  if (pieActiveLabel) pieActiveLabel.textContent = `${active} รายชื่อ`;
  if (pieInactiveLabel) pieInactiveLabel.textContent = `${inactive} รายชื่อ`;
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

  openEditModal(contact);
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

  const isUpdate = !!contactId.value;
  setSaving(true);

  try {
    if (useDemoStorage) {
      const now = new Date().toISOString();
      if (isUpdate) {
        saveDemoContacts(
          contacts.map((contact) =>
            contact.id === contactId.value ? { ...contact, ...data, updatedAt: now } : contact,
          ),
        );
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
      }
    } else if (isUpdate) {
      await update(ref(db, `contacts/${contactId.value}`), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await push(contactsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    resetForm();
    await showSaveSuccessAndClose(data, isUpdate);
  } catch (error) {
    Swal.fire("บันทึกไม่สำเร็จ", error.message, "error");
  } finally {
    setSaving(false);
  }
});

editForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = editContactId.value;
  const data = getEditFormData();
  if (!id) return;

  if (!data.name || !data.email || !data.phone || !data.status) {
    Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "info");
    return;
  }

  setEditSaving(true);

  try {
    if (useDemoStorage) {
      const now = new Date().toISOString();
      saveDemoContacts(
        contacts.map((contact) => (contact.id === id ? { ...contact, ...data, updatedAt: now } : contact)),
      );
    } else {
      await update(ref(db, `contacts/${id}`), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    }
    closeEditModal();
    await showSaveSuccessAndClose(data, true);
  } catch (error) {
    Swal.fire("บันทึกไม่สำเร็จ", error.message, "error");
  } finally {
    setEditSaving(false);
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
lineProfileRefresh?.addEventListener("click", handleLineProfileRefresh);
lineProfileImage?.addEventListener("load", () => setLineProfileFallbackVisible(false));
lineProfileImage?.addEventListener("error", () => setLineProfileImage(""));
editSheetBackdrop?.addEventListener("click", closeEditModal);
closeEditSheet?.addEventListener("click", closeEditModal);
cancelEditButton?.addEventListener("click", closeEditModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !editSheet?.classList.contains("is-hidden")) {
    closeEditModal();
  }
});
searchInput.addEventListener("input", renderContacts);
statusFilter.addEventListener("change", renderContacts);
captchaSlider?.addEventListener("input", verifyCaptchaProgress);
resetCaptcha();
loadLineProfile();

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
