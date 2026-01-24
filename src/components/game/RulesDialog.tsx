import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Heart, 
  Users, 
  Briefcase, 
  Coins, 
  Bird, 
  Sparkles,
  Globe,
  Dices,
  Target,
  Clock,
  Zap,
  Network,
  GraduationCap,
  Plane,
  AlertTriangle,
  RotateCcw,
  Gamepad2,
  Trophy,
  Map,
  Skull
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RulesDialogProps {
  trigger?: React.ReactNode;
}

export default function RulesDialog({ trigger }: RulesDialogProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('concept');

  const sections = [
    { id: 'concept', icon: BookOpen, title: t('rules.concept.title') },
    { id: 'pyramidsLife', icon: Target, title: t('rules.pyramidsLife.title') },
    { id: 'characters', icon: Users, title: t('rules.characters.title') },
    { id: 'countries', icon: Globe, title: t('rules.countries.title') },
    { id: 'resources', icon: Coins, title: t('rules.resources.title') },
    { id: 'actions', icon: Zap, title: t('rules.actions.title') },
    { id: 'turnFlow', icon: RotateCcw, title: t('rules.turnFlow.title') },
    { id: 'events', icon: AlertTriangle, title: t('rules.events.title') },
    { id: 'risks', icon: Skull, title: t('rules.risks.title') },
    { id: 'board', icon: Map, title: t('rules.board.title') },
    { id: 'gameModes', icon: Gamepad2, title: t('rules.gameModes.title') },
    { id: 'victory', icon: Trophy, title: t('rules.victory.title') },
    { id: 'scoring', icon: Sparkles, title: t('rules.scoring.title') },
  ];

  const pyramidItems = [
    { icon: Heart, label: t('rules.pyramidsLife.health'), color: 'text-rose-500' },
    { icon: Users, label: t('rules.pyramidsLife.relationships'), color: 'text-pink-500' },
    { icon: Briefcase, label: t('rules.pyramidsLife.career'), color: 'text-blue-500' },
    { icon: Coins, label: t('rules.pyramidsLife.finances'), color: 'text-amber-500' },
    { icon: Bird, label: t('rules.pyramidsLife.freedom'), color: 'text-cyan-500' },
    { icon: Sparkles, label: t('rules.pyramidsLife.meaning'), color: 'text-purple-500' },
  ];

  const resourceItems = [
    { icon: Clock, label: t('rules.resources.time'), color: 'text-cyan-400' },
    { icon: Coins, label: t('rules.resources.money'), color: 'text-amber-400' },
    { icon: Heart, label: t('rules.resources.health'), color: 'text-rose-400' },
    { icon: Network, label: t('rules.resources.network'), color: 'text-purple-400' },
    { icon: GraduationCap, label: t('rules.resources.skills'), color: 'text-emerald-400' },
    { icon: Plane, label: t('rules.resources.mobilityRes'), color: 'text-blue-400' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="w-4 h-4" />
            {t('rules.title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Dices className="w-6 h-6 text-primary" />
            {t('rules.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* Navigation */}
          <div className="hidden md:flex flex-col gap-1 min-w-[200px] max-h-[70vh] overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 h-[65vh] pr-4">
            {activeSection === 'concept' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {t('rules.concept.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.concept.description')}
                </p>
                <div className="glass-card rounded-lg p-4 border-l-4 border-primary">
                  <p className="text-sm italic">
                    {t('rules.concept.quote')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="glass-card rounded-lg p-3">
                    <span className="text-2xl">🎯</span>
                    <p className="text-sm font-medium mt-2">{t('rules.concept.goal')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <span className="text-2xl">⏱️</span>
                    <p className="text-sm font-medium mt-2">{t('rules.concept.duration')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <span className="text-2xl">👥</span>
                    <p className="text-sm font-medium mt-2">{t('rules.concept.players')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <span className="text-2xl">🎲</span>
                    <p className="text-sm font-medium mt-2">{t('rules.concept.luck')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'pyramidsLife' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t('rules.pyramidsLife.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.pyramidsLife.description')}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {pyramidItems.map((item, i) => (
                    <div 
                      key={i} 
                      className="glass-card rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className={cn("p-2 rounded-lg bg-muted", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-card rounded-lg p-4 bg-amber-500/10 border border-amber-500/30 mt-4">
                  <p className="text-sm text-amber-200">
                    ⚠️ {t('rules.pyramidsLife.warning')}
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'characters' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {t('rules.characters.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.characters.description')}
                </p>
                <div className="glass-card rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <span className="font-medium">{t('rules.characters.birthCountry')}</span>
                    <span className="text-muted-foreground text-sm">→ {t('rules.characters.birthCountryDesc')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span className="font-medium">{t('rules.characters.traits')}</span>
                    <span className="text-muted-foreground text-sm">→ {t('rules.characters.traitsDesc')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">{t('rules.characters.aspirations')}</span>
                    <span className="text-muted-foreground text-sm">→ {t('rules.characters.aspirationsDesc')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span className="font-medium">{t('rules.characters.startingResources')}</span>
                    <span className="text-muted-foreground text-sm">→ {t('rules.characters.startingResourcesDesc')}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'countries' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {t('rules.countries.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.countries.description')}
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-lg">📈</span>
                    <div>
                      <span className="font-medium text-emerald-400">{t('rules.countries.opportunitiesLabel')}</span>
                      <p className="text-sm text-muted-foreground">{t('rules.countries.opportunities')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <span className="font-medium text-blue-400">{t('rules.countries.safetyNetsLabel')}</span>
                      <p className="text-sm text-muted-foreground">{t('rules.countries.safetyNets')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-lg">✈️</span>
                    <div>
                      <span className="font-medium text-cyan-400">{t('rules.countries.mobilityLabel')}</span>
                      <p className="text-sm text-muted-foreground">{t('rules.countries.mobility')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                    <span className="text-lg">⚡</span>
                    <div>
                      <span className="font-medium text-rose-400">{t('rules.countries.frictionLabel')}</span>
                      <p className="text-sm text-muted-foreground">{t('rules.countries.friction')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'resources' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  {t('rules.resources.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.resources.description')}
                </p>
                <div className="grid gap-2 mt-4">
                  {resourceItems.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 p-3 glass-card rounded-lg"
                    >
                      <div className={cn("p-2 rounded-lg bg-primary/10", item.color)}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-card rounded-lg p-4 bg-purple-500/10 border border-purple-500/30 mt-4">
                  <p className="text-sm text-purple-200">
                    💡 {t('rules.resources.tip')}
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'actions' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  {t('rules.actions.title')}
                </h2>
                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-emerald-400">🎯 {t('rules.actions.majorTitle')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('rules.actions.majorDesc')}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">💼 {t('rules.actions.work')}</div>
                      <div className="p-2 rounded bg-muted/50">📚 {t('rules.actions.study')}</div>
                      <div className="p-2 rounded bg-muted/50">🚀 {t('rules.actions.entrepreneur')}</div>
                      <div className="p-2 rounded bg-muted/50">✈️ {t('rules.actions.migrate')}</div>
                      <div className="p-2 rounded bg-muted/50 col-span-2">🎨 {t('rules.actions.contribute')}</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-blue-400">⚡ {t('rules.actions.minorTitle')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('rules.actions.minorDesc')}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">🤝 {t('rules.actions.network')}</div>
                      <div className="p-2 rounded bg-muted/50">❤️ {t('rules.actions.relationships')}</div>
                      <div className="p-2 rounded bg-muted/50">🏥 {t('rules.actions.heal')}</div>
                      <div className="p-2 rounded bg-muted/50">😴 {t('rules.actions.rest')}</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-amber-400">⚠️ {t('rules.actions.shortcutsTitle')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('rules.actions.shortcutsDesc')}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-amber-500/20 border border-amber-500/30">💸 {t('rules.actions.blackMarket')}</div>
                      <div className="p-2 rounded bg-amber-500/20 border border-amber-500/30">📄 {t('rules.actions.fakeDocs')}</div>
                      <div className="p-2 rounded bg-amber-500/20 border border-amber-500/30">🤫 {t('rules.actions.corruption')}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {t('rules.actions.note')}
                </p>
              </div>
            )}

            {activeSection === 'turnFlow' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  {t('rules.turnFlow.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.turnFlow.description')}
                </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-4 p-4 glass-card rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-blue-400">{t('rules.turnFlow.phase1Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('rules.turnFlow.phase1Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 glass-card rounded-lg border-l-4 border-amber-500">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-amber-400">{t('rules.turnFlow.phase2Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('rules.turnFlow.phase2Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 glass-card rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-purple-400">{t('rules.turnFlow.phase3Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('rules.turnFlow.phase3Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 glass-card rounded-lg border-l-4 border-emerald-500">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-emerald-400">{t('rules.turnFlow.phase4Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('rules.turnFlow.phase4Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'events' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  {t('rules.events.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.events.description')}
                </p>
                <div className="space-y-3 mt-4">
                  <div className="glass-card rounded-lg p-4 bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-blue-400">{t('rules.events.globalTitle')}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('rules.events.globalDesc')}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="p-2 rounded bg-muted/50">🌍 {t('rules.events.globalEx1')}</div>
                      <div className="p-2 rounded bg-muted/50">📉 {t('rules.events.globalEx2')}</div>
                      <div className="p-2 rounded bg-muted/50">🦠 {t('rules.events.globalEx3')}</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-4 bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Map className="w-5 h-5 text-amber-400" />
                      <h4 className="font-semibold text-amber-400">{t('rules.events.localTitle')}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('rules.events.localDesc')}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="p-2 rounded bg-muted/50">🏛️ {t('rules.events.localEx1')}</div>
                      <div className="p-2 rounded bg-muted/50">💰 {t('rules.events.localEx2')}</div>
                      <div className="p-2 rounded bg-muted/50">🎉 {t('rules.events.localEx3')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'risks' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Skull className="w-5 h-5 text-primary" />
                  {t('rules.risks.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.risks.description')}
                </p>
                <div className="glass-card rounded-lg p-4 bg-rose-500/10 border border-rose-500/30">
                  <h4 className="font-semibold text-rose-400 mb-3">⚠️ {t('rules.risks.warningTitle')}</h4>
                  <p className="text-sm text-muted-foreground">{t('rules.risks.warningDesc')}</p>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="glass-card rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-400 mb-2">✅ {t('rules.risks.successTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.risks.successDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h4 className="font-semibold text-amber-400 mb-2">⚠️ {t('rules.risks.failureTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.risks.failureDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4 bg-rose-500/20">
                    <h4 className="font-semibold text-rose-400 mb-2">💀 {t('rules.risks.catastropheTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.risks.catastropheDesc')}</p>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4 border-l-4 border-purple-500 mt-4">
                  <p className="text-sm italic text-purple-200">
                    💡 {t('rules.risks.moral')}
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'board' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" />
                  {t('rules.board.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.board.description')}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">⬡</div>
                    <div>
                      <span className="text-sm font-medium">{t('rules.board.pyramidSquare')}</span>
                      <p className="text-xs text-muted-foreground">{t('rules.board.pyramidSquareDesc')}</p>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500 flex items-center justify-center">❓</div>
                    <div>
                      <span className="text-sm font-medium">{t('rules.board.questionSquare')}</span>
                      <p className="text-xs text-muted-foreground">{t('rules.board.questionSquareDesc')}</p>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center">🎲</div>
                    <div>
                      <span className="text-sm font-medium">{t('rules.board.chanceSquare')}</span>
                      <p className="text-xs text-muted-foreground">{t('rules.board.chanceSquareDesc')}</p>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500 flex items-center justify-center">⚠️</div>
                    <div>
                      <span className="text-sm font-medium">{t('rules.board.trapSquare')}</span>
                      <p className="text-xs text-muted-foreground">{t('rules.board.trapSquareDesc')}</p>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">⭐</div>
                    <div>
                      <span className="text-sm font-medium">{t('rules.board.bonusSquare')}</span>
                      <p className="text-xs text-muted-foreground">{t('rules.board.bonusSquareDesc')}</p>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">🏆</div>
                    <div>
                      <span className="text-sm font-medium">{t('rules.board.finishSquare')}</span>
                      <p className="text-xs text-muted-foreground">{t('rules.board.finishSquareDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'gameModes' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  {t('rules.gameModes.title')}
                </h2>
                <div className="space-y-3 mt-4">
                  <div className="glass-card rounded-lg p-4 bg-blue-500/10 border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-2">🎯 {t('rules.gameModes.soloTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.gameModes.soloDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4 bg-yellow-500/10 border border-yellow-500/30">
                    <h4 className="font-semibold text-yellow-400 mb-2">🏁 {t('rules.gameModes.raceTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.gameModes.raceDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4 bg-rose-500/10 border border-rose-500/30">
                    <h4 className="font-semibold text-rose-400 mb-2">⚔️ {t('rules.gameModes.duelTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.gameModes.duelDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4 bg-emerald-500/10 border border-emerald-500/30">
                    <h4 className="font-semibold text-emerald-400 mb-2">🤝 {t('rules.gameModes.coopTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.gameModes.coopDesc')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'victory' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {t('rules.victory.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.victory.description')}
                </p>
                <div className="space-y-3 mt-4">
                  <div className="glass-card rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🎯 {t('rules.victory.soloTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.victory.soloDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🏁 {t('rules.victory.raceTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.victory.raceDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h4 className="font-semibold mb-2">⚔️ {t('rules.victory.duelTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.victory.duelDesc')}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🤝 {t('rules.victory.coopTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('rules.victory.coopDesc')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'scoring' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t('rules.scoring.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('rules.scoring.description')}
                </p>
                <div className="glass-card rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>{t('rules.scoring.majorAspirations')}</span>
                    <span className="font-bold text-primary">×2</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>{t('rules.scoring.minorAspiration')}</span>
                    <span className="font-bold">×1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-500/20 text-emerald-400">
                    <span>{t('rules.scoring.resourceBonus')}</span>
                    <span className="font-bold">+{t('rules.scoring.bonus')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-rose-500/20 text-rose-400">
                    <span>{t('rules.scoring.crisisPenalty')}</span>
                    <span className="font-bold">{t('rules.scoring.penalty')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-purple-500/20 text-purple-400">
                    <span>{t('rules.scoring.difficultyBonus')}</span>
                    <span className="font-bold">+{t('rules.scoring.equity')}</span>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4 border-l-4 border-primary mt-4">
                  <p className="text-sm italic">
                    🎯 {t('rules.scoring.finalNote')}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile navigation */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mt-6">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
