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
  Plane
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
    { icon: Clock, label: t('rules.resources.time') },
    { icon: Coins, label: t('rules.resources.money') },
    { icon: Heart, label: t('rules.resources.health') },
    { icon: Network, label: t('rules.resources.network') },
    { icon: GraduationCap, label: t('rules.resources.skills') },
    { icon: Plane, label: t('rules.resources.mobilityRes') },
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
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Dices className="w-6 h-6 text-primary" />
            {t('rules.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* Navigation */}
          <div className="hidden md:flex flex-col gap-2 min-w-[180px]">
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
                <section.icon className="w-4 h-4" />
                {section.title}
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 h-[60vh] pr-4">
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
                    "You win by managing your lives better than others, with a system that stays realistic."
                  </p>
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
                    ⚠️ Each level is worth more but costs more. Reaching level 5 is rare: it represents an "exceptional life" in that domain.
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
                    <span className="font-medium">Birth Country</span>
                    <span className="text-muted-foreground text-sm">→ Your starting system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span className="font-medium">2 Traits + 1 Constraint</span>
                    <span className="text-muted-foreground text-sm">→ Your advantages and limitations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">2 Major + 1 Minor Aspirations</span>
                    <span className="text-muted-foreground text-sm">→ What counts for your score</span>
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
                      <span className="font-medium text-emerald-400">{t('rules.countries.opportunities').split(':')[0]}</span>
                      <span className="text-sm text-muted-foreground ml-2">{t('rules.countries.opportunities').split(':')[1]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <span className="font-medium text-blue-400">{t('rules.countries.safetyNets').split(':')[0]}</span>
                      <span className="text-sm text-muted-foreground ml-2">{t('rules.countries.safetyNets').split(':')[1]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-lg">✈️</span>
                    <div>
                      <span className="font-medium text-cyan-400">{t('rules.countries.mobility').split(':')[0]}</span>
                      <span className="text-sm text-muted-foreground ml-2">{t('rules.countries.mobility').split(':')[1]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                    <span className="text-lg">⚡</span>
                    <div>
                      <span className="font-medium text-rose-400">{t('rules.countries.friction').split(':')[0]}</span>
                      <span className="text-sm text-muted-foreground ml-2">{t('rules.countries.friction').split(':')[1]}</span>
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
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-card rounded-lg p-4 bg-purple-500/10 border border-purple-500/30 mt-4">
                  <p className="text-sm text-purple-200">
                    💡 The game is designed so you never have "everything". You choose what to sacrifice temporarily.
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
                    <h3 className="font-semibold mb-3 text-emerald-400">🎯 Major Actions (1 per year)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">💼 Work</div>
                      <div className="p-2 rounded bg-muted/50">📚 Study</div>
                      <div className="p-2 rounded bg-muted/50">🚀 Entrepreneur</div>
                      <div className="p-2 rounded bg-muted/50">✈️ Migrate</div>
                      <div className="p-2 rounded bg-muted/50 col-span-2">🎨 Contribute / Create</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-blue-400">⚡ Minor Actions</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">🤝 Network</div>
                      <div className="p-2 rounded bg-muted/50">❤️ Relationships</div>
                      <div className="p-2 rounded bg-muted/50">🏥 Heal</div>
                      <div className="p-2 rounded bg-muted/50">😴 Rest</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {t('rules.actions.note')}
                </p>
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
                    <span>Major Aspirations</span>
                    <span className="font-bold text-primary">×2</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Minor Aspiration</span>
                    <span className="font-bold">×1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-rose-500/20 text-rose-400">
                    <span>Unresolved Crises</span>
                    <span className="font-bold">Penalty</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-500/20 text-emerald-400">
                    <span>Difficult Country Bonus</span>
                    <span className="font-bold">+Equity</span>
                  </div>
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
