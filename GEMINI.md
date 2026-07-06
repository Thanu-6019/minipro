# MedTrack AI - Frontend Prototyping Instructions

Welcome to the MedTrack AI repository. This file defines the team-shared standards, architecture, design system, and development guidelines for creating and modifying high-fidelity interactive prototypes.

---

## 1. Project Overview & Scope
MedTrack AI is a smart medication tracking and health logging application designed to help users manage medications, track health metrics, schedule doctor appointments, and analyze health trends.

The repository is structured into three logical parts, each containing distinct screen flows:
- **`part1/`**: Core daily logging screens (e.g., Blood Pressure Tracker, Blood Sugar Tracker, Dose Logged, Health Metrics, Medicine Reminder, etc.).
- **`part2/`**: Setup, onboarding, and input screens (e.g., Welcome, Login, Scan/Review Prescription, Add Medicine, Schedule Medication, Home Dashboard).
- **`part3/`**: Health trends, analytics, calendars, and system-level configuration (e.g., Trends over 1/3/6/9/12 months, My Appointments, Appointment Details, Privacy/Data, Notifications & Reminders).

### Structure of a Screen Folder
Each screen prototype must be self-contained in its designated subdirectory. A complete screen subdirectory contains:
- `screen.png`: Visual design reference for the screen.
- `code.html` (to be created/implemented): The single-page responsive, interactive HTML/Tailwind CSS prototype.

---

## 2. Unified Design System & Tailwind Config
All prototypes must strictly adhere to the defined MedTrack AI Design System to ensure flawless visual continuity.

### A. Color Palette (Tailwind Custom Config)
Configure tailwind with the following exact colors under `tailwind.config = { theme: { extend: { colors: { ... } } } }`:

| Theme Color | Hex Code | Description / Usage |
| :--- | :--- | :--- |
| `primary` | `#0058bc` | Primary brand/interactive actions, main buttons |
| `on-primary` | `#ffffff` | Text/icons on primary colored surfaces |
| `primary-container` | `#0070eb` | Container accent, active tab highlights |
| `on-primary-container`| `#fefcff` | Text/icons on primary-container backgrounds |
| `secondary` | `#006e28` | Secondary actions / Success accents |
| `on-secondary` | `#ffffff` | Text on secondary actions |
| `secondary-container` | `#6ffb85` | Highlight background for active green status |
| `tertiary` | `#8a2bb9` | Accent details / alternative indicators |
| `background` | `#fcf8fb` | App background |
| `surface` | `#fcf8fb` | Container backgrounds, topbars |
| `surface-dim` | `#dcd9dc` | Dimmer surface for background contrast |
| `surface-variant` | `#e4e2e4` | Borders, subtle card accents |
| `on-surface` | `#1b1b1d` | Dominant text color |
| `on-surface-variant` | `#414755` | Secondary text, placeholders, labels |
| `outline` | `#717786` | Standard borders or dividers |
| `outline-variant` | `#c1c6d7` | Muted border borders |
| `error` | `#ba1a1a` | Error/danger state, destructive actions |
| `on-error` | `#ffffff` | Text on error surfaces |
| **Status Alerts** | | |
| `status-pending` | `#FF9500` | Yellow/Orange for pending items |
| `status-skipped` | `#FF3B30` | Red for skipped medication / alert |
| `status-taken` | `#34C759` | Green for confirmed medication / taken |
| `status-rescheduled` | `#5856D6` | Purple for rescheduled logs |

### B. Typography & Font Sizes
The primary typeface is **Inter** (`fontFamily: { body: ['Inter', 'sans-serif'] }`). Set up font-sizes with matching line-heights:
*   `display-lg`: `[34px, { lineHeight: 41px, letterSpacing: -0.02em, fontWeight: 700 }]` (Desktop main title)
*   `display-lg-mobile`: `[28px, { lineHeight: 34px, letterSpacing: -0.01em, fontWeight: 700 }]` (Mobile main title)
*   `headline-md`: `[22px, { lineHeight: 28px, fontWeight: 600 }]`
*   `title-lg`: `[20px, { lineHeight: 25px, fontWeight: 600 }]`
*   `body-lg`: `[17px, { lineHeight: 22px, fontWeight: 400 }]`
*   `body-md`: `[15px, { lineHeight: 20px, fontWeight: 400 }]`
*   `label-md`: `[13px, { lineHeight: 18px, letterSpacing: 0.01em, fontWeight: 500 }]`
*   `label-sm`: `[11px, { lineHeight: 13px, letterSpacing: 0.06em, fontWeight: 600 }]`

