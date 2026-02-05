/**
 * Fiscal Profile Step - Step 1 of the fiscal calculator wizard
 */
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users, Heart, Baby, Briefcase, Wallet } from 'lucide-react';
import type { TaxProfile } from '@/lib/fiscalEngine';
import { formatCurrency } from '@/lib/fiscalEngine';

interface FiscalProfileStepProps {
  profile: TaxProfile;
  onChange: (profile: TaxProfile) => void;
}

export function FiscalProfileStep({ profile, onChange }: FiscalProfileStepProps) {
  const { t } = useTranslation();
  
  const updateProfile = (updates: Partial<TaxProfile>) => {
    onChange({ ...profile, ...updates });
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {t('fiscal.profile.title', 'Votre situation fiscale')}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t('fiscal.profile.description', 'Ces informations permettent de calculer votre imposition selon les règles de chaque pays.')}
        </p>
      </div>
      
      {/* Marital Status */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          {t('fiscal.profile.status', 'Statut marital')}
        </Label>
        <RadioGroup
          value={profile.status}
          onValueChange={(value) => updateProfile({ status: value as TaxProfile['status'] })}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="cursor-pointer">
              {t('fiscal.profile.single', 'Célibataire')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="married" id="married" />
            <Label htmlFor="married" className="cursor-pointer">
              {t('fiscal.profile.married', 'Marié(e)')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pacs" id="pacs" />
            <Label htmlFor="pacs" className="cursor-pointer">
              {t('fiscal.profile.pacs', 'Pacsé(e)')}
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Children */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Baby className="w-4 h-4" />
          {t('fiscal.profile.children', 'Nombre d\'enfants à charge')}
        </Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[profile.children]}
            onValueChange={([value]) => updateProfile({ children: value })}
            min={0}
            max={6}
            step={1}
            className="flex-1"
          />
          <span className="w-8 text-center font-medium">{profile.children}</span>
        </div>
      </div>
      
      {/* Income Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          {t('fiscal.profile.incomeType', 'Type de revenus')}
        </Label>
        <Select
          value={profile.incomeType}
          onValueChange={(value) => updateProfile({ incomeType: value as TaxProfile['incomeType'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="salary">
              {t('fiscal.profile.salary', 'Salarié')}
            </SelectItem>
            <SelectItem value="self_employed">
              {t('fiscal.profile.selfEmployed', 'Indépendant / Freelance')}
            </SelectItem>
            <SelectItem value="mixed">
              {t('fiscal.profile.mixed', 'Revenus mixtes')}
            </SelectItem>
            <SelectItem value="retired">
              {t('fiscal.profile.retired', 'Retraité')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Gross Income */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {t('fiscal.profile.grossIncome', 'Revenu brut annuel')}
        </Label>
        <div className="space-y-4">
          <Slider
            value={[profile.grossIncome]}
            onValueChange={([value]) => updateProfile({ grossIncome: value })}
            min={10000}
            max={500000}
            step={5000}
          />
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={profile.grossIncome}
              onChange={(e) => updateProfile({ grossIncome: Number(e.target.value) || 0 })}
              className="flex-1"
              min={0}
            />
            <span className="text-lg font-semibold text-primary min-w-[120px] text-right">
              {formatCurrency(profile.grossIncome)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Net Wealth (optional) */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {t('fiscal.profile.netWealth', 'Patrimoine net (optionnel)')}
          <span className="text-xs text-muted-foreground">
            {t('fiscal.profile.wealthNote', '(pour impôt sur la fortune)')}
          </span>
        </Label>
        <Input
          type="number"
          value={profile.netWealth || ''}
          onChange={(e) => updateProfile({ netWealth: e.target.value ? Number(e.target.value) : undefined })}
          placeholder={t('fiscal.profile.wealthPlaceholder', 'Ex: 1000000')}
          min={0}
        />
      </div>
    </div>
  );
}
