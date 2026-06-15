// =========================================================
// КОНФИГ: 4 темы + реальный Supabase
// Переключение через URL: ?theme=dental | beauty | legal | auto
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
      { id: "s1", name: "Чистка зубов", duration: 40,  price: 150000, icon: "ti-tooth" },
      { id: "s2", name: "Консультация", duration: 20,  price: 0,      icon: "ti-stethoscope" },
      { id: "s3", name: "Отбеливание",  duration: 60,  price: 450000, icon: "ti-sparkles" }
    ],
    staff: [
      { id: "d1", name: "Др. Рустамов", initials: "ДР" },
      { id: "d2", name: "Др. Каримова", initials: "ДК" }
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
      { id: "s1", name: "Маникюр",     duration: 60,  price: 80000,  icon: "ti-hand-stop" },
      { id: "s2", name: "Стрижка",     duration: 45,  price: 60000,  icon: "ti-scissors" },
      { id: "s3", name: "Окрашивание", duration: 120, price: 250000, icon: "ti-color-swatch" }
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
      { id: "s1", name: "Консультация",         duration: 30, price: 100000, icon: "ti-message-2" },
      { id: "s2", name: "Составление договора", duration: 60, price: 300000, icon: "ti-file-text" },
      { id: "s3", name: "Представление в суде", duration: 90, price: 500000, icon: "ti-gavel" }
    ],
    staff: [
      { id: "l1", name: "А. Каримов",  initials: "АК" },
      { id: "l2", name: "М. Юлдашева", initials: "МЮ" }
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
      { id: "s1", name: "Диагностика",  duration: 30, price: 50000,  icon: "ti-stethoscope" },
      { id: "s2", name: "Замена масла", duration: 40, price: 80000,  icon: "ti-oil" },
      { id: "s3", name: "Шиномонтаж",   duration: 45, price: 120000, icon: "ti-circle" }
    ],
    staff: [
      { id: "a1", name: "Мастер Бахтиёр", initials: "БХ" },
      { id: "a2", name: "Мастер Жасур",   initials: "ЖС" }
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
