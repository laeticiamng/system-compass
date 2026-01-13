import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Copy, Twitter, Facebook, Linkedin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ExitKeyResult } from '@/lib/exit-keys-engine';

interface ShareResultsButtonProps {
  results: ExitKeyResult[];
  profileSummary: {
    birthCountry?: string;
    currentCountry?: string;
    desiredLife?: string;
  };
}

export function ShareResultsButton({ results, profileSummary }: ShareResultsButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const topKeys = results.slice(0, 3).map(r => 
      `• ${r.key.name} (${r.compatibility}%)`
    ).join('\n');
    
    return `🧭 Mes Clés de Sortie Pyramid Compass

De ${profileSummary.birthCountry || '?'} vers ${profileSummary.currentCountry || '?'}
Objectif: ${profileSummary.desiredLife || 'liberté'}

Top stratégies:
${topKeys}

Simulez votre trajectoire: ${window.location.origin}/exit-keys`;
  };

  const handleCopy = async () => {
    const text = generateShareText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('share.copied', 'Copié dans le presse-papier'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleLinkedinShare = () => {
    const url = encodeURIComponent(`${window.location.origin}/exit-keys`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(`${window.location.origin}/exit-keys`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          {t('exitKeys.share', 'Partager')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {t('share.copyLink', 'Copier le texte')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2">
          <Twitter className="w-4 h-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedinShare} className="gap-2">
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} className="gap-2">
          <Facebook className="w-4 h-4" />
          Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}