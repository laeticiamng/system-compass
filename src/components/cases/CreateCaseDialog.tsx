import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CaseIntentionSelector } from './CaseIntentionSelector';
import { useUserCases, CaseIntention } from '@/hooks/useUserCases';
import { toast } from 'sonner';

interface CreateCaseDialogProps {
  countryId: string;
  countryName: string;
  trigger?: React.ReactNode;
  onSuccess?: (caseId: string) => void;
}

export function CreateCaseDialog({ countryId, countryName, trigger, onSuccess }: CreateCaseDialogProps) {
  const { t } = useTranslation();
  const { createCase, isCreating } = useUserCases();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'intention' | 'details'>('intention');
  const [selectedIntention, setSelectedIntention] = useState<CaseIntention | null>(null);
  const [title, setTitle] = useState('');

  const handleIntentionSelect = (intention: CaseIntention) => {
    setSelectedIntention(intention);
    setTitle(intention === 'relocation' 
      ? t('cases.defaultTitle.relocation', 'Mon installation à {{country}}', { country: countryName })
      : t('cases.defaultTitle.entrepreneurship', 'Mon projet à {{country}}', { country: countryName })
    );
    setStep('details');
  };

  const handleCreate = () => {
    if (!selectedIntention || !title.trim()) return;

    createCase({
      country_id: countryId,
      title: title.trim(),
      intention: selectedIntention,
    }, {
      onSuccess: (data) => {
        toast.success(t('cases.created', 'Dossier créé'));
        setOpen(false);
        setStep('intention');
        setSelectedIntention(null);
        setTitle('');
        onSuccess?.(data.id);
      },
      onError: () => {
        toast.error(t('cases.createError', 'Erreur lors de la création'));
      },
    });
  };

  const handleBack = () => {
    setStep('intention');
    setSelectedIntention(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t('cases.create', 'Nouveau dossier')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'intention' 
              ? t('cases.createTitle', 'Créer un dossier')
              : t('cases.detailsTitle', 'Détails du dossier')
            }
          </DialogTitle>
          <DialogDescription>
            {step === 'intention'
              ? t('cases.createDescription', 'Choisissez votre objectif pour adapter l\'analyse')
              : t('cases.detailsDescription', 'Donnez un nom à votre dossier')
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'intention' ? (
          <CaseIntentionSelector 
            onSelect={handleIntentionSelect}
            countryName={countryName}
          />
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('cases.titleLabel', 'Nom du dossier')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('cases.titlePlaceholder', 'Ex: Mon installation à Paris')}
              />
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={handleBack}>
                {t('common.back', 'Retour')}
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.creating', 'Création...')}
                  </>
                ) : (
                  t('cases.createButton', 'Créer le dossier')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
