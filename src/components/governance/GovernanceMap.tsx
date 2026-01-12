import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Plus,
  Crown,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  Trash2,
  Download,
  FileText,
  Save,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { useGovernance } from '@/hooks/useGovernance';
import { GovernanceStakeholder } from '@/lib/schemas/governance';

interface GovernanceMapProps {
  countryId: string;
  countryName: string;
}

const LEVEL_CONFIG = {
  official: { label: 'Officiel', color: 'bg-blue-500/20 text-blue-700' },
  influential: { label: 'Influent', color: 'bg-purple-500/20 text-purple-700' },
  blocker: { label: 'Bloqueur', color: 'bg-red-500/20 text-red-700' },
};

const POWER_CONFIG = {
  sign: { label: 'Peut signer', icon: <Crown className="w-3 h-3" /> },
  block: { label: 'Peut bloquer', icon: <Lock className="w-3 h-3" /> },
  access: { label: 'Donne accès', icon: <Unlock className="w-3 h-3" /> },
  advise: { label: 'Conseille', icon: <Eye className="w-3 h-3" /> },
};

const RELIABILITY_CONFIG = {
  unknown: { label: 'Inconnu', color: 'text-gray-500' },
  low: { label: 'Faible', color: 'text-red-600' },
  medium: { label: 'Moyenne', color: 'text-amber-600' },
  high: { label: 'Élevée', color: 'text-green-600' },
};

const toCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

