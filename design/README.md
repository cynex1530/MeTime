# Me Time — Design assets

Everything needed to build **App Store** and **Google Play** artwork, exported
from the app's real theme (`src/theme/tokens.ts`).

| File | What it is | Use it for |
|------|------------|------------|
| `design-kit.html` | Visual style guide + screen mockups (light & dark) | Import to Figma / screenshot for store shots |
| `tokens.json` | Design tokens in **Tokens Studio** format | Import colors & radii as Figma variables |
| `tokens.css` | The same tokens as CSS custom properties | Web mockups / reference |

The Design Kit is also published as a Claude Artifact (a hosted web page) — the
URL is the easiest way to import it into Figma.

## Get it into Figma

**Option A — import the visuals (screens + components)**
1. In Figma, install the free plugin **html.to.design**.
2. Run it → paste the Design Kit Artifact URL (or open `design-kit.html`
   locally and use the plugin's file/HTML import).
3. It rebuilds the swatches, components and phone screens as editable frames.

**Option B — import the color tokens**
1. Install **Tokens Studio for Figma**.
2. Plugin → menu → **Import** → choose `tokens.json`.
3. You get every light/dark color and radius as managed variables.

**Option C — just screenshot**
Every screen in `design-kit.html` is a real HTML render. Screenshot a phone
frame, drop it into a device mockup at the sizes below, add a caption.

## Store screenshot sizes (portrait)

| Store | Asset | Pixels |
|-------|-------|--------|
| App Store | iPhone 6.9″ / 6.7″ | 1290 × 2796 |
| App Store | iPhone 6.5″ | 1242 × 2688 |
| App Store | iPad Pro 12.9″ | 2048 × 2732 |
| App Store | App icon | 1024 × 1024 (no alpha) |
| Google Play | Phone screenshot | 1080 × 1920 |
| Google Play | Feature graphic | 1024 × 500 (landscape) |
| Google Play | App icon | 512 × 512 |

## Tip: real device screenshots

The most authentic store images are screenshots of the running app. In Expo:
run the app in the iOS Simulator / Android Emulator at a supported device size,
capture screens, then frame them (e.g. with [fastlane frameit], Figma, or
[shots/AppMockUp]). The Design Kit is the fallback when you want polished
marketing frames without wiring up a device.
