import { clamp, lerp } from "./utils.js";

export class CardInteractions {
  /**
   * @param {import('./card.js').CardMotionCard} card
   * @param {{maxTilt?: number, autoRotateInterval?: number}} options
   */
  constructor(card, options = {}) {
    this.card = card;
    this.maxTilt = options.maxTilt ?? 15;
    this.autoRotateInterval = options.autoRotateInterval ?? 3200;

    this.flipButton = card.root.querySelector("[data-flip-button]");
    this.autoRotateCheckbox = card.root.querySelector("[data-auto-rotate]");

    this.currentTiltX = 0;
    this.currentTiltY = 0;
    this.isPointerInside = false;

    this.autoRotateTimer = null;
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.onPointerEnter = this.onPointerEnter.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onCardClick = this.onCardClick.bind(this);
    this.onStageKeyDown = this.onStageKeyDown.bind(this);
    this.onFlipButtonClick = this.onFlipButtonClick.bind(this);
    this.onAutoRotateToggle = this.onAutoRotateToggle.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onReducedMotionChange = this.onReducedMotionChange.bind(this);
  }

  init() {
    // Keyboard support for accessibility and touch keyboards.
    this.card.stage.tabIndex = 0;
    this.card.stage.setAttribute("aria-label", "Interactive payment card preview");

    this.card.stage.addEventListener("pointerenter", this.onPointerEnter);
    this.card.stage.addEventListener("pointermove", this.onPointerMove);
    this.card.stage.addEventListener("pointerleave", this.onPointerLeave);
    this.card.stage.addEventListener("pointercancel", this.onPointerLeave);
    this.card.stage.addEventListener("click", this.onCardClick);
    this.card.stage.addEventListener("keydown", this.onStageKeyDown);

    if (this.flipButton) {
      this.flipButton.addEventListener("click", this.onFlipButtonClick);
    }

    if (this.autoRotateCheckbox) {
      this.autoRotateCheckbox.addEventListener("change", this.onAutoRotateToggle);
    }

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.prefersReducedMotion.addEventListener("change", this.onReducedMotionChange);

    this.syncFlipButtonState();
  }

  destroy() {
    this.stopAutoRotate();
    this.card.stage.removeEventListener("pointerenter", this.onPointerEnter);
    this.card.stage.removeEventListener("pointermove", this.onPointerMove);
    this.card.stage.removeEventListener("pointerleave", this.onPointerLeave);
    this.card.stage.removeEventListener("pointercancel", this.onPointerLeave);
    this.card.stage.removeEventListener("click", this.onCardClick);
    this.card.stage.removeEventListener("keydown", this.onStageKeyDown);

    if (this.flipButton) {
      this.flipButton.removeEventListener("click", this.onFlipButtonClick);
    }

    if (this.autoRotateCheckbox) {
      this.autoRotateCheckbox.removeEventListener("change", this.onAutoRotateToggle);
    }

    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.prefersReducedMotion.removeEventListener("change", this.onReducedMotionChange);
  }

  /**
   * @param {PointerEvent} event
   */
  onPointerEnter(event) {
    this.isPointerInside = true;
    this.updateMotionFromPointer(event);
  }

  /**
   * @param {PointerEvent} event
   */
  onPointerMove(event) {
    if (!this.isPointerInside) {
      return;
    }

    this.updateMotionFromPointer(event);
  }

  onPointerLeave() {
    this.isPointerInside = false;
    this.currentTiltX = 0;
    this.currentTiltY = 0;

    this.card.resetTilt();
    this.card.resetParallax();
    this.card.resetShine();
  }

  /**
   * @param {PointerEvent} event
   */
  onCardClick(event) {
    if (event.target instanceof HTMLElement && event.target.closest("[data-flip-button]")) {
      return;
    }

    this.toggleFlip();
  }

  /**
   * @param {KeyboardEvent} event
   */
  onStageKeyDown(event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.toggleFlip();
    }
  }

  onFlipButtonClick(event) {
    event.preventDefault();
    this.toggleFlip();
  }

  onAutoRotateToggle(event) {
    const checkbox = /** @type {HTMLInputElement} */ (event.currentTarget);
    const enabled = checkbox.checked;

    this.card.root.classList.toggle("is-demo", enabled);

    if (enabled) {
      this.startAutoRotate();
      return;
    }

    this.stopAutoRotate();
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.stopAutoRotate();
      return;
    }

    if (this.autoRotateCheckbox?.checked) {
      this.startAutoRotate();
    }
  }

  onReducedMotionChange() {
    if (this.prefersReducedMotion.matches) {
      this.stopAutoRotate();
      this.card.root.classList.remove("is-demo");

      if (this.autoRotateCheckbox) {
        this.autoRotateCheckbox.checked = false;
      }
    }
  }

  toggleFlip() {
    this.card.toggleFlip();
    this.syncFlipButtonState();
  }

  syncFlipButtonState() {
    if (!this.flipButton) {
      return;
    }

    const isFlipped = this.card.getState().flipped;
    this.flipButton.setAttribute("aria-pressed", String(isFlipped));
    this.flipButton.textContent = isFlipped ? "Show Front" : "Flip Card";
  }

  startAutoRotate() {
    if (this.prefersReducedMotion.matches) {
      return;
    }

    this.stopAutoRotate();

    this.autoRotateTimer = window.setInterval(() => {
      if (!document.hidden) {
        this.toggleFlip();
      }
    }, this.autoRotateInterval);
  }

  stopAutoRotate() {
    if (this.autoRotateTimer !== null) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  /**
   * Motion model:
   * 1) Convert cursor coordinates into normalized 0..1 card-local space.
   * 2) Translate local space to signed offsets around center (-1..1).
   * 3) Map offsets into rotation range and lerp for smoothness.
   * @param {PointerEvent} event
   */
  updateMotionFromPointer(event) {
    const rect = this.card.stage.getBoundingClientRect();
    const normalizedX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const normalizedY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    const targetTiltY = (normalizedX - 0.5) * 2 * this.maxTilt;
    const targetTiltX = (0.5 - normalizedY) * 2 * this.maxTilt;

    this.currentTiltX = lerp(this.currentTiltX, targetTiltX, 0.34);
    this.currentTiltY = lerp(this.currentTiltY, targetTiltY, 0.34);

    this.card.setTilt(this.currentTiltX, this.currentTiltY);
    this.card.setParallax(normalizedX, normalizedY);

    const tiltMagnitude = Math.hypot(this.currentTiltX, this.currentTiltY) / (this.maxTilt * Math.SQRT2);
    const shineOpacity = clamp(0.16 + tiltMagnitude * 0.54, 0.16, 0.72);

    this.card.setShine(normalizedX * 100, normalizedY * 100, Number(shineOpacity.toFixed(3)));
  }
}
