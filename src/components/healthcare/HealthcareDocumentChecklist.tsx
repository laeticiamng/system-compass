import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { useHealthcareChecklist } from '@/hooks/useHealthcareData';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  countryId: string;
  countryName: string;
}

const SPECIALTIES = [
  { value: 'general_medicine', label: 'Médecine générale' },
  { value: 'nursing', label: 'Soins infirmiers' },
  { value: 'pharmacy', label: 'Pharmacie' },
  { value: 'dentistry', label: 'Dentisterie' },
  { value: 'physiotherapy', label: 'Kinésithérapie' },
];

const ORIGIN_REGIONS = [
  { value: 'eu', label: 'UE / AELE' },
  { value: 'non_eu', label: 'Hors UE' },
];

const STORAGE_KEY = 'healthcare_checklist_progress';

function getProgress(countryId: string, specialty: string): Record<number, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? JSON.parse(stored) : {};
    return all[`${countryId}_${specialty}`] || {};
  } catch { return {}; }
}

function saveProgress(countryId: string, specialty: string, progress: Record<number, boolean>) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? JSON.parse(stored) : {};
    all[`${countryId}_${specialty}`] = progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* noop */ }
}

export function HealthcareDocumentChecklist({ countryId, countryName }: Props) {
  const { t } = useTranslation();
  const [specialty, setSpecialty] = useState('general_medicine');
  const [originRegion, setOriginRegion] = useState('eu');
  const { data: checklist, isLoading } = useHealthcareChecklist(countryId, specialty, originRegion);
  
  const [checked, setChecked] = useState<Record<number, boolean>>(() => getProgress(countryId, specialty));

  const toggleDoc = (order: number) => {
    const next = { ...checked, [order]: !checked[order] };
    setChecked(next);
    saveProgress(countryId, specialty, next);
  };

  const docs = checklist?.documents || [];
  const completedCount = docs.filter(d => checked[d.order]).length;
  const progressPct = docs.length > 0 ? (completedCount / docs.length) * 100 : 0;
  const totalDays = docs.reduce((sum, d) => sum + d.estimated_processing_days, 0);

  const verifiedAgo = checklist?.last_verified_at
    ? formatDistanceToNow(new Date(checklist.last_verified_at), { addSuffix: true, locale: fr })
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            {t('healthcare.checklist.title', 'Checklist documents')} — {countryName}
          </CardTitle>
          {verifiedAgo && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <CheckCircle2 className="w-3 h-3" /> {verifiedAgo}
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={originRegion} onValueChange={setOriginRegion}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORIGIN_REGIONS.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('common.loading', 'Chargement...')}
          </div>
        ) : !checklist ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('healthcare.checklist.noData', 'Pas de checklist disponible pour cette combinaison. Données en cours d\'ajout.')}
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{completedCount}/{docs.length} {t('healthcare.checklist.completed', 'complétés')}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  ≈ {checklist.total_estimated_weeks || Math.ceil(totalDays / 7)} {t('healthcare.checklist.weeks', 'semaines')}
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>

            {/* Document list */}
            <ol className="space-y-2">
              {docs.sort((a, b) => a.order - b.order).map((doc) => (
                <li
                  key={doc.order}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    checked[doc.order] ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/30'
                  }`}
                >
                  <Checkbox
                    checked={!!checked[doc.order]}
                    onCheckedChange={() => toggleDoc(doc.order)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${checked[doc.order] ? 'line-through text-muted-foreground' : ''}`}>
                      {doc.order}. {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {doc.estimated_processing_days > 0 && (
                        <span className="text-[10px] text-primary flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ≈ {doc.estimated_processing_days}j
                        </span>
                      )}
                      {doc.required && (
                        <Badge variant="destructive" className="text-[9px]">Requis</Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* Sources */}
            {checklist.source_urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {checklist.source_urls.map((src, i) => (
                  <Button key={i} variant="ghost" size="sm" className="text-xs gap-1 h-7" asChild>
                    <a href={src.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" /> {src.name}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
