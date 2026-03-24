const themeModeInputs = document.querySelectorAll('input[name="themeMode"]');
const statusEl = document.getElementById("status");

function getStoredThemeMode(result) {
  if (result.themeMode === "dark" || result.themeMode === "light" || result.themeMode === "system") {
    return result.themeMode;
  }

  if (typeof result.darkModeEnabled === "boolean") {
    return result.darkModeEnabled ? "dark" : "light";
  }

  return "dark";
}

function setSelectedThemeMode(themeMode) {
  themeModeInputs.forEach((input) => {
    input.checked = input.value === themeMode;
  });
}

function setStatus(message) {
  statusEl.textContent = message;
  setTimeout(() => {
    if (statusEl.textContent === message) {
      statusEl.textContent = "";
    }
  }, 1500);
}

chrome.storage.local.get({ themeMode: "dark", darkModeEnabled: true }, (result) => {
  setSelectedThemeMode(getStoredThemeMode(result));
});

themeModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;

    const themeMode = input.value;

    chrome.storage.local.set({ themeMode }, () => {
      setStatus(
        themeMode === "system"
          ? "Following system theme"
          : themeMode === "dark"
            ? "Dark mode enabled"
            : "Light mode enabled"
      );
    });
  });
});
