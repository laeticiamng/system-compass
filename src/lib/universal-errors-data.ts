import { AlertTriangle, Clock, TrendingDown, Lock, EyeOff, User, MapPin, BookOpen, Anchor, Users } from 'lucide-react';

export interface UniversalError {
  id: string;
  translationKey: string;
  icon: React.ComponentType<{ className?: string }>;
  relatedPyramids: string[];
  relatedExitKeys: string[];
  defaultDecisionType: string;
  defaultHorizon: string;
  color: string;
}

export const UNIVERSAL_ERRORS: UniversalError[] = [
  {
    id: 'system-error',
    translationKey: 'systemError',
    icon: AlertTriangle,
    relatedPyramids: ['institutional', 'bureaucratic'],
    relatedExitKeys: ['visa-freedom', 'fiscal-optimization'],
    defaultDecisionType: 'country',
    defaultHorizon: '3years',
    color: 'red'
  },
  {
    id: 'metric-error',
    translationKey: 'metricError',
    icon: TrendingDown,
    relatedPyramids: ['performance', 'competitive'],
    relatedExitKeys: ['career-pivot', 'skill-arbitrage'],
    defaultDecisionType: 'career',
    defaultHorizon: '1year',
    color: 'orange'
  },
  {
    id: 'timing-error',
    translationKey: 'timingError',
    icon: Clock,
    relatedPyramids: ['opportunity', 'cyclical'],
    relatedExitKeys: ['market-timing', 'seasonal-arbitrage'],
    defaultDecisionType: 'investment',
    defaultHorizon: '3months',
    color: 'amber'
  },
  {
    id: 'irreversibility-error',
    translationKey: 'irreversibilityError',
    icon: Lock,
    relatedPyramids: ['rigid', 'traditional'],
    relatedExitKeys: ['exit-clause', 'reversibility-test'],
    defaultDecisionType: 'business',
    defaultHorizon: '10years',
    color: 'purple'
  },
  {
    id: 'hidden-cost-error',
    translationKey: 'hiddenCostError',
    icon: EyeOff,
    relatedPyramids: ['extractive', 'opaque'],
    relatedExitKeys: ['cost-audit', 'transparency-check'],
    defaultDecisionType: 'investment',
    defaultHorizon: '3years',
    color: 'slate'
  },
  {
    id: 'ego-error',
    translationKey: 'egoError',
    icon: User,
    relatedPyramids: ['status', 'hierarchical'],
    relatedExitKeys: ['ego-check', 'reality-test'],
    defaultDecisionType: 'career',
    defaultHorizon: '1year',
    color: 'pink'
  },
  {
    id: 'environment-error',
    translationKey: 'environmentError',
    icon: MapPin,
    relatedPyramids: ['geographic', 'cultural'],
    relatedExitKeys: ['location-arbitrage', 'culture-fit'],
    defaultDecisionType: 'country',
    defaultHorizon: '3years',
    color: 'green'
  },
  {
    id: 'narrative-error',
    translationKey: 'narrativeError',
    icon: BookOpen,
    relatedPyramids: ['ideological', 'narrative'],
    relatedExitKeys: ['narrative-audit', 'fact-check'],
    defaultDecisionType: 'education',
    defaultHorizon: '3years',
    color: 'blue'
  },
  {
    id: 'sunk-cost',
    translationKey: 'sunkCost',
    icon: Anchor,
    relatedPyramids: ['inertial', 'legacy'],
    relatedExitKeys: ['sunk-cost-audit', 'fresh-start'],
    defaultDecisionType: 'business',
    defaultHorizon: '1year',
    color: 'gray'
  },
  {
    id: 'social-proof-error',
    translationKey: 'socialProofError',
    icon: Users,
    relatedPyramids: ['conformist', 'social'],
    relatedExitKeys: ['contrarian-test', 'independent-analysis'],
    defaultDecisionType: 'career',
    defaultHorizon: '1year',
    color: 'cyan'
  }
];

export const getErrorById = (id: string): UniversalError | undefined => {
  return UNIVERSAL_ERRORS.find(error => error.id === id);
};
