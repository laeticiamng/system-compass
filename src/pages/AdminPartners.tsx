import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Star,
  Award,
  Loader2,
  Search,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PartnerApplication {
  id: string;
  user_id: string;
  partner_type: string;
  motivation: string;
  company_name: string | null;
  professional_profile: string | null;
  platform_experience: string | null;
  status: string;
  ethics_charter_accepted: boolean;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}

interface Contribution {
  id: string;
  user_id: string;
  contribution_type: string;
  description: string;
  impact_metric: string | null;
  verified: boolean;
  credits_awarded: number | null;
  created_at: string;
}

export default function AdminPartners() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [creditsToAward, setCreditsToAward] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, contribsRes] = await Promise.all([
        supabase
          .from('partner_applications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('partner_contributions')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (appsRes.data) setApplications(appsRes.data);
      if (contribsRes.data) setContributions(contribsRes.data);
    } catch (err) {
      console.error('Error fetching partner data:', err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: PartnerApplication) => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          review_notes: reviewNotes
        })
        .eq('id', app.id);

      if (error) throw error;

      toast.success('Candidature approuvée');
      setSelectedApp(null);
      setReviewNotes('');
      fetchData();
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (app: PartnerApplication) => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          review_notes: reviewNotes
        })
        .eq('id', app.id);

      if (error) throw error;

      toast.success('Candidature rejetée');
      setSelectedApp(null);
      setReviewNotes('');
      fetchData();
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('Erreur lors du rejet');
    }
  };

  const handleVerifyContribution = async (contrib: Contribution) => {
    try {
      const { error } = await supabase
        .from('partner_contributions')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          credits_awarded: creditsToAward
        })
        .eq('id', contrib.id);

      if (error) throw error;

      toast.success(`Contribution vérifiée (+${creditsToAward} crédits)`);
      fetchData();
    } catch (err) {
      console.error('Error verifying contribution:', err);
      toast.error('Erreur lors de la vérification');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const pendingContribs = contributions.filter(c => !c.verified);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Partenaires</h1>
            <p className="text-muted-foreground">Gérer les candidatures et contributions</p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {pendingApps.length} candidatures en attente
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="w-3 h-3" />
              {pendingContribs.length} contributions à vérifier
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total candidatures</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approuvées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contributions</p>
                  <p className="text-2xl font-bold">{contributions.length}</p>
                </div>
                <Star className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Crédits distribués</p>
                  <p className="text-2xl font-bold text-primary">
                    {contributions.reduce((acc, c) => acc + (c.credits_awarded || 0), 0)}
                  </p>
                </div>
                <Award className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications" className="gap-2">
              <Users className="w-4 h-4" />
              Candidatures
              {pendingApps.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingApps.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contributions" className="gap-2">
              <Star className="w-4 h-4" />
              Contributions
              {pendingContribs.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingContribs.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Candidatures partenaires</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Motivation</TableHead>
                      <TableHead>Charte</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .filter(a => 
                        a.motivation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {app.partner_type === 'ambassador' ? (
                              <><Users className="w-3 h-3 mr-1" />Ambassadeur</>
                            ) : (
                              <><Building2 className="w-3 h-3 mr-1" />B2B</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.company_name || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{app.motivation}</TableCell>
                        <TableCell>
                          {app.ethics_charter_accepted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.created_at), 'd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApp(app)}
                            >
                              Examiner
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions">
            <Card>
              <CardHeader>
                <CardTitle>Contributions à vérifier</CardTitle>
                <CardDescription>
                  Validez les contributions et attribuez des crédits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="text-sm font-medium">Crédits par défaut à attribuer:</label>
                  <Input
                    type="number"
                    value={creditsToAward}
                    onChange={(e) => setCreditsToAward(parseInt(e.target.value) || 0)}
                    className="w-24 mt-1"
                    min={0}
                    max={100}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contrib) => (
                      <TableRow key={contrib.id}>
                        <TableCell>
                          <Badge variant="outline">{contrib.contribution_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-sm">{contrib.description}</TableCell>
                        <TableCell>{contrib.impact_metric || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(contrib.created_at), 'd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {contrib.verified ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              +{contrib.credits_awarded} crédits
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!contrib.verified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyContribution(contrib)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Valider
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Examiner la candidature</DialogTitle>
              <DialogDescription>
                {selectedApp?.partner_type === 'ambassador' ? 'Candidature Ambassadeur' : 'Candidature B2B'}
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                {selectedApp.company_name && (
                  <div>
                    <label className="text-sm font-medium">Entreprise</label>
                    <p className="text-sm text-muted-foreground">{selectedApp.company_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Motivation</label>
                  <p className="text-sm text-muted-foreground">{selectedApp.motivation}</p>
                </div>
                {selectedApp.professional_profile && (
                  <div>
                    <label className="text-sm font-medium">Profil professionnel</label>
                    <p className="text-sm text-muted-foreground">{selectedApp.professional_profile}</p>
                  </div>
                )}
                {selectedApp.platform_experience && (
                  <div>
                    <label className="text-sm font-medium">Expérience plateforme</label>
                    <p className="text-sm text-muted-foreground">{selectedApp.platform_experience}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Notes de revue</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Notes internes sur cette candidature..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedApp)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button onClick={() => handleApprove(selectedApp)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approuver
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
