# 🗄️ Schéma de Base de Données

> 57 tables | 77 migrations | Dernière mise à jour : 2026-02-03

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC SCHEMA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   profiles  │───▶│ user_roles  │    │ subscribers │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                                     │                  │
│         │                                     │                  │
│         ▼                                     ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  dashboard_ │    │ exit_keys_  │    │subscription_│         │
│  │   progress  │    │   history   │    │   plans     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                    COUNTRIES DOMAIN                  │        │
│  ├─────────────────────────────────────────────────────┤        │
│  │  countries │ country_intelligence │ country_variants │        │
│  │  country_tags │ country_governance │ *_translations  │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                    TRACEOS DOMAIN                    │        │
│  ├─────────────────────────────────────────────────────┤        │
│  │  traceos_decisions │ traceos_approvals │ traceos_tags│        │
│  │  traceos_webhooks │ traceos_exports                  │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                      B2B DOMAIN                      │        │
│  ├─────────────────────────────────────────────────────┤        │
│  │  workspace_cases │ case_governance_* │ gov_intel_runs│        │
│  │  workspace_milestones │ b2b_usage_metering          │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tables Principales

### 👤 Utilisateurs & Auth

#### `profiles`
Données utilisateur étendues (lié à auth.users).

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK, = auth.users.id |
| display_name | text | Nom affiché |
| avatar_url | text | URL avatar |
| bio | text | Biographie |
| nationality | text | Nationalité ISO2 |
| current_country | text | Pays de résidence |
| created_at | timestamptz | Date création |
| updated_at | timestamptz | Dernière MAJ |

#### `user_roles`
Rôles utilisateurs (admin, moderator, etc.).

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| role | text | 'admin', 'moderator', 'expert' |
| created_at | timestamptz | Date attribution |

#### `subscribers`
Abonnements Stripe.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| email | text | Email facturation |
| stripe_customer_id | text | ID client Stripe |
| stripe_subscription_id | text | ID abonnement |
| subscribed | boolean | Actif ? |
| tier | text | 'free', 'premium', 'pro' |
| subscription_end | timestamptz | Fin abonnement |

### 🌍 Pays

#### `countries`
Données pays principales (50+ pays).

| Colonne | Type | Description |
|---------|------|-------------|
| id | text | PK (ex: 'portugal') |
| name | text | Nom pays |
| name_local | text | Nom local |
| iso2 | text | Code ISO2 |
| region | text | Région géographique |
| pyramid_type | text | Type de pyramide |
| pyramid | jsonb | Détails pyramide |
| snapshot | jsonb | Aperçu rapide |
| visa | jsonb | Infos visa |
| cost_of_living | jsonb | Coût de vie |
| healthcare | jsonb | Système santé |
| quality_of_life | jsonb | Qualité de vie |
| risks | jsonb | Risques |
| who_wins | jsonb | Profils gagnants |
| who_loses | jsonb | Profils perdants |
| playbook | jsonb | Guide stratégique |
| sources | jsonb | Sources données |
| data_version | int | Version données |

#### `country_intelligence`
Intelligence approfondie par pays.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| country_id | text | FK → countries |
| power_formal | jsonb | Pouvoirs formels |
| power_informal | jsonb | Pouvoirs informels |
| strategies_rewarded | jsonb | Stratégies gagnantes |
| strategies_punished | jsonb | Stratégies perdantes |
| newcomer_mistakes | jsonb | Erreurs débutants |
| macro_risks | jsonb | Risques macro |
| exit_difficulty | jsonb | Difficulté sortie |
| is_complete | boolean | Données complètes ? |

#### `country_variants`
Trajectoires et variantes par pays.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| country_id | text | FK → countries |
| daily_life | jsonb | Vie quotidienne |
| labor_market | jsonb | Marché du travail |
| entrepreneurship | jsonb | Entrepreneuriat |
| institutions | jsonb | Institutions |
| networks | jsonb | Réseaux |
| profiles_succeed | jsonb | Profils succès |
| profiles_struggle | jsonb | Profils difficulté |
| example_trajectories | jsonb | Exemples parcours |

