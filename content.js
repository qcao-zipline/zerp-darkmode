const STYLE_ID = "zerp-dark-mode-style";
const ROOT_CLASS = "zerp-dark-mode";
const THEME_BACKGROUND = { r: 11, g: 18, b: 32 };
const THEME_SURFACE = { r: 17, g: 24, b: 39 };
const THEME_TEXT = { r: 229, g: 231, b: 235 };
const THEME_BORDER = { r: 75, g: 85, b: 99 };
const AVATAR_SURFACE = { r: 107, g: 114, b: 128 };
const AVATAR_TEXT = { r: 249, g: 250, b: 251 };

const managedElements = new Set();
const originalInlineStyles = new WeakMap();

let observer;
let processScheduled = false;
const pendingRoots = new Set();
let rootListenersAttached = false;
let historyPatched = false;
let pendingRouteRefresh;
let suppressObserver = false;
let routeSettleInterval;

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html.${ROOT_CLASS},
    html.${ROOT_CLASS} body {
      background: #0b1220 !important;
      color: #e5e7eb !important;
    }

    html.${ROOT_CLASS} #root,
    html.${ROOT_CLASS} #app,
    html.${ROOT_CLASS} [data-reactroot] {
      background-color: #0b1220 !important;
    }

    html.${ROOT_CLASS},
    html.${ROOT_CLASS} body,
    html.${ROOT_CLASS} button,
    html.${ROOT_CLASS} select {
      color-scheme: dark;
    }

    html.${ROOT_CLASS} section,
    html.${ROOT_CLASS} article,
    html.${ROOT_CLASS} aside,
    html.${ROOT_CLASS} nav,
    html.${ROOT_CLASS} main,
    html.${ROOT_CLASS} header,
    html.${ROOT_CLASS} footer,
    html.${ROOT_CLASS} dialog,
    html.${ROOT_CLASS} [role="dialog"],
    html.${ROOT_CLASS} [role="tablist"],
    html.${ROOT_CLASS} [role="tabpanel"],
    html.${ROOT_CLASS} [role="tab"],
    html.${ROOT_CLASS} [class*="tab"],
    html.${ROOT_CLASS} [class*="panel"],
    html.${ROOT_CLASS} [class*="attachment"],
    html.${ROOT_CLASS} [class*="Attachment"],
    html.${ROOT_CLASS} [class*="modal"],
    html.${ROOT_CLASS} [class*="drawer"],
    html.${ROOT_CLASS} [class*="popover"],
    html.${ROOT_CLASS} [class*="menu"],
    html.${ROOT_CLASS} [class*="dropdown"] {
      background-color: #111827 !important;
      color: #e5e7eb !important;
      border-color: #374151 !important;
    }

    html.${ROOT_CLASS} .MuiCollapse-wrapperInner,
    html.${ROOT_CLASS} .MuiCollapse-wrapperInner > div,
    html.${ROOT_CLASS} .MuiCollapse-root,
    html.${ROOT_CLASS} .MuiCollapse-root > div,
    html.${ROOT_CLASS} .MuiCardContent-root:has(.heading-block),
    html.${ROOT_CLASS} .MuiPaper-root.MuiCard-root,
    html.${ROOT_CLASS} .MuiCardActions-root,
    html.${ROOT_CLASS} .sc-jbAkgO.gFRgml,
    html.${ROOT_CLASS} .sc-jbAkgO.fGRjA-d,
    html.${ROOT_CLASS} .sc-oxoUO.eGcbyj,
    html.${ROOT_CLASS} .sc-eKpnvn.bfegnO,
    html.${ROOT_CLASS} .sc-dXYVqG.gEeofX,
    html.${ROOT_CLASS} .sc-dCZjNh.dZgnMk,
    html.${ROOT_CLASS} .sc-fxdwpw.lbgdzM,
    html.${ROOT_CLASS} .sc-kjGEIJ.kcBsgZ,
    html.${ROOT_CLASS} .sc-lbpyZL.fiortM,
    html.${ROOT_CLASS} .sc-bFYcde.gyntgu,
    html.${ROOT_CLASS} .sc-bsOfxk.cCScCG,
    html.${ROOT_CLASS} .sc-hXyblB.kQWbGf,
    html.${ROOT_CLASS} div:has(> .zerp-section),
    html.${ROOT_CLASS} div:has(> div > .zerp-section),
    html.${ROOT_CLASS} div:has(> .MuiPaper-root.MuiCard-root),
    html.${ROOT_CLASS} div:has(> .sc-dCZjNh),
    html.${ROOT_CLASS} .zerp-section,
    html.${ROOT_CLASS} .zerp-detail,
    html.${ROOT_CLASS} .zerp-hsegment,
    html.${ROOT_CLASS} div:has(> h2.heading-block),
    html.${ROOT_CLASS} section:has(> h2.heading-block) {
      background-color: #111827 !important;
      color: #e5e7eb !important;
      border-color: #374151 !important;
      background-clip: padding-box !important;
    }

    html.${ROOT_CLASS} .sc-jbAkgO.gFRgml,
    html.${ROOT_CLASS} .sc-jbAkgO.fGRjA-d,
    html.${ROOT_CLASS} .sc-oxoUO.eGcbyj,
    html.${ROOT_CLASS} .sc-dXYVqG.gEeofX,
    html.${ROOT_CLASS} .sc-dCZjNh.dZgnMk,
    html.${ROOT_CLASS} .sc-bFYcde.gyntgu,
    html.${ROOT_CLASS} .sc-bsOfxk.cCScCG,
    html.${ROOT_CLASS} .zerp-section,
    html.${ROOT_CLASS} .zerp-hsegment,
    html.${ROOT_CLASS} .zerp-detail,
    html.${ROOT_CLASS} .sc-dslWvo.fNQwBU,
    html.${ROOT_CLASS} .sc-hORkcV.hamBOV:has(> h2.heading-block),
    html.${ROOT_CLASS} div:has(> h2.heading-block),
    html.${ROOT_CLASS} div:has(> h2.heading-block + a),
    html.${ROOT_CLASS} h3.flex,
    html.${ROOT_CLASS} h3.flex > button,
    html.${ROOT_CLASS} button[data-radix-collection-item],
    html.${ROOT_CLASS} .sc-jbAkgO.fGRjA-d:has(.MuiPaper-root.MuiCard-root),
    html.${ROOT_CLASS} .zerp-section:has(> .MuiPaper-root.MuiCard-root),
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root > .MuiCardContent-root,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .MuiCollapse-root,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .MuiCollapse-wrapper,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .MuiCollapse-wrapperInner,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .MuiCardActions-root,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .sc-hORkcV.haQSCe,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .sc-hORkcV.hamBOV,
    html.${ROOT_CLASS} .zerp-section > .MuiPaper-root.MuiCard-root .sc-hORkcV.gZThnW {
      background: #0b1220 !important;
      background-color: #0b1220 !important;
      box-shadow: none !important;
    }

    html.${ROOT_CLASS} .ql-container,
    html.${ROOT_CLASS} .ql-editor,
    html.${ROOT_CLASS} .ql-toolbar,
    html.${ROOT_CLASS} [data-orientation="vertical"].border-b,
    html.${ROOT_CLASS} [role="region"][data-orientation="vertical"],
    html.${ROOT_CLASS} .MuiDataGrid-overlayWrapperInner,
    html.${ROOT_CLASS} .MuiDataGrid-overlay,
    html.${ROOT_CLASS} .MuiDataGrid-topContainer,
    html.${ROOT_CLASS} .MuiDataGrid-columnHeaders,
    html.${ROOT_CLASS} .MuiDataGrid-row--borderBottom,
    html.${ROOT_CLASS} .MuiDataGrid-columnHeader,
    html.${ROOT_CLASS} .MuiDataGrid-filler,
    html.${ROOT_CLASS} .MuiDataGrid-scrollbarFiller,
    html.${ROOT_CLASS} .MuiDataGrid-columnSeparator,
    html.${ROOT_CLASS} .MuiDataGrid-columnHeaderTitleContainer,
    html.${ROOT_CLASS} .MuiDataGrid-columnHeaderDraggableContainer {
      background-color: #111827 !important;
      color: #e5e7eb !important;
      border-color: #374151 !important;
    }

    html.${ROOT_CLASS} fieldset,
    html.${ROOT_CLASS} legend,
    html.${ROOT_CLASS} .MuiOutlinedInput-notchedOutline {
      background-color: transparent !important;
      color: inherit !important;
    }

    html.${ROOT_CLASS} .MuiOutlinedInput-notchedOutline legend,
    html.${ROOT_CLASS} .MuiOutlinedInput-notchedOutline legend span {
      color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
      max-width: 0 !important;
    }

    html.${ROOT_CLASS} .MuiInputBase-root,
    html.${ROOT_CLASS} .MuiOutlinedInput-root {
      position: relative !important;
    }

    html.${ROOT_CLASS} .MuiInputBase-input,
    html.${ROOT_CLASS} .MuiOutlinedInput-input,
    html.${ROOT_CLASS} .MuiAutocomplete-input,
    html.${ROOT_CLASS} textarea,
    html.${ROOT_CLASS} input {
      color: #e5e7eb !important;
      -webkit-text-fill-color: #e5e7eb !important;
      caret-color: #f9fafb !important;
      position: relative !important;
      z-index: 2 !important;
    }

    html.${ROOT_CLASS} .MuiInputLabel-root,
    html.${ROOT_CLASS} .MuiFormLabel-root {
      color: #94a3b8 !important;
    }

    html.${ROOT_CLASS} .MuiInputLabel-root.Mui-focused,
    html.${ROOT_CLASS} .MuiInputLabel-root.MuiFormLabel-filled,
    html.${ROOT_CLASS} .MuiInputLabel-shrink {
      color: #93c5fd !important;
    }

    html.${ROOT_CLASS} .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline,
    html.${ROOT_CLASS} .MuiOutlinedInput-root fieldset {
      border-color: #64748b !important;
    }

    html.${ROOT_CLASS} .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline,
    html.${ROOT_CLASS} .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline,
    html.${ROOT_CLASS} .MuiOutlinedInput-root:hover fieldset,
    html.${ROOT_CLASS} .MuiOutlinedInput-root.Mui-focused fieldset {
      border-color: #93c5fd !important;
    }

    html.${ROOT_CLASS} .MuiRadio-root,
    html.${ROOT_CLASS} .MuiRadio-root .MuiSvgIcon-root,
    html.${ROOT_CLASS} .MuiCheckbox-root,
    html.${ROOT_CLASS} .MuiCheckbox-root .MuiSvgIcon-root {
      color: #cbd5e1 !important;
      fill: currentColor !important;
    }

    html.${ROOT_CLASS} .MuiRadio-root.Mui-checked,
    html.${ROOT_CLASS} .MuiRadio-root.Mui-checked .MuiSvgIcon-root,
    html.${ROOT_CLASS} .MuiCheckbox-root.Mui-checked,
    html.${ROOT_CLASS} .MuiCheckbox-root.Mui-checked .MuiSvgIcon-root {
      color: #93c5fd !important;
      fill: currentColor !important;
    }

    html.${ROOT_CLASS} .MuiToggleButtonGroup-root,
    html.${ROOT_CLASS} .MuiToggleButtonGroup-grouped,
    html.${ROOT_CLASS} .MuiToggleButton-root,
    html.${ROOT_CLASS} .zerp-hsegment:has(.MuiToggleButtonGroup-root) {
      background-color: #0b1220 !important;
      border-color: #374151 !important;
    }

    html.${ROOT_CLASS} .MuiToggleButton-root {
      color: #e5e7eb !important;
    }

    html.${ROOT_CLASS} .MuiToggleButton-root.Mui-selected {
      background-color: #1f2937 !important;
      color: #93c5fd !important;
    }

    html.${ROOT_CLASS} .zerp-hsegment:has(.MuiAutocomplete-root),
    html.${ROOT_CLASS} .zerp-hsegment:has(.MuiFormControl-root),
    html.${ROOT_CLASS} .zerp-hsegment:has(.MuiFormControlLabel-root),
    html.${ROOT_CLASS} .zerp-hsegment:has(.MuiCheckbox-root),
    html.${ROOT_CLASS} form:has(.MuiAutocomplete-root) {
      background-color: #0b1220 !important;
    }

    html.${ROOT_CLASS} h1,
    html.${ROOT_CLASS} h2,
    html.${ROOT_CLASS} h3,
    html.${ROOT_CLASS} h4,
    html.${ROOT_CLASS} h5,
    html.${ROOT_CLASS} h6,
    html.${ROOT_CLASS} td,
    html.${ROOT_CLASS} th {
      color: #e5e7eb !important;
    }

    html.${ROOT_CLASS} .heading-block {
      color: #e5e7eb !important;
    }

    html.${ROOT_CLASS} a {
      color: #93c5fd !important;
    }

    html.${ROOT_CLASS} button {
      background-color: #1f2937 !important;
      color: #e5e7eb !important;
      -webkit-text-fill-color: #e5e7eb !important;
      caret-color: #f9fafb !important;
      border: 1px solid #4b5563 !important;
      box-shadow: none !important;
    }

    html.${ROOT_CLASS} button:hover,
    html.${ROOT_CLASS} button:focus-visible {
      background-color: #273449 !important;
    }

    html.${ROOT_CLASS} button.sc-beKSRx.clTBIk {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      color: #60a5fa !important;
      -webkit-text-fill-color: #60a5fa !important;
      padding: 0 !important;
      min-height: 0 !important;
      height: auto !important;
    }

    html.${ROOT_CLASS} button.sc-beKSRx.clTBIk:hover,
    html.${ROOT_CLASS} button.sc-beKSRx.clTBIk:focus-visible {
      background: transparent !important;
      color: #93c5fd !important;
      -webkit-text-fill-color: #93c5fd !important;
    }

    html.${ROOT_CLASS} button:has(> span:only-child),
    html.${ROOT_CLASS} button:has(> div:only-child) {
      background: transparent !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }

    html.${ROOT_CLASS} button span,
    html.${ROOT_CLASS} button div {
      color: inherit;
    }

    html.${ROOT_CLASS} .MuiChip-root {
      color: #e5e7eb !important;
      -webkit-text-fill-color: #e5e7eb !important;
      border-radius: 9999px !important;
      border: 1px solid transparent !important;
      box-shadow: none !important;
    }

    html.${ROOT_CLASS} .MuiChip-filled,
    html.${ROOT_CLASS} .MuiChip-filledDefault {
      background-color: #334155 !important;
      border-color: #475569 !important;
    }

    html.${ROOT_CLASS} .MuiChip-outlined,
    html.${ROOT_CLASS} .MuiChip-outlinedDefault {
      background-color: rgba(51, 65, 85, 0.28) !important;
      border-color: #64748b !important;
    }

    html.${ROOT_CLASS} .MuiChip-clickable:hover,
    html.${ROOT_CLASS} .MuiChip-clickable:focus-visible,
    html.${ROOT_CLASS} .MuiChip-deletable:hover,
    html.${ROOT_CLASS} .MuiChip-deletable:focus-visible {
      background-color: #3f4d63 !important;
    }

    html.${ROOT_CLASS} .MuiChip-label,
    html.${ROOT_CLASS} .MuiChip-avatar,
    html.${ROOT_CLASS} .MuiChip-icon,
    html.${ROOT_CLASS} .MuiChip-deleteIcon {
      color: inherit !important;
      -webkit-text-fill-color: currentColor !important;
      fill: currentColor !important;
    }

    html.${ROOT_CLASS} table {
      background: #111827 !important;
      color: #e5e7eb !important;
      border-color: #374151 !important;
    }

    html.${ROOT_CLASS} thead,
    html.${ROOT_CLASS} tbody,
    html.${ROOT_CLASS} tr,
    html.${ROOT_CLASS} td,
    html.${ROOT_CLASS} th {
      background-color: transparent !important;
      border-color: #374151 !important;
    }

    html.${ROOT_CLASS} svg,
    html.${ROOT_CLASS} svg * {
      fill-opacity: 1;
    }

    html.${ROOT_CLASS} img,
    html.${ROOT_CLASS} video,
    html.${ROOT_CLASS} canvas {
      background-color: transparent !important;
    }

    html.${ROOT_CLASS} ::selection {
      background: rgba(96, 165, 250, 0.35);
      color: #f9fafb;
    }
  `;

  document.documentElement.appendChild(style);
}

function parseColor(value) {
  if (!value || value === "transparent" || value === "inherit" || value === "currentColor") {
    return null;
  }

  const match = value.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/
  );

  if (!match) return null;

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function mixColor(source, target, amount) {
  return {
    r: Math.round(source.r * (1 - amount) + target.r * amount),
    g: Math.round(source.g * (1 - amount) + target.g * amount),
    b: Math.round(source.b * (1 - amount) + target.b * amount),
    a: source.a,
  };
}

function getBrightness(color) {
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
}

function rgbToHsl(color) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }

    h *= 60;

    if (h < 0) {
      h += 360;
    }
  }

  return { h, s, l };
}

function hslToRgb(hsl) {
  const { h, s, l } = hsl;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hueSection = h / 60;
  const x = chroma * (1 - Math.abs((hueSection % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hueSection >= 0 && hueSection < 1) {
    r1 = chroma;
    g1 = x;
  } else if (hueSection < 2) {
    r1 = x;
    g1 = chroma;
  } else if (hueSection < 3) {
    g1 = chroma;
    b1 = x;
  } else if (hueSection < 4) {
    g1 = x;
    b1 = chroma;
  } else if (hueSection < 5) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  const match = l - chroma / 2;

  return {
    r: Math.round((r1 + match) * 255),
    g: Math.round((g1 + match) * 255),
    b: Math.round((b1 + match) * 255),
    a: 1,
  };
}

function getChannelSpread(color) {
  return Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
}

function isNeutralColor(color) {
  return getChannelSpread(color) <= 18;
}

function toCssColor(color) {
  const alpha = color.a === undefined ? 1 : color.a;

  if (alpha >= 0.999) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function rememberInlineStyle(element, property) {
  let stored = originalInlineStyles.get(element);

  if (!stored) {
    stored = {};
    originalInlineStyles.set(element, stored);
  }

  if (stored[property]) return;

  stored[property] = {
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  };
}

function setManagedStyle(element, property, value) {
  rememberInlineStyle(element, property);
  suppressObserver = true;
  element.style.setProperty(property, value, "important");
  suppressObserver = false;
  managedElements.add(element);
}

function restoreManagedStyles() {
  for (const element of managedElements) {
    const stored = originalInlineStyles.get(element);

    if (!stored) continue;

    for (const [property, original] of Object.entries(stored)) {
      if (original.value) {
        element.style.setProperty(property, original.value, original.priority);
      } else {
        element.style.removeProperty(property);
      }
    }
  }

  managedElements.clear();
}

function isMediaElement(element) {
  return (
    element instanceof HTMLImageElement ||
    element instanceof HTMLVideoElement ||
    element instanceof HTMLCanvasElement ||
    element instanceof SVGElement
  );
}

function isTextEntryElement(element) {
  if (element instanceof HTMLTextAreaElement) return true;

  if (element instanceof HTMLInputElement) {
    const type = (element.getAttribute("type") || "text").toLowerCase();

    return !["checkbox", "radio", "range", "color", "file", "image", "submit", "reset"].includes(type);
  }

  if (element.isContentEditable) return true;
  if (element.getAttribute("role") === "textbox") return true;

  const className = typeof element.className === "string" ? element.className : "";

  return className.includes("MuiInputBase-input") || className.includes("ProseMirror") || className.includes("editor");
}

function isTextEntryWrapper(element) {
  if (!(element instanceof HTMLElement)) return false;

  const className = typeof element.className === "string" ? element.className : "";

  if (
    className.includes("MuiInputBase-root") ||
    className.includes("MuiFormControl-root") ||
    className.includes("MuiOutlinedInput-root") ||
    className.includes("MuiInputLabel-root") ||
    className.includes("MuiFormLabel-root") ||
    className.includes("MuiAutocomplete")
  ) {
    return true;
  }

  return Boolean(
    element.querySelector("input, textarea, select, [contenteditable='true'], [role='textbox']")
  );
}

function shouldAdjustBackground(styles, backgroundColor) {
  if (!backgroundColor || backgroundColor.a < 0.85) return false;
  if (styles.backgroundImage && styles.backgroundImage !== "none") return false;

  return getBrightness(backgroundColor) > 214 && isNeutralColor(backgroundColor);
}

function shouldToneColoredBackground(styles, backgroundColor) {
  if (!backgroundColor || backgroundColor.a < 0.85) return false;
  if (styles.backgroundImage && styles.backgroundImage !== "none") return false;
  if (isNeutralColor(backgroundColor)) return false;

  return getBrightness(backgroundColor) > 150;
}

function getDarkPaletteColor(backgroundColor) {
  const hsl = rgbToHsl(backgroundColor);
  const hue = hsl.h;

  let saturation = 0.42;
  let lightness = 0.24;

  if (hue >= 70 && hue < 165) {
    saturation = 0.4;
    lightness = 0.21;
  } else if (hue >= 165 && hue < 255) {
    saturation = 0.44;
    lightness = 0.22;
  } else if (hue >= 255 && hue < 330) {
    saturation = 0.38;
    lightness = 0.24;
  } else if (hue >= 25 && hue < 70) {
    saturation = 0.48;
    lightness = 0.23;
  } else {
    saturation = 0.5;
    lightness = 0.24;
  }

  return hslToRgb({
    h: hue,
    s: Math.max(saturation, Math.min(hsl.s, 0.7)),
    l: lightness,
  });
}

function shouldPreserveAccentText(textColor) {
  if (!textColor || textColor.a < 0.85) return false;
  if (isNeutralColor(textColor)) return false;

  const hsl = rgbToHsl(textColor);

  return hsl.s >= 0.28 && hsl.l >= 0.28 && hsl.l <= 0.72;
}

function shouldAdjustText(textColor, backgroundColor) {
  if (!textColor || textColor.a < 0.85) return false;
  if (getBrightness(textColor) >= 145) return false;
  if (shouldPreserveAccentText(textColor)) return false;
  if (
    backgroundColor &&
    backgroundColor.a >= 0.85 &&
    getBrightness(backgroundColor) > 150 &&
    !isNeutralColor(backgroundColor)
  ) {
    return false;
  }

  return !backgroundColor || backgroundColor.a < 0.2 || getBrightness(backgroundColor) > 120;
}

function isAvatarBadge(element, styles, backgroundColor) {
  if (!backgroundColor || backgroundColor.a < 0.85) return false;
  if (styles.backgroundImage && styles.backgroundImage !== "none") return false;
  if (styles.borderRadius === "0px") return false;

  const width = element.offsetWidth;
  const height = element.offsetHeight;

  if (!width || !height) return false;
  if (Math.abs(width - height) > 6) return false;
  if (width < 28 || width > 72) return false;

  const text = element.textContent ? element.textContent.trim() : "";

  if (!text || text.length > 3) return false;

  return isNeutralColor(backgroundColor);
}

function processElement(element) {
  if (!(element instanceof HTMLElement) || isMediaElement(element)) return;
  if (isTextEntryElement(element) || isTextEntryWrapper(element)) return;
  const styles = window.getComputedStyle(element);
  const backgroundColor = parseColor(styles.backgroundColor);
  const textColor = parseColor(styles.color);
  const borderColor = parseColor(styles.borderColor);

  if (isAvatarBadge(element, styles, backgroundColor)) {
    setManagedStyle(element, "background-color", toCssColor(AVATAR_SURFACE));
    setManagedStyle(element, "color", toCssColor(AVATAR_TEXT));
    setManagedStyle(element, "border-color", toCssColor(mixColor(AVATAR_SURFACE, THEME_BORDER, 0.5)));
    setManagedStyle(element, "caret-color", toCssColor(AVATAR_TEXT));
  } else if (shouldToneColoredBackground(styles, backgroundColor)) {
    setManagedStyle(element, "background-color", toCssColor(getDarkPaletteColor(backgroundColor)));
  } else if (shouldAdjustBackground(styles, backgroundColor)) {
    setManagedStyle(element, "background-color", toCssColor(mixColor(backgroundColor, THEME_SURFACE, 0.88)));
  }

  if (shouldAdjustText(textColor, backgroundColor)) {
    setManagedStyle(element, "color", toCssColor(mixColor(textColor, THEME_TEXT, 0.9)));
    setManagedStyle(element, "caret-color", toCssColor(THEME_TEXT));
  }

  if (
    borderColor &&
    borderColor.a >= 0.85 &&
    getBrightness(borderColor) > 190 &&
    styles.borderStyle !== "none" &&
    styles.borderWidth !== "0px"
  ) {
    setManagedStyle(element, "border-color", toCssColor(mixColor(borderColor, THEME_BORDER, 0.82)));
  }

}

function enforceRootTheme() {
  setManagedStyle(document.documentElement, "background-color", toCssColor(THEME_BACKGROUND));
  setManagedStyle(document.body, "background-color", toCssColor(THEME_BACKGROUND));
  setManagedStyle(document.documentElement, "color", toCssColor(THEME_TEXT));
  setManagedStyle(document.body, "color", toCssColor(THEME_TEXT));
}

function handleRootRefresh() {
  if (!document.documentElement.classList.contains(ROOT_CLASS)) return;

  enforceRootTheme();
}

function refreshAfterRouteChange() {
  if (!document.documentElement.classList.contains(ROOT_CLASS)) return;

  handleRootRefresh();
  scheduleProcessing(document.documentElement);

  window.clearTimeout(pendingRouteRefresh);
  pendingRouteRefresh = window.setTimeout(() => {
    handleRootRefresh();
    scheduleProcessing(document.documentElement);
  }, 120);

  window.setTimeout(() => {
    handleRootRefresh();
    scheduleProcessing(document.documentElement);
  }, 320);

  if (routeSettleInterval) {
    window.clearInterval(routeSettleInterval);
  }

  let settleRuns = 0;
  routeSettleInterval = window.setInterval(() => {
    handleRootRefresh();
    scheduleProcessing(document.documentElement);
    settleRuns += 1;

    if (settleRuns >= 8) {
      window.clearInterval(routeSettleInterval);
      routeSettleInterval = undefined;
    }
  }, 180);
}

function patchHistoryMethods() {
  if (historyPatched) return;

  const wrapHistoryMethod = (methodName) => {
    const original = window.history[methodName];

    window.history[methodName] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      refreshAfterRouteChange();
      return result;
    };
  };

  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");
  historyPatched = true;
}

function attachRootListeners() {
  if (rootListenersAttached) return;

  window.addEventListener("focus", handleRootRefresh);
  window.addEventListener("pageshow", handleRootRefresh);
  document.addEventListener("visibilitychange", handleRootRefresh);
  window.addEventListener("popstate", refreshAfterRouteChange);
  window.addEventListener("hashchange", refreshAfterRouteChange);
  patchHistoryMethods();
  rootListenersAttached = true;
}

function detachRootListeners() {
  if (!rootListenersAttached) return;

  window.removeEventListener("focus", handleRootRefresh);
  window.removeEventListener("pageshow", handleRootRefresh);
  document.removeEventListener("visibilitychange", handleRootRefresh);
  window.removeEventListener("popstate", refreshAfterRouteChange);
  window.removeEventListener("hashchange", refreshAfterRouteChange);
  if (pendingRouteRefresh) {
    window.clearTimeout(pendingRouteRefresh);
    pendingRouteRefresh = undefined;
  }
  if (routeSettleInterval) {
    window.clearInterval(routeSettleInterval);
    routeSettleInterval = undefined;
  }
  rootListenersAttached = false;
}

function processTree(root) {
  if (!root) return;

  if (root instanceof Element) {
    processElement(root);
  }

  if (!(root instanceof Node)) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    processElement(currentNode);
    currentNode = walker.nextNode();
  }
}

function flushProcessing() {
  processScheduled = false;

  for (const root of pendingRoots) {
    processTree(root);
  }

  pendingRoots.clear();
}

function scheduleProcessing(root) {
  if (!root) return;

  pendingRoots.add(root);

  if (processScheduled) return;

  processScheduled = true;
  requestAnimationFrame(flushProcessing);
}

function startObserving() {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    if (suppressObserver) return;

    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        scheduleProcessing(mutation.target);
        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          scheduleProcessing(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });
}

function stopObserving() {
  if (!observer) return;

  observer.disconnect();
  observer = undefined;
}

function enableDarkMode() {
  injectStyle();
  document.documentElement.classList.add(ROOT_CLASS);
  enforceRootTheme();
  scheduleProcessing(document.documentElement);
  startObserving();
  attachRootListeners();
}

function disableDarkMode() {
  stopObserving();
  detachRootListeners();
  restoreManagedStyles();
  document.documentElement.classList.remove(ROOT_CLASS);
}

function syncState() {
  chrome.storage.local.get({ darkModeEnabled: true }, (result) => {
    if (result.darkModeEnabled) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  });
}

syncState();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.darkModeEnabled) {
    if (changes.darkModeEnabled.newValue) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }
});
