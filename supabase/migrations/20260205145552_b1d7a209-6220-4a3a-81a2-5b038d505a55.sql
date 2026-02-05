-- Create enum types for fiscal rules
CREATE TYPE public.fiscal_rule_type AS ENUM (
  'income_tax', 
  'social_contributions', 
  'wealth_tax', 
  'capital_gains', 
  'vat', 
  'special_regime'
);

CREATE TYPE public.fiscal_convention_type AS ENUM (
  'exemption', 
  'credit', 
  'deduction'
);

-- Table: fiscal_rules - Tax brackets and rules per country
CREATE TABLE public.fiscal_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  rule_type public.fiscal_rule_type NOT NULL,
  brackets JSONB NOT NULL DEFAULT '[]'::jsonb,
  deductions JSONB DEFAULT '{}'::jsonb,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes_i18n JSONB DEFAULT '{}'::jsonb,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: fiscal_conventions - Bilateral tax treaties
CREATE TABLE public.fiscal_conventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_a_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  country_b_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  convention_type public.fiscal_convention_type NOT NULL,
  applicable_income_types TEXT[] NOT NULL DEFAULT ARRAY['salary'],
  withholding_rates JSONB DEFAULT '{}'::jsonb,
  source_url TEXT,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_countries CHECK (country_a_id != country_b_id)
);

-- Table: fiscal_special_regimes - Special tax regimes for expats
CREATE TABLE public.fiscal_special_regimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  regime_name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  benefits JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_years INTEGER,
  application_deadline TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description_i18n JSONB DEFAULT '{}'::jsonb,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fiscal_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_conventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_special_regimes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access
CREATE POLICY "Fiscal rules are publicly readable"
  ON public.fiscal_rules FOR SELECT USING (true);

CREATE POLICY "Fiscal conventions are publicly readable"
  ON public.fiscal_conventions FOR SELECT USING (true);

CREATE POLICY "Fiscal special regimes are publicly readable"
  ON public.fiscal_special_regimes FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can manage fiscal rules"
  ON public.fiscal_rules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage fiscal conventions"
  ON public.fiscal_conventions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage fiscal special regimes"
  ON public.fiscal_special_regimes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_fiscal_rules_country ON public.fiscal_rules(country_id);
CREATE INDEX idx_fiscal_rules_type ON public.fiscal_rules(rule_type);
CREATE INDEX idx_fiscal_conventions_countries ON public.fiscal_conventions(country_a_id, country_b_id);
CREATE INDEX idx_fiscal_special_regimes_country ON public.fiscal_special_regimes(country_id);
CREATE INDEX idx_fiscal_special_regimes_active ON public.fiscal_special_regimes(is_active) WHERE is_active = true;

-- Triggers
CREATE TRIGGER update_fiscal_rules_updated_at
  BEFORE UPDATE ON public.fiscal_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fiscal_conventions_updated_at
  BEFORE UPDATE ON public.fiscal_conventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fiscal_special_regimes_updated_at
  BEFORE UPDATE ON public.fiscal_special_regimes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample fiscal rules for France
INSERT INTO public.fiscal_rules (country_id, rule_type, brackets, currency, source_url, notes_i18n)
VALUES (
  'france',
  'income_tax'::public.fiscal_rule_type,
  '[
    {"min": 0, "max": 11294, "rate": 0},
    {"min": 11295, "max": 28797, "rate": 0.11},
    {"min": 28798, "max": 82341, "rate": 0.30},
    {"min": 82342, "max": 177106, "rate": 0.41},
    {"min": 177107, "max": null, "rate": 0.45}
  ]'::jsonb,
  'EUR',
  'https://www.impots.gouv.fr',
  '{"fr": "Barème progressif 2024", "en": "2024 progressive scale"}'::jsonb
);

INSERT INTO public.fiscal_rules (country_id, rule_type, brackets, currency, notes_i18n)
VALUES (
  'france',
  'social_contributions'::public.fiscal_rule_type,
  '[{"min": 0, "max": null, "rate": 0.22}]'::jsonb,
  'EUR',
  '{"fr": "Cotisations salariales moyennes", "en": "Average employee contributions"}'::jsonb
);

-- Insert sample for Portugal
INSERT INTO public.fiscal_rules (country_id, rule_type, brackets, currency, source_url, notes_i18n)
VALUES (
  'portugal',
  'income_tax'::public.fiscal_rule_type,
  '[
    {"min": 0, "max": 7703, "rate": 0.1325},
    {"min": 7704, "max": 11623, "rate": 0.18},
    {"min": 11624, "max": 16472, "rate": 0.23},
    {"min": 16473, "max": 21321, "rate": 0.26},
    {"min": 21322, "max": 27146, "rate": 0.3275},
    {"min": 27147, "max": 39791, "rate": 0.37},
    {"min": 39792, "max": 51997, "rate": 0.435},
    {"min": 51998, "max": 81199, "rate": 0.45},
    {"min": 81200, "max": null, "rate": 0.48}
  ]'::jsonb,
  'EUR',
  'https://info.portaldasfinancas.gov.pt',
  '{"fr": "Barème IRS 2024", "en": "2024 IRS scale"}'::jsonb
);

