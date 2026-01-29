import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  Download,
  CreditCard,
  Wallet,
  History,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Commission {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'cpa' | 'revenue_share' | 'flat_fee';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: Date;
  paidAt?: Date;
  referenceId?: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'paypal' | 'wise';
  status: 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
}

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'c1',
    partnerId: 'wise',
    partnerName: 'Wise',
    type: 'cpa',
    amount: 25,
    currency: '€',
    status: 'paid',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    referenceId: 'WIS-2024-001',
  },
  {
    id: 'c2',
    partnerId: 'safetywing',
    partnerName: 'SafetyWing',
    type: 'revenue_share',
    amount: 45.50,
    currency: '€',
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    referenceId: 'SW-2024-015',
  },
  {
    id: 'c3',
    partnerId: 'revolut',
    partnerName: 'Revolut',
    type: 'cpa',
    amount: 15,
    currency: '€',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    referenceId: 'REV-2024-042',
  },
  {
    id: 'c4',
    partnerId: 'deel',
    partnerName: 'Deel',
    type: 'flat_fee',
    amount: 100,
    currency: '€',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    referenceId: 'DEL-2024-008',
  },
];

const MOCK_PAYOUTS: PayoutRequest[] = [
  {
    id: 'p1',
    amount: 250,
    currency: '€',
    method: 'bank_transfer',
    status: 'completed',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: 'p2',
    amount: 180,
    currency: '€',
    method: 'wise',
    status: 'processing',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
];

interface PartnerCommissionSystemProps {
  className?: string;
}

export function PartnerCommissionSystem({ className = '' }: PartnerCommissionSystemProps) {
  const [commissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [payouts] = useState<PayoutRequest[]>(MOCK_PAYOUTS);

  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  
  const pendingAmount = commissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const availableBalance = commissions
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const getStatusBadge = (status: Commission['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approuvé</Badge>;
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-600"><DollarSign className="h-3 w-3 mr-1" />Payé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
    }
  };

  const getTypeLabel = (type: Commission['type']) => {
    switch (type) {
      case 'cpa': return 'CPA';
      case 'revenue_share': return 'Rev. Share';
      case 'flat_fee': return 'Fixe';
    }
  };

  const handleRequestPayout = () => {
    if (availableBalance < 50) {
      toast.error('Solde minimum requis: 50€');
      return;
    }
    toast.success('Demande de paiement envoyée', {
      description: `Montant: ${availableBalance.toFixed(2)}€`,
    });
  };

  const handleExportCSV = () => {
    toast.success('Export CSV en cours...');
    // In production, generate and download CSV
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total gagné</p>
                <p className="text-3xl font-bold text-emerald-600">{totalEarned.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponible</p>
                <p className="text-3xl font-bold text-primary">{availableBalance.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              size="sm"
              onClick={handleRequestPayout}
              disabled={availableBalance < 50}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Demander un paiement
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-3xl font-bold text-amber-600">{pendingAmount.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Validation sous 7 jours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="commissions" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="commissions" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Commissions
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2">
              <History className="h-4 w-4" />
              Historique paiements
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        <TabsContent value="commissions">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {commission.createdAt.toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {commission.partnerName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(commission.type)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {commission.referenceId}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {commission.amount.toFixed(2)}{commission.currency}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date paiement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {payout.requestedAt.toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {payout.amount.toFixed(2)}{payout.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payout.method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payout.status === 'completed' ? (
                          <Badge className="bg-emerald-500/20 text-emerald-600">Complété</Badge>
                        ) : payout.status === 'processing' ? (
                          <Badge className="bg-blue-500/20 text-blue-600">En cours</Badge>
                        ) : (
                          <Badge variant="destructive">Échoué</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {payout.completedAt 
                          ? payout.completedAt.toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Commission Structure Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Structure des commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">CPA (Coût par Action)</h4>
              <p className="text-sm text-muted-foreground">
                Commission fixe par nouveau client référé. Généralement entre 10€ et 100€.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Revenue Share</h4>
              <p className="text-sm text-muted-foreground">
                Pourcentage des revenus générés par le client référé. Typiquement 10-30%.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Flat Fee</h4>
              <p className="text-sm text-muted-foreground">
                Montant fixe négocié pour des partenariats spéciaux ou campagnes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
