# CardMotion Display

CardMotion Display is a production-ready, client-side credit card preview component built with **pure HTML, CSS, and JavaScript**.
It renders an interactive payment card inside a browser-window mockup with realistic 3D motion and a live customization panel.

## Highlights

- Front/back credit card with smooth 3D flip (click card or button).
- Cursor-driven tilt/parallax with configurable max rotation (`15deg` by default).
- Dynamic shine/reflection layer following pointer position.
- Editable fields:
  - Cardholder name
  - Card number (masked on card preview)
  - Expiration date
  - CVV (visible on card back)
  - Brand logo (Visa, MasterCard, Custom SVG)
- Browser frame mockup:
  - macOS-style 3 top dots
  - URL bar placeholder
  - soft shadow + rounded shell
- Optional demo auto-rotate mode.
- Touch-friendly interactions and responsive scaling.
- No frameworks, no external runtime dependencies.

## Tech Stack

- HTML5 semantic structure
- Modern CSS (variables, gradients, 3D transforms, media queries)
- ES modules (vanilla JavaScript)

## Project Structure

```text
.
├── index.html
├── style.css
├── js
│   ├── card.js
│   ├── interactions.js
│   ├── customize.js
│   └── utils.js
├── assets
│   └── logos
│       ├── visa.svg
│       ├── mastercard.svg
│       └── custom.svg
├── LICENSE
└── README.md
```

## Quick Start

1. Clone/download the repository.
2. Open `index.html` directly in a browser.
3. (Optional) Serve with any static server for local dev comfort.

Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Component Architecture

### `js/utils.js`
Shared helpers:

- numeric sanitization
- card formatting (input + masked preview)
- expiration/CVV normalization
- clamp/lerp helpers for animation math
- gradient syntax validation

### `js/card.js`
Rendering/state layer:

- owns card state (`name`, `number`, `expiry`, `cvv`, `brand`, `theme`)
- updates DOM for front/back fields
- applies CSS variables for theme/gradient
- applies flip state + aria visibility
- exposes methods to set tilt, shine, and parallax transforms

### `js/interactions.js`
Interaction/animation controller:

- pointer-based tilt calculation
- cursor-follow shine hotspot
- parallax depth transforms per card layer
- click/keyboard flip actions
- optional auto-rotate demo loop
- reduced-motion handling

### `js/customize.js`
Composition + control bindings:

- mounts the component
- wires all panel fields/toggles to live updates
- exports `mountCardMotionDisplay(root, options)` for embedding
- exposes `window.CardMotionDisplay.mount(...)`

## Animation Model

### Tilt

Cursor position is normalized to card-local coordinates (`0..1`) and mapped to signed center offsets (`-1..1`).
Those offsets are translated to rotation values in the range `[-maxTilt, +maxTilt]` and smoothed with linear interpolation.

### Shine

Shine is a radial gradient overlay. Its center follows normalized cursor coordinates, and opacity increases with tilt magnitude.

### Parallax

Each marked layer (`.card-layer`) uses `data-depth` and receives a depth-scaled `translate3d(...)` transform.
This gives independent movement of number/chip/logo/background while preserving card perspective.

### Flip

Front/back sides are stacked in 3D (`backface-visibility: hidden`) and switched with `rotateY(180deg)`.

## Customization Panel Controls

| Control | Effect |
|---|---|
| Cardholder name | Updates front-side cardholder text |
| Card number | Formats input groups and renders masked number on card |
| Expiration | Normalized to `MM/YY` |
| CVV | Numeric-only, shown on back |
| Theme | Applies preset gradients and text tones |
| Background fill | Custom CSS `gradient(...)` or `url(...)` |
| Brand | Switches SVG logo |
| Shine effect | Enables/disables reflection layer |
| Parallax tilt | Enables/disables tilt and layer depth motion |

## Embedding In Another Page

If you import modules manually, you can mount the component in your own layout:

```html
<script type="module">
  import { mountCardMotionDisplay } from "./js/customize.js";

  const root = document.querySelector("#cardMotionDisplay");
  mountCardMotionDisplay(root, {
    controlsRoot: document
  });
</script>
```

For non-module integration in this demo setup, a global helper is also exposed:

```js
window.CardMotionDisplay.mount(rootElement);
```

## Accessibility

- Keyboard flip support (`Enter` / `Space`) on the card stage.
- `aria-hidden` synchronized between front/back card faces.
- Focus-visible styles for controls/buttons.
- Reduced motion preference respected (`prefers-reduced-motion`).

## Security Note

This project is a visual demo. Do not store real PAN/CVV in logs, local storage, analytics, or telemetry.
Use tokenization and PCI-compliant infrastructure in production payments.

## Browser Support

Designed for modern evergreen browsers with support for:

- CSS variables
- ES modules
- `pointer` events
- `backdrop-filter` (graceful visual degradation if unavailable)

## Removed Legacy Texture

Legacy texture/assets from the old tutorial scaffold were removed and replaced by layered gradients + procedural highlights.

## License

MIT License. See [LICENSE](LICENSE).
