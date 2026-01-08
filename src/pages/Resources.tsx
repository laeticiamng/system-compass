import { useTranslation } from 'react-i18next';
import { FileText, Shield, Wallet, GraduationCap, Globe } from 'lucide-react';

const categoryIcons = {
  financial: Wallet,
  skills: GraduationCap,
  mobility: Globe,
  security: Shield,
};

const categoryKeys = ['financial', 'skills', 'mobility', 'security'] as const;
const resourceItemKeys = {
  financial: ['emergencyFund', 'multipleIncome', 'offshoreBanking', 'taxOptimization'],
  skills: ['remote', 'certifications', 'languages', 'digitalPresence'],
  mobility: ['documents', 'visaStrategy', 'secondResidency', 'digitalNomad'],
  security: ['opsec', 'digitalPrivacy', 'assetProtection', 'networkSafety'],
};

export default function Resources() {
  const { t } = useTranslation();

  const survival30ItemsRaw = t('resources.checklists.survival30.items', { returnObjects: true });
  const preMoveItemsRaw = t('resources.checklists.preMove.items', { returnObjects: true });
  
  const survival30Items = Array.isArray(survival30ItemsRaw) ? survival30ItemsRaw : [];
  const preMoveItems = Array.isArray(preMoveItemsRaw) ? preMoveItemsRaw : [];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">{t('resources.title')}</h1>
          <p className="text-muted-foreground">
            {t('resources.subtitle')}
          </p>
        </div>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {categoryKeys.map((catKey) => {
            const Icon = categoryIcons[catKey];
            return (
              <div key={catKey} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{t(`resources.categories.${catKey}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`resources.categories.${catKey}.description`)}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {resourceItemKeys[catKey].map((itemKey) => (
                    <li
                      key={itemKey}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{t(`resources.categories.${catKey}.items.${itemKey}.name`)}</div>
                        <div className="text-xs text-muted-foreground">{t(`resources.categories.${catKey}.items.${itemKey}.description`)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Checklists */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">{t('resources.checklists.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">{t('resources.checklists.survival30.title')}</h3>
              <ul className="space-y-2">
                {survival30Items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">{t('resources.checklists.preMove.title')}</h3>
              <ul className="space-y-2">
                {preMoveItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
          <h3 className="font-display font-semibold mb-2">{t('resources.disclaimer.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('resources.disclaimer.text')}
          </p>
        </div>
      </div>
    </div>
  );
}
