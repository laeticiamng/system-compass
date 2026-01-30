/**
 * LocalExpertFinder - Sélecteur expert/bureau local (inspiré Coface)
 * Facilite la mise en relation avec des partenaires locaux
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Building2, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  MessageSquare,
  Calendar,
  
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LocalExpert {
  id: string;
  type: 'expert' | 'office' | 'partner';
  name: string;
  country: string;
  countryCode: string;
  specialties: string[];
  languages: string[];
  rating: number;
  verified: boolean;
  available: boolean;
}

// Mock data - in production from Supabase
const localExperts: LocalExpert[] = [
  {
    id: 'exp-1',
    type: 'expert',
    name: 'Sophie Martin',
    country: 'Portugal',
    countryCode: 'PT',
    specialties: ['Expatriation', 'Fiscalité', 'Immobilier'],
    languages: ['Français', 'Portugais', 'Anglais'],
    rating: 4.9,
    verified: true,
    available: true
  },
  {
    id: 'exp-2',
    type: 'partner',
    name: 'Dubai Business Hub',
    country: 'Émirats Arabes Unis',
    countryCode: 'AE',
    specialties: ['Création entreprise', 'Visa', 'Golden Visa'],
    languages: ['Français', 'Anglais', 'Arabe'],
    rating: 4.7,
    verified: true,
    available: true
  },
  {
    id: 'exp-3',
    type: 'office',
    name: 'Swiss Expat Services',
    country: 'Suisse',
    countryCode: 'CH',
    specialties: ['Permis travail', 'Assurances', 'Fiscalité'],
    languages: ['Français', 'Allemand', 'Anglais'],
    rating: 4.8,
    verified: true,
    available: true
  },
  {
    id: 'exp-4',
    type: 'expert',
    name: 'Carlos Rodriguez',
    country: 'Espagne',
    countryCode: 'ES',
    specialties: ['Retraite', 'Immobilier', 'Vie quotidienne'],
    languages: ['Français', 'Espagnol', 'Anglais'],
    rating: 4.6,
    verified: true,
    available: false
  }
];

const countries = [
  { code: 'PT', name: 'Portugal' },
  { code: 'AE', name: 'Émirats Arabes Unis' },
  { code: 'CH', name: 'Suisse' },
  { code: 'ES', name: 'Espagne' },
  { code: 'TH', name: 'Thaïlande' },
  { code: 'SG', name: 'Singapour' }
];

const typeConfig = {
  expert: { icon: Users, label: 'Expert indépendant', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  office: { icon: Building2, label: 'Bureau local', color: 'text-primary', bg: 'bg-primary/10' },
  partner: { icon: Globe, label: 'Partenaire certifié', color: 'text-amber-500', bg: 'bg-amber-500/10' }
};

const getFlagEmoji = (iso2: string) => {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

export function LocalExpertFinder() {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredExperts = localExperts.filter(expert => {
    if (selectedCountry && expert.countryCode !== selectedCountry) return false;
    if (selectedType !== 'all' && expert.type !== selectedType) return false;
    return true;
  });

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              {t('experts.badge', 'Réseau international')}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('experts.finderTitle', 'Trouvez un expert local')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('experts.finderSubtitle', 'Connectez-vous avec des professionnels vérifiés dans votre pays de destination.')}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full sm:w-64 h-12 rounded-full">
              <SelectValue placeholder={t('experts.selectCountry', 'Sélectionnez un pays')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('experts.allCountries', 'Tous les pays')}
              </SelectItem>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.code}>
                  {getFlagEmoji(country.code)} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="rounded-full"
            >
              {t('experts.all', 'Tous')}
            </Button>
            <Button
              variant={selectedType === 'expert' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('expert')}
              className="rounded-full gap-1"
            >
              <Users className="w-3 h-3" />
              {t('experts.typeExpert', 'Experts')}
            </Button>
            <Button
              variant={selectedType === 'partner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('partner')}
              className="rounded-full gap-1"
            >
              <Globe className="w-3 h-3" />
              {t('experts.typePartner', 'Partenaires')}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredExperts.map((expert, index) => {
              const config = typeConfig[expert.type];
              const TypeIcon = config.icon;

              return (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className={cn(
                    "h-full hover:border-primary/30 transition-all group cursor-pointer",
                    !expert.available && "opacity-60"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className={cn(
                          "p-2 rounded-lg",
                          config.bg
                        )}>
                          <TypeIcon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div className="flex items-center gap-1">
                          {expert.verified && (
                            <Badge variant="outline" className="text-xs gap-1 border-green-500/30 text-green-500">
                              <CheckCircle className="w-3 h-3" />
                              {t('experts.verified', 'Vérifié')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                        {expert.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getFlagEmoji(expert.countryCode)}</span>
                        <span>{expert.country}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{expert.rating}</span>
                        <span className="text-xs text-muted-foreground">/5</span>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1">
                        {expert.specialties.slice(0, 3).map(specialty => (
                          <Badge key={specialty} variant="outline" className="text-xs bg-muted/50">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      {/* Languages */}
                      <p className="text-xs text-muted-foreground">
                        🗣️ {expert.languages.join(', ')}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          disabled={!expert.available}
                        >
                          <MessageSquare className="w-3 h-3" />
                          {t('experts.contact', 'Contact')}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          disabled={!expert.available}
                        >
                          <Calendar className="w-3 h-3" />
                          {t('experts.book', 'RDV')}
                        </Button>
                      </div>

                      {!expert.available && (
                        <p className="text-xs text-center text-muted-foreground">
                          {t('experts.unavailable', 'Indisponible actuellement')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredExperts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {t('experts.noResults', 'Aucun expert trouvé pour ces critères.')}
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="rounded-full gap-2"
            asChild
          >
            <Link to="/experts">
              {t('experts.viewAll', 'Voir tous les experts')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            {t('experts.disclaimer', 'Les experts sont des professionnels indépendants. World Alignment ne garantit pas leurs services.')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
