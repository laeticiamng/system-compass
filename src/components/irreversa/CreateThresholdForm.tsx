import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ThresholdDomain, 
  ThresholdNature, 
  DetectionSource, 
  ValidatorRole 
} from '@/hooks/useIrreversa';

interface CreateThresholdFormProps {
  onSubmit: (data: {
    title: string;
    context: string;
    domain: ThresholdDomain;
    detection_source: DetectionSource;
    threshold_nature: ThresholdNature;
    irreversibility_reason: string;
    alternatives_before: string[];
    validated_by: string;
    validator_role: ValidatorRole;
    organization_name?: string;
  }) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export function CreateThresholdForm({ onSubmit, onCancel, isLoading }: CreateThresholdFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [domain, setDomain] = useState<ThresholdDomain>('strategic');
  const [detectionSource, setDetectionSource] = useState<DetectionSource>('manual');
  const [thresholdNature, setThresholdNature] = useState<ThresholdNature>('resource_commitment');
  const [irreversibilityReason, setIrreversibilityReason] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>(['']);
  const [validatedBy, setValidatedBy] = useState('');
  const [validatorRole, setValidatorRole] = useState<ValidatorRole>('director');
  const [organizationName, setOrganizationName] = useState('');

  const handleAddAlternative = () => {
    setAlternatives([...alternatives, '']);
  };

  const handleRemoveAlternative = (index: number) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
  };

  const handleAlternativeChange = (index: number, value: string) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = value;
    setAlternatives(newAlternatives);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await onSubmit({
      title,
      context,
      domain,
      detection_source: detectionSource,
      threshold_nature: thresholdNature,
      irreversibility_reason: irreversibilityReason,
      alternatives_before: alternatives.filter(a => a.trim()),
      validated_by: validatedBy,
      validator_role: validatorRole,
      organization_name: organizationName || undefined
    });

    if (success) {
      onCancel();
    }
  };

  const isValid = title.trim() && context.trim() && irreversibilityReason.trim() && validatedBy.trim();

  return (
    <Card className="border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          {t('irreversa.create.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('irreversa.create.warning')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organization & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">{t('irreversa.fields.organization')}</Label>
              <Input
                id="organization"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t('irreversa.placeholders.organization')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{t('irreversa.fields.title')} *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('irreversa.placeholders.title')}
                required
              />
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context">{t('irreversa.fields.context')} *</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t('irreversa.placeholders.context')}
              rows={3}
              required
            />
          </div>

          {/* Domain, Source, Nature */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('irreversa.fields.domain')} *</Label>
              <Select value={domain} onValueChange={(v) => setDomain(v as ThresholdDomain)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['strategic', 'financial', 'organizational', 'legal', 'ethical'].map(d => (
                    <SelectItem key={d} value={d}>
                      {t(`irreversa.domain.${d}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('irreversa.fields.detectionSource')} *</Label>
              <Select value={detectionSource} onValueChange={(v) => setDetectionSource(v as DetectionSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['compass_analysis', 'manual', 'external_signal'].map(s => (
                    <SelectItem key={s} value={s}>
                      {t(`irreversa.source.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('irreversa.fields.nature')} *</Label>
              <Select value={thresholdNature} onValueChange={(v) => setThresholdNature(v as ThresholdNature)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['resource_commitment', 'contractual', 'reputational', 'structural', 'temporal'].map(n => (
                    <SelectItem key={n} value={n}>
                      {t(`irreversa.nature.${n}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Irreversibility reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-red-600">
              {t('irreversa.fields.irreversibilityReason')} *
            </Label>
            <Textarea
              id="reason"
              value={irreversibilityReason}
              onChange={(e) => setIrreversibilityReason(e.target.value)}
              placeholder={t('irreversa.placeholders.irreversibilityReason')}
              rows={2}
              className="border-red-300 focus:border-red-500"
              required
            />
          </div>

          {/* Frozen alternatives */}
          <div className="space-y-2">
            <Label>{t('irreversa.fields.frozenAlternatives')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('irreversa.hints.alternatives')}
            </p>
            <div className="space-y-2">
              {alternatives.map((alt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={alt}
                    onChange={(e) => handleAlternativeChange(index, e.target.value)}
                    placeholder={t('irreversa.placeholders.alternative')}
                  />
                  {alternatives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAlternative(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAlternative}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('irreversa.actions.addAlternative')}
              </Button>
            </div>
          </div>

          {/* Validator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validator">{t('irreversa.fields.validator')} *</Label>
              <Input
                id="validator"
                value={validatedBy}
                onChange={(e) => setValidatedBy(e.target.value)}
                placeholder={t('irreversa.placeholders.validator')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('irreversa.fields.validatorRole')} *</Label>
              <Select value={validatorRole} onValueChange={(v) => setValidatorRole(v as ValidatorRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ceo', 'board', 'founder', 'director', 'comex'].map(r => (
                    <SelectItem key={r} value={r}>
                      {t(`irreversa.role.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('irreversa.actions.detect')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
