import {
  digitsOnly,
  formatMaskedCardNumber,
  normalizeCardholder,
  normalizeCVV,
  normalizeExpiry
} from "./utils.js";

export const THEME_PRESETS = {
  aurora: {
    gradient: "linear-gradient(140deg, #0b1220 0%, #14395f 55%, #2a7db8 100%)",
    text: "#f6fbff",
    muted: "rgba(232, 245, 255, 0.72)"
  },
  ember: {
    gradient: "linear-gradient(135deg, #1f0b0b 0%, #71321a 45%, #de7b37 100%)",
    text: "#fff9f1",
    muted: "rgba(255, 228, 202, 0.76)"
  },
  ocean: {
    gradient: "linear-gradient(135deg, #071d2e 0%, #005a7a 50%, #3cc6b2 100%)",
    text: "#effdff",
    muted: "rgba(216, 249, 255, 0.74)"
  },
  mono: {
    gradient: "linear-gradient(132deg, #111111 0%, #3f3f3f 55%, #6e6e6e 100%)",
    text: "#f5f5f5",
    muted: "rgba(236, 236, 236, 0.74)"
  }
};

export const BRAND_LOGOS = {
  visa: {
    src: "assets/logos/visa.svg",
    alt: "Visa"
  },
  mastercard: {
    src: "assets/logos/mastercard.svg",
    alt: "Mastercard"
  },
  custom: {
    src: "assets/logos/custom.svg",
    alt: "Custom"
  }
};

export class CardMotionCard {
  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector("[data-card-stage]");
    this.card = root.querySelector("[data-credit-card]");

    this.frontFace = root.querySelector(".card-front");
    this.backFace = root.querySelector(".card-back");

    this.cardholderElement = root.querySelector("[data-cardholder]");
    this.cardNumberElement = root.querySelector("[data-card-number]");
    this.expiryElement = root.querySelector("[data-expiry]");
    this.cvvElement = root.querySelector("[data-cvv]");
    this.brandLogoElement = root.querySelector("[data-brand-logo]");

    this.parallaxLayers = Array.from(root.querySelectorAll(".card-layer"));

    this.state = {
      cardholder: "Alex Morgan",
      cardNumber: "5123456789011234",
      expiry: "09/31",
      cvv: "123",
      theme: "aurora",
      gradient: THEME_PRESETS.aurora.gradient,
      brand: "visa",
      shineEnabled: true,
      parallaxEnabled: true,
      flipped: false
    };

