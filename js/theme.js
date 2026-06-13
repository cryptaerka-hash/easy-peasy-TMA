let selectedService = CONFIG.services[0];
let selectedStaff = CONFIG.staff[0];
let selectedSlot = CONFIG.slots.find(s => !CONFIG.busy_slots.includes(s));

function showAppPopup(title, message, buttons) {
  buttons = buttons || [{ id: "ok", type: "ok", text: "ОК" }];
  if (window.Telegram?.WebApp?.showPopup) {
    try {
      window.Telegram.WebApp.showPopup({ title, message, buttons });
      return;
    } catch (e) {
      console.warn("tg.showPopup недоступен, fallback", e);
    }
  }
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;";
  overlay.innerHTML = `
    <div style="background:#fff;color:#1a1a1a;border-radius:16px;padding:20px;max-width:320px;width:100%;">
      <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;">${title}</h3>
      <p style="margin:0 0 16px;font-size:14px;white-space:pre-line;color:#666;">${message}</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        ${buttons.map(b => `<button data-close style="padding:8px 16px;border-radius:10px;background:var(--brand-primary);color:#fff;border:none;font-weight:500;">${b.text}</button>`).join("")}
      </div>
    </div>`;
  overlay.querySelectorAll("[data-close]").forEach(btn => btn.onclick = () => overlay.remove());
  document.body.appendChild(overlay);
}

function applyBrand() {
  document.documentElement.style.setProperty("--brand-primary", CONFIG.colors.primary);
  document.documentElement.style.setProperty("--brand-secondary", CONFIG.colors.secondary);
  document.title = CONFIG.name + " — демо";
  document.querySelectorAll("[data-business-name]").forEach(el => el.textContent = CONFIG.name);
  document.querySelectorAll("[data-business-tagline]").forEach(el => el.textContent = CONFIG.tagline);
  document.querySelectorAll("[data-business-icon]").forEach(el => el.className = "ti " + CONFIG.icon);
}

function renderThemeSwitcher() {
  const labels = { dental: "🦷 Стоматология", beauty: "💅 Бьюти", legal: "⚖️ Юрист", auto: "🚗 Автосервис" };
  const wrap = document.getElementById("theme-switcher");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.all_themes.forEach(key => {
    const a = document.createElement("a");
    a.href = "?theme=" + key;
    a.textContent = labels[key] || key;
    a.style.cssText = "padding:6px 12px;border-radius:999px;font-size:12px;text-decoration:none;font-weight:500;" +
      (key === CONFIG.theme_key ? "background:var(--brand-primary);color:#fff;" : "background:#f4f4f5;color:#1a1a1a;opacity:.6;");
    wrap.appendChild(a);
  });
}

function renderServices() {
  const wrap = document.getElementById("services-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.services.forEach((svc, i) => {
    const card = document.createElement("div");
    card.style.cssText = `display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;border:2px solid ${svc.id === selectedService.id ? "var(--brand-primary)" : "#eee"};cursor:pointer;margin-bottom:8px;`;
    card.innerHTML = `
      <div style="width:36px;height:36px;border-radius:50%;background:#f4f4f5;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="ti ${svc.icon}" style="font-size:18px;"></i></div>
      <div style="flex:1;"><p style="margin:0;font-size:14px;font-weight:500;">${svc.name}</p><p style="margin:0;font-size:12px;color:#999;">${svc.duration} мин</p></div>
      <p style="margin:0;font-size:14px;font-weight:500;">${svc.price > 0 ? svc.price.toLocaleString("ru-RU") + " сум" : "бесплатно"}</p>`;
    card.onclick = () => { selectedService = svc; renderServices(); updateBookButton(); };
    wrap.appendChild(card);
  });
}

function renderStaff() {
  const wrap = document.getElementById("staff-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.staff.forEach(person => {
    const chip = document.createElement("div");
    chip.style.cssText = `flex:1;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;border:2px solid ${person.id === selectedStaff.id ? "var(--brand-primary)" : "#eee"};cursor:pointer;justify-content:center;`;
    chip.innerHTML = `<div style="width:24px;height:24px;border-radius:50%;background:#f4f4f5;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;flex-shrink:0;">${person.initials}</div><p style="margin:0;font-size:13px;font-weight:500;">${person.name}</p>`;
    chip.onclick = () => { selectedStaff = person; renderStaff(); };
    wrap.appendChild(chip);
  });
}

function renderTimeSlots() {
  const wrap = document.getElementById("time-slots");
  if (!wrap) return;
  wrap.innerHTML = "";
  CONFIG.slots.forEach(slot => {
    const busy = CONFIG.busy_slots.includes(slot);
    const btn = document.createElement("button");
    btn.textContent = slot;
    btn.disabled = busy;
    btn.style.cssText = `padding:8px;border-radius:12px;font-size:13px;background:transparent;color:#1a1a1a;border:2px solid ${slot === selectedSlot ? "var(--brand-primary)" : "#eee"};opacity:${busy ? "0.35" : "1"};font-weight:500;`;
    if (!busy) btn.onclick = () => { selectedSlot = slot; renderTimeSlots(); };
    wrap.appendChild(btn);
  });
}

