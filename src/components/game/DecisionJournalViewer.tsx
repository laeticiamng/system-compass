// Decision Journal Viewer for Game Module
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Download, 
  TrendingUp, 
  
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Heart,
  MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface GameDecision {
  turn: number;
  action: string;
  outcome: 'success' | 'failure' | 'neutral';
  moneyChange: number;
  healthChange: number;
  reputationChange: number;
  country: string;
  riskTaken: boolean;
  reasoning?: string;
  timestamp: Date;
}

interface GameSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  archetype: string;
  finalScore: number;
  totalTurns: number;
  decisions: GameDecision[];
}

interface DecisionJournalViewerProps {
  session?: GameSession;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export function DecisionJournalViewer({
  session: externalSession,
  onExport
}: DecisionJournalViewerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;
  const [activeTab, setActiveTab] = useState('timeline');

  // Default session if none provided
  const defaultSession: GameSession = useMemo(() => ({
    id: 'demo-session',
    startedAt: new Date(Date.now() - 3600000),
    endedAt: new Date(),
    archetype: 'Entrepreneur Audacieux',
    finalScore: 8500,
    totalTurns: 15,
    decisions: [
      {
        turn: 1,
        action: 'Investissement initial',
        outcome: 'success',
        moneyChange: -5000,
        healthChange: 0,
        reputationChange: 10,
        country: 'France',
        riskTaken: false,
        reasoning: 'Constitution du capital de départ',
        timestamp: new Date(Date.now() - 3500000),
      },
      {
        turn: 2,
        action: 'Networking intensif',
        outcome: 'success',
        moneyChange: -500,
        healthChange: -5,
        reputationChange: 25,
        country: 'France',
        riskTaken: false,
        reasoning: 'Construire un réseau professionnel',
        timestamp: new Date(Date.now() - 3200000),
      },
      {
        turn: 3,
        action: 'Prise de risque: Lancement produit',
        outcome: 'success',
        moneyChange: 8000,
        healthChange: -10,
        reputationChange: 30,
        country: 'France',
        riskTaken: true,
        reasoning: 'Le marché semblait favorable',
        timestamp: new Date(Date.now() - 2800000),
      },
      {
        turn: 4,
        action: 'Relocalisation',
        outcome: 'neutral',
        moneyChange: -3000,
        healthChange: 5,
        reputationChange: -5,
        country: 'Suisse',
        riskTaken: false,
        reasoning: 'Optimisation fiscale',
        timestamp: new Date(Date.now() - 2400000),
      },
      {
        turn: 5,
        action: 'Investissement R&D',
        outcome: 'failure',
        moneyChange: -4000,
        healthChange: -5,
        reputationChange: 0,
        country: 'Suisse',
        riskTaken: true,
        reasoning: 'Tentative d\'innovation',
        timestamp: new Date(Date.now() - 2000000),
      },
      {
        turn: 6,
        action: 'Repos et récupération',
        outcome: 'success',
        moneyChange: 0,
        healthChange: 20,
        reputationChange: 0,
        country: 'Suisse',
        riskTaken: false,
        reasoning: 'Prévention du burnout',
        timestamp: new Date(Date.now() - 1600000),
      },
    ],
  }), []);

  const session = externalSession || defaultSession;

  // Calculate statistics
  const stats = useMemo(() => {
    const decisions = session.decisions;
    const successes = decisions.filter(d => d.outcome === 'success').length;
    const failures = decisions.filter(d => d.outcome === 'failure').length;
    const risksTotal = decisions.filter(d => d.riskTaken).length;
    const risksSuccessful = decisions.filter(d => d.riskTaken && d.outcome === 'success').length;
    
    const totalMoney = decisions.reduce((sum, d) => sum + d.moneyChange, 0);
    const totalHealth = decisions.reduce((sum, d) => sum + d.healthChange, 0);
    const totalReputation = decisions.reduce((sum, d) => sum + d.reputationChange, 0);
    
    const countries = [...new Set(decisions.map(d => d.country))];

    return {
      successes,
      failures,
      neutrals: decisions.length - successes - failures,
      successRate: Math.round((successes / decisions.length) * 100),
      risksTotal,
      risksSuccessful,
      riskSuccessRate: risksTotal > 0 ? Math.round((risksSuccessful / risksTotal) * 100) : 0,
      totalMoney,
      totalHealth,
      totalReputation,
      countries,
    };
  }, [session.decisions]);

  const handleExport = useCallback((format: 'csv' | 'json' | 'pdf') => {
    if (format === 'csv') {
      const headers = ['Tour', 'Action', 'Résultat', 'Argent', 'Santé', 'Réputation', 'Pays', 'Risque', 'Raisonnement'];
      const rows = session.decisions.map(d => [
        d.turn,
        d.action,
        d.outcome,
        d.moneyChange,
        d.healthChange,
        d.reputationChange,
        d.country,
        d.riskTaken ? 'Oui' : 'Non',
        d.reasoning || '',
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${v}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `game-journal-${session.id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(session, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `game-journal-${session.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    onExport?.(format);
  }, [session, onExport]);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('game.journal.title', 'Journal de Décisions')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {session.archetype} • {session.totalTurns} tours • Score: {session.finalScore}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-1" />
            JSON
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="timeline" className="flex-1">
              {t('game.journal.timeline', 'Chronologie')}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">
              {t('game.journal.stats', 'Statistiques')}
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex-1">
              {t('game.journal.lessons', 'Leçons')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {session.decisions.map((decision, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 border rounded-lg ${
                      decision.riskTaken ? 'border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {getOutcomeIcon(decision.outcome)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Tour {decision.turn}</Badge>
                            <span className="font-medium">{decision.action}</span>
                            {decision.riskTaken && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Risque
                              </Badge>
                            )}
                          </div>
                          {decision.reasoning && (
                            <p className="text-sm text-muted-foreground italic">
                              "{decision.reasoning}"
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {decision.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(decision.timestamp, 'HH:mm', { locale })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`flex items-center gap-1 ${getChangeColor(decision.moneyChange)}`}>
                          <Coins className="h-4 w-4" />
                          {decision.moneyChange > 0 ? '+' : ''}{decision.moneyChange}
                        </span>
                        <span className={`flex items-center gap-1 ${getChangeColor(decision.healthChange)}`}>
                          <Heart className="h-4 w-4" />
                          {decision.healthChange > 0 ? '+' : ''}{decision.healthChange}
                        </span>
                        <span className={`flex items-center gap-1 ${getChangeColor(decision.reputationChange)}`}>
                          <TrendingUp className="h-4 w-4" />
                          {decision.reputationChange > 0 ? '+' : ''}{decision.reputationChange}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Outcome Stats */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">{t('game.journal.outcomes', 'Résultats')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-600">Succès</span>
                    <span className="font-medium">{stats.successes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-600">Échecs</span>
                    <span className="font-medium">{stats.failures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Neutres</span>
                    <span className="font-medium">{stats.neutrals}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Taux de réussite</span>
                    <Badge variant={stats.successRate >= 60 ? 'default' : 'secondary'}>
                      {stats.successRate}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Risk Stats */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">{t('game.journal.risks', 'Prises de risque')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Risques pris</span>
                    <span className="font-medium">{stats.risksTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-600">Risques réussis</span>
                    <span className="font-medium">{stats.risksSuccessful}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Taux de succès risques</span>
                    <Badge variant={stats.riskSuccessRate >= 50 ? 'default' : 'destructive'}>
                      {stats.riskSuccessRate}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Resource Changes */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">{t('game.journal.resources', 'Bilan ressources')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      Argent net
                    </span>
                    <span className={`font-medium ${getChangeColor(stats.totalMoney)}`}>
                      {stats.totalMoney > 0 ? '+' : ''}{stats.totalMoney}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Santé nette
                    </span>
                    <span className={`font-medium ${getChangeColor(stats.totalHealth)}`}>
                      {stats.totalHealth > 0 ? '+' : ''}{stats.totalHealth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Réputation nette
                    </span>
                    <span className={`font-medium ${getChangeColor(stats.totalReputation)}`}>
                      {stats.totalReputation > 0 ? '+' : ''}{stats.totalReputation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Geography */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">{t('game.journal.geography', 'Géographie')}</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.countries.map((country, idx) => (
                    <Badge key={idx} variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                  {t('game.journal.whatWorked', 'Ce qui a fonctionné')}
                </h4>
                <ul className="text-sm space-y-1 text-green-600 dark:text-green-300">
                  {stats.successRate >= 50 && (
                    <li>• Bon équilibre entre prudence et action</li>
                  )}
                  {stats.riskSuccessRate >= 60 && (
                    <li>• Prises de risque bien calibrées</li>
                  )}
                  {stats.totalHealth >= 0 && (
                    <li>• Gestion de la santé maîtrisée</li>
                  )}
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                  {t('game.journal.improvements', 'Axes d\'amélioration')}
                </h4>
                <ul className="text-sm space-y-1 text-orange-600 dark:text-orange-300">
                  {stats.successRate < 50 && (
                    <li>• Analyser plus soigneusement les opportunités</li>
                  )}
                  {stats.riskSuccessRate < 50 && (
                    <li>• Réduire la fréquence des prises de risque</li>
                  )}
                  {stats.totalHealth < 0 && (
                    <li>• Prioriser les périodes de récupération</li>
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
