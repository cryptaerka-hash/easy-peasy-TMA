// =========================================================
// ТЕМА + ЛОГИКА v3 — работает в любой версии Telegram и браузере
// =========================================================

let selectedService = CONFIG.services[0];
let selectedStaff   = CONFIG.staff[0];
let selectedSlot    = CONFIG.slots.find(s => !CONFIG.busy_slots.includes(s));

// ============================================
// 0. ПОПАП — работает везде (Telegram любой версии + браузер)
// ============================================
function showAppPopup(title, message, buttons) {
  // Всегда используем свой попап — не зависим от версии Telegram
  buttons = buttons || [{ text: "ОК" }];

  // Удаляем старый попап если есть
  const old = document.getElementById("app-popup-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "app-popup-overlay";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "background:rgba(0,0,0,.55)",
    "display:flex", "align-items:center", "justify-content:center",
    "z-index:99999", "padding:20px"
  ].join(";");

  const box = document.createElement("div");
  box.style.cssText = [
    "background:var(--tg-bg,#ffffff)",
    "color:var(--tg-text,#1a1a1a)",
    "border-radius:18px",
    "padding:22px 20px",
    "max-width:320px",
    "width:100%",
    "box-shadow:0 8px 32px rgba(0,0,0,.18)"
  ].join(";");

  const btnsHtml = buttons.map(b =>
    `<button class="popup-btn" style="flex:1;padding:11px 8px;border-radius:12px;
      background:var(--brand-primary,#0EA5E9);color:#fff;border:none;
      font-size:15px;font-weight:600;cursor:pointer;">${b.text}</button>`
  ).join("");

  box.innerHTML = `
    <p style="margin:0 0 8px;font-size:17px;font-weight:700;">${title}</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.55;
       color:var(--tg-hint,#666);white-space:pre-line;">${message}</p>
    <div style="display:flex;gap:8px;">${btnsHtml}</div>`;

  box.querySelectorAll(".popup-btn").forEach(btn => {
    btn.onclick = () => overlay.remove();
  });

  overlay.appendChild(box);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

// ============================================
// 0b. SUPABASE — сохранение записи
// ============================================
async function saveBookingToSupabase() {
  console.log("[Supabase] Starting save...");
  console.log("[Supabase] business_id:", CONFIG.business_id);
  console.log("[Supabase] service_id:", selectedService.id);
  console.log("[Supabase] staff_id:", selectedStaff.id);

  try {
    const today = new Date().toISOString().split("T")[0];
    const [h, m] = selectedSlot.split(":");
    const startTime = new Date(`${today}T${h}:${m}:00+05:00`).toISOString();
    const endTime   = new Date(
      new Date(`${today}T${h}:${m}:00+05:00`).getTime() +
      selectedService.duration * 60000
    ).toISOString();

    const tgUser = window.TG_USER || {};
    const payload = {
      business_id:          CONFIG.business_id,
      staff_id:             selectedStaff.id,
      service_id:           selectedService.id,
      customer_telegram_id: tgUser.id || null,
      customer_name:        tgUser.first_name || "Демо-клиент",
      start_time:           startTime,
      end_time:             endTime,
      status:               "confirmed"
    };

    console.log("[Supabase] Payload:", JSON.stringify(payload));

    const res = await fetch(CONFIG.supabase.url + "/rest/v1/bookings", {
      method: "POST",
      headers: {
        "apikey":        CONFIG.supabase.anon_key,
        "Authorization": "Bearer " + CONFIG.supabase.anon_key,
        "Content-Type":  "application/json",
        "Prefer":        "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("[Supabase] Status:", res.status, "Body:", text);

    if (res.ok) {
      console.log("[Supabase] ✅ Booking saved!");
    } else {
      console.error("[Supabase] ❌ Failed:", res.status, text);
    }
  } catch (err) {
    console.error("[Supabase] ❌ Exception:", err.message);
  }
}

// ============================================
// 1. БРЕНДИНГ
// ============================================
function applyBrand() {
  document.documentElement.style.setProperty("--brand-primary", CONFIG.colors.primary);
  document.documentElement.style.setProperty("--brand-secondary", CONFIG.colors.secondary);
  document.title = CONFIG.name;
  document.querySelectorAll("[data-business-name]").forEach(el => el.textContent = CONFIG.name);
  document.querySelectorAll("[data-business-tagline]").forEach(el => el.textContent = CONFIG.tagline);
  document.querySelectorAll("[data-business-icon]").forEach(el => el.className = "ti " + CONFIG.icon);
}

// ============================================
// 2. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ
// ============================================
function renderThemeSwitcher() {
  const labels = { dental: "🦷", beauty: "💅", legal: "⚖️", auto: "🚗" };
  const wrap = document.getElementById("theme-switcher");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.all_themes.forEach(key => {
    const a = document.createElement("a");
    a.href = "?theme=" + key;
    a.textContent = labels[key] || key;
    a.style.cssText = "padding:6px 10px;border-radius:999px;font-size:16px;text-decoration:none;" +
      (key === CONFIG.theme_key
        ? "border:2px solid var(--brand-primary);"
        : "border:1px solid var(--tg-secondary-bg,#eee);opacity:.5;");
    wrap.appendChild(a);
  });
}

// ============================================
// 3. УСЛУГИ
// ============================================
function renderServices() {
  const wrap = document.getElementById("services-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.services.forEach((svc, i) => {
    const card = document.createElement("div");
    card.style.cssText = "display:flex;align-items:center;gap:12px;padding:12px 14px;" +
      "border-radius:" + (i % 2 === 0 ? "22px 10px 22px 10px" : "10px 22px 10px 22px") + ";" +
      "border:2px solid " + (svc.id === selectedService.id ? "var(--brand-primary)" : "var(--tg-secondary-bg,#eee)") + ";" +
      "cursor:pointer;margin-bottom:8px;";
    card.innerHTML =
      "<div style='width:36px;height:36px;border-radius:50%;background:var(--tg-secondary-bg,#f4f4f5);" +
      "display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
      "<i class='ti " + svc.icon + "' style='font-size:18px;'></i></div>" +
      "<div style='flex:1;'>" +
      "<p style='margin:0;font-size:14px;font-weight:500;'>" + svc.name + "</p>" +
      "<p style='margin:0;font-size:12px;color:var(--tg-hint,#999);'>" + svc.duration + " мин</p></div>" +
      "<p style='margin:0;font-size:14px;font-weight:500;'>" +
      (svc.price > 0 ? svc.price.toLocaleString("ru-RU") + " сум" : "бесплатно") + "</p>";
    card.onclick = function() { selectedService = svc; renderServices(); updateBookButton(); };
    wrap.appendChild(card);
  });
}

// ============================================
// 4. СПЕЦИАЛИСТЫ
// ============================================
function renderStaff() {
  const wrap = document.getElementById("staff-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.staff.forEach(function(person) {
    const chip = document.createElement("div");
    chip.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 12px;" +
      "border-radius:999px;border:2px solid " +
      (person.id === selectedStaff.id ? "var(--brand-primary)" : "var(--tg-secondary-bg,#eee)") +
      ";cursor:pointer;margin-bottom:4px;";
    chip.innerHTML =
      "<div style='width:24px;height:24px;border-radius:50%;background:var(--tg-secondary-bg,#f4f4f5);" +
      "display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;flex-shrink:0;'>" +
      person.initials + "</div>" +
      "<p style='margin:0;font-size:13px;'>" + person.name + "</p>";
    chip.onclick = function() { selectedStaff = person; renderStaff(); };
    wrap.appendChild(chip);
  });
}

// ============================================
// 5. ВРЕМЕННЫЕ СЛОТЫ
// ============================================
function renderTimeSlots() {
  const wrap = document.getElementById("time-slots");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.slots.forEach(function(slot) {
    const busy = CONFIG.busy_slots.includes(slot);
    const btn = document.createElement("button");
    btn.textContent = slot;
    btn.disabled = busy;
    btn.style.cssText = "padding:8px;border-radius:12px;font-size:13px;background:transparent;" +
      "color:var(--tg-text,#1a1a1a);cursor:" + (busy ? "default" : "pointer") + ";" +
      "border:2px solid " + (slot === selectedSlot ? "var(--brand-primary)" : "var(--tg-secondary-bg,#eee)") + ";" +
      "opacity:" + (busy ? "0.35" : "1") + ";";
    if (!busy) btn.onclick = function() { selectedSlot = slot; renderTimeSlots(); };
    wrap.appendChild(btn);
  });
}

// ============================================
// 6. КНОПКА "ЗАПИСАТЬСЯ"
// ============================================
function updateBookButton() {
  const priceEl = document.getElementById("book-price");
  if (!priceEl) return;
  priceEl.textContent = selectedService.price > 0
    ? selectedService.price.toLocaleString("ru-RU") + " сум"
    : "бесплатно";
}

function initBookButton() {
  updateBookButton();
  const btn = document.getElementById("book-btn");
  if (!btn) return;

  btn.onclick = function() {
    console.log("[BookBtn] Clicked! service:", selectedService.name, "staff:", selectedStaff.name, "slot:", selectedSlot);

    // Показываем попап
    showAppPopup(
      "✅ Запись подтверждена",
      selectedService.name + "\n" + selectedStaff.name + " · сегодня, " + selectedSlot +
      "\n\nНапоминание придёт автоматически за 2 часа до приёма.",
      [{ text: "Отлично 👍" }]
    );

    // Сохраняем в Supabase (dental тема — реальный business_id)
    if (CONFIG.business_id) {
      saveBookingToSupabase();
    } else {
      console.log("[BookBtn] No business_id — demo theme, skipping Supabase save");
    }
  };
}

// ============================================
// 7. МОИ ЗАПИСИ
// ============================================
function renderMyBookings() {
  const wrap = document.getElementById("my-bookings-content");
  if (!wrap) return;
  const svc   = CONFIG.services[0];
  const staff = CONFIG.staff[0];
  const slot  = CONFIG.slots.find(function(s) { return !CONFIG.busy_slots.includes(s); });

  wrap.innerHTML =
    "<div style='border:1px solid var(--tg-secondary-bg,#eee);border-radius:16px;padding:14px;margin-bottom:12px;'>" +
    "<p style='margin:0 0 4px;font-size:14px;font-weight:500;'>" + svc.name + "</p>" +
    "<p style='margin:0;font-size:13px;color:var(--tg-hint,#999);'>" + staff.name + " · сегодня, " + slot + "</p>" +
    "<p style='margin:8px 0 0;font-size:13px;color:var(--brand-primary);'>✓ Запись подтверждена</p></div>" +
    "<button id='reminder-btn' style='width:100%;padding:12px;border-radius:14px;" +
    "border:1px solid var(--tg-secondary-bg,#eee);background:transparent;" +
    "color:var(--tg-text,#1a1a1a);font-size:14px;cursor:pointer;'>🔔 Показать, как выглядит напоминание</button>";

  document.getElementById("reminder-btn").onclick = function() {
    showAppPopup(
      "⏰ Напоминание",
      "Через 2 часа у вас приём:\n" + svc.name + " — " + CONFIG.name +
      "\n" + staff.name + ", сегодня в " + slot + "\n📍 " + CONFIG.tagline,
      [{ text: "Подтвердить ✓" }, { text: "Отменить" }]
    );
  };
}

// ============================================
// 8. ИСТОРИЯ ВИЗИТОВ
// ============================================
function renderHistory() {
  const wrap = document.getElementById("history-content");
  if (!wrap) return;
  const past = [
    { svc: CONFIG.services[0], staff: CONFIG.staff[0], date: "5 июня" },
    { svc: CONFIG.services[1], staff: CONFIG.staff[0], date: "18 мая" },
    { svc: CONFIG.services[0], staff: CONFIG.staff[CONFIG.staff.length > 1 ? 1 : 0], date: "2 мая" }
  ];
  wrap.innerHTML = "";
  past.forEach(function(visit, i) {
    const card = document.createElement("div");
    card.style.cssText = "border:1px solid var(--tg-secondary-bg,#eee);border-radius:16px;padding:14px;margin-bottom:10px;";
    const nameShort = visit.staff.name.split(" ").slice(0, 2).join(" ");
    card.innerHTML =
      "<div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;'>" +
      "<div><p style='margin:0;font-size:14px;font-weight:500;'>" + visit.svc.name + "</p>" +
      "<p style='margin:3px 0 0;font-size:13px;color:var(--tg-hint,#999);'>" + visit.staff.name + " · " + visit.date + "</p></div>" +
      "<p style='margin:0;font-size:13px;color:var(--tg-hint,#999);'>" +
      (visit.svc.price > 0 ? visit.svc.price.toLocaleString("ru-RU") + " сум" : "бесплатно") + "</p></div>" +
      "<button class='repeat-btn' data-idx='" + i + "' style='width:100%;padding:10px;border-radius:12px;" +
      "background:var(--brand-primary);color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer;'>" +
      "🔁 Записаться снова · " + nameShort + "</button>";
    wrap.appendChild(card);
  });
  wrap.querySelectorAll(".repeat-btn").forEach(function(btn) {
    btn.onclick = function() {
      const idx = parseInt(btn.dataset.idx);
      selectedService = past[idx].svc;
      selectedStaff   = past[idx].staff;
      renderServices(); renderStaff(); renderTimeSlots(); updateBookButton();
      showScreen("booking");
      showAppPopup(
        "✅ Данные заполнены",
        past[idx].svc.name + "\n" + past[idx].staff.name + "\n\nОсталось выбрать удобное время.",
        [{ text: "Выбрать время" }]
      );
    };
  });
}

// ============================================
// 9. КАБИНЕТ ВЛАДЕЛЬЦА
// ============================================
function renderOwnerStats() {
  const wrap = document.getElementById("owner-stats");
  if (!wrap) return;
  const s = CONFIG.owner_stats;
  const items = [
    ["Записей на сегодня", s.bookings_today],
    ["Ожидается выручка",  s.revenue_today],
    ["Свободных окон",     s.free_slots],
    ["Новых клиентов за неделю", s.new_clients_week]
  ];
  wrap.innerHTML = items.map(function(row) {
    return "<div style='background:var(--tg-secondary-bg,#f4f4f5);border-radius:12px;padding:12px;'>" +
      "<p style='margin:0 0 4px;font-size:12px;color:var(--tg-hint,#999);'>" + row[0] + "</p>" +
      "<p style='margin:0;font-size:18px;font-weight:600;'>" + row[1] + "</p></div>";
  }).join("");
}

// ============================================
// 10. НАВИГАЦИЯ
// ============================================
const SCREENS = ["booking", "bookings", "history", "owner", "about"];

function showScreen(id) {
  SCREENS.forEach(function(s) {
    const el = document.getElementById("screen-" + s);
    if (el) el.style.display = (s === id) ? "block" : "none";
  });
  document.querySelectorAll("#bottom-nav button").forEach(function(btn) {
    btn.style.color = (btn.dataset.screen === id) ? "var(--brand-primary)" : "var(--tg-hint,#999)";
  });
}

function initNavigation() {
  document.querySelectorAll("#bottom-nav button").forEach(function(btn) {
    btn.onclick = function() { showScreen(btn.dataset.screen); };
  });
  showScreen("booking");
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener("DOMContentLoaded", function() {
  safeSet(applyBrand,          "brand");
  safeSet(renderThemeSwitcher, "theme-switcher");
  safeSet(renderServices,      "services");
  safeSet(renderStaff,         "staff");
  safeSet(renderTimeSlots,     "slots");
  safeSet(initBookButton,      "book-btn");
  safeSet(renderMyBookings,    "my-bookings");
  safeSet(renderHistory,       "history");
  safeSet(renderOwnerStats,    "owner-stats");
  safeSet(initNavigation,      "navigation");
});
