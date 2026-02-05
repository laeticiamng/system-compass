import { Bell, BellOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCountryWatchlist, useWatchlistCount } from '@/hooks/useCountryWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface FollowCountryButtonProps {
  countryId: string;
  className?: string;
  showCount?: boolean;
}

export function FollowCountryButton({ countryId, className, showCount = true }: FollowCountryButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isWatching, toggleWatch } = useCountryWatchlist();
  const { data: watchCount = 0 } = useWatchlistCount(countryId);
  
  const isFollowing = isWatching(countryId);

  const handleClick = () => {
    if (!user) {
      // Could show login modal here
      return;
    }
    toggleWatch.mutate(countryId);
  };

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFollowing ? 'default' : 'outline'}
              size="sm"
              onClick={handleClick}
              disabled={toggleWatch.isPending || !user}
              className={cn(
                'gap-2 transition-all',
                isFollowing && 'bg-primary text-primary-foreground'
              )}
            >
              {isFollowing ? (
                <>
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('country.following', 'Suivi')}</span>
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('country.follow', 'Suivre')}</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!user 
              ? t('country.loginToFollow', 'Connectez-vous pour suivre ce pays')
              : isFollowing 
                ? t('country.unfollowTooltip', 'Cliquez pour ne plus recevoir les mises à jour')
                : t('country.followTooltip', 'Recevez une notification lors des mises à jour')
            }
          </TooltipContent>
        </Tooltip>

        {showCount && watchCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{watchCount}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t('country.watchersCount', '{{count}} personnes suivent ce pays', { count: watchCount })}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
