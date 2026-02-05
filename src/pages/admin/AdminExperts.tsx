/**
 * Admin Experts Page - Manage experts, verification, and view stats
 */
import { useState } from 'react';
import { useAllExpertsAdmin, useUpdateExpertVerification, useToggleExpertActive } from '@/hooks/useExpertsDb';
import { useConsultationStats, useAdminConsultations } from '@/hooks/useConsultations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  Search,
  Star,
  Eye,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminExperts() {
  const [search, setSearch] = useState('');
  
  const { data: experts, isLoading: expertsLoading } = useAllExpertsAdmin();
  const { data: stats, isLoading: statsLoading } = useConsultationStats();
  const { data: consultations } = useAdminConsultations();
  
  const updateVerification = useUpdateExpertVerification();
  const toggleActive = useToggleExpertActive();
  
  const filteredExperts = experts?.filter(e => 
    e.display_name.toLowerCase().includes(search.toLowerCase()) ||
    e.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  ) || [];
  
  const activeExperts = experts?.filter(e => e.is_active).length || 0;
  const verifiedExperts = experts?.filter(e => e.is_verified).length || 0;
  
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des Experts</h1>
        <p className="text-muted-foreground">
          Vérifiez les experts, gérez leur statut et consultez les statistiques.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeExperts}</p>
                <p className="text-sm text-muted-foreground">Experts actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedExperts}</p>
                <p className="text-sm text-muted-foreground">Vérifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <DollarSign className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalFees?.toFixed(0) || 0}€</p>
                )}
                <p className="text-sm text-muted-foreground">Commission totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Experts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des experts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {expertsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Spécialités</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Tarif</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExperts.map(expert => {
                  const initials = expert.display_name.split(' ').map(n => n[0]).join('').slice(0, 2);
                  
                  return (
                    <TableRow key={expert.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={expert.avatar_url || undefined} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{expert.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {expert.countries.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {expert.specialties.slice(0, 2).map(s => (
                            <Badge key={s} variant="outline" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{expert.rating_avg.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({expert.review_count})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {expert.hourly_rate} {expert.currency}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={expert.is_verified}
                          onCheckedChange={(checked) => 
                            updateVerification.mutate({ expertId: expert.id, isVerified: checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={expert.is_active}
                          onCheckedChange={(checked) => 
                            toggleActive.mutate({ expertId: expert.id, isActive: checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{expert.display_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Bio</p>
                                <p className="text-sm text-muted-foreground">{expert.bio || 'Aucune'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Certifications</p>
                                {expert.certifications && expert.certifications.length > 0 ? (
                                  <ul className="text-sm space-y-1">
                                    {expert.certifications.map((cert, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        {cert.verified ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                          <Clock className="w-4 h-4 text-amber-500" />
                                        )}
                                        {cert.title} - {cert.issuer} ({cert.year})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Aucune certification</p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Pays</p>
                                <div className="flex flex-wrap gap-1">
                                  {expert.countries.map(c => (
                                    <Badge key={c} variant="secondary">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Langues</p>
                                <p className="text-sm text-muted-foreground">
                                  {expert.languages.join(', ')}
                                </p>
                              </div>
                              <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground">
                                  Inscrit le {format(new Date(expert.created_at), 'dd MMMM yyyy', { locale: fr })}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Consultations récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {consultations && consultations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.slice(0, 10).map(consultation => (
                  <TableRow key={consultation.id}>
                    <TableCell>{consultation.expert?.display_name || 'N/A'}</TableCell>
                    <TableCell>
                      {consultation.scheduled_at 
                        ? format(new Date(consultation.scheduled_at), 'dd/MM/yyyy HH:mm')
                        : 'Non planifié'
                      }
                    </TableCell>
                    <TableCell>{consultation.duration_minutes} min</TableCell>
                    <TableCell>{consultation.amount}€</TableCell>
                    <TableCell className="text-emerald-600">{consultation.platform_fee}€</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          consultation.status === 'completed' ? 'default' :
                          consultation.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {consultation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune consultation pour le moment
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
