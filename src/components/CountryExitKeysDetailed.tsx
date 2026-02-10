/**
 * CountryExitKeysDetailed - Enhanced "Vos clés de sortie" section
 * for each country detail page.
 *
 * Shows: visa type, average delay, cost, difficulty (1-5 stars),
 * checklist of steps — all in accordion format.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Country } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Key, Star, Clock, DollarSign, FileText, ChevronRight,
  Plane, Briefcase, Building2, GraduationCap, Heart
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface VisaStrategy {
  id: string;
  titleKey: string;
  titleDefault: string;
  icon: typeof Plane;
  type: string;
  delay: string;
  cost: string;
  difficulty: number; // 1-5
  descriptionKey: string;
  descriptionDefault: string;
  checklist: { labelKey: string; labelDefault: string }[];
}

// ============================================================
// VISA STRATEGIES PER COUNTRY
// ============================================================

function getVisaStrategies(country: Country): VisaStrategy[] {
  const strategies: VisaStrategy[] = [];

  // Work visa
  if (country.visa.workVisa !== 'difficult') {
    strategies.push({
      id: `${country.id}-work`,
      titleKey: 'exitKeys.detailed.workVisa',
      titleDefault: 'Visa de travail',
      icon: Briefcase,
      type: country.visa.workVisa === 'easy' ? 'Facile' : 'Modéré',
      delay: country.visa.workVisa === 'easy' ? '1-3 mois' : '3-6 mois',
      cost: country.costOfLiving.index <= 40 ? '200-500 €' : country.costOfLiving.index <= 70 ? '500-1 500 €' : '1 500-3 000 €',
      difficulty: country.visa.workVisa === 'easy' ? 2 : 3,
      descriptionKey: 'exitKeys.detailed.workVisaDesc',
      descriptionDefault: `Visa de travail pour ${country.name}. Nécessite une offre d'emploi d'un employeur local.`,
      checklist: [
        { labelKey: 'exitKeys.checklist.passport', labelDefault: 'Passeport valide (6+ mois)' },
        { labelKey: 'exitKeys.checklist.jobOffer', labelDefault: 'Offre d\'emploi d\'un employeur local' },
        { labelKey: 'exitKeys.checklist.cv', labelDefault: 'CV et lettre de motivation traduits' },
        { labelKey: 'exitKeys.checklist.criminal', labelDefault: 'Extrait de casier judiciaire' },
        { labelKey: 'exitKeys.checklist.medical', labelDefault: 'Certificat médical' },
        { labelKey: 'exitKeys.checklist.application', labelDefault: 'Formulaire de demande complété' },
      ],
    });
  }

  // Startup visa
  if (country.visa.startupVisa) {
    strategies.push({
      id: `${country.id}-startup`,
      titleKey: 'exitKeys.detailed.startupVisa',
      titleDefault: 'Visa entrepreneur / startup',
      icon: Building2,
      type: 'Entrepreneur',
      delay: '2-6 mois',
      cost: country.costOfLiving.index <= 50 ? '500-2 000 €' : '2 000-5 000 €',
      difficulty: 3,
      descriptionKey: 'exitKeys.detailed.startupVisaDesc',
      descriptionDefault: `Programme startup visa dans ${country.name}. Idéal pour les entrepreneurs innovants.`,
      checklist: [
        { labelKey: 'exitKeys.checklist.passport', labelDefault: 'Passeport valide (6+ mois)' },
        { labelKey: 'exitKeys.checklist.businessPlan', labelDefault: 'Business plan détaillé' },
        { labelKey: 'exitKeys.checklist.funding', labelDefault: 'Preuve de financement / fonds propres' },
        { labelKey: 'exitKeys.checklist.incorporation', labelDefault: 'Préparer l\'immatriculation de société' },
        { labelKey: 'exitKeys.checklist.insurance', labelDefault: 'Assurance santé internationale' },
        { labelKey: 'exitKeys.checklist.address', labelDefault: 'Adresse de domiciliation prévue' },
      ],
    });
  }

  // Digital nomad visa
  if (country.visa.digitalNomadVisa) {
    strategies.push({
      id: `${country.id}-nomad`,
      titleKey: 'exitKeys.detailed.nomadVisa',
      titleDefault: 'Visa digital nomade',
      icon: Plane,
      type: 'Nomade',
      delay: '2-8 semaines',
      cost: '250-1 000 €',
      difficulty: 2,
      descriptionKey: 'exitKeys.detailed.nomadVisaDesc',
      descriptionDefault: `Visa pour télétravailleurs dans ${country.name}. Permet de travailler à distance.`,
      checklist: [
        { labelKey: 'exitKeys.checklist.passport', labelDefault: 'Passeport valide (6+ mois)' },
        { labelKey: 'exitKeys.checklist.remoteProof', labelDefault: 'Preuve d\'emploi ou revenus à distance' },
        { labelKey: 'exitKeys.checklist.incomeProof', labelDefault: 'Justificatif de revenus minimum' },
        { labelKey: 'exitKeys.checklist.insurance', labelDefault: 'Assurance santé internationale' },
        { labelKey: 'exitKeys.checklist.accommodation', labelDefault: 'Preuve d\'hébergement' },
      ],
    });
  }

  // Investment visa
  if (country.visa.investmentVisa) {
    const minInvest = country.visa.investmentMinimum;
    strategies.push({
      id: `${country.id}-invest`,
      titleKey: 'exitKeys.detailed.investVisa',
      titleDefault: 'Visa investisseur',
      icon: DollarSign,
      type: 'Investisseur',
      delay: '3-12 mois',
      cost: minInvest ? `${(minInvest / 1000).toFixed(0)}k € minimum` : '50 000+ €',
      difficulty: 4,
      descriptionKey: 'exitKeys.detailed.investVisaDesc',
      descriptionDefault: `Visa investisseur dans ${country.name}. Nécessite un investissement local significatif.`,
      checklist: [
        { labelKey: 'exitKeys.checklist.passport', labelDefault: 'Passeport valide (6+ mois)' },
        { labelKey: 'exitKeys.checklist.investPlan', labelDefault: 'Plan d\'investissement détaillé' },
        { labelKey: 'exitKeys.checklist.fundingProof', labelDefault: 'Preuve d\'origine des fonds' },
        { labelKey: 'exitKeys.checklist.criminal', labelDefault: 'Extrait de casier judiciaire' },
        { labelKey: 'exitKeys.checklist.dueDiligence', labelDefault: 'Due diligence complète' },
        { labelKey: 'exitKeys.checklist.legalCounsel', labelDefault: 'Avocat en droit de l\'immigration' },
        { labelKey: 'exitKeys.checklist.bankAccount', labelDefault: 'Ouverture de compte bancaire local' },
      ],
    });
  }

  // Citizenship path (always show)
  strategies.push({
    id: `${country.id}-citizenship`,
    titleKey: 'exitKeys.detailed.citizenship',
    titleDefault: 'Chemin vers la citoyenneté',
    icon: GraduationCap,
    type: 'Naturalisation',
    delay: `${country.visa.citizenshipYears} ans`,
    cost: 'Variable',
    difficulty: country.visa.citizenshipYears <= 3 ? 3 : country.visa.citizenshipYears <= 5 ? 4 : 5,
    descriptionKey: 'exitKeys.detailed.citizenshipDesc',
    descriptionDefault: `Parcours vers la citoyenneté de ${country.name} (${country.visa.citizenshipYears} ans de résidence).`,
    checklist: [
      { labelKey: 'exitKeys.checklist.residence', labelDefault: `Résider au moins ${country.visa.citizenshipYears} ans dans le pays` },
      { labelKey: 'exitKeys.checklist.languageTest', labelDefault: 'Test de langue (si requis)' },
      { labelKey: 'exitKeys.checklist.civicsTest', labelDefault: 'Test de connaissances civiques' },
      { labelKey: 'exitKeys.checklist.taxCompliance', labelDefault: 'Conformité fiscale sur toute la période' },
      { labelKey: 'exitKeys.checklist.noConvictions', labelDefault: 'Casier judiciaire vierge' },
      { labelKey: 'exitKeys.checklist.integration', labelDefault: 'Preuve d\'intégration dans la société' },
    ],
  });

  // Family/spouse visa if applicable
  if (country.visa.workVisa !== 'difficult') {
    strategies.push({
      id: `${country.id}-family`,
      titleKey: 'exitKeys.detailed.familyVisa',
      titleDefault: 'Regroupement familial',
      icon: Heart,
      type: 'Famille',
      delay: '3-9 mois',
      cost: '300-1 500 €',
      difficulty: 3,
      descriptionKey: 'exitKeys.detailed.familyVisaDesc',
      descriptionDefault: `Visa de regroupement familial dans ${country.name}.`,
      checklist: [
        { labelKey: 'exitKeys.checklist.passport', labelDefault: 'Passeport valide (6+ mois)' },
        { labelKey: 'exitKeys.checklist.familyProof', labelDefault: 'Preuves de liens familiaux (acte de mariage, etc.)' },
        { labelKey: 'exitKeys.checklist.sponsorIncome', labelDefault: 'Justificatif de revenus du parrain' },
        { labelKey: 'exitKeys.checklist.accommodation', labelDefault: 'Preuve d\'hébergement adéquat' },
        { labelKey: 'exitKeys.checklist.insurance', labelDefault: 'Assurance santé' },
      ],
    });
  }

  return strategies;
}

// ============================================================
// DIFFICULTY STARS
// ============================================================

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-3.5 h-3.5',
            star <= level
              ? level <= 2
                ? 'fill-emerald-500 text-emerald-500'
                : level <= 3
                  ? 'fill-amber-500 text-amber-500'
                  : 'fill-rose-500 text-rose-500'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function CountryExitKeysDetailed({ country }: { country: Country }) {
  const { t } = useTranslation();

  const strategies = useMemo(() => getVisaStrategies(country), [country]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('exitKeys.detailed.title', 'Vos clés de sortie')}
          </CardTitle>
          <Link to="/exit-keys">
            <Button variant="ghost" size="sm" className="gap-1">
              {t('exitKeys.detailed.seeAllStrategies', 'Toutes les stratégies')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          {t(
            'exitKeys.detailed.subtitle',
            'Options de visa et parcours de relocalisation adaptés à votre profil'
          )}
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <AccordionItem
                key={strategy.id}
                value={strategy.id}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">
                        {t(strategy.titleKey, strategy.titleDefault)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {strategy.type}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {strategy.delay}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          {strategy.cost}
                        </span>
                      </div>
                    </div>
                    <div className="mr-4 text-right">
                      <DifficultyStars level={strategy.difficulty} />
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('exitKeys.detailed.difficulty', 'Difficulté')}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(strategy.descriptionKey, strategy.descriptionDefault)}
                  </p>

                  {/* Checklist */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {t('exitKeys.detailed.checklist', 'Checklist des démarches')}
                    </h5>
                    {strategy.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-accent/30">
                        <Checkbox id={`${strategy.id}-check-${idx}`} />
                        <label
                          htmlFor={`${strategy.id}-check-${idx}`}
                          className="text-sm cursor-pointer leading-relaxed"
                        >
                          {t(item.labelKey, item.labelDefault)}
                        </label>
                      </div>
                    ))}
                  </div>

                  {country.visa.notes && (
                    <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/30 rounded">
                      {country.visa.notes}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          {t(
            'exitKeys.detailed.disclaimer',
            'À titre indicatif. Consultez un avocat en immigration pour des conseils personnalisés.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
