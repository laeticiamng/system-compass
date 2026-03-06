/**
 * QuickExitKeySelector - Quick exit key recommendation widget
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Key, ArrowRight, Briefcase, GraduationCap, Heart, Wallet } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/i18n';

interface ExitKeyOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  matchScore: number;
}

const EXIT_KEY_OPTIONS: ExitKeyOption[] = [
  {
    id: 'digital-nomad',
    label: 'Nomade digital',
    icon: <Briefcase className="w-4 h-4" />,
    description: 'Travail à distance, flexibilité maximale',
    matchScore: 92,
  },
  {
    id: 'retirement',
    label: 'Retraite dorée',
    icon: <Heart className="w-4 h-4" />,
    description: 'Qualité de vie, coût raisonnable',
    matchScore: 88,
  },
  {
    id: 'student',
    label: 'Étudiant international',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Formation, opportunités académiques',
    matchScore: 85,
  },
  {
    id: 'investor',
    label: 'Investisseur',
    icon: <Wallet className="w-4 h-4" />,
    description: 'Visa doré, résidence par investissement',
    matchScore: 78,
  },
];

export function QuickExitKeySelector() {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>('');
  
  const selectedOption = EXIT_KEY_OPTIONS.find(opt => opt.id === selectedKey);
  
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          {t('dashboard.quickExitKey', 'Votre clé de sortie')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('dashboard.exitKeyQuestion', 'Quel est votre objectif principal ?')}
        </p>
        
        <RadioGroup value={selectedKey} onValueChange={setSelectedKey} className="space-y-2">
          {EXIT_KEY_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                selectedKey === option.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedKey(option.id)}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <div className="flex items-center gap-2 flex-1">
                <div className="p-1.5 rounded bg-primary/10 text-primary">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        {selectedOption && (
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm">Compatibilité estimée</span>
              <Badge className="bg-emerald-500 text-white">
                {selectedOption.matchScore}%
              </Badge>
            </div>
            
            <Button asChild className="w-full">
              <Link to={`/exit-keys?type=${selectedKey}`}>
                {t('dashboard.exploreExitKey', 'Explorer cette voie')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
