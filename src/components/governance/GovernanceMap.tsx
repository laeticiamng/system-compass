import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useUserGovernanceNotes } from '@/hooks/useCountryGovernance';
import jsPDF from 'jspdf';
import { 
  Users, 
  Plus, 
  Crown, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Eye,
  Trash2
} from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  level: 'official' | 'influential' | 'blocker';
  power: 'sign' | 'block' | 'access' | 'advise';
  reliability: 'unknown' | 'low' | 'medium' | 'high';
  notes: string;
  countryId: string;
  userId?: string;
}

interface GovernanceMapProps {
  countryId: string;
  countryName: string;
}

const LEVEL_CONFIG = {
  official: { labelKey: 'governance.map.levels.official', color: 'bg-blue-500/20 text-blue-700' },
  influential: { labelKey: 'governance.map.levels.influential', color: 'bg-purple-500/20 text-purple-700' },
  blocker: { labelKey: 'governance.map.levels.blocker', color: 'bg-red-500/20 text-red-700' },
};

const POWER_CONFIG = {
  sign: { labelKey: 'governance.map.powers.sign', icon: <Crown className="w-3 h-3" /> },
  block: { labelKey: 'governance.map.powers.block', icon: <Lock className="w-3 h-3" /> },
  access: { labelKey: 'governance.map.powers.access', icon: <Unlock className="w-3 h-3" /> },
  advise: { labelKey: 'governance.map.powers.advise', icon: <Eye className="w-3 h-3" /> },
};

const RELIABILITY_CONFIG = {
  unknown: { labelKey: 'governance.map.reliabilities.unknown', color: 'text-gray-500' },
  low: { labelKey: 'governance.map.reliabilities.low', color: 'text-red-600' },
  medium: { labelKey: 'governance.map.reliabilities.medium', color: 'text-amber-600' },
  high: { labelKey: 'governance.map.reliabilities.high', color: 'text-green-600' },
};

