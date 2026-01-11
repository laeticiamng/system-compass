import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Shield,
  Eye,
  FileCheck,
  Trash2
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  role: string;
  status: 'unverified' | 'in_progress' | 'verified';
  criteria: {
    terrain: boolean;
    references: boolean;
    transparency: boolean;
    alignment: boolean;
    capacity: boolean;
  };
  notes: string;
  proofs: string;
}

interface TerrainPartnerReliabilityProps {
  countryId: string;
  countryName: string;
  onSave?: (partners: Partner[]) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  unverified: { 
    label: 'Non vérifié', 
    color: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
    icon: <AlertCircle className="w-4 h-4" />
  },
  in_progress: { 
    label: 'En cours', 
    color: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    icon: <Clock className="w-4 h-4" />
  },
  verified: { 
    label: 'Vérifié', 
    color: 'bg-green-500/20 text-green-700 border-green-500/30',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
};

const CRITERIA_LABELS: Record<string, { label: string; description: string }> = {
  terrain: { label: 'Présence terrain', description: 'Existe physiquement, locaux vérifiables' },
  references: { label: 'Références', description: 'Clients/projets passés vérifiables' },
  transparency: { label: 'Transparence', description: 'Communication claire, pas d\'opacité' },
  alignment: { label: 'Alignement', description: 'Objectifs compatibles avec les vôtres' },
  capacity: { label: 'Capacité réelle', description: 'Moyens effectifs pour délivrer' },
};

export function TerrainPartnerReliability({ countryId, countryName, onSave }: TerrainPartnerReliabilityProps) {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<string | null>(null);
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    criteria: { terrain: false, references: false, transparency: false, alignment: false, capacity: false }
  });

  const addPartner = () => {
    if (newPartner.name && newPartner.role) {
      setPartners(prev => [...prev, {
        id: Date.now().toString(),
        name: newPartner.name!,
        role: newPartner.role!,
        status: 'unverified',
        criteria: newPartner.criteria || { terrain: false, references: false, transparency: false, alignment: false, capacity: false },
        notes: newPartner.notes || '',
        proofs: newPartner.proofs || '',
      }]);
      setNewPartner({ criteria: { terrain: false, references: false, transparency: false, alignment: false, capacity: false } });
      setShowAddForm(false);
    }
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePartner = (id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const toggleCriteria = (partnerId: string, criteriaKey: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === partnerId) {
        const newCriteria = { ...p.criteria, [criteriaKey]: !p.criteria[criteriaKey as keyof typeof p.criteria] };
        const verifiedCount = Object.values(newCriteria).filter(Boolean).length;
        const newStatus = verifiedCount === 5 ? 'verified' : verifiedCount > 0 ? 'in_progress' : 'unverified';
        return { ...p, criteria: newCriteria, status: newStatus };
      }
      return p;
    }));
  };

  return (
    <Card className="border-pink-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-pink-600" />
            {t('governance.partners.title', 'Partenaires & Fiabilité')}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            {t('common.add', 'Ajouter')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('governance.partners.description', 'Grille de vérification des partenaires pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3 border-2 border-dashed border-primary/30">
            <Input
              placeholder="Nom du partenaire"
              value={newPartner.name || ''}
              onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Rôle (ex: Distributeur, Avocat, Transitaire...)"
              value={newPartner.role || ''}
              onChange={(e) => setNewPartner(prev => ({ ...prev, role: e.target.value }))}
            />
            <Textarea
              placeholder="Notes initiales"
              value={newPartner.notes || ''}
              onChange={(e) => setNewPartner(prev => ({ ...prev, notes: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addPartner}>
                {t('common.save', 'Sauvegarder')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                {t('common.cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        )}

        {/* Partners List */}
        {partners.map(partner => (
          <div key={partner.id} className="p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{partner.name}</h4>
                <p className="text-sm text-muted-foreground">{partner.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_CONFIG[partner.status]?.color}>
                  {STATUS_CONFIG[partner.status]?.icon}
                  <span className="ml-1">{STATUS_CONFIG[partner.status]?.label}</span>
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => deletePartner(partner.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {Object.entries(CRITERIA_LABELS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => toggleCriteria(partner.id, key)}
                  className={`p-2 rounded-lg text-xs text-left transition-colors ${
                    partner.criteria[key as keyof typeof partner.criteria]
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-muted/80 border border-transparent hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {partner.criteria[key as keyof typeof partner.criteria] ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <p className="text-muted-foreground">{config.description}</p>
                </button>
              ))}
            </div>

            {/* Notes and Proofs */}
            {editingPartner === partner.id ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Notes"
                  value={partner.notes}
                  onChange={(e) => updatePartner(partner.id, { notes: e.target.value })}
                />
                <Textarea
                  placeholder="Preuves / Références vérifiées"
                  value={partner.proofs}
                  onChange={(e) => updatePartner(partner.id, { proofs: e.target.value })}
                />
                <Button size="sm" onClick={() => setEditingPartner(null)}>
                  {t('common.done', 'Terminé')}
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {partner.notes ? (
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> Notes ajoutées
                    </span>
                  ) : (
                    <span>Pas de notes</span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingPartner(partner.id)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Détails
                </Button>
              </div>
            )}
          </div>
        ))}

        {partners.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{t('governance.partners.empty', 'Aucun partenaire ajouté')}</p>
            <p className="text-sm">{t('governance.partners.addPrompt', 'Ajoutez les partenaires à évaluer')}</p>
          </div>
        )}

        {/* Due Diligence Reminder */}
        <div className="p-4 bg-pink-500/10 rounded-lg flex items-start gap-3">
          <Shield className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">{t('governance.partners.reminder', 'Rappel Due Diligence')}</p>
            <p className="text-muted-foreground">
              {t('governance.partners.reminderText', 'Règle terrain : ne faire confiance à personne sans vérification. Même les partenaires recommandés doivent passer cette grille.')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
