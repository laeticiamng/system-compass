import { ExternalLink, Globe, Building, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Source {
  name: string;
  url?: string;
  type: string;
  date?: string;
}

interface SourceLinkProps {
  source: Source;
}

const typeIcons: Record<string, any> = {
  regulator: Shield,
  government: Building,
  ngo: Users,
  international: Globe,
};

const typeColors: Record<string, string> = {
  regulator: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  government: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ngo: 'bg-green-500/20 text-green-300 border-green-500/30',
  international: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export function SourceLink({ source }: SourceLinkProps) {
  const Icon = typeIcons[source.type] || Globe;
  const colorClass = typeColors[source.type] || 'bg-muted';

  const content = (
    <Badge 
      variant="outline" 
      className={`text-xs inline-flex items-center gap-1 ${colorClass} ${source.url ? 'cursor-pointer hover:bg-opacity-40 transition-colors' : ''}`}
    >
      <Icon className="h-3 w-3" />
      <span>{source.name}</span>
      {source.date && (
        <span className="text-muted-foreground">({source.date})</span>
      )}
      {source.url && <ExternalLink className="h-3 w-3 ml-1" />}
    </Badge>
  );

  if (source.url) {
    // Ensure URL is valid
    let href = source.url;
    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      href = `https://${href}`;
    }

    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
        title={source.url}
      >
        {content}
      </a>
    );
  }

  return content;
}
