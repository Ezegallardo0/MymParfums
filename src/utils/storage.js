export const getStoredUser = () => {
  try {
    const raw = window.localStorage.getItem("usuario");
    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    window.localStorage.setItem("usuario", JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
};

export const getStoredPreferences = (userEmail) => {
  const storageKey = `mymparfums-preferences-${userEmail || "guest"}`;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return { notifications: true };
    }

    return { notifications: true, ...JSON.parse(stored) };
  } catch {
    return { notifications: true };
  }
};
