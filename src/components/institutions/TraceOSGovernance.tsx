import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Lock,
  Users,
  UserPlus,
  Key,
  History,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  addedAt: string;
  lastActivity?: string;
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'approve';
  target: string;
  timestamp: string;
  details?: string;
}

const ROLE_PERMISSIONS = {
  admin: {
    label: 'Administrator',
    permissions: ['create', 'read', 'update', 'delete', 'manage_team', 'export', 'approve'],
    color: 'bg-purple-500/20 text-purple-700'
  },
  editor: {
    label: 'Editor',
    permissions: ['create', 'read', 'update', 'export'],
    color: 'bg-blue-500/20 text-blue-700'
  },
  viewer: {
    label: 'Viewer',
    permissions: ['read'],
    color: 'bg-gray-500/20 text-gray-700'
  }
};

export function TraceOSGovernance() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Mock data - in production, this would come from a database
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      email: user?.email || 'owner@example.com',
      name: user?.user_metadata?.display_name || 'Owner',
      role: 'admin',
      addedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
  ]);

  const [accessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      userId: '1',
      userName: user?.email?.split('@')[0] || 'User',
      action: 'create',
      target: 'Decision: Market Expansion',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      userId: '1',
      userName: user?.email?.split('@')[0] || 'User',
      action: 'view',
      target: 'Decision Tree',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      userId: '1',
      userName: user?.email?.split('@')[0] || 'User',
      action: 'export',
      target: 'PDF Report',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [settings, setSettings] = useState({
    requireApprovalForStrategic: true,
    allowExternalSharing: false,
    retainHistoryDays: 365,
    autoArchiveAfterDays: 90
  });

  const handleInvite = () => {
    if (!inviteEmail.includes('@')) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      email: inviteEmail,
      name: inviteEmail.split('@')[0],
      role: inviteRole,
      addedAt: new Date().toISOString()
    };

    setTeamMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleChangeRole = (memberId: string, newRole: TeamMember['role']) => {
    setTeamMembers(prev =>
      prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    );
  };

  const getActionIcon = (action: AccessLog['action']) => {
    const icons = {
      view: Eye,
      create: Edit3,
      update: Edit3,
      delete: Trash2,
      export: Download,
      approve: CheckCircle2
    };
    return icons[action];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="access" className="space-y-6">
        <TabsList>
          <TabsTrigger value="access" className="gap-2">
            <Users className="w-4 h-4" />
            {t('traceOS.governance.accessControl', 'Access Control')}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="w-4 h-4" />
            {t('traceOS.governance.auditLog', 'Audit Log')}
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2">
            <Shield className="w-4 h-4" />
            {t('traceOS.governance.policies', 'Policies')}
          </TabsTrigger>
        </TabsList>

        {/* Access Control Tab */}
        <TabsContent value="access">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {t('traceOS.governance.teamMembers', 'Team Members')}
                    </CardTitle>
                    <CardDescription>
                      {t('traceOS.governance.teamDesc', 'Manage who has access to your decisions')}
                    </CardDescription>
                  </div>
                  <Dialog open={showInvite} onOpenChange={setShowInvite}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <UserPlus className="w-4 h-4" />
                        {t('traceOS.governance.invite', 'Invite')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('traceOS.governance.inviteMember', 'Invite Team Member')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">{t('traceOS.governance.email', 'Email')}</label>
                          <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('traceOS.governance.role', 'Role')}</label>
                          <Select value={inviteRole} onValueChange={(v: 'editor' | 'viewer') => setInviteRole(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-2">
                                  <Edit3 className="w-4 h-4" />
                                  {t('traceOS.governance.roleEditor', 'Editor')}
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  {t('traceOS.governance.roleViewer', 'Viewer')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInvite(false)}>
                          {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleInvite} disabled={!inviteEmail.includes('@')}>
                          {t('traceOS.governance.sendInvite', 'Send Invite')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === 'admin' && member.id === '1' ? (
                          <Badge className={ROLE_PERMISSIONS.admin.color}>
                            {t('traceOS.governance.owner', 'Owner')}
                          </Badge>
                        ) : (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(v) => handleChangeRole(member.id, v as TeamMember['role'])}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="editor">{t('traceOS.governance.roleEditor', 'Editor')}</SelectItem>
                                <SelectItem value="viewer">{t('traceOS.governance.roleViewer', 'Viewer')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permissions Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {t('traceOS.governance.permissions', 'Permissions')}
                </CardTitle>
                <CardDescription>
                  {t('traceOS.governance.permissionsDesc', 'Role-based access control matrix')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => (
                    <div key={role} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={config.color}>{t(`traceOS.governance.role${config.label.replace(' ', '')}`, config.label)}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['create', 'read', 'update', 'delete', 'export', 'approve', 'manage_team'].map(permission => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className={config.permissions.includes(permission) ? 'bg-green-500/10 text-green-700 border-green-500/30' : 'opacity-30'}
                          >
                            {config.permissions.includes(permission) ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : null}
                            {t(`traceOS.governance.perm.${permission}`, permission)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    {t('traceOS.governance.activityLog', 'Activity Log')}
                  </CardTitle>
                  <CardDescription>
                    {t('traceOS.governance.activityDesc', 'Complete audit trail of all actions')}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="w-4 h-4" />
                  {t('traceOS.governance.exportLog', 'Export Log')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs.map(log => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ActionIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {t(`traceOS.governance.action.${log.action}`, log.action)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.target}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Security Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t('traceOS.governance.securityPolicies', 'Security Policies')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{t('traceOS.governance.requireApproval', 'Require approval for strategic decisions')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('traceOS.governance.requireApprovalDesc', 'Strategic decisions must go through approval workflow')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireApprovalForStrategic}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, requireApprovalForStrategic: v }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{t('traceOS.governance.externalSharing', 'Allow external sharing')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('traceOS.governance.externalSharingDesc', 'Enable sharing decisions with external parties')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowExternalSharing}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, allowExternalSharing: v }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('traceOS.governance.dataRetention', 'Data Retention')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{t('traceOS.governance.historyRetention', 'History retention')}</p>
                    <Input
                      type="number"
                      value={settings.retainHistoryDays}
                      onChange={(e) => setSettings(prev => ({ ...prev, retainHistoryDays: parseInt(e.target.value) || 365 }))}
                      className="w-24 text-right"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('traceOS.governance.historyRetentionDesc', 'Days to retain decision history')}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{t('traceOS.governance.autoArchive', 'Auto-archive after')}</p>
                    <Input
                      type="number"
                      value={settings.autoArchiveAfterDays}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoArchiveAfterDays: parseInt(e.target.value) || 90 }))}
                      className="w-24 text-right"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('traceOS.governance.autoArchiveDesc', 'Days of inactivity before archiving')}
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {t('traceOS.governance.appendOnly', 'Append-only history')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('traceOS.governance.appendOnlyDesc', 'All changes are logged and cannot be modified or deleted. This ensures a complete audit trail.')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
