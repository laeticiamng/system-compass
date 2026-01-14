# World Alignment — Exit Keys Platform

[![Tests](https://github.com/system-compass/system-compass/actions/workflows/test.yml/badge.svg)](https://github.com/system-compass/system-compass/actions/workflows/test.yml)
[![i18n Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/system-compass/system-compass/main/.github/badges/i18n-coverage.json)](https://github.com/system-compass/system-compass/blob/main/.github/badges/I18N_COVERAGE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)](https://supabase.com/)
[![Built with Lovable](https://img.shields.io/badge/Built_with-Lovable-ff69b4.svg)](https://lovable.dev/)

> A strategic decision-making platform for understanding country systems, planning life trajectories, and navigating international relocation or entrepreneurship.

---

## 📸 Screenshots

| Home Page | Country Analysis | Exit Keys |
|-----------|------------------|-----------|
| ![Home](docs/screenshots/home.png) | ![Analysis](docs/screenshots/country-analysis.png) | ![Exit Keys](docs/screenshots/exit-keys.png) |

| Game Mode |
|-----------|
| ![Game](docs/screenshots/game-mode.png) |

---

## 🎯 Who It's For

### B2C — Personal Relocation
- **Expats & Digital Nomads** planning international moves
- **Families** evaluating quality of life across countries
- **Career changers** seeking new opportunities abroad
- **Retirees** considering retirement destinations

### B2B — Business & Entrepreneurship
- **Entrepreneurs** exploring new markets and jurisdictions
- **Consultants** advising clients on international strategy
- **Institutions** (NGOs, embassies) requiring country governance analysis
- **Investors** assessing geopolitical and operational risks

---

## 📦 What You Get

### Personalized Analysis
- **Exit Keys** — Tailored strategies based on your profile, goals, and risk tolerance
- **Country Profiles** — 25+ countries with pyramid system analysis
- **Terrain Realities** — AI-powered intelligence on governance, friction, and opportunities

### Decision Support Tools
- **Dashboard** — Track progress with timelines, deadlines, and reminders
- **Dossier Builder** — Manage relocation or entrepreneurship cases end-to-end
- **Comparative Analysis** — Side-by-side country comparisons with radar charts

### Exportable Reports
- **PDF Exports** — Professional reports for Exit Keys, Country Analysis, Governance Deep/Light
- **TraceOS Integration** — Institutional decision traceability and audit logs
- **Irreversa Module** — Document irreversible decisions with witness validation

### Gamified Learning
- **Pyramid Quiz** — Interactive strategy game to understand country systems
- **Achievements System** — Unlock badges as you explore and plan

---

## 🛠️ Features

- 🌍 **Country Analysis** — Detailed profiles with pyramid systems and intelligence layers
- 🔑 **Exit Keys Engine** — Personalized strategies based on 100+ profile dimensions
- 📊 **Interactive Dashboard** — Progress tracking, notifications, and AI assistance
- 🎮 **Strategy Game** — Learn through turn-based gameplay with events and choices
- 🏛️ **Governance Intelligence** — B2B-grade analysis for institutions and consultants
- 🌐 **Multi-language** — Available in EN, FR, ES, DE, IT, PT, NL, AR, ZH, RU
- 📱 **Mobile-Friendly** — Responsive design for all devices

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | Supabase (Auth, Database, Edge Functions, Storage) |
| **AI** | Lovable AI (Gemini, GPT-5) |
| **Testing** | Vitest, Playwright (E2E) |
| **i18n** | react-i18next with 10+ languages |

---

## 🚀 Getting Started

```sh
# Clone the repository
git clone https://github.com/system-compass/system-compass.git

# Navigate to project directory
cd system-compass

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧪 Running Tests

```sh
# Run unit tests
npx vitest run

# Run tests in watch mode
npx vitest

# Run with coverage
npx vitest run --coverage

# Run E2E tests
npx playwright test
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ai/           # AI assistant components
│   ├── cases/        # Dossier management
│   ├── dashboard/    # Dashboard widgets
│   ├── game/         # Strategy game components
│   ├── governance/   # B2B governance tools
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks
├── lib/              # Utilities, data, and business logic
│   └── __tests__/    # Unit tests
├── pages/            # Route components
├── locales/          # i18n translation files
└── integrations/     # Supabase and external services

supabase/
├── functions/        # Edge functions
└── migrations/       # Database migrations
```

---

## 🌐 Deployment

This project is deployed on **Lovable Cloud**.

- **Preview**: [world-alignment.lovable.app](https://world-alignment.lovable.app)
- **Publish**: Open [Lovable Editor](https://lovable.dev/projects/abysiagseykztutnbjtu) → Share → Publish

### Custom Domain

Navigate to Project > Settings > Domains to connect your domain.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

---

## 📄 License

MIT

---

## 🔗 Links

- **Live App**: [world-alignment.lovable.app](https://world-alignment.lovable.app)
- **Documentation**: [docs.lovable.dev](https://docs.lovable.dev)
- **Lovable Community**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

---

<p align="center">
  <sub>Built with ❤️ using <a href="https://lovable.dev">Lovable</a></sub>
</p>
