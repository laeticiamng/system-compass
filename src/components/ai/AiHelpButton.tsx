import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { AiSidePanel, AiAction, AiContext } from './AiSidePanel';
import { cn } from '@/lib/utils';

interface AiHelpButtonProps {
  title: string;
  actions: AiAction[];
  context: AiContext;
  onAccept?: (result: any, action: string) => void;
  onModify?: (result: any, action: string, modifications: string) => void;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function AiHelpButton({
  title,
  actions,
  context,
  onAccept,
  onModify,
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = true,
}: AiHelpButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={() => setIsOpen(true)}
            className={cn(
              "gap-2",
              variant === 'secondary' && "bg-primary/10 hover:bg-primary/20 text-primary",
              className
            )}
          >
            <Sparkles className="w-4 h-4" />
            {showLabel && <span>{t('ai.help', 'Aide IA')}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('ai.helpTooltip', 'Ouvrir l\'assistant IA')}</p>
        </TooltipContent>
      </Tooltip>

      <AiSidePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        actions={actions}
        context={context}
        onAccept={onAccept}
        onModify={onModify}
      />
    </>
  );
}
