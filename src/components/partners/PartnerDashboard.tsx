import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Trophy, Gift, Plus, Clock, CheckCircle2,
  Users, Building2, Sparkles, Award, TrendingUp,
  FileText, Loader2
} from "lucide-react";
import { usePartnerProgram } from "@/hooks/usePartnerProgram";
import { useTranslation } from "react-i18next";
import { EthicsCharter } from "./EthicsCharter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const getContributionTypes = (t: any) => [
  { value: "referral", label: t('partners.contributions.referral', 'User referral') },
  { value: "feedback", label: t('partners.contributions.feedback', 'Quality feedback') },
  { value: "content", label: t('partners.contributions.content', 'Content creation') },
  { value: "event", label: t('partners.contributions.event', 'Presentation / Event') },
  { value: "b2b_intro", label: t('partners.contributions.b2bIntro', 'B2B introduction') },
  { value: "other", label: t('partners.contributions.other', 'Other contribution') }
];

export function PartnerDashboard() {
  const { t } = useTranslation();
  const {
    contributions,
    benefits,
    loading,
    submitContribution,
    getTotalCredits,
    isApprovedPartner
  } = usePartnerProgram();
  
  const CONTRIBUTION_TYPES = getContributionTypes(t);

  const [newContribOpen, setNewContribOpen] = useState(false);
  const [contribType, setContribType] = useState("");
  const [contribDesc, setContribDesc] = useState("");
  const [contribImpact, setContribImpact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAmbassador = isApprovedPartner('ambassador');
  const isB2BPartner = isApprovedPartner('b2b_partner');

  const handleSubmitContribution = async () => {
    if (!contribType || !contribDesc.trim()) return;
    
    setSubmitting(true);
    const result = await submitContribution({
      contribution_type: contribType,
      description: contribDesc,
      impact_metric: contribImpact || undefined
    });

    if (result.success) {
      setNewContribOpen(false);
      setContribType("");
      setContribDesc("");
      setContribImpact("");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalCredits = getTotalCredits();
  const verifiedContribs = contributions.filter(c => c.verified).length;
  const pendingContribs = contributions.filter(c => !c.verified).length;

  return (
    <div className="space-y-6">
      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {isAmbassador && (
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
            <Users className="h-3 w-3" />
            {t('partners.badge.ambassador', 'Compass Ambassador')}
          </Badge>
        )}
        {isB2BPartner && (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
            <Building2 className="h-3 w-3" />
            {t('partners.badge.b2bPartner', 'B2B Partner')}
          </Badge>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('partners.stats.creditsEarned', 'Credits earned')}</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('partners.stats.verifiedContributions', 'Verified contributions')}</p>
                <p className="text-2xl font-bold">{verifiedContribs}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('partners.stats.pending', 'Pending')}</p>
                <p className="text-2xl font-bold">{pendingContribs}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs defaultValue="contributions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contributions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('partners.tabs.contributions', 'Contributions')}
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-2">
            <Gift className="h-4 w-4" />
            {t('partners.tabs.benefits', 'Benefits')}
          </TabsTrigger>
          <TabsTrigger value="charter" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('partners.tabs.charter', 'Charter')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{t('partners.myContributions', 'My contributions')}</h3>
            <Dialog open={newContribOpen} onOpenChange={setNewContribOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('partners.newContribution', 'New contribution')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('partners.declareContribution', 'Declare a contribution')}</DialogTitle>
                  <DialogDescription>
                    {t('partners.declareContributionDesc', 'Describe your contribution. It will be reviewed by our team.')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('partners.contributionType', 'Contribution type')}</Label>
                    <Select value={contribType} onValueChange={setContribType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('partners.selectType', 'Select a type')} />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRIBUTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.description', 'Description')}</Label>
                    <Textarea
                      value={contribDesc}
                      onChange={(e) => setContribDesc(e.target.value)}
                      placeholder={t('partners.describeContribution', 'Describe your contribution in detail...')}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('partners.measurableImpact', 'Measurable impact')} ({t('common.optional', 'optional')})</Label>
                    <Input
                      value={contribImpact}
                      onChange={(e) => setContribImpact(e.target.value)}
                      placeholder={t('partners.impactExample', 'e.g., 5 new users, 3 quality feedbacks...')}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitContribution}
                    disabled={!contribType || !contribDesc.trim() || submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('common.sending', 'Sending...')}
                      </>
                    ) : (
                      t('common.submit', 'Submit')
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {contributions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('partners.noContributions', 'No contributions yet')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('partners.startContributing', 'Start contributing to earn credits and benefits.')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contributions.map(contrib => (
                <Card key={contrib.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {CONTRIBUTION_TYPES.find(t => t.value === contrib.contribution_type)?.label || contrib.contribution_type}
                          </Badge>
                          {contrib.verified ? (
                            <Badge className="bg-green-500/10 text-green-600 text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('partners.verified', 'Verified')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Clock className="h-3 w-3" />
                              {t('partners.pending', 'Pending')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{contrib.description}</p>
                        {contrib.impact_metric && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('partners.impact', 'Impact')}: {contrib.impact_metric}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(contrib.created_at), "d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      {contrib.verified && contrib.credits_awarded > 0 && (
                        <div className="text-right">
                          <Badge className="bg-primary/10 text-primary">
                            +{contrib.credits_awarded} {t('partners.credits', 'credits')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <h3 className="font-medium">{t('partners.activeBenefits', 'My active benefits')}</h3>
          
          {benefits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('partners.noActiveBenefits', 'No active benefits')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('partners.benefitsBasedOnContributions', 'Benefits are granted based on your verified contributions.')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {benefits.map(benefit => (
                <Card key={benefit.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{benefit.benefit_type}</p>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                      {benefit.expires_at && (
                        <Badge variant="outline" className="text-xs">
                          {t('partners.expiresOn', 'Expires on')} {format(new Date(benefit.expires_at), "d MMM yyyy", { locale: fr })}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="charter">
          <EthicsCharter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
