#!/bin/bash

# ============================================
# System Compass - Development Setup Script
# ============================================

set -e

echo "🏔️ System Compass - Installation de développement"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js
print_step "Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION installé"
else
    print_error "Node.js n'est pas installé. Installez Node.js 20+ depuis https://nodejs.org"
    exit 1
fi

# Check npm
print_step "Vérification de npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION installé"
else
    print_error "npm n'est pas installé."
    exit 1
fi

# Install dependencies
print_step "Installation des dépendances..."
npm ci
print_success "Dépendances installées"

# Setup environment
print_step "Configuration de l'environnement..."

if [ ! -f .env ]; then
    # Create minimal .env for development without Supabase
    cat > .env << EOF
# System Compass - Development Environment
# Pour le mode complet avec backend, utilisez Lovable Cloud

# Mode développement local (sans backend)
VITE_DEV_MODE=true

# Ces variables sont optionnelles en mode dev local
# VITE_SUPABASE_URL=
# VITE_SUPABASE_PUBLISHABLE_KEY=
# VITE_SUPABASE_PROJECT_ID=
EOF
    print_success "Fichier .env créé (mode développement local)"
else
    print_warning "Fichier .env existant conservé"
fi

# Setup git hooks
print_step "Installation des git hooks..."
if [ -f scripts/setup-hooks.js ]; then
    node scripts/setup-hooks.js
    print_success "Git hooks installés"
else
    print_warning "Script setup-hooks.js non trouvé"
fi

# Type check
print_step "Vérification des types TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
    print_success "Types valides"
else
    print_warning "Quelques erreurs de types (normal en mode dev local)"
fi

# Run tests
print_step "Exécution des tests..."
if npm run test 2>/dev/null; then
    print_success "Tests passés"
else
    print_warning "Certains tests échouent (vérifiez la configuration)"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo ""
echo "Commandes disponibles :"
echo "  npm run dev          - Lancer le serveur de développement"
echo "  npm run test         - Lancer les tests"
echo "  npm run lint         - Vérifier le linting"
echo "  npm run build        - Build de production"
echo ""
echo "Documentation :"
echo "  docs/CONTRIBUTING.md - Guide de contribution"
echo "  docs/audit/          - Rapports d'audit"
echo "  docs/API.md          - Documentation API"
echo ""
echo "=================================================="
echo ""

# Optional: Start dev server
read -p "Lancer le serveur de développement ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Démarrage du serveur..."
    npm run dev
fi
