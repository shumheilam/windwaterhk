# 風生水起 FengShui Oracle

A web-based Traditional Chinese Metaphysics platform offering nine integrated divination and feng shui modules, built with pure HTML/CSS/JavaScript — no frameworks, no backend, no dependencies.

🔗 **Live Demo:** [fengshuioracle.vercel.app](https://fengshuioracle.vercel.app)

---

## Overview

FengShui Oracle digitises classical Chinese metaphysical systems that have historically existed only in physical form — temple fortune sticks, paper almanacs, and master consultations. The app makes these systems accessible, accurate, and interactive for a modern Cantonese-speaking audience.

All core calculations are pure algorithmic implementations of classical texts and formulas. AI-assisted interpretation (via Anthropic Claude API) is planned for Phase 4.

---

## Modules

| Module | Description |
|--------|-------------|
| **八字命盤 BaZi Chart** | Four Pillars calculation from Gregorian birth date/time; Five Elements distribution; Ten Gods analysis; Useful God (扶抑法); annual luck pillar scoring; career/study direction |
| **求簽解簽 Fortune Sticks** | 12 deities (Guan Yin, Guan Di, Yue Lao, etc.); 100 lots with classical verse + plain-language interpretation; animated temple wooden stick animation |
| **合婚配對 Compatibility** | Dual BaZi input; Five Elements radar chart; overall compatibility score; three-dimensional scoring across romance, career, and family |
| **改名系統 Name Analysis** | Three scenarios (newborn / adult / business); 20,717-character Kangxi stroke database; Wu Ge (五格剖象法) analysis; scored candidate name ranking |
| **流年運程 Annual Fortune** | Full-year overview; 12-month timeline; peak and caution months highlighted |
| **神明曆 Deity Calendar** | Lunar calendar with 12 deity birthdays; Jian Chu 12-spirit auspicious/inauspicious day classification; worship guidance |
| **擇日系統 Date Selection** | 7 event types (wedding, business opening, relocation, etc.); Jian Chu auspiciousness judgement; recommended auspicious dates |
| **奇門遁甲 Qi Men Dun Jia** | Chai Bu (拆補法) fixed-palace layout engine; Three Peculiarities and Six Protocols ground plate; Nine Stars and Eight Gates heaven plate with Value Officer/Value Messenger markers |
| **風水羅盤 Feng Shui Compass** | Live device compass (iOS/Android); 24 Mountain directional ring; Eight Mansions (八宅法) life-gua analysis; Annual Flying Stars layout (2024–2034, dynamic solar term calculation via 壽星公式) |

---

## Technical Architecture

### Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+) — zero frameworks, zero build tools
- **Deployment:** Vercel (GitHub auto-deploy)
- **PWA:** Installable on iOS (Add to Home Screen) and Android (Chrome)

### Design Decisions

**Why no React/Vue/Next.js?**
The app is content-driven and computation-heavy, not UI-state-heavy. Vanilla JS modules communicate directly with the calculation engines without reconciliation overhead. This keeps the bundle size minimal, eliminates build pipeline complexity, and allows the entire app to function offline once cached.

**Algorithmic Complexity**
Despite the static delivery, the calculation layer is non-trivial:
- BaZi engine: Gregorian → Lunar conversion, Heavenly Stems and Earthly Branches derivation, Ten Gods mapping, Useful God analysis via 扶抑法
- Qi Men Dun Jia: Chai Bu 拆補法 starting-palace determination, full 9×9 plate arrangement with all classical markers
- Flying Stars: Dynamic annual star entry calculation using the 壽星公式 astronomical formula for precise solar term boundaries — no hardcoded yearly lookup tables
- Eight Mansions: 大游年歌訣 reconstructed and validated against 3 symmetry sets
- Kangxi Database: 20,717-character stroke count lookup for name analysis

### Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1–3 | ✅ Complete | All 9 core modules, algorithmic calculation layer |
| Phase 4 | 🔄 In Progress | Anthropic Claude API integration — AI fortune stick interpretation (Haiku), deep BaZi report (Sonnet), feng shui Q&A, face/palm reading (Vision) |
| Phase 5 | 📋 Planned | Stripe payment integration, user accounts, PDF report export |

---

## Product Context

This project emerged from identifying a gap in the Cantonese-speaking market: existing Chinese metaphysics apps are either Mandarin-only, algorithmically shallow, or locked behind expensive consultations. FengShui Oracle aims to be the first Cantonese-native, algorithmically rigorous, and freely accessible platform for classical Chinese metaphysical systems.

The accuracy of each module has been cross-validated with a practising master in Hong Kong, combining computational precision with traditional authority.

---

## Developer

**Hayley Shum** — Final-year BEng (Hons) Electrical & Electronic Engineering, Auckland University of Technology

This project demonstrates applied skills in:
- Complex algorithmic system design (astronomical calculation, classical text digitisation)
- AI product architecture and API integration planning
- Full product lifecycle ownership: ideation → build → deployment → monetisation
- Cross-domain knowledge synthesis (engineering + traditional knowledge systems)

📧 hayleyshum0317@gmail.com  
🔗 [linkedin.com/in/hei-lam-shum](https://linkedin.com/in/hei-lam-shum)  
🌐 [fengshuioracle.vercel.app](https://fengshuioracle.vercel.app)
