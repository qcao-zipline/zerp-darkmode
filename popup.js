const enabledCheckbox = document.getElementById("enabled");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
  setTimeout(() => {
    if (statusEl.textContent === message) {
      statusEl.textContent = "";
    }
  }, 1500);
}

chrome.storage.local.get({ darkModeEnabled: true }, (result) => {
  enabledCheckbox.checked = result.darkModeEnabled;
});

enabledCheckbox.addEventListener("change", () => {
  const enabled = enabledCheckbox.checked;

  chrome.storage.local.set({ darkModeEnabled: enabled }, () => {
    setStatus(enabled ? "Dark mode enabled" : "Dark mode disabled");
  });
});