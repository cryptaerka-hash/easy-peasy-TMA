// =========================================================
// ТЕМА + ЛОГИКА: брендирование, экраны, Supabase-запись
// =========================================================

let selectedService = CONFIG.services[0];
let selectedStaff = CONFIG.staff[0];
let selectedSlot = CONFIG.slots.find(s => !CONFIG.busy_slots.includes(s));

// ============================================
// 0. SUPABASE CLIENT (лёгкий fetch-враппер)
// ============================================
const sb = {
  async insert(table, data) {
    const res = await fetch(`${CONFIG.supabase.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "apikey": CONFIG.supabase.anon_key,
        "Authorization": `Bearer ${CONFIG.supabase.anon_key}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  }
};

// ============================================
// 0b. УНИВЕРСАЛЬНЫЙ ПОПАП
// ============================================
function showAppPopup(title, message, buttons) {
  buttons = buttons || [{ id: "ok", type: "ok", text: "ОК" }];
  if (window.Telegram?.WebApp?.showPopup) {
    try { window.Telegram.WebApp.showPopup({ title, message, buttons }); return; }
    catch(e) {}
  }
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;";
  overlay.innerHTML = `
    <div style="background:var(--tg-bg,#fff);color:var(--tg-text,#1a1a1a);border-radius:16px;padding:20px;max-width:320px;width:100%;">
      <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;">${title}</h3>
      <p style="margin:0 0 16px;font-size:14px;white-space:pre-line;color:var(--tg-hint,#666);">${message}</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        ${buttons.map(b => `<button data-close style="padding:8px 16px;border-radius:10px;background:var(--brand-primary);color:#fff;border:none;font-weight:500;cursor:pointer;">${b.text}</button>`).join("")}
      </div>
    </div>`;
  overlay.querySelectorAll("[data-close]").forEach(btn => btn.onclick = () => overlay.remove());
  document.body.appendChild(overlay);
}

// ============================================
// 1. БРЕНДИНГ
// ============================================
function applyBrand() {
  document.documentElement.style.setProperty("--brand-primary", CONFIG.colors.primary);
  document.documentElement.style.setProperty("--brand-secondary", CONFIG.colors.secondary);
  document.title = CONFIG.name + " — демо";
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
      (key === CONFIG.theme_key ? "border:2px solid var(--brand-primary);" : "border:1px solid var(--tg-secondary-bg,#eee);opacity:.5;");
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
    card.style.cssText = `display:flex;align-items:center;gap:12px;padding:12px 14px;
      border-radius:${i % 2 === 0 ? "22px 10px 22px 10px" : "10px 22px 10px 22px"};
      border:2px solid ${svc.id === selectedService.id ? "var(--brand-primary)" : "var(--tg-secondary-bg,#eee)"};
      cursor:pointer;margin-bottom:8px;`;
    card.innerHTML = `
      <div style="width:36px;height:36px;border-radius:50%;background:var(--tg-secondary-bg,#f4f4f5);
        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ti ${svc.icon}" style="font-size:18px;"></i>
      </div>
      <div style="flex:1;">
        <p style="margin:0;font-size:14px;font-weight:500;">${svc.name}</p>
        <p style="margin:0;font-size:12px;color:var(--tg-hint,#999);">${svc.duration} мин</p>
      </div>
      <p style="margin:0;font-size:14px;font-weight:500;">
        ${svc.price > 0 ? svc.price.toLocaleString("ru-RU") + " сум" : "бесплатно"}
      </p>`;
    card.onclick = () => { selectedService = svc; renderServices(); updateBookButton(); };
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
  CONFIG.staff.forEach(person => {
    const chip = document.createElement("div");
    chip.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 12px;
      border-radius:999px;border:2px solid ${person.id === selectedStaff.id ? "var(--brand-primary)" : "var(--tg-secondary-bg,#eee)"};
      cursor:pointer;margin-bottom:4px;`;
    chip.innerHTML = `
      <div style="width:24px;height:24px;border-radius:50%;background:var(--tg-secondary-bg,#f4f4f5);
        display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;flex-shrink:0;">${person.initials}</div>
      <p style="margin:0;font-size:13px;">${person.name}</p>`;
    chip.onclick = () => { selectedStaff = person; renderStaff(); };
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
  CONFIG.slots.forEach(slot => {
    const busy = CONFIG.busy_slots.includes(slot);
    const btn = document.createElement("button");
    btn.textContent = slot;
    btn.disabled = busy;
    btn.style.cssText = `padding:8px;border-radius:12px;font-size:13px;background:transparent;
      color:var(--tg-text,#1a1a1a);cursor:${busy ? "default" : "pointer"};
      border:2px solid ${slot === selectedSlot ? "var(--brand-primary)" : "var(--tg-secondary-bg,#eee)"};
      opacity:${busy ? "0.35" : "1"};`;
    if (!busy) btn.onclick = () => { selectedSlot = slot; renderTimeSlots(); };
    wrap.appendChild(btn);
  });
}

// ============================================
// 6. КНОПКА "ЗАПИСАТЬСЯ" — реальное сохранение в Supabase
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

  btn.onclick = async () => {
    if (typeof hapticSuccess === "function") hapticSuccess();

    // Показываем попап сразу — не ждём Supabase (UX быстрый)
    showAppPopup(
      "✅ Запись подтверждена",
      `${selectedService.name}\n${selectedStaff.name} · сегодня, ${selectedSlot}\n\nНапоминание придёт автоматически за 2 часа до приёма.`,
      [{ id: "ok", type: "ok", text: "Отлично" }]
    );

    // Сохраняем в Supabase в фоне (только если есть business_id)
    if (CONFIG.business_id && CONFIG.supabase) {
      safeSet(async () => {
        const today = new Date().toISOString().split("T")[0];
        const [h, m] = selectedSlot.split(":");
        const startTime = new Date(`${today}T${h}:${m}:00+05:00`).toISOString();
        const endTime = new Date(
          new Date(`${today}T${h}:${m}:00+05:00`).getTime() + selectedService.duration * 60000
        ).toISOString();

        const tgUser = window.TG_USER || {};
        await sb.insert("bookings", {
          business_id: CONFIG.business_id,
          staff_id:    selectedStaff.id,
          service_id:  selectedService.id,
          customer_telegram_id: tgUser.id || null,
          customer_name: tgUser.first_name || "Демо-клиент",
          start_time: startTime,
          end_time:   endTime,
          status: "confirmed"
        });
      }, "supabase-booking");
    }
  };
}

// ============================================
// 7. МОИ ЗАПИСИ
// ============================================
function renderMyBookings() {
  const wrap = document.getElementById("my-bookings-content");
  if (!wrap) return;
  const svc = CONFIG.services[0];
  const staff = CONFIG.staff[0];
  const slot = CONFIG.slots.find(s => !CONFIG.busy_slots.includes(s));
  wrap.innerHTML = `
    <div style="border:1px solid var(--tg-secondary-bg,#eee);border-radius:16px;padding:14px;margin-bottom:12px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:500;">${svc.name}</p>
      <p style="margin:0;font-size:13px;color:var(--tg-hint,#999);">${staff.name} · сегодня, ${slot}</p>
      <p style="margin:8px 0 0;font-size:13px;color:var(--brand-primary);">✓ Запись подтверждена</p>
    </div>
    <button id="reminder-btn" style="width:100%;padding:12px;border-radius:14px;
      border:1px solid var(--tg-secondary-bg,#eee);background:transparent;
      color:var(--tg-text,#1a1a1a);font-size:14px;cursor:pointer;">
      🔔 Показать, как выглядит напоминание
    </button>`;
  document.getElementById("reminder-btn").onclick = () => {
    showAppPopup(
      "⏰ Напоминание",
      `Через 2 часа у вас приём:\n${svc.name} — ${CONFIG.name}\n${staff.name}, сегодня в ${slot}\n📍 ${CONFIG.tagline}`,
      [
        { id: "confirm", type: "default", text: "Подтвердить" },
        { id: "cancel", type: "destructive", text: "Отменить" }
      ]
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
  past.forEach((visit, i) => {
    const card = document.createElement("div");
    card.style.cssText = `border:1px solid var(--tg-secondary-bg,#eee);border-radius:16px;padding:14px;margin-bottom:10px;`;
    const nameShort = visit.staff.name.split(" ").slice(0, 2).join(" ");
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div>
          <p style="margin:0;font-size:14px;font-weight:500;">${visit.svc.name}</p>
          <p style="margin:3px 0 0;font-size:13px;color:var(--tg-hint,#999);">${visit.staff.name} · ${visit.date}</p>
        </div>
        <p style="margin:0;font-size:13px;font-weight:500;color:var(--tg-hint,#999);">
          ${visit.svc.price > 0 ? visit.svc.price.toLocaleString("ru-RU") + " сум" : "бесплатно"}
        </p>
      </div>
      <button class="repeat-btn" data-idx="${i}" style="width:100%;padding:10px;border-radius:12px;
        background:var(--brand-primary);color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer;">
        🔁 Записаться снова · ${nameShort}
      </button>`;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll(".repeat-btn").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      selectedService = past[idx].svc;
      selectedStaff = past[idx].staff;
      safeSet(renderServices, "repeat-services");
      safeSet(renderStaff, "repeat-staff");
      safeSet(renderTimeSlots, "repeat-slots");
      safeSet(updateBookButton, "repeat-price");
      showScreen("booking");
      if (typeof hapticTap === "function") hapticTap();
      showAppPopup(
        "✅ Данные заполнены",
        `${past[idx].svc.name}\n${past[idx].staff.name}\n\nОсталось выбрать удобное время — и готово.`,
        [{ id: "ok", type: "ok", text: "Выбрать время" }]
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
    ["Ожидается выручка", s.revenue_today],
    ["Свободных окон", s.free_slots],
    ["Новых клиентов за неделю", s.new_clients_week]
  ];
  wrap.innerHTML = items.map(([label, val]) => `
    <div style="background:var(--tg-secondary-bg,#f4f4f5);border-radius:12px;padding:12px;">
      <p style="margin:0 0 4px;font-size:12px;color:var(--tg-hint,#999);">${label}</p>
      <p style="margin:0;font-size:18px;font-weight:600;">${val}</p>
    </div>`).join("");
}

// ============================================
// 10. НАВИГАЦИЯ
// ============================================
const SCREENS = ["booking", "bookings", "history", "owner", "about"];

function showScreen(id) {
  SCREENS.forEach(s => {
    const el = document.getElementById("screen-" + s);
    if (el) el.style.display = (s === id) ? "block" : "none";
  });
  document.querySelectorAll("#bottom-nav button").forEach(btn => {
    btn.style.color = (btn.dataset.screen === id) ? "var(--brand-primary)" : "var(--tg-hint,#999)";
  });
  if (typeof setBackButton === "function") setBackButton(() => showScreen("booking"));
}

function initNavigation() {
  document.querySelectorAll("#bottom-nav button").forEach(btn => {
    btn.onclick = () => showScreen(btn.dataset.screen);
  });
  showScreen("booking");
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener("DOMContentLoaded", () => {
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
