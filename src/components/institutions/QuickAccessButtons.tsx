import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  History, 
  Users, 
  FileText, 
  BarChart3
} from 'lucide-react';

interface QuickAccessButtonsProps {
  className?: string;
}

export function QuickAccessButtons({ className }: QuickAccessButtonsProps) {
  const { t } = useTranslation();

  const quickLinks = [
    {
      href: '/institutions',
      icon: History,
      label: t('institutions.quickAccess.traceability', 'Traçabilité'),
      description: t('institutions.quickAccess.traceabilityDesc', 'Historique des décisions'),
      tab: 'traceability',
    },
    {
      href: '/institutions',
      icon: Users,
      label: t('institutions.quickAccess.collective', 'Décision collective'),
      description: t('institutions.quickAccess.collectiveDesc', 'Mode multi-acteurs'),
      tab: 'collective',
    },
    {
      href: '/cases',
      icon: FileText,
      label: t('institutions.quickAccess.cases', 'Mes dossiers'),
      description: t('institutions.quickAccess.casesDesc', 'Gérer les cas actifs'),
    },
    {
      href: '/dashboard',
      icon: BarChart3,
      label: t('institutions.quickAccess.dashboard', 'Tableau de bord'),
      description: t('institutions.quickAccess.dashboardDesc', 'Vue consolidée'),
    },
  ];

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {t('institutions.quickAccess.title', 'Accès rapide')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={index}
              to={link.tab ? `${link.href}?tab=${link.tab}` : link.href}
              className="group"
            >
              <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
