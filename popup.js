const themeModeInputs = document.querySelectorAll('input[name="themeMode"]');
const statusEl = document.getElementById("status");
const versionEl = document.getElementById("version");
const updateCardEl = document.getElementById("updateCard");
const updateMessageEl = document.getElementById("updateMessage");
const updateLinkEl = document.getElementById("updateLink");
const currentVersion = chrome.runtime.getManifest().version;
const UPDATE_INFO_URL = "https://raw.githubusercontent.com/qcao-zipline/zerp-darkmode/main/update.json";

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

function parseVersion(version) {
  return String(version)
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  const maxLength = Math.max(a.length, b.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = a[index] || 0;
    const rightPart = b[index] || 0;

    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

function showUpdateCard(message, downloadUrl) {
  updateMessageEl.textContent = message;
  updateLinkEl.href = downloadUrl;
  updateCardEl.classList.remove("hidden");
}

function hideUpdateCard() {
  updateCardEl.classList.add("hidden");
}

async function checkForUpdates() {
  try {
    const response = await fetch(`${UPDATE_INFO_URL}?t=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      hideUpdateCard();
      return;
    }

    const updateInfo = await response.json();

    if (!updateInfo?.version || !updateInfo?.downloadUrl) {
      hideUpdateCard();
      return;
    }

    if (compareVersions(updateInfo.version, currentVersion) > 0) {
      showUpdateCard(
        `Update available: ${updateInfo.version} (you have ${currentVersion}).`,
        updateInfo.downloadUrl
      );
      return;
    }

    hideUpdateCard();
  } catch {
    hideUpdateCard();
  }
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

versionEl.textContent = `Installed version: ${currentVersion}`;
checkForUpdates();

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
