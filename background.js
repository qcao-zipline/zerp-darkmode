const UPDATE_INFO_URL = "https://raw.githubusercontent.com/qcao-zipline/zerp-darkmode/main/update.json";
const UPDATE_CHECK_ALARM = "check-for-updates";
const UPDATE_CHECK_PERIOD_MINUTES = 360;
const currentVersion = chrome.runtime.getManifest().version;

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

async function clearUpdateBadge() {
  await chrome.action.setBadgeText({ text: "" });
  await chrome.action.setTitle({ title: "ZERP Dark Mode" });
}

async function setUpdateBadge(remoteVersion) {
  await chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  await chrome.action.setBadgeTextColor({ color: "#ffffff" });
  await chrome.action.setBadgeText({ text: "1" });
  await chrome.action.setTitle({
    title: `ZERP Dark Mode - Update available (${remoteVersion})`,
  });
}

async function checkForUpdates() {
  try {
    const response = await fetch(`${UPDATE_INFO_URL}?t=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const updateInfo = await response.json();

    if (!updateInfo?.version) {
      return;
    }

    if (compareVersions(updateInfo.version, currentVersion) > 0) {
      await setUpdateBadge(updateInfo.version);
      return;
    }

    await clearUpdateBadge();
  } catch {
    // Ignore transient fetch failures so we don't spam the user with false state changes.
  }
}

function ensureUpdateAlarm() {
  chrome.alarms.create(UPDATE_CHECK_ALARM, {
    delayInMinutes: 1,
    periodInMinutes: UPDATE_CHECK_PERIOD_MINUTES,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureUpdateAlarm();
  void checkForUpdates();
});

chrome.runtime.onStartup.addListener(() => {
  ensureUpdateAlarm();
  void checkForUpdates();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === UPDATE_CHECK_ALARM) {
    void checkForUpdates();
  }
});
