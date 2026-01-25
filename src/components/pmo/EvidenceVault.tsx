import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePmoEvidence, type EvidenceType, type ReliabilityLevel } from '@/hooks/usePmoEvidence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, FileText, Link as LinkIcon, MessageSquare, 
  Loader2, Trash2, ExternalLink, Search, Filter, Star, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface EvidenceVaultProps {
  caseId: string;
}

const EVIDENCE_TYPE_CONFIG: Record<EvidenceType, { icon: React.ElementType; label: string; color: string }> = {
  document: { icon: FileText, label: 'Document', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  link: { icon: LinkIcon, label: 'Lien', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  note: { icon: MessageSquare, label: 'Note', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  decision: { icon: Star, label: 'Décision', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  extract: { icon: FileText, label: 'Extrait', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
};

const RELIABILITY_CONFIG: Record<ReliabilityLevel, { label: string; color: string }> = {
  high: { label: 'Fiable', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  low: { label: 'Faible', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  unverified: { label: 'Non vérifié', color: 'bg-muted text-muted-foreground' },
};

export function EvidenceVault({ caseId }: EvidenceVaultProps) {
  const { t } = useTranslation();
  const { 
    evidenceItems, 
    isLoading, 
    isCreating,
    createEvidence,
    deleteEvidence,
    verifyEvidence
  } = usePmoEvidence(caseId);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EvidenceType | 'all'>('all');
  
  const [form, setForm] = useState({
    evidence_type: 'note' as EvidenceType,
    title: '',
    content: '',
    url: '',
    source_name: '',
    source_date: '',
    reliability: 'unverified' as ReliabilityLevel,
    tags: '',
    version: '',
  });

  const handleCreate = () => {
    createEvidence({
      evidence_type: form.evidence_type,
      title: form.title,
      content: form.content || undefined,
      url: form.url || undefined,
      source_name: form.source_name || undefined,
      source_date: form.source_date || undefined,
      reliability: form.reliability,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : undefined,
      version: form.version || undefined,
    });
    setShowAddDialog(false);
    setForm({
      evidence_type: 'note',
      title: '',
      content: '',
      url: '',
      source_name: '',
      source_date: '',
      reliability: 'unverified',
      tags: '',
      version: '',
    });
  };

  const filteredItems = evidenceItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.evidence_type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {t('pmo.evidence.title', 'Evidence Vault')}
          </h2>
          <p className="text-muted-foreground">
            {t('pmo.evidence.subtitle', 'Sources, documents et preuves traçables')}
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('pmo.evidence.add', 'Ajouter une preuve')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('pmo.evidence.new', 'Nouvelle preuve')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{t('pmo.evidence.type', 'Type')}</Label>
                <Select
                  value={form.evidence_type}
                  onValueChange={(v) => setForm(f => ({ ...f, evidence_type: v as EvidenceType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(EVIDENCE_TYPE_CONFIG) as [EvidenceType, typeof EVIDENCE_TYPE_CONFIG[EvidenceType]][]).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('pmo.form.title', 'Titre')}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={t('pmo.evidence.titlePlaceholder', 'Ex: Contrat fournisseur v2.0')}
                />
              </div>

              {(form.evidence_type === 'link' || form.evidence_type === 'document') && (
                <div>
                  <Label>{t('pmo.evidence.url', 'URL / Lien')}</Label>
                  <Input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div>
                <Label>{t('pmo.evidence.content', 'Contenu / Extrait')}</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={t('pmo.evidence.contentPlaceholder', 'Décrivez ou collez un extrait...')}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('pmo.evidence.source', 'Source')}</Label>
                  <Input
                    value={form.source_name}
                    onChange={(e) => setForm(f => ({ ...f, source_name: e.target.value }))}
                    placeholder="Ex: Rapport ANSM"
                  />
                </div>
                <div>
                  <Label>{t('pmo.evidence.date', 'Date source')}</Label>
                  <Input
                    type="date"
                    value={form.source_date}
                    onChange={(e) => setForm(f => ({ ...f, source_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('pmo.evidence.reliability', 'Fiabilité')}</Label>
                  <Select
                    value={form.reliability}
                    onValueChange={(v) => setForm(f => ({ ...f, reliability: v as ReliabilityLevel }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(RELIABILITY_CONFIG) as [ReliabilityLevel, typeof RELIABILITY_CONFIG[ReliabilityLevel]][]).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('pmo.evidence.version', 'Version')}</Label>
                  <Input
                    value={form.version}
                    onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))}
                    placeholder="Ex: v2.1"
                  />
                </div>
              </div>

              <div>
                <Label>{t('pmo.evidence.tags', 'Tags (séparés par virgule)')}</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Ex: legal, RGPD, contrat"
                />
              </div>

              <Button 
                onClick={handleCreate} 
                disabled={!form.title || isCreating}
                className="w-full"
              >
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('pmo.form.create', 'Créer')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pmo.evidence.search', 'Rechercher...')}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as EvidenceType | 'all')}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pmo.evidence.allTypes', 'Tous')}</SelectItem>
            {(Object.entries(EVIDENCE_TYPE_CONFIG) as [EvidenceType, typeof EVIDENCE_TYPE_CONFIG[EvidenceType]][]).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Evidence List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('pmo.evidence.empty', 'Aucune preuve enregistrée')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('pmo.evidence.emptyHint', 'Ajoutez des documents, liens et notes pour documenter vos décisions')}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('pmo.evidence.addFirst', 'Ajouter une première preuve')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map(item => {
            const typeConfig = EVIDENCE_TYPE_CONFIG[item.evidence_type as EvidenceType] || EVIDENCE_TYPE_CONFIG.note;
            const reliabilityConfig = RELIABILITY_CONFIG[item.reliability as ReliabilityLevel] || RELIABILITY_CONFIG.unverified;
            const Icon = typeConfig.icon;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${typeConfig.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {item.source_name && <span>{item.source_name}</span>}
                          {item.source_date && <span>• {format(new Date(item.source_date), 'dd/MM/yyyy')}</span>}
                          {item.version && <Badge variant="outline">{item.version}</Badge>}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={reliabilityConfig.color}>
                        {reliabilityConfig.label}
                      </Badge>
                      {item.is_verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.content && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {item.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {item.url && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {!item.is_verified && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-600"
                          onClick={() => verifyEvidence(item.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => deleteEvidence(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
