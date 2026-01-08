import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Scale,
  TrendingUp,
  Dice5,
  Target,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

export default function HowToRead() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {t('howToRead.title')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('howToRead.subtitle')}
              </p>
            </div>
          </div>
          
          <SimulationDisclaimer variant="contextual" context="default" />
        </div>

        {/* Main Distinction */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* What Simulation IS */}
            <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-semibold">
                  {t('howToRead.whatSimulationIs.title')}
                </h2>
              </div>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t(`howToRead.whatSimulationIs.point${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What Simulation is NOT */}
            <div className="glass-card rounded-xl p-6 border-l-4 border-destructive">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-destructive" />
                <h2 className="font-display text-xl font-semibold">
                  {t('howToRead.whatSimulationIsNot.title')}
                </h2>
              </div>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive mt-0.5">✗</span>
                    <span>{t(`howToRead.whatSimulationIsNot.point${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Key Concept */}
        <section className="mb-12">
          <div className="glass-card rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-7 h-7 text-primary" />
              <h2 className="font-display text-2xl font-bold">
                {t('howToRead.keyConcept.title')}
              </h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              {t('howToRead.keyConcept.explanation')}
            </p>
            <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary/50">
              <p className="text-sm italic text-muted-foreground">
                {t('howToRead.keyConcept.analogy')}
              </p>
            </div>
          </div>
        </section>

        {/* Concrete Examples */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-primary" />
            {t('howToRead.examples.title')}
          </h2>
          
          <div className="space-y-6">
            {/* Example 1: Country Match */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('howToRead.examples.countryMatch.title')}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-destructive/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {t('howToRead.examples.wrongReading')}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t('howToRead.examples.countryMatch.wrong')}"
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary mb-2">
                    {t('howToRead.examples.correctReading')}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t('howToRead.examples.countryMatch.correct')}"
                  </p>
                </div>
              </div>
            </div>

            {/* Example 2: Trajectory */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('howToRead.examples.trajectory.title')}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-destructive/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {t('howToRead.examples.wrongReading')}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t('howToRead.examples.trajectory.wrong')}"
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary mb-2">
                    {t('howToRead.examples.correctReading')}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t('howToRead.examples.trajectory.correct')}"
                  </p>
                </div>
              </div>
            </div>

            {/* Example 3: Game Verdict */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Dice5 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('howToRead.examples.gameVerdict.title')}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-destructive/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {t('howToRead.examples.wrongReading')}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t('howToRead.examples.gameVerdict.wrong')}"
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary mb-2">
                    {t('howToRead.examples.correctReading')}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t('howToRead.examples.gameVerdict.correct')}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            {t('howToRead.limitations.title')}
          </h2>
          
          <div className="glass-card rounded-xl p-6">
            <ul className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                  <span className="text-muted-foreground">
                    {t(`howToRead.limitations.point${i}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-primary" />
            {t('howToRead.bestPractices.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {i}
                  </span>
                  <h3 className="font-semibold text-sm">
                    {t(`howToRead.bestPractices.practice${i}.title`)}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground pl-11">
                  {t(`howToRead.bestPractices.practice${i}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final Note */}
        <section className="glass-card rounded-xl p-8 text-center bg-gradient-to-br from-primary/5 to-transparent">
          <p className="text-lg font-medium mb-2">
            {t('howToRead.finalNote.title')}
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('howToRead.finalNote.text')}
          </p>
        </section>
      </div>
    </div>
  );
}
