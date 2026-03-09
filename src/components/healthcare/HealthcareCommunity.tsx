import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Stethoscope, Search, UserPlus, Star, Clock, Construction } from 'lucide-react';

interface PeerProfile {
  id: string;
  initials: string;
  specialty: string;
  originCountry: string;
  currentCountry: string;
  yearsAbroad: number;
  languages: string[];
  topics: string[];
  available: boolean;
  rating: number;
}

const MOCK_PEERS: PeerProfile[] = [
  { id: '1', initials: 'ML', specialty: 'general_medicine', originCountry: 'france', currentCountry: 'switzerland', yearsAbroad: 5, languages: ['FR', 'DE'], topics: ['MEBEKO', 'LAMal', 'Canton Vaud'], available: true, rating: 4.8 },
  { id: '2', initials: 'SA', specialty: 'nursing', originCountry: 'belgium', currentCountry: 'switzerland', yearsAbroad: 3, languages: ['FR'], topics: ['Croix-Rouge', 'Reconnaissance diplôme'], available: true, rating: 4.6 },
  { id: '3', initials: 'KR', specialty: 'pharmacy', originCountry: 'france', currentCountry: 'germany', yearsAbroad: 7, languages: ['FR', 'DE', 'EN'], topics: ['Approbation', 'Apothekerkammer'], available: false, rating: 4.9 },
  { id: '4', initials: 'JD', specialty: 'physiotherapy', originCountry: 'france', currentCountry: 'belgium', yearsAbroad: 2, languages: ['FR', 'NL'], topics: ['INAMI', 'Agrément'], available: true, rating: 4.5 },
  { id: '5', initials: 'PT', specialty: 'dentistry', originCountry: 'germany', currentCountry: 'switzerland', yearsAbroad: 4, languages: ['DE', 'FR', 'EN'], topics: ['SSO', 'Autorisation cantonale'], available: true, rating: 4.7 },
];

const SPECIALTY_KEYS = [
  { value: 'all', labelKey: 'healthcare.specialties.all' },
  { value: 'general_medicine', labelKey: 'healthcare.specialties.generalMedicine' },
  { value: 'nursing', labelKey: 'healthcare.specialties.nursing' },
  { value: 'pharmacy', labelKey: 'healthcare.specialties.pharmacy' },
  { value: 'dentistry', labelKey: 'healthcare.specialties.dentistry' },
  { value: 'physiotherapy', labelKey: 'healthcare.specialties.physiotherapy' },
];

const REGION_KEYS = [
  { value: 'all', labelKey: 'healthcare.regions.all' },
  { value: 'switzerland', labelKey: 'healthcare.regions.switzerland', flag: '🇨🇭' },
  { value: 'france', labelKey: 'healthcare.regions.france', flag: '🇫🇷' },
  { value: 'germany', labelKey: 'healthcare.regions.germany', flag: '🇩🇪' },
  { value: 'belgium', labelKey: 'healthcare.regions.belgium', flag: '🇧🇪' },
];

const SPECIALTY_FALLBACKS: Record<string, string> = {
  'healthcare.specialties.all': 'Toutes spécialités',
  'healthcare.specialties.generalMedicine': 'Médecine générale',
  'healthcare.specialties.nursing': 'Soins infirmiers',
  'healthcare.specialties.pharmacy': 'Pharmacie',
  'healthcare.specialties.dentistry': 'Dentisterie',
  'healthcare.specialties.physiotherapy': 'Kinésithérapie',
};

const REGION_FALLBACKS: Record<string, string> = {
  'healthcare.regions.all': 'Toutes destinations',
  'healthcare.regions.switzerland': 'Suisse',
  'healthcare.regions.france': 'France',
  'healthcare.regions.germany': 'Allemagne',
  'healthcare.regions.belgium': 'Belgique',
};

export function HealthcareCommunity() {
  const { t } = useTranslation();
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PEERS.filter(p => {
    if (specialtyFilter !== 'all' && p.specialty !== specialtyFilter) return false;
    if (regionFilter !== 'all' && p.currentCountry !== regionFilter) return false;
    if (search && !p.topics.some(tp => tp.toLowerCase().includes(search.toLowerCase())) && !p.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getSpecialtyLabel = (key: string) => {
    const sk = SPECIALTY_KEYS.find(s => s.value === key);
    return sk ? t(sk.labelKey, SPECIALTY_FALLBACKS[sk.labelKey] || key) : key;
  };

  const getRegionLabel = (key: string) => {
    const rk = REGION_KEYS.find(r => r.value === key);
    if (!rk) return key;
    const label = t(rk.labelKey, REGION_FALLBACKS[rk.labelKey] || key);
    return 'flag' in rk ? `${(rk as any).flag} ${label}` : label;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          {t('healthcare.community.title', 'Réseau Confrères — Professionnels relocalisés')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('healthcare.community.subtitle', 'Échangez avec des professionnels de santé qui ont déjà fait le parcours.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Beta banner */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Construction className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {t('healthcare.community.betaTitle', 'Réseau en construction')}
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t('healthcare.community.betaDescription', 'Cette fonctionnalité est en cours de développement. Les profils affichés sont des exemples illustratifs. Le réseau réel sera disponible prochainement.')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SPECIALTY_KEYS.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {t(s.labelKey, SPECIALTY_FALLBACKS[s.labelKey] || s.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGION_KEYS.map(r => (
                <SelectItem key={r.value} value={r.value}>
                  {'flag' in r ? `${(r as any).flag} ` : ''}{t(r.labelKey, REGION_FALLBACKS[r.labelKey] || r.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('healthcare.community.search', 'Rechercher...')}
              className="h-9 text-xs pl-8"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Badge variant="outline" className="gap-1 py-1.5 px-3 text-xs">
            <Users className="w-3 h-3" /> {filtered.length} {t('healthcare.community.professionals', 'professionnels')}
          </Badge>
          <Badge variant="outline" className="gap-1 py-1.5 px-3 text-xs">
            <Stethoscope className="w-3 h-3" /> {new Set(filtered.map(p => p.specialty)).size} {t('healthcare.community.specialties', 'spécialités')}
          </Badge>
        </div>

        {/* Peer list */}
        <div className="space-y-2">
          {filtered.map((peer) => (
            <div
              key={peer.id}
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors opacity-75"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{peer.initials}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{getSpecialtyLabel(peer.specialty)}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] text-muted-foreground">{peer.rating}</span>
                  </div>
                  {peer.available ? (
                    <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
                      {t('healthcare.community.available', 'Disponible')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px]">
                      <Clock className="w-2.5 h-2.5 mr-0.5" />
                      {t('healthcare.community.busy', 'Occupé')}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {getRegionLabel(peer.originCountry)} → {getRegionLabel(peer.currentCountry)}
                  <span className="text-[10px]">• {peer.yearsAbroad} {t('healthcare.community.years', 'ans')}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {peer.topics.map(topic => (
                    <Badge key={topic} variant="secondary" className="text-[9px]">{topic}</Badge>
                  ))}
                  {peer.languages.map(lang => (
                    <Badge key={lang} variant="outline" className="text-[9px]">{lang}</Badge>
                  ))}
                </div>
              </div>

              {/* Action - disabled in beta */}
              <div className="shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1 h-8"
                  disabled
                  title={t('healthcare.community.comingSoon', 'Bientôt disponible')}
                >
                  <UserPlus className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('healthcare.community.askButton', 'Demander conseil')}</span>
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('healthcare.community.empty', 'Aucun professionnel ne correspond à vos critères pour le moment.')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
