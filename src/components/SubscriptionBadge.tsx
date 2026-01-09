import { Crown, Sparkles, User } from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tierConfig: Record<SubscriptionTier, { icon: typeof Crown; label: string; className: string }> = {
  free: {
    icon: User,
    label: "Free",
    className: "bg-muted text-muted-foreground border-muted",
  },
  premium: {
    icon: Sparkles,
    label: "Premium",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  },
  pro: {
    icon: Crown,
    label: "Pro",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400",
  },
};

export function SubscriptionBadge() {
  const { tier, loading } = useSubscription();

  if (loading) return null;

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-xs font-medium", config.className)}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
