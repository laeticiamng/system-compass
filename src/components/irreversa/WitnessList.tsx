import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, User, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIrreversa, IrreversaWitness } from '@/hooks/useIrreversa';
import { AddWitnessDialog } from './AddWitnessDialog';

interface WitnessListProps {
  thresholdId: string;
  canAddWitness?: boolean;
}

export function WitnessList({ thresholdId, canAddWitness = true }: WitnessListProps) {
  const { t } = useTranslation();
  const { getWitnesses, isLoggedIn } = useIrreversa();
  const [witnesses, setWitnesses] = useState<IrreversaWitness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWitnesses = async () => {
      setLoading(true);
      const data = await getWitnesses(thresholdId);
      setWitnesses(data);
      setLoading(false);
    };
    fetchWitnesses();
  }, [thresholdId, getWitnesses]);

  const handleWitnessAdded = (witness: IrreversaWitness) => {
    setWitnesses(prev => [...prev, witness]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('irreversa.witnesses.title')}
            <Badge variant="secondary" className="ml-2">
              {witnesses.length}
            </Badge>
          </CardTitle>
          {canAddWitness && (
            <AddWitnessDialog 
              thresholdId={thresholdId} 
              onWitnessAdded={handleWitnessAdded}
              disabled={!isLoggedIn}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('common.loading')}
          </div>
        ) : witnesses.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('irreversa.witnesses.empty')}
          </div>
        ) : (
          <div className="space-y-3">
            {witnesses.map(witness => (
              <div 
                key={witness.id} 
                className="p-3 rounded-lg bg-muted/30 border border-muted"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{witness.witness_name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t(`irreversa.witnessRole.${witness.witness_role}`, witness.witness_role)}
                  </Badge>
                </div>
                
                {witness.witness_statement && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span className="italic">"{witness.witness_statement}"</span>
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(witness.witnessed_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
