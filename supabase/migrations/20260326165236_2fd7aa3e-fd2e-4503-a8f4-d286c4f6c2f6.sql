
-- pg_net doesn't support SET SCHEMA, so we drop and recreate in extensions
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net SCHEMA extensions;
