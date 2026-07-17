const getStoredPreferences = (userEmail) => {
  const storageKey = `mymparfums-preferences-${userEmail || "guest"}`;
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return { notifications: true };
  }

  try {
    return { notifications: true, ...JSON.parse(stored) };
  } catch {
    return { notifications: true };
  }
};

export const areNotificationsEnabled = (userEmail) => {
  const preferences = getStoredPreferences(userEmail);
  return preferences.notifications !== false;
};

export const emitNotification = (message, options = {}) => {
  const usuario = getStoredUser();

  if (!areNotificationsEnabled(usuario?.email)) {
    return false;
  }

  const detail = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: options.title || "Mym Parfums",
    message,
    type: options.type || "info",
  };

  window.dispatchEvent(new CustomEvent("app:notification", { detail }));

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(detail.title, { body: detail.message });
  }

  return true;
};