export function GovernanceMap({ countryId, countryName }: GovernanceMapProps) {
  const { t } = useTranslation();
  const { governanceMap, notes, redFlags, updateGovernance, isSaving } = useGovernance(countryId);
  const [stakeholders, setStakeholders] = useState<GovernanceStakeholder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState<Partial<GovernanceStakeholder>>({});
  const [localNotes, setLocalNotes] = useState('');

  useEffect(() => {
    setStakeholders(governanceMap);
    setLocalNotes(notes ?? '');
  }, [governanceMap, notes]);

  const exportFileName = useMemo(() => {
    const normalized = countryName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${normalized || 'governance'}_map`;
  }, [countryName]);

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role) {
      const nextStakeholders = [
        ...stakeholders,
        {
          id: crypto.randomUUID(),
          name: newStakeholder.name,
          role: newStakeholder.role,
          level: (newStakeholder.level as GovernanceStakeholder['level']) || 'official',
          power: (newStakeholder.power as GovernanceStakeholder['power']) || 'advise',
          reliability: (newStakeholder.reliability as GovernanceStakeholder['reliability']) || 'unknown',
          notes: newStakeholder.notes || '',
        },
      ];
      setStakeholders(nextStakeholders);
      updateGovernance({ map: nextStakeholders, notes: localNotes });
      setNewStakeholder({});
      setShowAddForm(false);
    }
  };

  const deleteStakeholder = (id: string) => {
    const nextStakeholders = stakeholders.filter((stakeholder) => stakeholder.id !== id);
    setStakeholders(nextStakeholders);
    updateGovernance({ map: nextStakeholders, notes: localNotes });
  };

  const updateStakeholder = (id: string, updates: Partial<GovernanceStakeholder>) => {
    const nextStakeholders = stakeholders.map((stakeholder) =>
      stakeholder.id === id ? { ...stakeholder, ...updates } : stakeholder
    );
    setStakeholders(nextStakeholders);
    updateGovernance({ map: nextStakeholders, notes: localNotes });
  };

  const exportCsv = () => {
    const header = ['Nom', 'Rôle', 'Niveau', 'Pouvoir', 'Fiabilité', 'Notes'];
    const rows = stakeholders.map((stakeholder) => [
      stakeholder.name,
      stakeholder.role,
      LEVEL_CONFIG[stakeholder.level]?.label ?? stakeholder.level,
      POWER_CONFIG[stakeholder.power]?.label ?? stakeholder.power,
      RELIABILITY_CONFIG[stakeholder.reliability]?.label ?? stakeholder.reliability,
      stakeholder.notes ?? '',
    ]);

    const csvLines = [header, ...rows].map((row) => row.map(toCsvValue).join(','));

    if (redFlags.length > 0) {
      csvLines.push('');
      csvLines.push('"Drapeaux rouges"');
      redFlags.forEach((flag) => {
        csvLines.push([toCsvValue(flag.label), toCsvValue(flag.severity)].join(','));
      });
    }

    if (localNotes.trim()) {
      csvLines.push('');
      csvLines.push([toCsvValue('Notes'), toCsvValue(localNotes.trim())].join(','));
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportPdf = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 16;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const addText = (text: string, fontSize = 11, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * (fontSize * 0.45) + 2;
    };

    const addSection = (title: string) => {
      yPos += 2;
      pdf.setFillColor(76, 108, 255);
      pdf.rect(margin, yPos - 5, contentWidth, 8, 'F');
      pdf.setTextColor('#FFFFFF');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 2, yPos + 1);
      yPos += 8;
      pdf.setTextColor('#333333');
    };

    addText(t('governance.map.title', 'Governance Map'), 16, true);
    addText(countryName, 12, false);

    if (stakeholders.length > 0) {
      addSection(t('governance.map.title', 'Governance Map'));
      stakeholders.forEach((stakeholder) => {
        addText(
          `${stakeholder.name} - ${stakeholder.role} (${LEVEL_CONFIG[stakeholder.level]?.label}, ${POWER_CONFIG[stakeholder.power]?.label}, ${RELIABILITY_CONFIG[stakeholder.reliability]?.label})`,
          10
        );
        if (stakeholder.notes) {
          addText(`• ${stakeholder.notes}`, 9);
        }
      });
    }

    if (redFlags.length > 0) {
      addSection('Drapeaux rouges');
      redFlags.forEach((flag) => {
        addText(`• ${flag.label}`, 10);
      });
    }

    if (localNotes.trim()) {
      addSection('Notes');
      addText(localNotes.trim(), 10);
    }

    pdf.save(`${exportFileName}.pdf`);
  };

  const handleNotesSave = () => {
    updateGovernance({ map: stakeholders, notes: localNotes });
    toast.success(t('common.saved', 'Sauvegardé'));
  };

  return (
    <Card className="border-violet-500/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-violet-600" />
            {t('governance.map.title', 'Governance Map')}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
            {stakeholders.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1">
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportPdf} className="gap-1">
                  <FileText className="w-4 h-4" />
                  PDF
                </Button>
              </>
            )}
            <Button size="sm" onClick={handleNotesSave} className="gap-1" disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? t('common.saving', 'Sauvegarde...') : t('common.save', 'Sauvegarder')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {redFlags.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm text-red-700">Drapeaux rouges</span>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              {redFlags.map((flag) => (
                <li key={flag.id}>• {flag.label}</li>
              ))}
            </ul>
          </div>
        )}

        {showAddForm && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3 border-2 border-dashed border-primary/30">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nom/Titre"
                value={newStakeholder.name || ''}
                onChange={(e) => setNewStakeholder((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Rôle"
                value={newStakeholder.role || ''}
                onChange={(e) => setNewStakeholder((prev) => ({ ...prev, role: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newStakeholder.level}
                onValueChange={(value) => setNewStakeholder((prev) => ({ ...prev, level: value as GovernanceStakeholder['level'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_CONFIG).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newStakeholder.power}
                onValueChange={(value) => setNewStakeholder((prev) => ({ ...prev, power: value as GovernanceStakeholder['power'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pouvoir" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POWER_CONFIG).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newStakeholder.reliability}
                onValueChange={(value) => setNewStakeholder((prev) => ({ ...prev, reliability: value as GovernanceStakeholder['reliability'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fiabilité" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RELIABILITY_CONFIG).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Notes"
              value={newStakeholder.notes || ''}
              onChange={(e) => setNewStakeholder((prev) => ({ ...prev, notes: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addStakeholder}>
                Ajouter
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {stakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="p-3 bg-muted/50 rounded-lg flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={stakeholder.name}
                      onChange={(e) => updateStakeholder(stakeholder.id, { name: e.target.value })}
                      className="h-8 max-w-xs"
                    />
                    <Badge className={LEVEL_CONFIG[stakeholder.level]?.color}>
                      {LEVEL_CONFIG[stakeholder.level]?.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3 mt-2">
                    <Input
                      value={stakeholder.role}
                      onChange={(e) => updateStakeholder(stakeholder.id, { role: e.target.value })}
                      className="h-8 max-w-xs"
                    />
                    <span className="flex items-center gap-1">
                      {POWER_CONFIG[stakeholder.power]?.icon} {POWER_CONFIG[stakeholder.power]?.label}
                    </span>
                    <span className={RELIABILITY_CONFIG[stakeholder.reliability]?.color}>
                      Fiabilité: {RELIABILITY_CONFIG[stakeholder.reliability]?.label}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteStakeholder(stakeholder.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Select
                  value={stakeholder.level}
                  onValueChange={(value) => updateStakeholder(stakeholder.id, { level: value as GovernanceStakeholder['level'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_CONFIG).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={stakeholder.power}
                  onValueChange={(value) => updateStakeholder(stakeholder.id, { power: value as GovernanceStakeholder['power'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POWER_CONFIG).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={stakeholder.reliability}
                  onValueChange={(value) =>
                    updateStakeholder(stakeholder.id, { reliability: value as GovernanceStakeholder['reliability'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RELIABILITY_CONFIG).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={stakeholder.notes ?? ''}
                onChange={(e) => updateStakeholder(stakeholder.id, { notes: e.target.value })}
                placeholder="Notes"
              />
            </div>
          ))}
        </div>

        {stakeholders.length === 0 && !showAddForm && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Cartographiez les acteurs clés du projet</p>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium">Notes générales</p>
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Ajoutez des notes sur la gouvernance"
          />
        </div>
      </CardContent>
    </Card>
  );
}
