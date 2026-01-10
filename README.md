# Exit Keys Platform

[![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml)
[![i18n Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/.github/badges/i18n-coverage.json)](https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/.github/badges/I18N_COVERAGE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

A strategic platform for understanding country systems and planning life trajectories.

## Features

- 🌍 **Country Analysis** - Detailed profiles for 25+ countries with pyramid systems
- 🔑 **Exit Keys** - Personalized strategies based on your profile
- 📊 **Dashboard** - Track your progress with timelines and deadlines
- 🎮 **Strategy Game** - Learn through interactive gameplay
- 🌐 **Multi-language** - Available in EN, FR, ES, DE, IT, PT, NL

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Testing**: Vitest

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Running Tests

```sh
# Run tests once
npx vitest run

# Run tests in watch mode
npx vitest

# Run with coverage
npx vitest run --coverage
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and data
│   └── __tests__/  # Unit tests
├── pages/          # Route components
└── integrations/   # External service integrations
```

## Deployment

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share → Publish.

## Custom Domain

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## License

MIT
