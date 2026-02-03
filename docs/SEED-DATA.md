# Données de Seed - Pyramid Compass

Ce document explique comment peupler la base de données avec des données de test.

## Mode développement local

En mode développement local (`VITE_DEV_MODE=true`), l'application utilise des **données mock intégrées** dans le code. Aucune configuration supplémentaire n'est nécessaire.

Les données mock sont définies dans :
- `src/lib/mock/countries.ts` — Pays fictifs
- `src/lib/mock/exitKeys.ts` — Stratégies de test
- `src/lib/mock/users.ts` — Profils utilisateurs

## Avec Lovable Cloud

### Option 1 : Via l'interface Cloud

1. Ouvrez votre projet dans Lovable
2. Allez dans **Cloud** → **Database** → **Tables**
3. Sélectionnez la table à peupler
4. Cliquez sur **Import** et uploadez un fichier CSV/JSON

### Option 2 : Via les Edge Functions admin

```bash
# Générer des pays de test
curl -X POST https://[project-id].supabase.co/functions/v1/seed-countries \
  -H "Authorization: Bearer [admin-token]" \
  -d '{"count": 10}'
```

### Option 3 : Script SQL

Exécutez dans **Cloud** → **Run SQL** :

```sql
-- Insérer des pays de test
INSERT INTO countries (id, name, iso2, pyramid_type, region)
VALUES 
  ('test-fr', 'France (Test)', 'FR', 'administrative', 'Europe'),
  ('test-de', 'Allemagne (Test)', 'DE', 'meritocratic', 'Europe'),
  ('test-us', 'États-Unis (Test)', 'US', 'competitive', 'North America');

-- Données minimales pour chaque pays
UPDATE countries 
SET 
  snapshot = '{"summary": "Pays de test"}',
  pyramid = '{"type": "test", "layers": []}',
  visa = '{"tourist": "90 days", "work": "Visa required"}',
  risks = '[]',
  positive_points = '[]'
WHERE id LIKE 'test-%';
```

## Structure des données

### Table `countries`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `name` | text | Nom du pays |
| `iso2` | text | Code ISO 2 lettres |
| `pyramid_type` | text | Type de système |
| `region` | text | Région géographique |
| `snapshot` | jsonb | Résumé rapide |
| `pyramid` | jsonb | Structure pyramidale |
| `visa` | jsonb | Informations visa |
| `risks` | jsonb | Risques identifiés |
| `positive_points` | jsonb | Points positifs |

### Table `country_intelligence`

| Colonne | Type | Description |
|---------|------|-------------|
| `country_id` | uuid | Référence pays |
| `power_formal` | jsonb | Pouvoir formel |
| `power_informal` | jsonb | Pouvoir informel |
| `strategies_rewarded` | jsonb | Stratégies gagnantes |
| `strategies_punished` | jsonb | Stratégies perdantes |
| `newcomer_mistakes` | jsonb | Erreurs de débutant |

## Nettoyage

Pour supprimer les données de test :

```sql
DELETE FROM countries WHERE id LIKE 'test-%';
DELETE FROM country_intelligence WHERE country_id LIKE 'test-%';
```

## Données de production

⚠️ **Ne jamais utiliser les données de seed en production**

Les données de production sont générées par :
1. L'Edge Function `generate-country-profile` (IA)
2. Import de données officielles validées
3. Contribution de la communauté (après review)
