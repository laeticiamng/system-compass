import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
}

interface GovernanceMapProps {
  countryId: string;
  countryName: string;
  onExport?: (stakeholders: Stakeholder[]) => void;
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

export function GovernanceMap({ countryId, countryName, onExport }: GovernanceMapProps) {
  const { t } = useTranslation();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState<Partial<Stakeholder>>({});

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
      }]);
      setNewStakeholder({});
      setShowAddForm(false);
    }
  };

  const deleteStakeholder = (id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id));
  };

  // Red flags analysis
  const redFlags = [];
  const singleIntermediary = stakeholders.filter(s => s.level === 'influential').length === 1;
  const highOpacity = stakeholders.filter(s => s.reliability === 'unknown' || s.reliability === 'low').length > stakeholders.length / 2;
  
  if (singleIntermediary) redFlags.push('Dépendance à un seul intermédiaire');
  if (highOpacity) redFlags.push('Opacité élevée (fiabilité non vérifiée)');

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
              Ajouter
            </Button>
            {stakeholders.length > 0 && (
              <Button size="sm" onClick={() => onExport?.(stakeholders)}>
                Exporter
              </Button>
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
              <span className="font-medium text-sm text-red-700">Drapeaux rouges</span>
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
              <Input placeholder="Nom/Titre" value={newStakeholder.name || ''} onChange={(e) => setNewStakeholder(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Rôle" value={newStakeholder.role || ''} onChange={(e) => setNewStakeholder(p => ({ ...p, role: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={newStakeholder.level} onValueChange={(v) => setNewStakeholder(p => ({ ...p, level: v as Stakeholder['level'] }))}>
                <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newStakeholder.power} onValueChange={(v) => setNewStakeholder(p => ({ ...p, power: v as Stakeholder['power'] }))}>
                <SelectTrigger><SelectValue placeholder="Pouvoir" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(POWER_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newStakeholder.reliability} onValueChange={(v) => setNewStakeholder(p => ({ ...p, reliability: v as Stakeholder['reliability'] }))}>
                <SelectTrigger><SelectValue placeholder="Fiabilité" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RELIABILITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addStakeholder}>Ajouter</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Stakeholders List */}
        <div className="space-y-2">
          {stakeholders.map(s => (
            <div key={s.id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <Badge className={LEVEL_CONFIG[s.level]?.color}>{LEVEL_CONFIG[s.level]?.label}</Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                  <span>{s.role}</span>
                  <span className="flex items-center gap-1">{POWER_CONFIG[s.power]?.icon} {POWER_CONFIG[s.power]?.label}</span>
                  <span className={RELIABILITY_CONFIG[s.reliability]?.color}>Fiabilité: {RELIABILITY_CONFIG[s.reliability]?.label}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteStakeholder(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        {stakeholders.length === 0 && !showAddForm && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Cartographiez les acteurs clés du projet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
