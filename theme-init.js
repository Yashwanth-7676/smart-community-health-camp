(() => {
  let preference = "dark";
  try {
    const designVersion = "premium-dark-v1";
    if (localStorage.getItem("smartcareThemeDesign") !== designVersion) {
      localStorage.setItem("smartcareTheme", preference);
      localStorage.setItem("smartcareThemeDesign", designVersion);
    } else {
      preference = localStorage.getItem("smartcareTheme") || "dark";
    }
  } catch (error) {
    document.documentElement.dataset.storageFallback = "true";
  }
  const resolved = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
})();
