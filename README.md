# ZERP Dark Mode

A lightweight Chrome extension that applies a dark theme to `zerp.flyzipline.com`.

## Install For A New User

### Option 1: Download As ZIP

1. Download the latest ZIP:
   `https://github.com/qcao-zipline/zerp-darkmode/archive/refs/heads/main.zip`
2. Unzip the download to a folder on your computer.
3. Open Chrome and go to `chrome://extensions`.
4. Turn on `Developer mode` in the top-right corner.
5. Click `Load unpacked`.
6. Select the unzipped `zerp-darkmode-main` folder.

## Update The Extension

1. Download the latest ZIP again:
   `https://github.com/qcao-zipline/zerp-darkmode/archive/refs/heads/main.zip`
2. Replace your old unpacked folder with the new unzipped folder.
3. Go to `chrome://extensions`.
4. Find `ZERP Dark Mode`.
5. Click the refresh icon on the extension card.

## Local Project Files

- `manifest.json`: Chrome extension manifest
- `content.js`: dark mode styling and page behavior
- `popup.html`: extension popup markup
- `popup.css`: popup styles
- `popup.js`: popup toggle logic

## Notes

- This extension is designed for `https://zerp.flyzipline.com/*`
- Because it is loaded as an unpacked extension, users need to keep the extracted folder on their machine