export function GovernanceMap({ countryId, countryName }: GovernanceMapProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notes, saveNotes, isLoading } = useUserGovernanceNotes(countryId);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState<Partial<Stakeholder>>({});

  const notesById = useMemo(() => {
    return new Map(notes?.governance_map?.map(actor => [actor.id, actor]) ?? []);
  }, [notes]);

  const normalizeInternal = (items: Stakeholder[]) => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      role: item.role,
      level: item.level,
      power: item.power,
      reliability: item.reliability,
      notes: item.notes || '',
    }));
  };

  const normalizeNote = (item: {
    id: string;
    name: string;
    role: string;
    level: string;
    power: string;
    reliability: number;
    notes?: string;
    isRedFlag?: boolean;
  }) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    level: item.level,
    power: item.power,
    reliability: item.reliability,
    notes: item.notes || '',
    isRedFlag: item.isRedFlag,
  });

  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter(stakeholder => stakeholder.countryId === countryId);
  }, [countryId, stakeholders]);

  const mappedFromNotes = useMemo(() => {
    if (!notes?.governance_map) return [];
    return notes.governance_map.map(actor => ({
      id: actor.id,
      name: actor.name,
      role: actor.role,
      level: (actor.level === 'blocking' ? 'blocker' : actor.level) as Stakeholder['level'],
      power: actor.power as Stakeholder['power'],
      reliability: (actor.reliability >= 4 ? 'high' : actor.reliability >= 3 ? 'medium' : actor.reliability >= 2 ? 'low' : 'unknown') as Stakeholder['reliability'],
      notes: actor.notes || '',
      countryId,
      userId: notes.user_id,
    }));
  }, [countryId, notes]);

  const filteredSnapshot = useMemo(() => {
    return JSON.stringify(normalizeInternal(filteredStakeholders));
  }, [filteredStakeholders]);

  const notesSnapshot = useMemo(() => {
    return JSON.stringify((notes?.governance_map ?? []).map(normalizeNote));
  }, [notes]);

  const mappedNotesSnapshot = useMemo(() => {
    return JSON.stringify(normalizeInternal(mappedFromNotes));
  }, [mappedFromNotes]);

  useEffect(() => {
    if (isLoading || !notes?.governance_map) return;
    if (mappedNotesSnapshot === filteredSnapshot) return;
    setStakeholders(mappedFromNotes);
  }, [filteredSnapshot, isLoading, mappedFromNotes, mappedNotesSnapshot, notes]);

  useEffect(() => {
    if (isLoading || !user) return;
    const mapped = filteredStakeholders.map(actor => {
      const existing = notesById.get(actor.id);
      return {
        id: actor.id,
        name: actor.name,
        role: actor.role,
        level: (actor.level === 'blocker' ? 'blocking' : actor.level) as 'blocking' | 'influential' | 'official',
        power: (actor.power === 'advise' ? 'access' : actor.power) as 'access' | 'block' | 'sign',
        reliability: (actor.reliability === 'high' ? 5 : actor.reliability === 'medium' ? 3 : actor.reliability === 'low' ? 2 : 1) as 1 | 2 | 3 | 4 | 5,
        notes: actor.notes || '',
        isRedFlag: existing?.isRedFlag,
      };
    });
    if (notesSnapshot === JSON.stringify(mapped.map(normalizeNote))) return;
    saveNotes({ governance_map: mapped });
  }, [filteredStakeholders, isLoading, notesById, notesSnapshot, saveNotes, user]);

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role) {
      setStakeholders(prev => [...prev, {
        id: Date.now().toString(),
        name: newStakeholder.name!,
        role: newStakeholder.role!,
        level: (newStakeholder.level as Stakeholder['level']) || 'official',
        power: (newStakeholder.power as Stakeholder['power']) || 'advise',
        reliability: (newStakeholder.reliability as Stakeholder['reliability']) || 'unknown',
        notes: newStakeholder.notes || '',
        countryId,
        userId: user?.id,
      }]);
      setNewStakeholder({});
      setShowAddForm(false);
    }
  };

  const deleteStakeholder = (id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id));
  };

  const exportStakeholdersCsv = () => {
    if (filteredStakeholders.length === 0) return;
    const headers = [
      t('governance.map.name', 'Name'),
      t('governance.map.role', 'Role'),
      t('governance.map.level', 'Level'),
      t('governance.map.power', 'Power'),
      t('governance.map.reliability', 'Reliability'),
      t('common.description', 'Notes')
    ];
    const escapeValue = (value: string) => `"${value.replace(/\"/g, '""')}"`;
    const rows = filteredStakeholders.map(s => ([
      s.name,
      s.role,
      t(LEVEL_CONFIG[s.level]?.labelKey ?? '', s.level),
      t(POWER_CONFIG[s.power]?.labelKey ?? '', s.power),
      t(RELIABILITY_CONFIG[s.reliability]?.labelKey ?? '', s.reliability),
      s.notes || '',
    ].map(value => escapeValue(String(value))).join(',')));
    const csv = [headers.map(escapeValue).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${countryName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stakeholders.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportStakeholdersPdf = () => {
    if (filteredStakeholders.length === 0) return;
    const pdf = new jsPDF();
    const margin = 12;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    let yPos = 18;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(`${t('governance.map.title', 'Governance Map')} - ${countryName}`, margin, yPos);
    yPos += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    filteredStakeholders.forEach((stakeholder, index) => {
      const levelLabel = t(LEVEL_CONFIG[stakeholder.level]?.labelKey ?? '', stakeholder.level);
      const powerLabel = t(POWER_CONFIG[stakeholder.power]?.labelKey ?? '', stakeholder.power);
      const reliabilityLabel = t(RELIABILITY_CONFIG[stakeholder.reliability]?.labelKey ?? '', stakeholder.reliability);
      const line = `${index + 1}. ${stakeholder.name} — ${stakeholder.role} | ${levelLabel} | ${powerLabel} | ${reliabilityLabel}`;
      const lines = pdf.splitTextToSize(line, maxWidth);
      lines.forEach(textLine => {
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(textLine, margin, yPos);
        yPos += 6;
      });
      if (stakeholder.notes) {
        const notesLines = pdf.splitTextToSize(`${t('common.description', 'Notes')}: ${stakeholder.notes}`, maxWidth);
        notesLines.forEach(noteLine => {
          if (yPos > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(noteLine, margin, yPos);
          yPos += 6;
        });
      }
      yPos += 4;
    });

    pdf.save(`${countryName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stakeholders.pdf`);
  };

  // Red flags analysis
  const redFlags: string[] = [];
  const singleIntermediary = filteredStakeholders.filter(s => s.level === 'influential').length === 1;
  const highOpacity = filteredStakeholders.filter(s => s.reliability === 'unknown' || s.reliability === 'low').length > filteredStakeholders.length / 2;

  if (singleIntermediary) redFlags.push(t('governance.map.singleIntermediary', 'Dependency on a single intermediary'));
  if (highOpacity) redFlags.push(t('governance.map.highOpacity', 'High opacity (unverified reliability)'));

  return (
    <Card className="border-violet-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-violet-600" />
            {t('governance.map.title', 'Governance Map')}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-1" />
              {t('governance.map.add', 'Add')}
            </Button>
            {filteredStakeholders.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={exportStakeholdersCsv}>
                  {t('governance.map.exportCsv', 'Export CSV')}
                </Button>
                <Button size="sm" onClick={exportStakeholdersPdf}>
                  {t('governance.map.exportPdf', 'Export PDF')}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm text-red-700">{t('governance.map.redFlags', 'Red flags')}</span>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              {redFlags.map((flag, i) => <li key={i}>• {flag}</li>)}
            </ul>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3 border-2 border-dashed border-primary/30">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={t('governance.map.name', 'Name/Title')} value={newStakeholder.name || ''} onChange={(e) => setNewStakeholder(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder={t('governance.map.role', 'Role')} value={newStakeholder.role || ''} onChange={(e) => setNewStakeholder(p => ({ ...p, role: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={newStakeholder.level} onValueChange={(v) => setNewStakeholder(p => ({ ...p, level: v as Stakeholder['level'] }))}>
                <SelectTrigger><SelectValue placeholder={t('governance.map.level', 'Level')} /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{t(v.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newStakeholder.power} onValueChange={(v) => setNewStakeholder(p => ({ ...p, power: v as Stakeholder['power'] }))}>
                <SelectTrigger><SelectValue placeholder={t('governance.map.power', 'Power')} /></SelectTrigger>
                <SelectContent>
                  {Object.entries(POWER_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{t(v.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newStakeholder.reliability} onValueChange={(v) => setNewStakeholder(p => ({ ...p, reliability: v as Stakeholder['reliability'] }))}>
                <SelectTrigger><SelectValue placeholder={t('governance.map.reliability', 'Reliability')} /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RELIABILITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{t(v.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addStakeholder}>{t('governance.map.add', 'Add')}</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>{t('common.cancel', 'Cancel')}</Button>
            </div>
          </div>
        )}

        {/* Stakeholders List */}
        <div className="space-y-2">
          {filteredStakeholders.map(s => (
            <div key={s.id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <Badge className={LEVEL_CONFIG[s.level]?.color}>{t(LEVEL_CONFIG[s.level]?.labelKey ?? '')}</Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                  <span>{s.role}</span>
                  <span className="flex items-center gap-1">{POWER_CONFIG[s.power]?.icon} {t(POWER_CONFIG[s.power]?.labelKey ?? '')}</span>
                  <span className={RELIABILITY_CONFIG[s.reliability]?.color}>{t('governance.map.reliability', 'Reliability')}: {t(RELIABILITY_CONFIG[s.reliability]?.labelKey ?? '')}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteStakeholder(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        {filteredStakeholders.length === 0 && !showAddForm && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{t('governance.map.mapActors', 'Map the key actors of the project')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
