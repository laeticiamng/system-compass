import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCase } from '@/hooks/useUserCases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, CheckCircle2, Calendar, 
  Target, AlertTriangle, Users, FileCheck, Settings 
} from 'lucide-react';

interface CaseMilestonesProps {
  caseData: UserCase;
  onUpdateCase: (updates: Partial<UserCase>) => void;
}

const MILESTONE_TYPES = [
  { value: 'clarification', label: 'Clarification', icon: AlertTriangle },
  { value: 'admin', label: 'Administratif', icon: FileCheck },
  { value: 'poc', label: 'POC', icon: Target },
  { value: 'risk', label: 'Risque', icon: AlertTriangle },
  { value: 'partner', label: 'Partenaire', icon: Users },
  { value: 'custom', label: 'Autre', icon: Settings },
] as const;

export function CaseMilestones({ caseData, onUpdateCase }: CaseMilestonesProps) {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('custom');
  const [newDeadline, setNewDeadline] = useState('');

  const addMilestone = () => {
    if (!newTitle.trim()) return;

    const milestone = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      deadline: newDeadline || undefined,
      completed: false,
      type: newType as any,
    };

    onUpdateCase({
      milestones: [...caseData.milestones, milestone],
    });

    setNewTitle('');
    setNewDeadline('');
    setNewType('custom');
  };

  const toggleMilestone = (id: string) => {
    const updated = caseData.milestones.map((m) =>
      m.id === id
        ? { ...m, completed: !m.completed, completed_at: !m.completed ? new Date().toISOString() : undefined }
        : m
    );
    onUpdateCase({ milestones: updated });
  };

  const deleteMilestone = (id: string) => {
    onUpdateCase({
      milestones: caseData.milestones.filter((m) => m.id !== id),
    });
  };

  const updateMilestone = (id: string, updates: Partial<typeof caseData.milestones[0]>) => {
    const updated = caseData.milestones.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    onUpdateCase({ milestones: updated });
  };

  // Group milestones by status
  const pendingMilestones = caseData.milestones.filter((m) => !m.completed);
  const completedMilestones = caseData.milestones.filter((m) => m.completed);

  // Check for overdue milestones
  const today = new Date().toISOString().split('T')[0];
  const overdueMilestones = pendingMilestones.filter(
    (m) => m.deadline && m.deadline < today
  );

  return (
    <div className="space-y-6">
      {/* Add New Milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('cases.milestones.addNew', 'Ajouter un jalon')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('cases.milestones.titlePlaceholder', 'Titre du jalon')}
                onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
              />
            </div>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILESTONE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(`cases.milestones.types.${type.value}`, type.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addMilestone} disabled={!newTitle.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Alert */}
      {overdueMilestones.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {t('cases.milestones.overdue', '{{count}} jalon(s) en retard', { count: overdueMilestones.length })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('cases.milestones.pending', 'Jalons à compléter')}
            <Badge variant="secondary">{pendingMilestones.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingMilestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t('cases.milestones.noPending', 'Aucun jalon en attente')}
            </p>
          ) : (
            <div className="space-y-3">
              {pendingMilestones.map((milestone) => {
                const isOverdue = milestone.deadline && milestone.deadline < today;
                const TypeIcon = MILESTONE_TYPES.find((t) => t.value === milestone.type)?.icon || Settings;

                return (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isOverdue ? 'border-destructive/50 bg-destructive/5' : 'bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={() => toggleMilestone(milestone.id)}
                    />
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {t(`cases.milestones.types.${milestone.type}`, milestone.type)}
                    </Badge>
                    {milestone.deadline && (
                      <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Calendar className="w-3 h-3" />
                        {milestone.deadline}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMilestone(milestone.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {t('cases.milestones.completed', 'Jalons terminés')}
              <Badge variant="secondary">{completedMilestones.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 opacity-70"
                >
                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={() => toggleMilestone(milestone.id)}
                  />
                  <span className="flex-1 line-through text-muted-foreground">
                    {milestone.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
