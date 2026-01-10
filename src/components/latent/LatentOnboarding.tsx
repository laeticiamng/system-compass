import { useTranslation } from 'react-i18next';
import { 
  Moon, 
  Sparkles, 
  Clock, 
  Shield, 
  XCircle,
  Lightbulb,
  Compass,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function LatentOnboarding() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Message */}
      <div className="text-center space-y-4">
        <Badge className="px-4 py-1.5 bg-gradient-to-r from-slate-500/20 to-purple-500/20 border-slate-500/30">
          <Moon className="w-3.5 h-3.5 mr-2" />
          {t('latent.onboarding.badge')}
        </Badge>
        
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          {t('latent.onboarding.title')}
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('latent.onboarding.subtitle')}
        </p>
      </div>

      {/* What LATENT is NOT */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            {t('latent.onboarding.notTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <NotItem text={t('latent.onboarding.not.idea')} />
            <NotItem text={t('latent.onboarding.not.project')} />
            <NotItem text={t('latent.onboarding.not.objective')} />
            <NotItem text={t('latent.onboarding.not.decision')} />
          </div>
        </CardContent>
      </Card>

      {/* What LATENT IS */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            {t('latent.onboarding.isTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('latent.onboarding.isDescription')}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <IsItem 
              icon={<Compass className="w-5 h-5" />}
              text={t('latent.onboarding.is.potential')}
            />
            <IsItem 
              icon={<Clock className="w-5 h-5" />}
              text={t('latent.onboarding.is.noDeadline')}
            />
            <IsItem 
              icon={<Shield className="w-5 h-5" />}
              text={t('latent.onboarding.is.safe')}
            />
            <IsItem 
              icon={<Heart className="w-5 h-5" />}
              text={t('latent.onboarding.is.respect')}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Core Principles */}
      <div className="grid md:grid-cols-3 gap-6">
        <PrincipleCard 
          icon={<Moon className="w-6 h-6" />}
          title={t('latent.onboarding.principles.dormancy.title')}
          description={t('latent.onboarding.principles.dormancy.desc')}
        />
        <PrincipleCard 
          icon={<Clock className="w-6 h-6" />}
          title={t('latent.onboarding.principles.noTimeline.title')}
          description={t('latent.onboarding.principles.noTimeline.desc')}
        />
        <PrincipleCard 
          icon={<Lightbulb className="w-6 h-6" />}
          title={t('latent.onboarding.principles.noForcing.title')}
          description={t('latent.onboarding.principles.noForcing.desc')}
        />
      </div>
    </div>
  );
}

function NotItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
      <XCircle className="w-4 h-4 shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function IsItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function PrincipleCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-lg bg-muted/30">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