    this.setTheme(this.state.theme);
    this.setBrand(this.state.brand);
    this.setCardholder(this.state.cardholder);
    this.setCardNumber(this.state.cardNumber);
    this.setExpiry(this.state.expiry);
    this.setCVV(this.state.cvv);
    this.setShineEnabled(this.state.shineEnabled);
    this.setParallaxEnabled(this.state.parallaxEnabled);
    this.setFlipped(this.state.flipped);
    this.resetTilt();
    this.resetParallax();
  }

  /**
   * @param {string} value
   */
  setCardholder(value) {
    const normalized = normalizeCardholder(value);
    this.state.cardholder = normalized;
    this.cardholderElement.textContent = normalized;
  }

  /**
   * @param {string} value
   */
  setCardNumber(value) {
    const digits = digitsOnly(value).slice(0, 19);
    this.state.cardNumber = digits;
    this.cardNumberElement.textContent = formatMaskedCardNumber(digits);
  }

  /**
   * @param {string} value
   */
  setExpiry(value) {
    const normalized = normalizeExpiry(value);
    this.state.expiry = normalized;
    this.expiryElement.textContent = normalized;
  }

  /**
   * @param {string} value
   */
  setCVV(value) {
    const normalized = normalizeCVV(value);
    this.state.cvv = normalized;
    this.cvvElement.textContent = normalized;
  }

  /**
   * @param {string} brand
   */
  setBrand(brand) {
    const resolved = BRAND_LOGOS[brand] ? brand : "custom";
    const logo = BRAND_LOGOS[resolved];

    this.state.brand = resolved;
    this.brandLogoElement.src = logo.src;
    this.brandLogoElement.alt = `${logo.alt} logo`;
  }

  /**
   * @param {string} themeName
   */
  setTheme(themeName) {
    const preset = THEME_PRESETS[themeName] ?? THEME_PRESETS.aurora;
    this.state.theme = themeName in THEME_PRESETS ? themeName : "aurora";
    this.state.gradient = preset.gradient;

    this.root.style.setProperty("--card-gradient", preset.gradient);
    this.root.style.setProperty("--card-text", preset.text);
    this.root.style.setProperty("--card-muted", preset.muted);
  }

  /**
   * @param {string} gradient
   */
  setGradient(gradient) {
    this.state.gradient = gradient;
    this.root.style.setProperty("--card-gradient", gradient);
  }

  /**
   * @param {boolean} enabled
   */
  setShineEnabled(enabled) {
    this.state.shineEnabled = Boolean(enabled);
    this.root.dataset.shineEnabled = String(this.state.shineEnabled);

    if (!this.state.shineEnabled) {
      this.root.style.setProperty("--shine-opacity", "0");
    }
  }

  /**
   * @param {boolean} enabled
   */
  setParallaxEnabled(enabled) {
    this.state.parallaxEnabled = Boolean(enabled);
    this.root.dataset.parallaxEnabled = String(this.state.parallaxEnabled);

    if (!this.state.parallaxEnabled) {
      this.resetParallax();
      this.resetTilt();
    }
  }

  /**
   * @param {boolean} flipped
   */
  setFlipped(flipped) {
    this.state.flipped = Boolean(flipped);
    this.root.dataset.flipped = String(this.state.flipped);
    this.frontFace.setAttribute("aria-hidden", String(this.state.flipped));
    this.backFace.setAttribute("aria-hidden", String(!this.state.flipped));
  }

  toggleFlip() {
    this.setFlipped(!this.state.flipped);
  }

  /**
   * Update tilt variables on the perspective wrapper.
   * rotateX responds to vertical cursor offset, rotateY to horizontal offset.
   * @param {number} rotateX
   * @param {number} rotateY
   */
  setTilt(rotateX, rotateY) {
    if (!this.state.parallaxEnabled) {
      return;
    }

    this.stage.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    this.stage.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
  }

  resetTilt() {
    this.stage.style.setProperty("--tilt-x", "0deg");
    this.stage.style.setProperty("--tilt-y", "0deg");
  }

  /**
   * Move highlight hotspot in percentage coordinates.
   * @param {number} xPercent
   * @param {number} yPercent
   * @param {number} opacity
   */
  setShine(xPercent, yPercent, opacity) {
    if (!this.state.shineEnabled) {
      this.root.style.setProperty("--shine-opacity", "0");
      return;
    }

    this.root.style.setProperty("--shine-x", `${xPercent.toFixed(2)}%`);
    this.root.style.setProperty("--shine-y", `${yPercent.toFixed(2)}%`);
    this.root.style.setProperty("--shine-opacity", String(opacity));
  }

  resetShine() {
    this.root.style.setProperty("--shine-opacity", "0");
  }

  /**
   * Parallax math: each layer moves by cursor offset * depth.
   * Depth is stored in data-depth and converted to px offsets.
   * @param {number} normalizedX 0..1
   * @param {number} normalizedY 0..1
   */
  setParallax(normalizedX, normalizedY) {
    if (!this.state.parallaxEnabled) {
      return;
    }

    const offsetX = (normalizedX - 0.5) * 2;
    const offsetY = (normalizedY - 0.5) * 2;

    this.parallaxLayers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || "0.1");
      const x = -offsetX * depth * 14;
      const y = -offsetY * depth * 14;
      const z = depth * 34;

      layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`;
    });
  }

  resetParallax() {
    this.parallaxLayers.forEach((layer) => {
      layer.style.transform = "translate3d(0px, 0px, 0px)";
    });
  }

  getState() {
    return { ...this.state };
  }
}
