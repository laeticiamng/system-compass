import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePmoBudget } from '@/hooks/usePmoBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, Wallet,
  Loader2, Trash2, AlertCircle, Copy, PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  formatBudgetAmount,
  calculateRunway,
  BUDGET_CATEGORY_LABELS,
  SCENARIO_TYPE_LABELS,
  type BudgetType,
  type BudgetCategory,
  type ScenarioType,
  type CreateBudgetLineForm
} from '@/lib/pmo-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BudgetRunwayProps {
  caseId: string;
  isAdvancedMode?: boolean;
  availableCash?: number;
}

export function BudgetRunway({ caseId, isAdvancedMode = false, availableCash = 0 }: BudgetRunwayProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  
  const { 
    budgetLines, 
    scenarios,
    dashboard,
    isLoading,
    isCreating,
    createBudgetLine,
    deleteBudgetLine,
    createScenario,
    activeScenarioId,
    setActiveScenarioId
  } = usePmoBudget(caseId);

  const [showLineDialog, setShowLineDialog] = useState(false);
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  
  const [lineForm, setLineForm] = useState<CreateBudgetLineForm>({
    budget_type: 'opex',
    category: 'other',
    description: '',
    amount: 0,
    month_year: format(new Date(), 'yyyy-MM'),
    is_recurring: false,
  });

  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    type: 'base' as ScenarioType,
  });

  const handleCreateLine = () => {
    createBudgetLine({
      ...lineForm,
      scenario_id: activeScenarioId || undefined,
    });
    setLineForm({
      budget_type: 'opex',
      category: 'other',
      description: '',
      amount: 0,
      month_year: format(new Date(), 'yyyy-MM'),
      is_recurring: false,
    });
    setShowLineDialog(false);
  };

  const handleCreateScenario = () => {
    createScenario({
      name: scenarioForm.name,
      type: scenarioForm.type,
    });
    setScenarioForm({ name: '', type: 'base' });
    setShowScenarioDialog(false);
  };

  const runway = calculateRunway(availableCash, dashboard.monthly_burn_rate);

  // Chart colors
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Prepare chart data
  const categoryData = Object.entries(dashboard.by_category).map(([category, amount]) => ({
    name: BUDGET_CATEGORY_LABELS[category as BudgetCategory]?.[lang] || category,
    value: amount,
  }));

  const monthlyData = dashboard.by_month.map(m => ({
    month: m.month,
    CAPEX: m.capex,
    OPEX: m.opex,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            {isAdvancedMode 
              ? t('pmo.budget.title', 'Budget & Runway')
              : t('pmo.budget.titleSimple', 'Budget prévisionnel')
            }
          </h2>
          <p className="text-muted-foreground">
            {isAdvancedMode
              ? t('pmo.budget.subtitle', 'CAPEX/OPEX, scénarios et projections')
              : t('pmo.budget.subtitleSimple', 'Estimez vos dépenses')
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {isAdvancedMode && (
            <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  {t('pmo.budget.newScenario', 'Scénario')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('pmo.budget.createScenario', 'Nouveau scénario')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>{t('pmo.form.name', 'Nom')}</Label>
                    <Input
                      value={scenarioForm.name}
                      onChange={(e) => setScenarioForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={t('pmo.budget.scenarioPlaceholder', 'Ex: Budget optimiste 2025')}
                    />
                  </div>
                  <div>
                    <Label>{t('pmo.form.type', 'Type')}</Label>
                    <Select
                      value={scenarioForm.type}
                      onValueChange={(v) => setScenarioForm(f => ({ ...f, type: v as ScenarioType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(SCENARIO_TYPE_LABELS) as ScenarioType[]).map(type => (
                          <SelectItem key={type} value={type}>
                            {SCENARIO_TYPE_LABELS[type][lang]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateScenario} 
                    disabled={!scenarioForm.name}
                    className="w-full"
                  >
                    {t('pmo.form.create', 'Créer')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={showLineDialog} onOpenChange={setShowLineDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t('pmo.budget.addLine', 'Ajouter')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('pmo.budget.newLine', 'Nouvelle ligne budgétaire')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t('pmo.form.description', 'Description')}</Label>
                  <Input
                    value={lineForm.description}
                    onChange={(e) => setLineForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t('pmo.budget.linePlaceholder', 'Ex: Loyer bureau Paris')}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('pmo.budget.type', 'Type')}</Label>
                    <Select
                      value={lineForm.budget_type}
                      onValueChange={(v) => setLineForm(f => ({ ...f, budget_type: v as BudgetType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capex">CAPEX</SelectItem>
                        <SelectItem value="opex">OPEX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('pmo.budget.category', 'Catégorie')}</Label>
                    <Select
                      value={lineForm.category}
                      onValueChange={(v) => setLineForm(f => ({ ...f, category: v as BudgetCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(BUDGET_CATEGORY_LABELS) as BudgetCategory[]).map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {BUDGET_CATEGORY_LABELS[cat][lang]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('pmo.budget.amount', 'Montant (€)')}</Label>
                    <Input
                      type="number"
                      value={lineForm.amount}
                      onChange={(e) => setLineForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>{t('pmo.budget.month', 'Mois')}</Label>
                    <Input
                      type="month"
                      value={lineForm.month_year}
                      onChange={(e) => setLineForm(f => ({ ...f, month_year: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={lineForm.is_recurring}
                    onChange={(e) => setLineForm(f => ({ ...f, is_recurring: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="recurring">{t('pmo.budget.recurring', 'Récurrent (mensuel)')}</Label>
                </div>

                <div>
                  <Label>{t('pmo.budget.justification', 'Justification')}</Label>
                  <Textarea
                    value={lineForm.justification || ''}
                    onChange={(e) => setLineForm(f => ({ ...f, justification: e.target.value }))}
                    placeholder={t('pmo.budget.justificationPlaceholder', 'Pourquoi cette dépense ?')}
                  />
                </div>

                <Button 
                  onClick={handleCreateLine} 
                  disabled={!lineForm.description || lineForm.amount <= 0 || isCreating}
                  className="w-full"
                >
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('pmo.form.create', 'Créer')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Scenario Selector (Advanced) */}
      {isAdvancedMode && scenarios.length > 0 && (
        <div className="flex items-center gap-4">
          <Label>{t('pmo.budget.activeScenario', 'Scénario actif')}</Label>
          <Select
            value={activeScenarioId || 'all'}
            onValueChange={(v) => setActiveScenarioId(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t('pmo.budget.allScenarios', 'Tous les scénarios')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('pmo.budget.allScenarios', 'Tous')}</SelectItem>
              {scenarios.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({SCENARIO_TYPE_LABELS[s.scenario_type as ScenarioType]?.[lang]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatBudgetAmount(dashboard.total_budget)}</div>
            <p className="text-sm text-muted-foreground">{t('pmo.budget.total', 'Budget total')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{formatBudgetAmount(dashboard.total_capex)}</div>
            <p className="text-sm text-muted-foreground">CAPEX</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{formatBudgetAmount(dashboard.total_opex)}</div>
            <p className="text-sm text-muted-foreground">OPEX</p>
          </CardContent>
        </Card>
        <Card className={runway < 6 ? 'border-red-500' : runway < 12 ? 'border-yellow-500' : ''}>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              {runway === 999 ? '∞' : `${runway} mois`}
            </div>
            <p className="text-sm text-muted-foreground">{t('pmo.budget.runway', 'Runway')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {dashboard.alerts.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              {t('pmo.budget.alerts', 'Alertes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {dashboard.alerts.map((alert, i) => (
                <li key={i} className={`text-sm ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                  • {alert.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {isAdvancedMode && budgetLines.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('pmo.budget.monthlyBreakdown', 'Répartition mensuelle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatBudgetAmount(value)} />
                  <Legend />
                  <Bar dataKey="CAPEX" fill="#3b82f6" />
                  <Bar dataKey="OPEX" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('pmo.budget.categoryBreakdown', 'Par catégorie')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatBudgetAmount(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pmo.budget.lines', 'Lignes budgétaires')}</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('pmo.budget.noLines', 'Aucune ligne budgétaire')}</p>
              <Button className="mt-4" onClick={() => setShowLineDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('pmo.budget.addFirst', 'Ajouter une dépense')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">{t('pmo.budget.description', 'Description')}</th>
                    <th className="text-left py-2">{t('pmo.budget.type', 'Type')}</th>
                    <th className="text-left py-2">{t('pmo.budget.category', 'Catégorie')}</th>
                    <th className="text-right py-2">{t('pmo.budget.amount', 'Montant')}</th>
                    <th className="text-left py-2">{t('pmo.budget.month', 'Mois')}</th>
                    <th className="text-right py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {budgetLines.map(line => (
                    <tr key={line.id} className="border-b hover:bg-muted/50">
                      <td className="py-2">
                        {line.description}
                        {line.is_recurring && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t('pmo.budget.recurringBadge', 'Récurrent')}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2">
                        <Badge variant={line.budget_type === 'capex' ? 'default' : 'secondary'}>
                          {line.budget_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {BUDGET_CATEGORY_LABELS[line.category as BudgetCategory]?.[lang]}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatBudgetAmount(line.amount, line.currency)}
                      </td>
                      <td className="py-2">{line.month_year}</td>
                      <td className="py-2 text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive h-8 w-8 p-0"
                          onClick={() => deleteBudgetLine(line.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={3} className="py-2">{t('pmo.budget.total', 'Total')}</td>
                    <td className="py-2 text-right">{formatBudgetAmount(dashboard.total_budget)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
