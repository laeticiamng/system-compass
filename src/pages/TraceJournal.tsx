/**
 * TraceOS Personal Decision Journal
 * Route: /trace
 *
 * Personal timeline of all decisions, visited countries,
 * simulations launched, and comparisons. Users can annotate
 * decisions and export a PDF of their decision trail.
 */
import { useState, useMemo, useRef, useCallback } from 'react';
import { LocalizedLink as Link } from '@/components/i18n';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  FileText, Download, Plus, MapPin, Calculator, Scale, Gamepad2,
  Clock, MessageSquare, Trash2, Eye, Filter, Search,
  ChevronRight, BookOpen, ArrowRight
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type DecisionType = 'country_visit' | 'simulation' | 'comparison' | 'matcher' | 'game' | 'note';

interface DecisionEntry {
  id: string;
  type: DecisionType;
  title: string;
  description: string;
  annotation: string;
  timestamp: Date;
  countryIds?: string[];
  metadata?: Record<string, string>;
}

// ============================================================
// HELPERS
// ============================================================

const DECISION_TYPE_CONFIG: Record<DecisionType, {
  icon: typeof MapPin;
  labelKey: string;
  labelDefault: string;
  color: string;
}> = {
  country_visit: {
    icon: MapPin,
    labelKey: 'trace.type.countryVisit',
    labelDefault: 'Fiche pays consultée',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
  simulation: {
    icon: Calculator,
    labelKey: 'trace.type.simulation',
    labelDefault: 'Simulation lancée',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  comparison: {
    icon: Scale,
    labelKey: 'trace.type.comparison',
    labelDefault: 'Comparaison effectuée',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  },
  matcher: {
    icon: Eye,
    labelKey: 'trace.type.matcher',
    labelDefault: 'Matcher utilisé',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  game: {
    icon: Gamepad2,
    labelKey: 'trace.type.game',
    labelDefault: 'Partie jouée',
    color: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  },
  note: {
    icon: MessageSquare,
    labelKey: 'trace.type.note',
    labelDefault: 'Note personnelle',
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
  },
};

const STORAGE_KEY = 'pyramid-compass-trace-journal';

function loadEntries(): DecisionEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultEntries();
    const parsed = JSON.parse(stored);
    return parsed.map((e: DecisionEntry & { timestamp: string }) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  } catch {
    return getDefaultEntries();
  }
}

function saveEntries(entries: DecisionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getDefaultEntries(): DecisionEntry[] {
  const now = new Date();
  return [
    {
      id: 'demo-1',
      type: 'country_visit',
      title: 'Fiche France consultée',
      description: 'Analyse du système STABILITY_REDIS, fiscalité et qualité de vie.',
      annotation: '',
      timestamp: new Date(now.getTime() - 86400000 * 3),
      countryIds: ['france'],
    },
    {
      id: 'demo-2',
      type: 'simulation',
      title: 'Simulation fiscale : France vs Portugal',
      description: 'Comparaison pour un revenu brut de 60 000 €. Portugal plus avantageux de 8 200 €/an.',
      annotation: 'Vérifier le régime NHR du Portugal — conditions d\'éligibilité.',
      timestamp: new Date(now.getTime() - 86400000 * 2),
      countryIds: ['france', 'portugal'],
    },
    {
      id: 'demo-3',
      type: 'matcher',
      title: 'Matcher Pays IA complété',
      description: 'Top 3 : Portugal (87%), Espagne (81%), Grèce (76%).',
      annotation: '',
      timestamp: new Date(now.getTime() - 86400000),
    },
    {
      id: 'demo-4',
      type: 'note',
      title: 'Réflexion personnelle',
      description: 'Prioriser les pays avec visa digital nomade. Budget max 2 000 €/mois.',
      annotation: 'Prendre RDV avec comptable pour optimisation fiscale.',
      timestamp: now,
    },
  ];
}

function generateId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function TraceJournal() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DecisionEntry[]>(loadEntries);
  const [filterType, setFilterType] = useState<DecisionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const updateEntries = useCallback((updated: DecisionEntry[]) => {
    setEntries(updated);
    saveEntries(updated);
  }, []);

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) {
      toast.error(t('trace.emptyTitle', 'Veuillez saisir un titre'));
      return;
    }
    const newEntry: DecisionEntry = {
      id: generateId(),
      type: 'note',
      title: newNoteTitle.trim(),
      description: newNoteDescription.trim(),
      annotation: '',
      timestamp: new Date(),
    };
    const updated = [newEntry, ...entries];
    updateEntries(updated);
    setNewNoteTitle('');
    setNewNoteDescription('');
    setShowAddNote(false);
    toast.success(t('trace.noteAdded', 'Note ajoutée'));
  };

  const handleUpdateAnnotation = (entryId: string, annotation: string) => {
    const updated = entries.map(e =>
      e.id === entryId ? { ...e, annotation } : e
    );
    updateEntries(updated);
    setEditingAnnotation(null);
    toast.success(t('trace.annotationSaved', 'Annotation sauvegardée'));
  };

  const handleDeleteEntry = (entryId: string) => {
    const updated = entries.filter(e => e.id !== entryId);
    updateEntries(updated);
    toast.success(t('trace.entryDeleted', 'Entrée supprimée'));
  };

  const handleExportPDF = () => {
    toast.info(t('trace.exportingPdf', 'Génération du PDF...'));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const lineHeight = 6;
    let y = margin;

    const ensureSpace = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.text('Journal de Décisions — Compass', margin, y);
    y += lineHeight + 2;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exporté le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, margin, y);
    y += lineHeight;
    doc.text(`${filteredEntries.length} entrée(s)`, margin, y);
    y += lineHeight + 4;

    doc.setTextColor(0, 0, 0);

    // Entries
    for (const entry of filteredEntries) {
      ensureSpace(30);

      // Date + type
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const typeLabel = DECISION_TYPE_CONFIG[entry.type].labelDefault;
      doc.text(
        `${format(entry.timestamp, 'dd/MM/yyyy HH:mm')} — ${typeLabel}`,
        margin,
        y
      );
      y += lineHeight;

      // Title
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(entry.title, margin, y);
      y += lineHeight;

      // Description
      if (entry.description) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(entry.description, pageWidth - margin * 2);
        for (const line of lines) {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        }
      }

      // Annotation
      if (entry.annotation) {
        doc.setFontSize(9);
        doc.setTextColor(30, 80, 160);
        const annoLines = doc.splitTextToSize(`Note : ${entry.annotation}`, pageWidth - margin * 2);
        for (const line of annoLines) {
          ensureSpace(lineHeight);
          doc.text(line, margin + 4, y);
          y += lineHeight;
        }
      }

      y += 4;
    }

    // Footer disclaimer
    ensureSpace(20);
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      'Outil d\'analyse et simulation. Pas de conseil juridique, financier ou médical.',
      margin,
      y
    );
    y += 4;
    doc.text('© 2026 Compass — EmotionsCare SASU', margin, y);

    const fileName = `trace-journal-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    toast.success(t('trace.pdfGenerated', 'PDF exporté avec succès'));
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e => e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.annotation.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [entries, filterType, searchQuery]);

  // Group by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, DecisionEntry[]> = {};
    for (const entry of filteredEntries) {
      const key = format(entry.timestamp, 'yyyy-MM-dd');
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {t('trace.headline', 'Journal de Décisions')}
        </h1>
        <p className="text-muted-foreground">
          {t('trace.subheadline', 'Tracez votre parcours de relocalisation. Annotez, analysez, exportez.')}
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button onClick={() => setShowAddNote(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('trace.addNote', 'Ajouter une note')}
        </Button>
        <Button variant="outline" onClick={handleExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          {t('trace.exportPdf', 'Exporter en PDF')}
        </Button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('trace.search', 'Rechercher...')}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={filterType === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilterType('all')}
        >
          <Filter className="w-3 h-3 mr-1" />
          {t('trace.filter.all', 'Tout')} ({entries.length})
        </Badge>
        {(Object.entries(DECISION_TYPE_CONFIG) as [DecisionType, typeof DECISION_TYPE_CONFIG[DecisionType]][]).map(
          ([type, config]) => {
            const count = entries.filter(e => e.type === type).length;
            if (count === 0) return null;
            const Icon = config.icon;
            return (
              <Badge
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterType(type)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {t(config.labelKey, config.labelDefault)} ({count})
              </Badge>
            );
          }
        )}
      </div>

      {/* Add note form */}
      <AnimatePresence>
        {showAddNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {t('trace.newNote', 'Nouvelle note')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder={t('trace.noteTitle', 'Titre de la note...')}
                />
                <Textarea
                  value={newNoteDescription}
                  onChange={(e) => setNewNoteDescription(e.target.value)}
                  placeholder={t('trace.noteDescription', 'Description, réflexions, idées...')}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddNote}>
                    {t('trace.save', 'Enregistrer')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddNote(false)}>
                    {t('trace.cancel', 'Annuler')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div ref={timelineRef}>
        {Object.keys(groupedEntries).length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t('trace.empty', 'Aucune entrée dans votre journal.')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('trace.emptyHint', 'Explorez des pays, lancez des simulations — tout sera tracé ici.')}
              </p>
              <Link to="/countries">
                <Button className="mt-4 gap-2">
                  {t('trace.startExploring', 'Commencer à explorer')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-8">
              {Object.entries(groupedEntries).map(([date, dateEntries]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </h3>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  {/* Day entries */}
                  <div className="space-y-3 ml-6 border-l-2 border-border pl-6">
                    {dateEntries.map((entry) => {
                      const config = DECISION_TYPE_CONFIG[entry.type];
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="glass-card relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-[calc(1.5rem+9px)] top-4 w-4 h-4 rounded-full bg-background border-2 border-primary" />

                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${config.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{entry.title}</h4>
                                    <Badge variant="outline" className="text-[10px]">
                                      {t(config.labelKey, config.labelDefault)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(entry.timestamp, 'HH:mm')}
                                  </p>

                                  {/* Annotation */}
                                  {editingAnnotation === entry.id ? (
                                    <div className="mt-3 space-y-2">
                                      <Textarea
                                        defaultValue={entry.annotation}
                                        id={`anno-${entry.id}`}
                                        placeholder={t('trace.annotationPlaceholder', 'Votre annotation...')}
                                        rows={2}
                                        className="text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            const el = document.getElementById(`anno-${entry.id}`) as HTMLTextAreaElement;
                                            handleUpdateAnnotation(entry.id, el?.value || '');
                                          }}
                                        >
                                          {t('trace.save', 'Enregistrer')}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingAnnotation(null)}
                                        >
                                          {t('trace.cancel', 'Annuler')}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : entry.annotation ? (
                                    <div
                                      className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                                      onClick={() => setEditingAnnotation(entry.id)}
                                    >
                                      <span className="text-xs text-primary font-medium">
                                        {t('trace.annotation', 'Note :')}
                                      </span>{' '}
                                      {entry.annotation}
                                    </div>
                                  ) : null}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditingAnnotation(entry.id)}
                                    title={t('trace.annotate', 'Annoter')}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    title={t('trace.delete', 'Supprimer')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Country links */}
                              {entry.countryIds && entry.countryIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 ml-11">
                                  {entry.countryIds.map(cid => (
                                    <Link key={cid} to={`/country/${cid}`}>
                                      <Badge variant="secondary" className="text-xs hover:bg-primary/20">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {cid}
                                        <ChevronRight className="w-3 h-3 ml-0.5" />
                                      </Badge>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Useful links */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link to="/tools/fiscal-simulator">
          <Card className="glass-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{t('trace.links.fiscal', 'Simulateur fiscal')}</p>
                <p className="text-xs text-muted-foreground">{t('trace.links.fiscalDesc', 'Lancer une simulation')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/tools/matcher">
          <Card className="glass-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{t('trace.links.matcher', 'Matcher Pays')}</p>
                <p className="text-xs text-muted-foreground">{t('trace.links.matcherDesc', 'Trouver votre destination')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/countries">
          <Card className="glass-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{t('trace.links.explore', 'Explorer les pays')}</p>
                <p className="text-xs text-muted-foreground">{t('trace.links.exploreDesc', '51 pays analysés')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-8">
        <SimulationDisclaimer variant="prominent" />
      </div>
    </div>
  );
}