-- Insert NHR regime for Portugal
INSERT INTO public.fiscal_special_regimes (country_id, regime_name, conditions, benefits, duration_years, is_active, description_i18n, source_url)
VALUES (
  'portugal',
  'Non-Habitual Resident (NHR)',
  '{
    "residency": "Must become tax resident in Portugal",
    "previous_residency": "Not been tax resident in Portugal for 5 years prior",
    "high_value_activities": "Optional: work in high-value activity list"
  }'::jsonb,
  '{
    "foreign_income": "Exemption on most foreign-source income",
    "pension": "10% flat rate on foreign pensions",
    "high_value_work": "20% flat rate for eligible professions"
  }'::jsonb,
  10,
  true,
  '{"fr": "Régime fiscal avantageux pour les nouveaux résidents", "en": "Advantageous tax regime for new residents"}'::jsonb,
  'https://info.portaldasfinancas.gov.pt'
);

-- Insert sample for Switzerland
INSERT INTO public.fiscal_rules (country_id, rule_type, brackets, currency, notes_i18n)
VALUES (
  'switzerland',
  'income_tax'::public.fiscal_rule_type,
  '[
    {"min": 0, "max": 14500, "rate": 0},
    {"min": 14501, "max": 31600, "rate": 0.0077},
    {"min": 31601, "max": 41400, "rate": 0.0088},
    {"min": 41401, "max": 55200, "rate": 0.0264},
    {"min": 55201, "max": 72500, "rate": 0.0297},
    {"min": 72501, "max": 78100, "rate": 0.055},
    {"min": 78101, "max": 103600, "rate": 0.066},
    {"min": 103601, "max": 134600, "rate": 0.088},
    {"min": 134601, "max": 176000, "rate": 0.099},
    {"min": 176001, "max": 755200, "rate": 0.11},
    {"min": 755201, "max": null, "rate": 0.115}
  ]'::jsonb,
  'CHF',
  '{"fr": "Impôt fédéral direct - les cantons ajoutent leur propre taux", "en": "Federal direct tax - cantons add their own rates"}'::jsonb
);

-- Insert Forfait for Switzerland
INSERT INTO public.fiscal_special_regimes (country_id, regime_name, conditions, benefits, duration_years, is_active, description_i18n)
VALUES (
  'switzerland',
  'Imposition forfaitaire',
  '{
    "nationality": "Non-Swiss national",
    "residency": "First-time or returning after 10+ years",
    "no_work": "Cannot work in Switzerland"
  }'::jsonb,
  '{
    "calculation": "Tax based on living expenses, not income",
    "minimum": "Minimum taxable base varies by canton (400k-1M CHF)"
  }'::jsonb,
  NULL,
  true,
  '{"fr": "Imposition sur la dépense pour les résidents fortunés", "en": "Expenditure-based taxation for wealthy residents"}'::jsonb
);

-- Insert for Spain (Beckham Law)
INSERT INTO public.fiscal_special_regimes (country_id, regime_name, conditions, benefits, duration_years, is_active, description_i18n)
VALUES (
  'spain',
  'Ley Beckham (Régimen especial)',
  '{
    "employment": "Work contract with Spanish employer or posted",
    "previous_residency": "Not been tax resident in Spain for 5 years prior",
    "income_cap": "Annual income up to 600,000€ eligible"
  }'::jsonb,
  '{
    "flat_rate": "24% flat rate on Spanish-source income up to 600k€",
    "foreign_income": "Only Spanish-source income taxed",
    "wealth_tax": "Exemption from wealth tax on foreign assets"
  }'::jsonb,
  6,
  true,
  '{"fr": "Régime fiscal favorable pour les impatriés", "en": "Favorable tax regime for inpatriates"}'::jsonb
);

INSERT INTO public.fiscal_rules (country_id, rule_type, brackets, currency, notes_i18n)
VALUES (
  'spain',
  'income_tax'::public.fiscal_rule_type,
  '[
    {"min": 0, "max": 12450, "rate": 0.19},
    {"min": 12451, "max": 20200, "rate": 0.24},
    {"min": 20201, "max": 35200, "rate": 0.30},
    {"min": 35201, "max": 60000, "rate": 0.37},
    {"min": 60001, "max": 300000, "rate": 0.45},
    {"min": 300001, "max": null, "rate": 0.47}
  ]'::jsonb,
  'EUR',
  '{"fr": "Barème IRPF 2024 (national + régional moyen)", "en": "2024 IRPF scale (national + average regional)"}'::jsonb
);