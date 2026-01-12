-- Table to store governance map stakeholders per user and country
CREATE TABLE public.governance_stakeholders (
  user_id UUID NOT NULL,
  country_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, country_id)
);

-- Enable RLS
ALTER TABLE public.governance_stakeholders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their governance stakeholders"
  ON public.governance_stakeholders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their governance stakeholders"
  ON public.governance_stakeholders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their governance stakeholders"
  ON public.governance_stakeholders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their governance stakeholders"
  ON public.governance_stakeholders FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_governance_stakeholders_updated_at
  BEFORE UPDATE ON public.governance_stakeholders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_governance_stakeholders_user_id ON public.governance_stakeholders(user_id);
CREATE INDEX idx_governance_stakeholders_country_id ON public.governance_stakeholders(country_id);
