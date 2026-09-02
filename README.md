# Personal Product Designer Portfolio — Aththar

> **Design Concept:** "Warm Precision"  
> *"Quiet on the surface. Curious underneath."*

A contemporary, high-craft personal product designer portfolio website built for **Aththar**, showcasing enterprise SaaS design, entrepreneurial ventures, technical literacy, and purposeful interaction design.

---

## 1. Product Overview & Design System

### Design Philosophy
- **Professional & Contemporary:** Tailored for corporate recruiters, design leads, and enterprise hiring managers without generic template clichés.
- **Warm Precision:** Restrained signature accent color (`#9B0F06`) against warm neutral surfaces (`#FBF9F6`, `#F7F4F0`, `#171514`).
- **Purposeful Interaction:** Incorporates the interactive "Hold → Release → Reveal" hero gesture, microcopy feedback, and dynamic case study views.

### Color Palette

| Token | Hex Value | Role & Usage |
|---|---|---|
| **Accent (Signature)** | `#9B0F06` | Interaction signals, active filter pills, CTA hover, progress ring (max 5–9% surface) |
| **Ink (Primary Text)** | `#171514` | High-contrast body and heading typography |
| **Warm Black** | `#24201E` | Secondary dark surfaces & deep contrast frames |
| **Warm Gray** | `#6F6965` | Metadata labels, supporting descriptions, timestamps |
| **Paper** | `#F7F4F0` | Container backgrounds and card surfaces |
| **Warm White** | `#FBF9F6` | Primary canvas background |

---

## 2. Core Architecture & Features

### 2.1 Public Portfolio Experience
1. **Interactive Hero ("Hold → Release → Reveal"):**
   - **Idle:** Neutral target ◉ with subtle microcopy `"Hold to explore"`.
   - **Proximity:** Damped magnetic pull towards cursor on desktop.
   - **Hold:** 1.6-second progress ring in signature `#9B0F06` with haptic feedback.
   - **Completion & Reveal:** Smooth expansion displaying `"YOU FOUND IT."` → auto-scrolling to unlock the full archive.
   - **Accessibility & Fallback:** Instant `"Explore Selected Work →"` button with complete keyboard support (Space / Enter).
2. **Selected Work (Featured Projects):**
   - Editorial presentation of high-impact case studies (e.g., *Mambu Radar*, *Hexacode Enterprise AI Core*, *Cilcoffee*).
   - Real-world impact metrics, problem-solution synthesis, and hover zoom.
3. **Experience Section (4 Structured Categories):**
   - `01 WORK`: Enterprise SaaS, AI workflows, BUMN & banking platforms.
   - `02 BUILD`: Entrepreneurial execution (Cilcoffee: Sourcing → Costing → Branding → Operations).
   - `03 LEARN`: Google UX Design, AWS Cloud Practitioner, Dicoding UX certifications.
   - `04 STUDY`: B.Sc. in Computer Science with Honors.
4. **All Projects (The Rest of the Work):**
   - Dynamic archive with category filter chips: `ALL` · `PRODUCT` · `UX` · `BUILD` · `EXPERIMENT`.
5. **Dynamic Case Study Engine (`/work/[slug]`):**
   - Structured content renderer supporting Headings, Paragraphs, Quotes, Sensory Tables, Callout Blocks, 2-Column comparisons, and User Journey steps.
   - Next & Previous project routing with social sharing and draft preview mode (`?preview=true`).
6. **Direct WhatsApp CTA & Contact Channel:**
   - Primary high-conversion CTA linked directly to WhatsApp (`https://wa.me/<number>`) with pre-composed messaging.

---

### 2.2 Admin System (CMS) — `/admin`
- **Secure Authentication:** Protected session auth with password hashing (PBKDF2/Argon2-compatible).
- **Default Initial Credentials:**
  - **Username:** `admin`
  - **Password:** `AththarPortfolio2026!` *(Configurable & changeable via Settings panel)*
- **Project CRUD & Life-cycle:**
  - Create, edit, duplicate, preview, publish, unpublish, and delete case studies.
  - Featured slots ordering (`featured_order`) for Homepage.
  - Structured WYSIWYG Content Block Builder.
- **Media Asset Manager:**
  - Upload local files or link external CDN/Unsplash URLs with alt text, caption, and dimensions.
- **System Settings:**
  - Profile metadata, WhatsApp number, email, social links, and database restore utilities.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons.
- **Backend:** Express.js running on Node.js.
- **Data Persistence:** File-backed persistent database (`data/db.json`) with auto-recovery and memory sync.
- **Deployment Build:** Single-bundle server output via `esbuild` (`dist/server.cjs`) + static asset pipeline.

---

## 4. API Endpoints

### Authentication
- `POST /api/auth/login` — Authenticate admin and return session token.
- `GET /api/auth/me` — Verify active session.
- `POST /api/auth/logout` — Invalidate token.
- `POST /api/auth/change-password` — Update admin credentials securely.

### Projects
- `GET /api/projects` — Fetch published projects (or all projects when authenticated).
- `GET /api/projects/:slug` — Retrieve single project by slug or ID.
- `POST /api/projects` — Create a new project (Admin).
- `PUT /api/projects/:id` — Update project metadata and blocks (Admin).
- `DELETE /api/projects/:id` — Delete project (Admin).
- `POST /api/projects/:id/duplicate` — Duplicate project into draft (Admin).
- `POST /api/projects/reorder-featured` — Reorder featured homepage slots (Admin).

### Experience & Settings
- `GET /api/experience` & `PUT /api/experience` — Track record items.
- `GET /api/settings` & `PUT /api/settings` — Profile and contact settings.
- `GET /api/media` & `POST /api/media` — Media asset catalog.
- `POST /api/reset-data` — Restore default showcase database state.

---

## 5. Getting Started

### Development
```bash
# Start development server on port 3000
npm run dev
```

### Production Build & Launch
```bash
# Build frontend and bundle standalone server
npm run build

# Start production server
npm start
```

---

## 6. Author

**Aththar** — Product Designer  
*Enterprise Digital Products · AI Workflows · Venture Experiments*
