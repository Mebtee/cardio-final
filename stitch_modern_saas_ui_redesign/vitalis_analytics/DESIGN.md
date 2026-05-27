---
name: Vitalis Analytics
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005474'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e95'
  on-tertiary-container: '#caeaff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-page: 32px
  section-gap: 48px
  element-gap: 16px
  stack-sm: 8px
---

## Brand & Style

The design system establishes a high-performance, clinical, and sophisticated environment for medical professionals. It moves away from the traditional, utilitarian healthcare aesthetic toward a premium SaaS experience reminiscent of high-end developer and financial tools.

The visual direction is **Modern Corporate with Glassmorphism**. It prioritizes extreme clarity, structural integrity, and a sense of "quiet intelligence." The UI acts as a neutral frame for critical medical data, using depth and subtle motion to guide the clinician's eye without causing fatigue. The emotional goal is to evoke precision, speed, and unwavering reliability.

## Colors

The palette is built on a foundation of deep, authoritative slates and navies, contrasted with a vibrant "Medical Blue" for primary actions.

- **Primary (#0052FF):** A high-visibility, high-performance blue used strictly for primary CTAs and critical interactive states.
- **Secondary (#0F172A):** Deep Navy used for sidebar backgrounds, primary headings, and high-contrast text to provide a premium feel.
- **Surface & Backgrounds:** Use a scale of off-whites and cool grays (`#F8FAFC` to `#F1F5F9`) to maintain a clean, sterile, yet modern canvas.
- **Semantic Accents:** 
    - **Positive:** Emerald 600 for successful diagnoses and "Completed" states.
    - **Alert:** Rose 500 for critical findings or "Positive" cardiomegaly detection.
    - **Warning:** Amber 500 for pending or processing states.

## Typography

This design system utilizes **Inter** for all UI elements to ensure maximum legibility at various optical sizes. The typeface is configured with tight letter-spacing for headlines to mimic a premium, "Linear-like" aesthetic.

**JetBrains Mono** is introduced as a secondary font for Patient IDs, Confidence Scores, and timestamps to emphasize the data-driven, technical nature of the system. 

For mobile devices, `display-lg` should be replaced by `headline-lg`, and all `headline` levels should scale down by one tier (e.g., `headline-lg` becomes `headline-md`).

## Layout & Spacing

The system follows a **12-column fixed grid** on desktop, centered with generous margins to focus the user's attention. 

- **Density:** We utilize a "Comfortable" density setting. Dashboard widgets and cards should have 24px of internal padding to feel spacious and professional.
- **Rhythm:** An 8px linear scaling system is used for all padding and margin values. 
- **Responsive Behavior:** 
    - **Desktop (>1024px):** 12 columns, 24px gutters.
    - **Tablet (768px - 1023px):** 8 columns, 16px gutters, 24px page margins.
    - **Mobile (<767px):** 4 columns, 12px gutters, 16px page margins. Content stacks vertically.

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layers** and **Subtle Glassmorphism**.

1.  **Base Layer:** The application background is a solid `#F8FAFC`.
2.  **Surface Layer:** Cards and containers use a solid white surface with a 1px border of `#E2E8F0`. 
3.  **Elevation (Soft Shadows):** Instead of heavy shadows, we use a single "Ambient" shadow for active cards: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
4.  **Glassmorphism:** Navigation sidebars and sticky headers use a backdrop-blur of 12px with a 70% transparent white background. This creates a sense of depth and modernism without sacrificing performance.

## Shapes

The design system uses a **Rounded** shape language to appear approachable yet professional.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px).
- **Large Elements (Cards, Dashboards):** 1rem (16px).
- **Micro Elements (Chips, Badges):** Pill-shaped (fully rounded).

This consistent corner radius creates a cohesive visual rhythm across complex data tables and registration forms.

## Components

### Buttons
- **Primary:** Solid `#0052FF` with white text. High-contrast, bold weight.
- **Secondary:** Transparent with a `#E2E8F0` border and `#0F172A` text.
- **Ghost:** No border, `#64748B` text, appears on hover with a light gray background.

### Data Cards
Dashboard widgets must feature a top-aligned "Label" (Label-md, uppercase) and a large "Value" (Headline-lg). Data trends (sparklines) should be integrated directly into the card background using the tertiary color.

### Input Fields
Inputs should have a subtle 1px border. When focused, the border transitions to Primary Blue with a 3px soft outer "glow" (blue at 10% opacity). Labels sit above the input in `label-md`.

### Tables (X-ray Requests)
Rows should have a hover state that slightly lifts the row using a subtle background tint (`#F1F5F9`). Use pill-shaped badges for "Status" (e.g., Completed, Pending) with low-saturation background colors to keep the focus on the data.

### Progress Indicators
For AI analysis, use a clean, thin indeterminate progress bar at the very top of the card or a centered, high-performance circular spinner using the primary blue.