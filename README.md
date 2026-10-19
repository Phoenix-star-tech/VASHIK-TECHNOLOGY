# VASHIK-TECHNOLOGY

Official website for **VASHIK TECHNOLOGY — We build what matters**.

This project is built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Three.js**, and **GSAP**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.18+ or v20+)
- npm / yarn / pnpm

### Installation
```bash
npm install
```

### Development Server
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
Generate an optimized production build:
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
├── app/
│   ├── globals.css          # Design system, responsive styles, animations
│   ├── layout.tsx           # Root layout with SEO, OpenGraph, JSON-LD Schema & Fonts
│   └── page.tsx             # Home page assembling modular components
├── components/
│   ├── CustomCursor.tsx     # Custom trailing cursor with lerp & data-cursor triggers
│   ├── Navbar.tsx           # Sticky responsive navigation with mobile toggle
│   ├── Hero.tsx             # 3D Wireframe canvas (Three.js) & GSAP entrance
│   ├── About.tsx            # About story & interactive Founders carousel slider
│   ├── Services.tsx         # Packages pricing table, Add-ons with 3D tilt, Support timeline & Projects
│   ├── Approach.tsx         # 3 disciplined pillars & parallax background floating shapes
│   ├── Marquee.tsx          # Continuous ticker marquee
│   ├── Contact.tsx          # Contact section with Gmail web / mailto logic
│   ├── Footer.tsx           # Branding & footer navigation
│   └── ScrollEffects.tsx    # GSAP ScrollTrigger transitions, parallax layers & smooth scroll
├── public/                  # Static assets (images, logos, favicon, robots.txt, sitemap.xml)
├── next.config.mjs          # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## ⚡ Features & Interactivity
- **Three.js 3D Wireframe Hero**: Interactive rotating icosahedron, octahedron, torus ring, and point cloud reacting to mouse movement and scroll.
- **GSAP ScrollTrigger**: Cinematic section transitions, staggered reveal animations, and parallax layer shifts.
- **Micro-Interactions**: 3D perspective card tilt with dynamic radial glare effects.
- **SEO & Performance**: Server-Side Rendering (SSR), Next.js metadata API, JSON-LD Organization schema, optimized images, and Google Inter font integration.
- **Full Responsiveness**: Optimized layouts across mobile, tablet, and desktop viewports.
