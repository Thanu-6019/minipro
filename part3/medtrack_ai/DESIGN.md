---
name: MedTrack AI
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#414755'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006e28'
  on-secondary: '#ffffff'
  secondary-container: '#6ffb85'
  on-secondary-container: '#00732a'
  tertiary: '#8a2bb9'
  on-tertiary: '#ffffff'
  tertiary-container: '#a649d5'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#72fe88'
  secondary-fixed-dim: '#53e16f'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531c'
  tertiary-fixed: '#f6d9ff'
  tertiary-fixed-dim: '#e8b3ff'
  on-tertiary-fixed: '#310048'
  on-tertiary-fixed-variant: '#7201a2'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  status-pending: '#FF9500'
  status-skipped: '#FF3B30'
  status-taken: '#34C759'
  status-rescheduled: '#5856D6'
  surface-dark: '#121212'
  surface-light: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 13px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-tablet: 32px
---

## Brand & Style
The design system for this healthcare application is anchored in the **Corporate / Modern** movement, elevated with **Glassmorphism** and high-fidelity depth to meet a "2026 Mobile" standard. The brand personality is professional, empathetic, and ultra-reliable—positioning the product as a premium medical companion rather than a simple utility.

The aesthetic prioritizes clarity and "Apple-level" refinement. It uses significant whitespace, soft-focus background blurs, and layered surfaces to organize complex medical data without overwhelming the user. The visual tone should evoke a sense of clinical precision softened by human-centric design, ensuring users feel both empowered and cared for.

## Colors
The palette is rooted in established healthcare semiotics while maintaining a vibrant, modern edge. 

- **Primary (Medical Blue):** Used for primary actions, active states, and brand-heavy elements.
- **Secondary (Emerald Green):** Dedicated to positive reinforcement, "taken" medication states, and health progress.
- **Tertiary (Soft Purple):** Used for specialized insights, AI-driven suggestions, and subtle accents.
- **Neutral:** A deep charcoal is used for text and high-contrast elements in light mode, and as the primary background in dark mode.

All color applications must maintain AA/AAA compliance. Status colors (Pending, Skipped, Taken) are semantically mapped to ensure immediate recognition of medication adherence levels.

## Typography
The system utilizes **Inter** exclusively to achieve a clean, systematic, and utilitarian aesthetic that feels contemporary and highly legible. 

- **Hierarchy:** Dramatic scale differences between Display and Body text help guide the user through complex medical schedules.
- **Display:** Used for large dashboard titles and health scores.
- **Body:** Optimized for readability in medication descriptions and drug interaction warnings.
- **Labels:** Utilized for form fields and status badges, often with increased tracking for clarity at small sizes.

Mobile-specific overrides ensure that large titles do not wrap awkwardly on smaller devices while maintaining their visual impact.

## Layout & Spacing
The layout follows a **fluid grid** model based on a 4px baseline. Mobile views utilize a standard 4-column system, while tablets scale to 8 or 12 columns depending on orientation.

- **Margins:** A generous 20px margin on mobile ensures content doesn't feel cramped, contributing to the "calm" brand attribute.
- **Rhythm:** Spacing between related items (e.g., label to input) uses `xs` or `sm`, while spacing between unrelated sections or cards uses `lg` or `xl`.
- **Reflow:** On larger screens, medication lists should transition from a single stack to a multi-column masonry or grid layout to maximize information density without losing focus.

## Elevation & Depth
Hierarchy is conveyed through **Tonal Layers** and **Glassmorphism**. 

- **Surface Levels:** The base background is the lowest level. Cards sit on "Level 1" with a subtle, diffused shadow (15% opacity, 20px blur, 4px Y-offset). 
- **Glassmorphism:** Navigation bars and "Meal-Aware" floating notifications use a backdrop blur (20px to 30px) and a semi-transparent white or dark-charcoal fill (80% opacity) to create a sense of presence over the content.
- **Shadows:** Avoid harsh black shadows. Use tinted shadows that incorporate a fraction of the primary blue or neutral charcoal to keep the interface feeling light and "airy."

## Shapes
The shape language is consistently **Rounded**, reflecting an approachable and empathetic medical tool.

- **Cards & Containers:** Use `rounded-lg` (16px) for main content containers and medication cards.
- **Interactive Elements:** Buttons and Input fields use `rounded-md` (8px) for a precise, professional feel.
- **Status Badges:** Use `pill-shaped` (full radius) to distinguish them from interactive buttons and to emphasize their role as labels.

## Components
- **Buttons:** Primary buttons should be full-width on mobile with a subtle gradient (Primary to a slightly darker shade) and high-contrast white text. Secondary buttons should use a soft tonal fill rather than an outline.
- **Cards:** Medication cards are the core component. They must feature a clear "Status" indicator in the top right, a prominent Title, and secondary dosage information. Use subtle horizontal separators for nested information.
- **Forms:** Inputs should have a background color slightly different from the card surface to define the hit area. Labels should always be visible (never floating-only) to ensure accessibility.
- **Chips/Badges:** Pill-shaped with a low-opacity version of the status color as the background and full-opacity color for the text (e.g., Light Green background with Dark Green text for "Taken").
- **Data Visualizations:** High-fidelity charts (React Native Gifted Charts) should use smoothed Bézier curves and subtle area gradients. Interaction points on charts should trigger haptic feedback and clear tooltips.
- **OCR Previews:** Image uploads for prescriptions should be contained in a "rounded-lg" frame with a "Glass" overlay for raw text extraction results.