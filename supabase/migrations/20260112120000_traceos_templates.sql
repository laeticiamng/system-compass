-- Create TraceOS decision templates table
CREATE TABLE IF NOT EXISTS public.traceos_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('rh', 'it', 'strategy', 'finance', 'legal', 'operations')),
  icon TEXT NOT NULL,
  title_key TEXT NOT NULL,
  title_default TEXT NOT NULL,
  description_key TEXT NOT NULL,
  description_default TEXT NOT NULL,
  template_title_key TEXT NOT NULL,
  template_title_default TEXT NOT NULL,
  context_key TEXT NOT NULL,
  context_default TEXT NOT NULL,
  main_hypothesis_key TEXT NOT NULL,
  main_hypothesis_default TEXT NOT NULL,
  alternative_hypotheses JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
  scope_key TEXT NOT NULL,
  scope_default TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_traceos_templates_category ON public.traceos_templates(category);
CREATE INDEX IF NOT EXISTS idx_traceos_templates_active ON public.traceos_templates(is_active);

ALTER TABLE public.traceos_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read TraceOS templates"
  ON public.traceos_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage TraceOS templates"
  ON public.traceos_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TRIGGER update_traceos_templates_updated_at
  BEFORE UPDATE ON public.traceos_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.traceos_templates (
  template_key,
  category,
  icon,
  title_key,
  title_default,
  description_key,
  description_default,
  template_title_key,
  template_title_default,
  context_key,
  context_default,
  main_hypothesis_key,
  main_hypothesis_default,
  alternative_hypotheses,
  constraints,
  scope_key,
  scope_default,
  sort_order
) VALUES
(
  'rh-recruitment',
  'rh',
  'Users',
  'traceos.templates.items.rh-recruitment.title',
  'Recrutement stratégique',
  'traceos.templates.items.rh-recruitment.description',
  'Décision de recrutement pour un poste clé',
  'traceos.templates.items.rh-recruitment.template.title',
  'Recrutement [Poste]',
  'traceos.templates.items.rh-recruitment.template.context',
  'Besoin identifié suite à [croissance/départ/réorganisation]. Impact sur [équipe/projet].',
  'traceos.templates.items.rh-recruitment.template.mainHypothesis',
  'Recruter un profil [junior/senior] avec expertise en [domaine]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.rh-recruitment.template.alternativeHypotheses.0', 'default', 'Promotion interne d''un collaborateur existant'),
    jsonb_build_object('key', 'traceos.templates.items.rh-recruitment.template.alternativeHypotheses.1', 'default', 'Externalisation de la fonction'),
    jsonb_build_object('key', 'traceos.templates.items.rh-recruitment.template.alternativeHypotheses.2', 'default', 'Réorganisation des responsabilités actuelles')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.rh-recruitment.template.constraints.0', 'default', 'Budget alloué : [montant]'),
    jsonb_build_object('key', 'traceos.templates.items.rh-recruitment.template.constraints.1', 'default', 'Délai de recrutement : [durée]'),
    jsonb_build_object('key', 'traceos.templates.items.rh-recruitment.template.constraints.2', 'default', 'Disponibilité du manager pour intégration')
  ),
  'traceos.templates.items.rh-recruitment.template.scope',
  'RH / Direction',
  1
),
(
  'rh-reorganization',
  'rh',
  'Building2',
  'traceos.templates.items.rh-reorganization.title',
  'Réorganisation d''équipe',
  'traceos.templates.items.rh-reorganization.description',
  'Restructuration ou fusion d''équipes',
  'traceos.templates.items.rh-reorganization.template.title',
  'Réorganisation [Département]',
  'traceos.templates.items.rh-reorganization.template.context',
  'Contexte de [transformation/optimisation/croissance] nécessitant une revue de l''organisation.',
  'traceos.templates.items.rh-reorganization.template.mainHypothesis',
  'Fusionner les équipes [A] et [B] sous une direction unique',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.rh-reorganization.template.alternativeHypotheses.0', 'default', 'Maintenir la structure actuelle avec coordination renforcée'),
    jsonb_build_object('key', 'traceos.templates.items.rh-reorganization.template.alternativeHypotheses.1', 'default', 'Créer une structure matricielle'),
    jsonb_build_object('key', 'traceos.templates.items.rh-reorganization.template.alternativeHypotheses.2', 'default', 'Externaliser certaines fonctions')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.rh-reorganization.template.constraints.0', 'default', 'Préserver les compétences clés'),
    jsonb_build_object('key', 'traceos.templates.items.rh-reorganization.template.constraints.1', 'default', 'Respecter les obligations sociales'),
    jsonb_build_object('key', 'traceos.templates.items.rh-reorganization.template.constraints.2', 'default', 'Limiter l''impact sur les projets en cours')
  ),
  'traceos.templates.items.rh-reorganization.template.scope',
  'Direction Générale',
  2
),
(
  'it-migration',
  'it',
  'Monitor',
  'traceos.templates.items.it-migration.title',
  'Migration technologique',
  'traceos.templates.items.it-migration.description',
  'Changement d''infrastructure ou de stack',
  'traceos.templates.items.it-migration.template.title',
  'Migration vers [Technologie/Plateforme]',
  'traceos.templates.items.it-migration.template.context',
  'Obsolescence de [système actuel] / Besoin de [scalabilité/performance/sécurité].',
  'traceos.templates.items.it-migration.template.mainHypothesis',
  'Migrer vers [nouvelle solution] avec approche [big bang/progressive]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.alternativeHypotheses.0', 'default', 'Moderniser le système existant'),
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.alternativeHypotheses.1', 'default', 'Adopter une solution hybride'),
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.alternativeHypotheses.2', 'default', 'Externaliser vers un service managé')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.constraints.0', 'default', 'Budget projet : [montant]'),
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.constraints.1', 'default', 'Fenêtre de migration : [période]'),
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.constraints.2', 'default', 'Continuité de service requise'),
    jsonb_build_object('key', 'traceos.templates.items.it-migration.template.constraints.3', 'default', 'Formation des équipes')
  ),
  'traceos.templates.items.it-migration.template.scope',
  'DSI / Direction',
  3
),
(
  'it-security',
  'it',
  'Shield',
  'traceos.templates.items.it-security.title',
  'Politique de sécurité',
  'traceos.templates.items.it-security.description',
  'Renforcement ou révision sécuritaire',
  'traceos.templates.items.it-security.template.title',
  'Renforcement sécurité [Périmètre]',
  'traceos.templates.items.it-security.template.context',
  'Suite à [audit/incident/nouvelle réglementation], nécessité de renforcer la posture sécurité.',
  'traceos.templates.items.it-security.template.mainHypothesis',
  'Implémenter [solution/politique] pour adresser [risque identifié]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.it-security.template.alternativeHypotheses.0', 'default', 'Accepter le risque avec mesures compensatoires'),
    jsonb_build_object('key', 'traceos.templates.items.it-security.template.alternativeHypotheses.1', 'default', 'Transférer le risque (assurance)'),
    jsonb_build_object('key', 'traceos.templates.items.it-security.template.alternativeHypotheses.2', 'default', 'Éviter le risque en abandonnant l''activité concernée')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.it-security.template.constraints.0', 'default', 'Conformité réglementaire (RGPD, NIS2...)'),
    jsonb_build_object('key', 'traceos.templates.items.it-security.template.constraints.1', 'default', 'Impact utilisateurs acceptable'),
    jsonb_build_object('key', 'traceos.templates.items.it-security.template.constraints.2', 'default', 'Budget sécurité disponible')
  ),
  'traceos.templates.items.it-security.template.scope',
  'RSSI / DSI',
  4
),
(
  'strategy-market',
  'strategy',
  'Target',
  'traceos.templates.items.strategy-market.title',
  'Entrée sur un marché',
  'traceos.templates.items.strategy-market.description',
  'Expansion géographique ou sectorielle',
  'traceos.templates.items.strategy-market.template.title',
  'Expansion [Marché/Segment]',
  'traceos.templates.items.strategy-market.template.context',
  'Opportunité identifiée sur [marché]. Potentiel estimé à [valeur]. Concurrence : [analyse].',
  'traceos.templates.items.strategy-market.template.mainHypothesis',
  'Lancer une offre [produit/service] sur [marché] via [canal]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.alternativeHypotheses.0', 'default', 'Partenariat avec acteur local établi'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.alternativeHypotheses.1', 'default', 'Acquisition d''un concurrent local'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.alternativeHypotheses.2', 'default', 'Test en mode pilote avant déploiement')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.constraints.0', 'default', 'Investissement initial : [montant]'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.constraints.1', 'default', 'ROI attendu : [horizon]'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.constraints.2', 'default', 'Ressources humaines disponibles'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-market.template.constraints.3', 'default', 'Risques réglementaires locaux')
  ),
  'traceos.templates.items.strategy-market.template.scope',
  'Comité Stratégique',
  5
),
(
  'strategy-pivot',
  'strategy',
  'Briefcase',
  'traceos.templates.items.strategy-pivot.title',
  'Pivot stratégique',
  'traceos.templates.items.strategy-pivot.description',
  'Réorientation du modèle d''affaires',
  'traceos.templates.items.strategy-pivot.template.title',
  'Pivot vers [Nouveau modèle]',
  'traceos.templates.items.strategy-pivot.template.context',
  'Évolution du marché nécessitant une adaptation. [Menaces/Opportunités] identifiées.',
  'traceos.templates.items.strategy-pivot.template.mainHypothesis',
  'Réorienter l''offre vers [nouveau positionnement] en [horizon]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.strategy-pivot.template.alternativeHypotheses.0', 'default', 'Diversification de l''offre actuelle'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-pivot.template.alternativeHypotheses.1', 'default', 'Consolidation sur le cœur de métier'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-pivot.template.alternativeHypotheses.2', 'default', 'Recherche de nouveaux canaux de distribution')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.strategy-pivot.template.constraints.0', 'default', 'Préserver la base clients existante'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-pivot.template.constraints.1', 'default', 'Capacité de financement de la transition'),
    jsonb_build_object('key', 'traceos.templates.items.strategy-pivot.template.constraints.2', 'default', 'Compétences à acquérir ou développer')
  ),
  'traceos.templates.items.strategy-pivot.template.scope',
  'Direction Générale / Board',
  6
),
(
  'finance-investment',
  'finance',
  'DollarSign',
  'traceos.templates.items.finance-investment.title',
  'Décision d''investissement',
  'traceos.templates.items.finance-investment.description',
  'Allocation de capital importante',
  'traceos.templates.items.finance-investment.template.title',
  'Investissement [Projet/Asset]',
  'traceos.templates.items.finance-investment.template.context',
  'Opportunité d''investissement de [montant] dans [projet]. VAN estimée : [valeur]. TRI : [%].',
  'traceos.templates.items.finance-investment.template.mainHypothesis',
  'Approuver l''investissement avec [conditions]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.alternativeHypotheses.0', 'default', 'Reporter l''investissement à [date]'),
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.alternativeHypotheses.1', 'default', 'Investissement partiel en phase 1'),
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.alternativeHypotheses.2', 'default', 'Recherche de co-investisseurs')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.constraints.0', 'default', 'Capacité de financement disponible'),
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.constraints.1', 'default', 'Impact sur les ratios financiers'),
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.constraints.2', 'default', 'Cohérence avec la stratégie groupe'),
    jsonb_build_object('key', 'traceos.templates.items.finance-investment.template.constraints.3', 'default', 'Risques de marché')
  ),
  'traceos.templates.items.finance-investment.template.scope',
  'CFO / Comité Financier',
  7
),
(
  'finance-cost',
  'finance',
  'Scale',
  'traceos.templates.items.finance-cost.title',
  'Optimisation des coûts',
  'traceos.templates.items.finance-cost.description',
  'Plan de réduction ou rationalisation',
  'traceos.templates.items.finance-cost.template.title',
  'Plan d''optimisation [Périmètre]',
  'traceos.templates.items.finance-cost.template.context',
  'Objectif de réduction de [X%] des coûts [opérationnels/structurels] sur [horizon].',
  'traceos.templates.items.finance-cost.template.mainHypothesis',
  'Implémenter le plan [A] ciblant [postes de coûts]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.alternativeHypotheses.0', 'default', 'Approche progressive par phases'),
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.alternativeHypotheses.1', 'default', 'Focus sur l''amélioration des revenus plutôt que réduction'),
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.alternativeHypotheses.2', 'default', 'Externalisation de fonctions non-core')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.constraints.0', 'default', 'Maintenir la qualité de service'),
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.constraints.1', 'default', 'Respecter les engagements contractuels'),
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.constraints.2', 'default', 'Préserver les talents clés'),
    jsonb_build_object('key', 'traceos.templates.items.finance-cost.template.constraints.3', 'default', 'Timeline de mise en œuvre')
  ),
  'traceos.templates.items.finance-cost.template.scope',
  'Direction Financière',
  8
),
(
  'legal-compliance',
  'legal',
  'FileText',
  'traceos.templates.items.legal-compliance.title',
  'Mise en conformité',
  'traceos.templates.items.legal-compliance.description',
  'Adaptation réglementaire',
  'traceos.templates.items.legal-compliance.template.title',
  'Conformité [Réglementation]',
  'traceos.templates.items.legal-compliance.template.context',
  'Nouvelle réglementation [nom] applicable au [date]. Écart de conformité identifié sur [périmètre].',
  'traceos.templates.items.legal-compliance.template.mainHypothesis',
  'Plan de mise en conformité en [X] phases d''ici [date]',
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.alternativeHypotheses.0', 'default', 'Demande de dérogation ou délai supplémentaire'),
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.alternativeHypotheses.1', 'default', 'Externalisation de la fonction concernée'),
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.alternativeHypotheses.2', 'default', 'Cessation de l''activité non-conforme')
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.constraints.0', 'default', 'Deadline réglementaire non négociable'),
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.constraints.1', 'default', 'Sanctions en cas de non-conformité'),
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.constraints.2', 'default', 'Budget compliance limité'),
    jsonb_build_object('key', 'traceos.templates.items.legal-compliance.template.constraints.3', 'default', 'Ressources expertes requises')
  ),
  'traceos.templates.items.legal-compliance.template.scope',
  'Direction Juridique',
  9
);
