const tg = window.Telegram?.WebApp;

if (tg) {
  tg.expand();
  tg.ready();
}

function safeSet(fn, name) {
  try {
    fn();
  } catch (e) {
    console.error("Ошибка инициализации модуля: " + name, e);
  }
}

function hapticSuccess() {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred("success");
  }
}

function setBackButton(onClickCallback) {
  if (tg?.BackButton) {
    if (onClickCallback) {
      tg.BackButton.onClick(onClickCallback);
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
  }
}
