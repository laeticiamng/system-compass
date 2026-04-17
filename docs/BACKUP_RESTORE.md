# Backup & Restore Runbook

> **Owner**: Platform team — Review every quarter.
> **Last drill**: _to fill after first execution_

## 1. Backup model

Lovable Cloud (Supabase) ships **automatic daily backups** with point-in-time recovery (PITR) for paid tiers. Storage buckets are backed up separately as part of the project snapshot.

| Asset | Backup mechanism | Retention | Restore granularity |
|---|---|---|---|
| Postgres database | Daily snapshot + WAL (PITR) | 7 days (Pro) / 14 days (Team+) | Per-table or full DB, ±1 second |
| Storage buckets (`traceos-exports`, `email-assets`) | Daily snapshot | 7 days | Bucket / object |
| Edge functions code | Lovable git history | Indefinite | Per file |
| Secrets | Manual export only | — | Manual |

## 2. What to back up *manually* (monthly)

Some artefacts live outside automatic backups. Export them on the 1st of each month and store in `1Password → "Lovable Recovery"`:

1. **Secrets list** (names only, no values) — copy from Cloud → Secrets.
2. **RLS policies snapshot** — run `\d+` on critical tables in SQL editor, save as `.sql`.
3. **Migrations folder** (`supabase/migrations/`) — already in git, no extra step.
4. **Connector configurations** — note connection IDs and scopes.

## 3. Restore drills (quarterly)

A restore drill validates that backups are *actually* restorable. Schedule one **per quarter** and log the result here.

### 3.1 Database restore drill

1. Create a temporary project (`lovable-restore-test`).
2. From the source project: Cloud → Backups → pick yesterday's snapshot → "Restore to new project" → choose the temp project.
3. Wait for restore to complete (≈10–30 min).
4. Run the validation queries below in the restored project's SQL editor:

```sql
-- A. Row count parity on critical tables
SELECT 'countries' AS t, count(*) FROM countries
UNION ALL SELECT 'profiles', count(*) FROM profiles
UNION ALL SELECT 'user_roles', count(*) FROM user_roles
UNION ALL SELECT 'error_logs', count(*) FROM error_logs;

-- B. RLS still enforced
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('profiles', 'user_roles', 'error_logs');

-- C. Recent activity present
SELECT max(created_at) FROM analytics_events;
```

5. Compare the counts with the source project (within the previous day's tolerance).
6. **Delete the temp project** when validation succeeds.
7. Log the drill in the table below.

### 3.2 Storage restore drill

1. Pick 5 random files from `traceos-exports`.
2. Note their checksum (`md5sum`).
3. Restore the bucket to a temp project as above.
4. Re-download the same 5 files and compare checksums.

### 3.3 Drill log

| Date | Operator | Outcome | Restore time | Notes |
|---|---|---|---|---|
| _YYYY-MM-DD_ | _name_ | ✅ / ❌ | _Xmin_ | _link to ticket_ |

## 4. Real incident playbook

When a real recovery is needed:

1. **Do NOT panic-restore over the live project.** Always restore to a *new* project first.
2. Open an incident in TraceOS with severity `critical`.
3. Identify the target timestamp (when the data was still good). Use `error_logs` and `analytics_events` to triangulate.
4. Restore to a fresh project.
5. Validate (queries from §3.1).
6. Decide:
   - **Full swap**: switch DNS / Lovable project pointer to the restored project.
   - **Partial sync**: copy only the affected tables back (`pg_dump --table=...`).
7. Post-mortem within 72h.

## 5. Recovery objectives

| Metric | Target |
|---|---|
| RPO (Recovery Point Objective) | ≤ 24 h (daily snapshot) |
| RTO (Recovery Time Objective) | ≤ 2 h for full restore |
| Drill cadence | 1 per quarter |

## 6. Out of scope (future work)

- Cross-region replication
- Logical replication to a hot standby
- Automated weekly drill via CI

— *Document maintained alongside `/admin/governance` dashboard.*
