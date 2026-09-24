(() => {
  let preference = "light";
  try {
    preference = localStorage.getItem("smartcareTheme") || "light";
  } catch (error) {
    document.documentElement.dataset.storageFallback = "true";
  }
  const resolved = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
})();
