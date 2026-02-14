import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Copy, Twitter, Linkedin, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { FinancialIntelResult } from '@/hooks/useFinancialIntel';

interface ShareButtonProps {
  result: FinancialIntelResult;
  country?: string;
}

export function ShareButton({ result }: ShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareText = `🛡️ Financial Safety Intel - ${result.country_profile.name}\n\n` +
    `⚠️ Top arnaques à éviter:\n${result.scam_top7.slice(0, 3).map(s => `• ${s.name}`).join('\n')}\n\n` +
    `✅ Options régulées:\n${result.legit_top7.slice(0, 3).map(o => `• ${o.name}`).join('\n')}\n\n` +
    `📊 Confiance: ${Math.round(result.confidence * 100)}%`;

  const shareUrl = window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success(t('common.copied', 'Copié !'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('errors.copyFailed', 'Erreur de copie'));
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.slice(0, 280))}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Financial Safety Intel - ${result.country_profile.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  // Check if native share is available
  const hasNativeShare = typeof navigator.share === 'function';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.share', 'Partager')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {t('common.copyText', 'Copier le texte')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
        {hasNativeShare && (
          <DropdownMenuItem onClick={nativeShare} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            {t('common.moreOptions', 'Plus d\'options...')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
