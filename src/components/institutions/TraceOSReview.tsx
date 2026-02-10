import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  GitBranch,
  MessageSquare,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { DecisionNodeData } from './DecisionNode';
import { useTraceOSWorkflows, useTraceOSApprovals } from '@/hooks/useTraceOSWorkflows';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TraceOSReviewProps {
  decisions: DecisionNodeData[];
  onSelectDecision?: (decision: DecisionNodeData) => void;
}

export function TraceOSReview({ decisions, onSelectDecision }: TraceOSReviewProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { workflows, loading: workflowsLoading, createWorkflow } = useTraceOSWorkflows();
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    steps: [{ order: 1, name: '', required_approvers: 1, type: 'approval' as const }]
  });
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [showStartWorkflow, setShowStartWorkflow] = useState(false);

  const { approvals, startWorkflow, approveStep, rejectStep } =
    useTraceOSApprovals(selectedDecisionId || undefined);

  const pendingDecisions = useMemo(() => {
    return decisions.filter(d => d.status === 'pending');
  }, [decisions]);

  const selectedDecision = useMemo(() => {
    return decisions.find(d => d.id === selectedDecisionId);
  }, [decisions, selectedDecisionId]);

  const handleSelectDecision = (decision: DecisionNodeData) => {
    setSelectedDecisionId(decision.id);
    onSelectDecision?.(decision);
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || newWorkflow.steps.some(s => !s.name)) {
      toast.error(t('traceOS.review.fillAllFields', 'Please fill all required fields'));
      return;
    }

    await createWorkflow(newWorkflow.name, newWorkflow.description, newWorkflow.steps);
    setShowCreateWorkflow(false);
    setNewWorkflow({
      name: '',
      description: '',
      steps: [{ order: 1, name: '', required_approvers: 1, type: 'approval' }]
    });
  };

  const handleStartWorkflow = async () => {
    if (!selectedDecisionId || !selectedWorkflowId) return;

    const success = await startWorkflow(selectedWorkflowId, selectedDecisionId);
    if (success) {
      setShowStartWorkflow(false);
      setSelectedWorkflowId('');
    }
  };

  const addWorkflowStep = () => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, {
        order: prev.steps.length + 1,
        name: '',
        required_approvers: 1,
        type: 'approval'
      }]
    }));
  };

  const updateWorkflowStep = (index: number, field: string, value: string | number) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeWorkflowStep = (index: number) => {
    if (newWorkflow.steps.length <= 1) return;
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              {t('traceOS.review.pendingDecisions', 'Pending Decisions')}
            </CardTitle>
            <CardDescription>
              {t('traceOS.review.pendingDesc', 'Decisions awaiting review and approval')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingDecisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t('traceOS.review.noPending', 'No pending decisions')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDecisions.map(decision => (
                  <div
                    key={decision.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedDecisionId === decision.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectDecision(decision)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{decision.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {decision.context}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700">
                        {t('traceOS.status.pending', 'Pending')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>{decision.author}</span>
                      <span>•</span>
                      <span>{new Date(decision.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">{decision.scope}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Workflow */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  {t('traceOS.review.approvalWorkflow', 'Approval Workflow')}
                </CardTitle>
                <CardDescription>
                  {t('traceOS.review.workflowDesc', 'Manage approval steps for decisions')}
                </CardDescription>
              </div>
              <Dialog open={showCreateWorkflow} onOpenChange={setShowCreateWorkflow}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    {t('traceOS.review.createWorkflow', 'Create Workflow')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t('traceOS.review.newWorkflow', 'New Approval Workflow')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium">{t('traceOS.review.workflowName', 'Workflow Name')}</label>
                      <Input
                        value={newWorkflow.name}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('traceOS.review.workflowNamePlaceholder', 'e.g., Strategic Review')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('common.description', 'Description')}</label>
                      <Textarea
                        value={newWorkflow.description}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={t('traceOS.review.workflowDescPlaceholder', 'Describe the approval process...')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('traceOS.review.steps', 'Steps')}</label>
                      <div className="space-y-3">
                        {newWorkflow.steps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                            <Input
                              value={step.name}
                              onChange={(e) => updateWorkflowStep(index, 'name', e.target.value)}
                              placeholder={t('traceOS.review.stepName', 'Step name')}
                              className="flex-1"
                            />
                            <Select
                              value={step.type}
                              onValueChange={(v) => updateWorkflowStep(index, 'type', v)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approval">{t('traceOS.review.typeApproval', 'Approval')}</SelectItem>
                                <SelectItem value="review">{t('traceOS.review.typeReview', 'Review')}</SelectItem>
                                <SelectItem value="signature">{t('traceOS.review.typeSignature', 'Signature')}</SelectItem>
                              </SelectContent>
                            </Select>
                            {newWorkflow.steps.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWorkflowStep(index)}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={addWorkflowStep}>
                        {t('traceOS.review.addStep', 'Add Step')}
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateWorkflow(false)}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleCreateWorkflow}>
                      {t('traceOS.review.create', 'Create')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDecisionId ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t('traceOS.review.selectDecision', 'Select a decision to review')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Decision Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium">{selectedDecision?.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDecision?.mainHypothesis}</p>
                </div>

                {/* Start Workflow Button */}
                {approvals.length === 0 && workflows.length > 0 && (
                  <Dialog open={showStartWorkflow} onOpenChange={setShowStartWorkflow}>
                    <DialogTrigger asChild>
                      <Button className="w-full gap-2">
                        <Play className="w-4 h-4" />
                        {t('traceOS.review.startWorkflow', 'Start Approval Workflow')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('traceOS.review.selectWorkflow', 'Select Workflow')}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('traceOS.review.chooseWorkflow', 'Choose a workflow...')} />
                          </SelectTrigger>
                          <SelectContent>
                            {workflows.map(wf => (
                              <SelectItem key={wf.id} value={wf.id}>
                                {wf.name} ({wf.steps.length} {t('traceOS.review.steps', 'steps')})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStartWorkflow(false)}>
                          {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleStartWorkflow} disabled={!selectedWorkflowId}>
                          {t('traceOS.review.start', 'Start')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Approval Steps */}
                {approvals.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">{t('traceOS.review.approvalProgress', 'Approval Progress')}</h5>
                    {approvals.map((approval, index) => (
                      <ApprovalStepCard
                        key={approval.id}
                        approval={approval}
                        isLast={index === approvals.length - 1}
                        previousApproved={index === 0 || approvals[index - 1].status === 'approved'}
                        onApprove={() => approveStep(approval.id)}
                        onReject={(comment) => rejectStep(approval.id, comment)}
                        canAct={user !== null}
                      />
                    ))}
                  </div>
                )}

                {/* No Workflows Warning */}
                {workflows.length === 0 && approvals.length === 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-700">
                          {t('traceOS.review.noWorkflows', 'No workflows configured')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('traceOS.review.createWorkflowPrompt', 'Create an approval workflow to start the review process.')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            {t('traceOS.review.availableWorkflows', 'Available Workflows')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workflowsLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              {t('common.loading', 'Loading...')}
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t('traceOS.review.noWorkflowsYet', 'No workflows created yet')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map(workflow => (
                <div key={workflow.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{workflow.name}</h4>
                  {workflow.description && (
                    <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {workflow.steps.map((step, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {i + 1}. {step.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ApprovalStepCardProps {
  approval: {
    id: string;
    step_name: string;
    status: 'pending' | 'approved' | 'rejected';
    approver_name: string | null;
    comment: string | null;
    approved_at: string | null;
  };
  isLast: boolean;
  previousApproved: boolean;
  onApprove: () => void;
  onReject: (comment: string) => void;
  canAct: boolean;
}

function ApprovalStepCard({
  approval,
  isLast,
  previousApproved,
  onApprove,
  onReject,
  canAct
}: ApprovalStepCardProps) {
  const { t } = useTranslation();
  const [showReject, setShowReject] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
  };

  const config = statusConfig[approval.status];
  const Icon = config.icon;
  const canActOnThis = canAct && approval.status === 'pending' && previousApproved;

  const handleReject = () => {
    if (!rejectComment.trim()) {
      toast.error(t('traceOS.review.commentRequired', 'Please provide a reason for rejection'));
      return;
    }
    onReject(rejectComment);
    setShowReject(false);
    setRejectComment('');
  };

  return (
    <div className={`relative p-4 rounded-lg ${config.bg} border`}>
      {/* Connection Line */}
      {!isLast && (
        <div className="absolute left-7 -bottom-3 w-0.5 h-6 bg-border z-0" />
      )}

      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">{approval.step_name}</h5>
            <Badge variant="outline" className={`${config.color}`}>
              {t(`traceOS.status.${approval.status}`, approval.status)}
            </Badge>
          </div>

          {approval.approver_name && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('traceOS.review.by', 'By')}: {approval.approver_name}
              {approval.approved_at && ` • ${new Date(approval.approved_at).toLocaleString()}`}
            </p>
          )}

          {approval.comment && (
            <div className="mt-2 p-2 bg-background rounded text-sm flex items-start gap-2">
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{approval.comment}</span>
            </div>
          )}

          {canActOnThis && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={onApprove} className="gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {t('traceOS.review.approve', 'Approve')}
              </Button>
              {!showReject ? (
                <Button size="sm" variant="outline" onClick={() => setShowReject(true)} className="gap-1">
                  <XCircle className="w-4 h-4" />
                  {t('traceOS.review.reject', 'Reject')}
                </Button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder={t('traceOS.review.rejectReason', 'Reason for rejection...')}
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" variant="destructive" onClick={handleReject}>
                    {t('common.confirm', 'Confirm')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
                    {t('common.cancel', 'Cancel')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