### 📋 TraceOS

#### `traceos_decisions`
Décisions à tracer.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| title | text | Titre décision |
| description | text | Description |
| status | text | 'pending', 'approved', 'rejected' |
| domain | text | Domaine (visa, fiscal, etc.) |
| deadline | timestamptz | Échéance |
| country_id | text | Pays concerné |

#### `traceos_approvals`
Approbations des décisions.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| decision_id | uuid | FK → traceos_decisions |
| approver_name | text | Nom approbateur |
| approver_role | text | Rôle approbateur |
| approved_at | timestamptz | Date approbation |
| signature_hash | text | Hash signature |

### 🏢 B2B

#### `workspace_cases`
Dossiers B2B par workspace.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| workspace_id | uuid | ID workspace |
| title | text | Titre dossier |
| country_code | text | Pays cible |
| project_type | text | Type projet |
| sector | text | Secteur |
| status | text | Statut dossier |

#### `case_governance_actors`
Acteurs de gouvernance par dossier.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| case_id | uuid | FK → workspace_cases |
| actor_type | text | Type acteur |
| label | text | Nom/Label |
| country_code | text | Pays |
| power_types | text[] | Types de pouvoir |
| reliability_status | text | Fiabilité |
| is_ai_generated | boolean | Généré par IA ? |

### 🎮 Gamification

#### `gamification_progress`
Progression gamification utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| xp | int | Points d'expérience |
| level | text | Niveau actuel |
| phase | text | Phase parcours |
| streak | int | Jours consécutifs |
| badges | text[] | Badges obtenus |
| challenges_completed | text[] | Défis complétés |

#### `game_statistics`
Stats du jeu de scénarios.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| total_games_played | int | Parties jouées |
| best_score_solo | int | Meilleur score solo |
| countries_visited | text[] | Pays visités |
| archetypes_used | jsonb | Archétypes utilisés |

### 📊 Analytics & Usage

#### `ai_usage_metering`
Comptage usage IA.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| period_start | timestamptz | Début période |
| period_end | timestamptz | Fin période |
| ai_actions_count | int | Actions IA |
| ai_tokens_used | int | Tokens consommés |
| total_case_units | int | Unités case |
| quota_limit | int | Limite quota |

## Migrations

77 fichiers de migration dans `supabase/migrations/`.

### Structure d'une Migration

```sql
-- 20260203120000_example_migration.sql

-- 1. Créer la table
CREATE TABLE public.example_table (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Activer RLS
ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;

-- 3. Créer les policies
CREATE POLICY "Users can view own data"
  ON public.example_table
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON public.example_table
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Trigger updated_at
CREATE TRIGGER update_example_table_updated_at
  BEFORE UPDATE ON public.example_table
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## Fonctions Database

### `has_role(user_id, role)`
Vérifie si un utilisateur a un rôle.

```sql
SELECT has_role(auth.uid(), 'admin'); -- true/false
```

### `increment_ai_usage(user_id, action_type, units, tokens)`
Incrémente les compteurs d'usage IA.

```sql
PERFORM increment_ai_usage(auth.uid(), 'generation', 1, 500);
```

### `increment_b2b_usage(user_id, metric, increment)`
Incrémente les métriques B2B.

```sql
PERFORM increment_b2b_usage(auth.uid(), 'cases_created', 1);
```

## Index Importants

```sql
-- Performance sur lookups user
CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_dashboard_progress_user ON dashboard_progress(user_id);

-- Recherche pays
CREATE INDEX idx_countries_region ON countries(region);
CREATE INDEX idx_countries_pyramid ON countries(pyramid_type);

-- TraceOS queries
CREATE INDEX idx_decisions_user_status ON traceos_decisions(user_id, status);
CREATE INDEX idx_decisions_deadline ON traceos_decisions(deadline);
```
