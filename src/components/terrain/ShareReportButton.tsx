import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareReportButtonProps {
  countryId: string;
  countryName: string;
}

export function ShareReportButton({ countryId, countryName }: ShareReportButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/country/${countryId}/terrain-realities`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('terrainRealities.shareReportSuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('terrainRealities.title')} - ${countryName}`,
          text: t('terrainRealities.subtitle'),
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const hasNativeShare = typeof navigator.share === 'function';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{t('terrainRealities.shareReport')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          {t('terrainRealities.copyToClipboard')}
        </DropdownMenuItem>
        {hasNativeShare && (
          <DropdownMenuItem onClick={handleShareNative}>
            <Share2 className="h-4 w-4 mr-2" />
            {t('terrainRealities.shareReport')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
