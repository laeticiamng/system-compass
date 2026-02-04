import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { LucideIcon } from 'lucide-react';

interface PyramidQuickNavProps {
  pyramidTypes: [PyramidType, typeof PYRAMID_TYPE_INFO[PyramidType]][];
  icons: Record<PyramidType, LucideIcon>;
}

export function PyramidQuickNav({ pyramidTypes, icons }: PyramidQuickNavProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2">
      {pyramidTypes.map(([type, info]) => {
        const Icon = icons[type];
        return (
          <a
            key={type}
            href={`#${type.toLowerCase()}`}
            className="p-2 rounded-lg bg-card/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors group"
            title={info.label}
          >
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        );
      })}
    </div>
  );
}