function updateBookButton() {
  const priceEl = document.getElementById("book-price");
  if (!priceEl) return;
  priceEl.textContent = selectedService.price > 0 ? selectedService.price.toLocaleString("ru-RU") + " сум" : "бесплатно";
}

function initBookButton() {
  updateBookButton();
  const btn = document.getElementById("book-btn");
  if (!btn) return;
  btn.onclick = () => {
    if (typeof hapticSuccess === "function") hapticSuccess();
    showAppPopup("✅ Запись подтверждена", `${selectedService.name}\n${selectedStaff.name} · сегодня, ${selectedSlot}\n\nНапоминание придёт автоматически за 2 часа до приема.`, [{ id: "ok", type: "ok", text: "Отлично" }]);
  };
}

function renderMyBookings() {
  const wrap = document.getElementById("my-bookings-content");
  if (!wrap) return;
  const svc = CONFIG.services[0];
  const staff = CONFIG.staff[0];
  const slot = CONFIG.slots.find(s => !CONFIG.busy_slots.includes(s));
  wrap.innerHTML = `
    <div style="border:1px solid #eee;border-radius:16px;padding:14px;margin-bottom:12px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:500;">${svc.name}</p>
      <p style="margin:0;font-size:13px;color:#999;">${staff.name} · сегодня, ${slot}</p>
      <p style="margin:8px 0 0;font-size:13px;color:var(--brand-primary);font-weight:500;">✓ Запись подтверждена</p>
    </div>
    <button id="reminder-btn" style="width:100%;padding:12px;border-radius:14px;border:1px solid #eee;background:transparent;color:#1a1a1a;font-size:14px;font-weight:500;">🔔 Показать, как выглядит напоминание</button>`;
  document.getElementById("reminder-btn").onclick = () => {
    showAppPopup("⏰ Напоминание", `Через 2 часа у вас прием:\n${svc.name} — ${CONFIG.name}\n${staff.name}, сегодня в ${slot}\n📍 ${CONFIG.tagline}`, [{ id: "confirm", type: "default", text: "Подтвердить" }, { id: "cancel", type: "destructive", text: "Отменить" }]);
  };
}

function renderVaqf() {
  const wrap = document.getElementById("vaqf-content");
  if (!wrap) return;
  wrap.innerHTML = `
    <div style="border:1px solid #eee;border-radius:16px;padding:16px;">
      <p style="margin:0 0 8px;font-size:16px;font-weight:600;">❤️ Vaqf — добро рядом</p>
      <p style="margin:0 0 12px;font-size:14px;color:#666;line-height:1.5;">${CONFIG.vaqf.description}</p>
      <p style="margin:0;font-size:14px;color:#999;">В этом месяце благодаря клиентам ${CONFIG.name} собрано:</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:600;color:var(--brand-primary);">${CONFIG.vaqf.collected_month}</p>
    </div>`;
}

function renderOwnerStats() {
  const wrap = document.getElementById("owner-stats");
  if (!wrap) return;
  const s = CONFIG.owner_stats;
  const items = [["Записей на сегодня", s.bookings_today], ["Ожидается выручка", s.revenue_today], ["Свободных окон", s.free_slots], ["Новых клиентов за неделю", s.new_clients_week]];
  wrap.innerHTML = items.map(([label, val]) => `<div style="background:#f4f4f5;border-radius:12px;padding:12px;"><p style="margin:0 0 4px;font-size:12px;color:#999;">${label}</p><p style="margin:0;font-size:18px;font-weight:600;">${val}</p></div>`).join("");
}

const SCREENS = ["booking", "bookings", "vaqf", "owner", "about"];
function showScreen(id) {
  SCREENS.forEach(s => { const el = document.getElementById("screen-" + s); if (el) el.style.display = (s === id) ? "block" : "none"; });
  document.querySelectorAll("#bottom-nav button").forEach(btn => { btn.style.color = (btn.dataset.screen === id) ? "var(--brand-primary)" : "#999"; });
  if (typeof setBackButton === "function") { setBackButton(() => showScreen("booking")); }
}

function initNavigation() {
  document.querySelectorAll("#bottom-nav button").forEach(btn => { btn.onclick = () => showScreen(btn.dataset.screen); });
  showScreen("booking");
}

document.addEventListener("DOMContentLoaded", () => {
  safeSet(applyBrand, "brand");
  safeSet(renderThemeSwitcher, "theme-switcher");
  safeSet(renderServices, "services");
  safeSet(renderStaff, "staff");
  safeSet(renderTimeSlots, "slots");
  safeSet(initBookButton, "book-btn");
  safeSet(renderMyBookings, "my-bookings");
  safeSet(renderVaqf, "vaqf");
  safeSet(renderOwnerStats, "owner-stats");
  safeSet(initNavigation, "navigation");
});