### C. Spacing (Tailwind Custom Config)
Add these layout constants under spacing config to match standard gutters:
*   `margin-mobile`: `20px`
*   `margin-tablet`: `32px`
*   `gutter`: `16px`
*   `base`: `4px`
*   `xxs`: `4px`
*   `xs`: `8px`
*   `sm`: `12px`
*   `md`: `16px`
*   `lg`: `24px`
*   `xl`: `32px`

---

## 3. Implementation Checklist & Standards

When implementing any screen's `code.html`, ensure the following conditions are satisfied:

1.  **Tailwind Configuration & Fonts**:
    *   Load Tailwind CSS with Plugins: `<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>`.
    *   Load Fonts & Icons: Use Inter font and Google Material Symbols Outlined stylesheet.
    *   Embed `<script id="tailwind-config">` containing the custom theme definitions.
2.  **Responsiveness & Layout**:
    *   Adopt a Mobile-First layout, centering cards/menus cleanly when viewed on larger desktop monitors (e.g. `max-w-4xl mx-auto`).
    *   Body should have `min-height: max(884px, 100dvh)` and `overflow-x-hidden`.
3.  **Visual Styling**:
    *   Use the **Glassmorphism panel** utility where elegant overlays or cards are required:
        ```css
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 4px 20px rgba(0, 88, 188, 0.05);
        }
        ```
    *   Ensure proper contrast: dark text on light backgrounds (`text-on-surface`).
4.  **Interactive Elements & States**:
    *   **Buttons & Links**: Provide subtle transitions (`transition-all duration-200`) and active states (`active:scale-95`).
    *   **Toggles & Switches**: Custom checkbox toggle switches styled with `#0058bc` primary color on checked state.
    *   **Range Sliders & Inputs**: Match design system color outlines and handle focus cleanly.
5.  **Navigation**:
    *   Include a standard `TopAppBar` header containing a back arrow, screen title, and space balance element.
    *   Provide bottom gaps or spacers (`pb-[100px]`) so items aren't cropped by mobile navigation overlays.

---

## 4. Architecture & Navigation Strategy (Feature-First)

To ensure scalability and maintainability, the project follows a **Feature-First Architecture**. All new features must be implemented within their respective `src/features/[feature]` directory.

### A. Feature Module Structure
Each feature module (`src/features/[feature]/`) MUST strictly adhere to:
- `components/`: UI molecules unique to this feature.
- `screens/`: Screen components referenced by Expo Router routes.
- `hooks/`: Feature-specific business logic (e.g., `useMedicationSchedule`).
- `services/`: Feature-specific API calls or data processing.
- `types/`: Feature-local TypeScript interfaces.
- `utils/`: Feature-local helper functions.

### B. Navigation Strategy (Expo Router)
Navigation is structured using Expo Router groups:
- **Auth Flow**: `app/(auth)/` - Welcome, Login.
- **Main Flow**: `app/(tabs)/` - Persistent navigation (Home, Medicines, Calendar, Profile).
- **Feature Routes**: `app/[feature]/` - Specific feature stacks (e.g., `app/scanner/` for scan-processing-review flow).

### C. Component Strategy
- **Atomic UI (`src/components/ui`)**: Highly reusable, generic components (Typography, Button, Badge).
- **Feature Components**: Domain-specific components that rely on specific feature data.
- **Layout Primitives**: Standardized wrappers (e.g., `FeatureContainer`) ensuring consistent margin-mobile/glassmorphism styling.

