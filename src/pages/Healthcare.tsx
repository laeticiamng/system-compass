import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Globe, Shield, Heart, FileText, GraduationCap, CheckCircle2 } from 'lucide-react';
import { HealthcareCountryOverview } from '@/components/healthcare/HealthcareCountryOverview';
import { useAllHealthcareCountries } from '@/hooks/useHealthcareData';
import { useCountries } from '@/lib/countries-store';

const HEALTHCARE_COUNTRIES = [
  { id: 'switzerland', name: 'Suisse', flag: '🇨🇭' },
  { id: 'france', name: 'France', flag: '🇫🇷' },
  { id: 'germany', name: 'Allemagne', flag: '🇩🇪' },
  { id: 'belgium', name: 'Belgique', flag: '🇧🇪' },
];

export default function Healthcare() {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState('switzerland');
  const { data: healthcareCountries } = useAllHealthcareCountries();

  const country = HEALTHCARE_COUNTRIES.find(c => c.id === selectedCountry) || HEALTHCARE_COUNTRIES[0];

  return (
    <>
      <Helmet>
        <title>{t('healthcare.seo.title', 'Parcours Professionnel de Santé — Compass')}</title>
        <meta name="description" content={t('healthcare.seo.description', 'Guide complet pour les professionnels de santé : reconnaissance de diplôme, autorisations d\'exercer, protection sociale et checklist documents par pays.')} />
      </Helmet>

      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold">
            {t('healthcare.hero.title', 'Parcours Professionnel de Santé')}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('healthcare.hero.subtitle', 'Reconnaissance de diplôme, autorisations d\'exercer, protection sociale — tout ce qu\'il faut savoir pour exercer dans un nouveau pays.')}
          </p>

          {/* Quick stats */}
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { icon: Globe, label: `${healthcareCountries?.length || 4} pays couverts`, color: 'text-primary' },
              { icon: CheckCircle2, label: 'Données vérifiées', color: 'text-emerald-500' },
              { icon: FileText, label: 'Checklists personnalisées', color: 'text-primary' },
            ].map((stat, i) => (
              <Badge key={i} variant="outline" className="gap-1.5 py-1.5 px-3">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                {stat.label}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Country selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium shrink-0">
                  {t('healthcare.selectCountry', 'Pays de destination')}
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTHCARE_COUNTRIES.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Country healthcare overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HealthcareCountryOverview 
            countryId={selectedCountry} 
            countryName={country.name} 
          />
        </motion.div>
      </div>
    </>
  );
}
