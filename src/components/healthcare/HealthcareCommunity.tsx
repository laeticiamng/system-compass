import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageCircle, MapPin, Stethoscope, Search, UserPlus, Star, Clock } from 'lucide-react';

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
  { id: '1', initials: 'ML', specialty: 'Médecine générale', originCountry: 'France', currentCountry: 'Suisse', yearsAbroad: 5, languages: ['FR', 'DE'], topics: ['MEBEKO', 'LAMal', 'Canton Vaud'], available: true, rating: 4.8 },
  { id: '2', initials: 'SA', specialty: 'Soins infirmiers', originCountry: 'Belgique', currentCountry: 'Suisse', yearsAbroad: 3, languages: ['FR'], topics: ['Croix-Rouge', 'Reconnaissance diplôme'], available: true, rating: 4.6 },
  { id: '3', initials: 'KR', specialty: 'Pharmacie', originCountry: 'France', currentCountry: 'Allemagne', yearsAbroad: 7, languages: ['FR', 'DE', 'EN'], topics: ['Approbation', 'Apothekerkammer'], available: false, rating: 4.9 },
  { id: '4', initials: 'JD', specialty: 'Kinésithérapie', originCountry: 'France', currentCountry: 'Belgique', yearsAbroad: 2, languages: ['FR', 'NL'], topics: ['INAMI', 'Agrément'], available: true, rating: 4.5 },
  { id: '5', initials: 'PT', specialty: 'Dentisterie', originCountry: 'Allemagne', currentCountry: 'Suisse', yearsAbroad: 4, languages: ['DE', 'FR', 'EN'], topics: ['SSO', 'Autorisation cantonale'], available: true, rating: 4.7 },
];

const SPECIALTIES = [
  { value: 'all', label: 'Toutes spécialités' },
  { value: 'Médecine générale', label: 'Médecine générale' },
  { value: 'Soins infirmiers', label: 'Soins infirmiers' },
  { value: 'Pharmacie', label: 'Pharmacie' },
  { value: 'Dentisterie', label: 'Dentisterie' },
  { value: 'Kinésithérapie', label: 'Kinésithérapie' },
];

const REGIONS = [
  { value: 'all', label: 'Toutes destinations' },
  { value: 'Suisse', label: '🇨🇭 Suisse' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Allemagne', label: '🇩🇪 Allemagne' },
  { value: 'Belgique', label: '🇧🇪 Belgique' },
];

export function HealthcareCommunity() {
  const { t } = useTranslation();
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [requestSent, setRequestSent] = useState<Set<string>>(new Set());

  const filtered = MOCK_PEERS.filter(p => {
    if (specialtyFilter !== 'all' && p.specialty !== specialtyFilter) return false;
    if (regionFilter !== 'all' && p.currentCountry !== regionFilter) return false;
    if (search && !p.topics.some(t => t.toLowerCase().includes(search.toLowerCase())) && !p.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRequest = (peerId: string) => {
    setRequestSent(prev => new Set(prev).add(peerId));
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
        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGIONS.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
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
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{peer.initials}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{peer.specialty}</span>
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
                  {peer.originCountry} → {peer.currentCountry}
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

              {/* Action */}
              <div className="shrink-0">
                {requestSent.has(peer.id) ? (
                  <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600">
                    <MessageCircle className="w-3 h-3" />
                    {t('healthcare.community.sent', 'Envoyé')}
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant={peer.available ? 'default' : 'outline'}
                    className="text-xs gap-1 h-8"
                    onClick={() => handleRequest(peer.id)}
                    disabled={!peer.available}
                  >
                    <UserPlus className="w-3 h-3" />
                    {t('healthcare.community.askButton', 'Demander conseil')}
                  </Button>
                )}
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
