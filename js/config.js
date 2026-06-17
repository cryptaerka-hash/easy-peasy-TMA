// =========================================================
// КОНФИГ: 4 темы + реальный Supabase
// =========================================================

const THEMES = {

  dental: {
    slug: "aziz-dent",
    name: "Aziz Dent",
    tagline: "Стоматология премиум-класса в Нукусе",
    category: "dental",
    icon: "ti-tooth",
    colors: { primary: "#0EA5E9", secondary: "#0F172A" },
    business_id: "aaaaaaaa-0000-0000-0000-000000000001",
    services: [
      { id: "0eb02c44-a9e9-4e33-b8e1-72c1cf495aaf", name: "Чистка зубов", duration: 40,  price: 150000, icon: "ti-tooth" },
      { id: "e7b9222a-aae6-4df9-ba41-7634e47951e0", name: "Консультация",  duration: 20,  price: 0,      icon: "ti-stethoscope" },
      { id: "a3e95ca9-9f26-4915-85d5-d8b9e6108443", name: "Отбеливание",   duration: 60,  price: 450000, icon: "ti-sparkles" }
    ],
    staff: [
      { id: "238a4150-81c8-4abc-b6d6-0448172ee6d9", name: "Др. Рустамов", initials: "ДР" },
      { id: "f6d373a2-459f-4e3b-9835-82bb854407b3", name: "Др. Каримова", initials: "ДК" }
    ],
    slots: ["10:00", "11:20", "13:00", "14:40", "16:00", "17:20"],
    busy_slots: ["17:20"],
    owner_stats: { bookings_today: 14, revenue_today: "1 850 000 сум", free_slots: 6, new_clients_week: 9 }
  },

  beauty: {
    slug: "beauty-lab-nukus",
    name: "Beauty Lab Nukus",
    tagline: "Салон красоты в центре Нукуса",
    category: "beauty",
    icon: "ti-sparkles",
    colors: { primary: "#D4537E", secondary: "#1F2937" },
    business_id: null,
    services: [
      { id: "b1", name: "Маникюр",     duration: 60,  price: 80000,  icon: "ti-hand-stop" },
      { id: "b2", name: "Стрижка",     duration: 45,  price: 60000,  icon: "ti-scissors" },
      { id: "b3", name: "Окрашивание", duration: 120, price: 250000, icon: "ti-color-swatch" }
    ],
    staff: [
      { id: "m1", name: "Мастер Дилнора", initials: "ДН" },
      { id: "m2", name: "Мастер Шахноза", initials: "ШХ" }
    ],
    slots: ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"],
    busy_slots: ["13:00"],
    owner_stats: { bookings_today: 9, revenue_today: "740 000 сум", free_slots: 4, new_clients_week: 6 }
  },

  legal: {
    slug: "yurist-karimov",
    name: "Юрист Каримов",
    tagline: "Юридическая консультация и сопровождение",
    category: "legal",
    icon: "ti-scale",
    colors: { primary: "#3C3489", secondary: "#111827" },
    business_id: null,
    services: [
      { id: "l1", name: "Консультация",         duration: 30, price: 100000, icon: "ti-message-2" },
      { id: "l2", name: "Составление договора", duration: 60, price: 300000, icon: "ti-file-text" },
      { id: "l3", name: "Представление в суде", duration: 90, price: 500000, icon: "ti-gavel" }
    ],
    staff: [
      { id: "l4", name: "А. Каримов",  initials: "АК" },
      { id: "l5", name: "М. Юлдашева", initials: "МЮ" }
    ],
    slots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
    busy_slots: ["12:00"],
    owner_stats: { bookings_today: 6, revenue_today: "900 000 сум", free_slots: 5, new_clients_week: 4 }
  },

  auto: {
    slug: "automaster-24",
    name: "AutoMaster 24",
    tagline: "Автосервис полного цикла",
    category: "auto",
    icon: "ti-car",
    colors: { primary: "#0F6E56", secondary: "#1C1917" },
    business_id: null,
    services: [
      { id: "a1", name: "Диагностика",  duration: 30, price: 50000,  icon: "ti-stethoscope" },
      { id: "a2", name: "Замена масла", duration: 40, price: 80000,  icon: "ti-oil" },
      { id: "a3", name: "Шиномонтаж",   duration: 45, price: 120000, icon: "ti-circle" }
    ],
    staff: [
      { id: "a4", name: "Мастер Бахтиёр", initials: "БХ" },
      { id: "a5", name: "Мастер Жасур",   initials: "ЖС" }
    ],
    slots: ["09:00", "10:00", "11:30", "13:00", "15:00", "16:30"],
    busy_slots: ["11:30"],
    owner_stats: { bookings_today: 11, revenue_today: "1 120 000 сум", free_slots: 5, new_clients_week: 7 }
  }
};

// === Определение темы по URL-параметру ?theme= ===
const _params = new URLSearchParams(window.location.search);
const _requestedTheme = _params.get("theme");
const _themeKey = THEMES[_requestedTheme] ? _requestedTheme : "dental";

const CONFIG = THEMES[_themeKey];
CONFIG.theme_key = _themeKey;
CONFIG.all_themes = Object.keys(THEMES);
CONFIG.telegram_bot_username = "LeanTMADemoBot";
CONFIG.default_locale = "ru";
CONFIG.is_demo = true;

// === РЕАЛЬНЫЙ SUPABASE ===
CONFIG.supabase = {
  url: "https://gqihcjytyleqiytctwzg.supabase.co",
  anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaWhjanl0eWxlcWl5dGN0d3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTE1OTIsImV4cCI6MjA5NzA2NzU5Mn0.GJpHRoqHURgph1HzmKmJY_UkQue6S3uft2w8FoFHss0"
};
