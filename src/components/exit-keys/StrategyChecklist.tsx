import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  FileText,
  Briefcase,
  Home,
  CreditCard,
  Shield,
  Users,
  Plane,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDays?: number;
  dependsOn?: string[];
  icon: typeof CheckCircle2;
}

interface StrategyChecklistProps {
  countryId: string;
  countryName: string;
  intention: string;
  onProgressChange?: (progress: number) => void;
}

export function StrategyChecklist({
  countryName,
  intention,
  onProgressChange
}: StrategyChecklistProps) {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Build checklist based on intention
  const checklistItems: ChecklistItem[] = (() => {
    const baseItems: ChecklistItem[] = [
      // Pre-departure essentials
      { id: 'passport_valid', label: t('exitKeys.checklist.passport', 'Passeport valide (6+ mois)'), category: 'documents', priority: 'critical', icon: FileText },
      { id: 'visa_research', label: t('exitKeys.checklist.visaResearch', 'Recherche type de visa requis'), category: 'documents', priority: 'critical', icon: FileText },
      { id: 'visa_apply', label: t('exitKeys.checklist.visaApply', 'Demande de visa déposée'), category: 'documents', priority: 'critical', dependsOn: ['visa_research'], icon: FileText },
      
      // Financial
      { id: 'savings_secured', label: t('exitKeys.checklist.savings', 'Épargne sécurisée (6 mois min)'), category: 'finance', priority: 'critical', icon: CreditCard },
      { id: 'bank_research', label: t('exitKeys.checklist.bankResearch', 'Banque internationale ou locale identifiée'), category: 'finance', priority: 'high', icon: CreditCard },
      { id: 'tax_advisor', label: t('exitKeys.checklist.taxAdvisor', 'Consultation fiscaliste'), category: 'finance', priority: 'high', icon: Briefcase },
      
      // Housing
      { id: 'housing_temp', label: t('exitKeys.checklist.housingTemp', 'Logement temporaire réservé (1ère semaine)'), category: 'housing', priority: 'high', icon: Home },
      { id: 'housing_research', label: t('exitKeys.checklist.housingResearch', 'Quartiers cibles identifiés'), category: 'housing', priority: 'medium', icon: Home },
      
      // Insurance
      { id: 'health_insurance', label: t('exitKeys.checklist.healthInsurance', 'Assurance santé internationale'), category: 'insurance', priority: 'critical', icon: Shield },
      { id: 'travel_insurance', label: t('exitKeys.checklist.travelInsurance', 'Assurance voyage/rapatriement'), category: 'insurance', priority: 'high', icon: Shield },
      
      // Administrative
      { id: 'address_change', label: t('exitKeys.checklist.addressChange', 'Changement adresse officielle'), category: 'admin', priority: 'medium', icon: FileText },
      { id: 'mail_forward', label: t('exitKeys.checklist.mailForward', 'Redirection courrier'), category: 'admin', priority: 'low', icon: FileText },
      
      // Network
      { id: 'contacts_local', label: t('exitKeys.checklist.contactsLocal', 'Contacts locaux identifiés'), category: 'network', priority: 'medium', icon: Users },
      { id: 'expat_groups', label: t('exitKeys.checklist.expatGroups', 'Groupes expats rejoints'), category: 'network', priority: 'low', icon: Users },
      
      // Travel
      { id: 'flights_booked', label: t('exitKeys.checklist.flightsBooked', 'Vols réservés'), category: 'travel', priority: 'high', dependsOn: ['visa_apply'], icon: Plane },
      { id: 'luggage_planned', label: t('exitKeys.checklist.luggagePlanned', 'Bagages planifiés (essentiel vs expédition)'), category: 'travel', priority: 'medium', icon: Plane },
    ];

    // Add intention-specific items
    if (intention === 'installation' || intention === 'work') {
      baseItems.push(
        { id: 'job_secured', label: t('exitKeys.checklist.jobSecured', 'Emploi ou opportunité confirmée'), category: 'work', priority: 'critical', icon: Briefcase },
        { id: 'contract_reviewed', label: t('exitKeys.checklist.contractReviewed', 'Contrat relu par expert'), category: 'work', priority: 'high', dependsOn: ['job_secured'], icon: Briefcase },
        { id: 'credentials_check', label: t('exitKeys.checklist.credentialsCheck', 'Équivalence diplômes vérifiée'), category: 'work', priority: 'high', icon: FileText }
      );
    }

    if (intention === 'retirement') {
      baseItems.push(
        { id: 'pension_transfer', label: t('exitKeys.checklist.pensionTransfer', 'Transfert pension organisé'), category: 'finance', priority: 'critical', icon: CreditCard },
        { id: 'healthcare_local', label: t('exitKeys.checklist.healthcareLocal', 'Système santé local compris'), category: 'insurance', priority: 'critical', icon: Shield },
        { id: 'emergency_contacts', label: t('exitKeys.checklist.emergencyContacts', 'Contacts d\'urgence établis'), category: 'network', priority: 'high', icon: Users }
      );
    }

    if (intention === 'digital_nomad') {
      baseItems.push(
        { id: 'remote_setup', label: t('exitKeys.checklist.remoteSetup', 'Setup travail remote validé'), category: 'work', priority: 'critical', icon: Briefcase },
        { id: 'timezone_plan', label: t('exitKeys.checklist.timezonePlan', 'Décalage horaire géré avec clients'), category: 'work', priority: 'high', icon: Clock },
        { id: 'coworking_found', label: t('exitKeys.checklist.coworkingFound', 'Espaces coworking repérés'), category: 'work', priority: 'medium', icon: Briefcase }
      );
    }

    return baseItems;
  })();

  // Group items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categoryLabels: Record<string, string> = {
    documents: t('exitKeys.checklist.categories.documents', 'Documents'),
    finance: t('exitKeys.checklist.categories.finance', 'Finances'),
    housing: t('exitKeys.checklist.categories.housing', 'Logement'),
    insurance: t('exitKeys.checklist.categories.insurance', 'Assurances'),
    admin: t('exitKeys.checklist.categories.admin', 'Administratif'),
    network: t('exitKeys.checklist.categories.network', 'Réseau'),
    travel: t('exitKeys.checklist.categories.travel', 'Voyage'),
    work: t('exitKeys.checklist.categories.work', 'Travail'),
  };

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-700 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    low: 'bg-muted text-muted-foreground border-muted',
  };

  // Calculate progress
  const progress = (checkedItems.size / checklistItems.length) * 100;
  const criticalItems = checklistItems.filter(i => i.priority === 'critical');
  const criticalProgress = (criticalItems.filter(i => checkedItems.has(i.id)).length / criticalItems.length) * 100;

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const canCheck = (item: ChecklistItem) => {
    if (!item.dependsOn) return true;
    return item.dependsOn.every(dep => checkedItems.has(dep));
  };

  return (
    <Card className="border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListTodo className="w-5 h-5 text-emerald-600" />
          {t('exitKeys.checklist.title', 'Checklist automatisée')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('exitKeys.checklist.subtitle', 'Préparation pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('exitKeys.checklist.overall', 'Progression globale')}</span>
              <span className="font-bold text-lg">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="p-4 rounded-lg bg-red-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('exitKeys.checklist.critical', 'Critiques')}
              </span>
              <span className="font-bold text-lg text-red-700">{Math.round(criticalProgress)}%</span>
            </div>
            <Progress value={criticalProgress} className="h-2 bg-red-200 [&>div]:bg-red-500" />
          </div>
        </div>

        <Separator />

        {/* Checklist by Category */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Badge variant="outline">{categoryLabels[category] || category}</Badge>
                <span className="text-muted-foreground text-xs">
                  {items.filter(i => checkedItems.has(i.id)).length}/{items.length}
                </span>
              </h4>
              <div className="space-y-2">
                {items.map(item => {
                  const Icon = item.icon;
                  const isChecked = checkedItems.has(item.id);
                  const canToggle = canCheck(item);
                  
                  return (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isChecked ? 'bg-emerald-500/10' : canToggle ? 'bg-muted/30 hover:bg-muted/50' : 'bg-muted/20 opacity-50'
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={!canToggle}
                      />
                      <Icon className={`w-4 h-4 ${isChecked ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <label 
                        htmlFor={item.id}
                        className={`flex-1 text-sm cursor-pointer ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.label}
                      </label>
                      <Badge variant="outline" className={`text-xs ${priorityColors[item.priority]}`}>
                        {t(`exitKeys.checklist.priority.${item.priority}`, item.priority)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCheckedItems(new Set())}
            className="flex-1"
          >
            {t('exitKeys.checklist.reset', 'Réinitialiser')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCheckedItems(new Set(checklistItems.map(i => i.id)))}
            className="flex-1"
          >
            {t('exitKeys.checklist.markAll', 'Tout cocher')}
          </Button>
        </div>

        {/* Reminder */}
        <p className="text-xs text-muted-foreground">
          {t('exitKeys.checklist.reminder', '💡 Les éléments grisés dépendent d\'autres tâches à compléter d\'abord.')}
        </p>
      </CardContent>
    </Card>
  );
}
