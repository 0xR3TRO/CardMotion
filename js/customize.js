import { CardMotionCard, THEME_PRESETS } from "./card.js";
import { CardInteractions } from "./interactions.js";
import {
  digitsOnly,
  formatInputCardNumber,
  isBackgroundFill,
  normalizeCVV,
  normalizeExpiry
} from "./utils.js";

/**
 * Format expiry input while typing (MM/YY mask).
 * @param {string} value
 * @returns {string}
 */
function formatExpiryInput(value) {
  const digits = digitsOnly(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

/**
 * Mount CardMotion on an existing root element.
 * @param {HTMLElement} root
 * @param {{controlsRoot?: ParentNode}} [options]
 */
export function mountCardMotionDisplay(root, options = {}) {
  const controlsRoot = options.controlsRoot ?? document;
  const card = new CardMotionCard(root);
  const interactions = new CardInteractions(card, { maxTilt: 15, autoRotateInterval: 3000 });
  interactions.init();

  const nameInput = controlsRoot.querySelector("[data-input-name]");
  const numberInput = controlsRoot.querySelector("[data-input-number]");
  const expiryInput = controlsRoot.querySelector("[data-input-expiry]");
  const cvvInput = controlsRoot.querySelector("[data-input-cvv]");

  const themeSelect = controlsRoot.querySelector("[data-select-theme]");
  const gradientInput = controlsRoot.querySelector("[data-input-gradient]");
  const brandSelect = controlsRoot.querySelector("[data-select-brand]");

  const shineToggle = controlsRoot.querySelector("[data-toggle-shine]");
  const parallaxToggle = controlsRoot.querySelector("[data-toggle-parallax]");

  if (nameInput instanceof HTMLInputElement) {
    const applyName = () => card.setCardholder(nameInput.value);
    nameInput.addEventListener("input", applyName);
    applyName();
  }

  if (numberInput instanceof HTMLInputElement) {
    const applyNumber = () => {
      const digits = digitsOnly(numberInput.value).slice(0, 19);
      numberInput.value = formatInputCardNumber(digits);
      card.setCardNumber(digits);
    };

    numberInput.addEventListener("input", applyNumber);
    applyNumber();
  }

  if (expiryInput instanceof HTMLInputElement) {
    const applyExpiry = (finalize = false) => {
      expiryInput.value = finalize ? normalizeExpiry(expiryInput.value) : formatExpiryInput(expiryInput.value);
      card.setExpiry(expiryInput.value);
    };

    expiryInput.addEventListener("input", () => applyExpiry(false));
    expiryInput.addEventListener("blur", () => applyExpiry(true));
    applyExpiry(true);
  }

  if (cvvInput instanceof HTMLInputElement) {
    const applyCVV = () => {
      cvvInput.value = normalizeCVV(cvvInput.value);
      card.setCVV(cvvInput.value);
    };

    cvvInput.addEventListener("input", applyCVV);
    applyCVV();
  }

  if (themeSelect instanceof HTMLSelectElement && gradientInput instanceof HTMLInputElement) {
    const applyTheme = () => {
      card.setTheme(themeSelect.value);
      const nextGradient = THEME_PRESETS[card.getState().theme]?.gradient ?? card.getState().gradient;
      gradientInput.value = nextGradient;
      card.setGradient(nextGradient);
      gradientInput.classList.remove("is-invalid");
    };

    themeSelect.addEventListener("change", applyTheme);
    applyTheme();
  }

  if (gradientInput instanceof HTMLInputElement) {
    const applyGradient = () => {
      const value = gradientInput.value.trim();
      const valid = isBackgroundFill(value);

      gradientInput.classList.toggle("is-invalid", !valid);

      if (valid) {
        card.setGradient(value);
      }
    };

    gradientInput.addEventListener("input", applyGradient);
    gradientInput.addEventListener("blur", applyGradient);
  }

  if (brandSelect instanceof HTMLSelectElement) {
    const applyBrand = () => card.setBrand(brandSelect.value);
    brandSelect.addEventListener("change", applyBrand);
    applyBrand();
  }

  if (shineToggle instanceof HTMLInputElement) {
    const applyShine = () => card.setShineEnabled(shineToggle.checked);
    shineToggle.addEventListener("change", applyShine);
    applyShine();
  }

  if (parallaxToggle instanceof HTMLInputElement) {
    const applyParallax = () => card.setParallaxEnabled(parallaxToggle.checked);
    parallaxToggle.addEventListener("change", applyParallax);
    applyParallax();
  }

  return {
    card,
    interactions,
    destroy: () => interactions.destroy()
  };
}

const defaultRoot = document.querySelector("#cardMotionDisplay");

if (defaultRoot instanceof HTMLElement) {
  mountCardMotionDisplay(defaultRoot);
}

if (typeof window !== "undefined") {
  window.CardMotionDisplay = Object.freeze({
    mount: mountCardMotionDisplay
  });
}
