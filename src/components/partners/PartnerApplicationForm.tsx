import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Sparkles, Gift, Star, Loader2 } from "lucide-react";
import { usePartnerProgram, PartnerType } from "@/hooks/usePartnerProgram";
import { EthicsCharter } from "./EthicsCharter";
import { useTranslation } from "react-i18next";

interface PartnerApplicationFormProps {
  type: PartnerType;
  onSuccess?: () => void;
}

export function PartnerApplicationForm({ type, onSuccess }: PartnerApplicationFormProps) {
  const { t } = useTranslation();
  const { submitApplication, getActiveApplication } = usePartnerProgram();
  const [motivation, setMotivation] = useState("");
  const [platformExperience, setPlatformExperience] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [professionalProfile, setProfessionalProfile] = useState("");
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [showCharter, setShowCharter] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const existingApplication = getActiveApplication(type);
  const isAmbassador = type === 'ambassador';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charterAccepted || !motivation.trim()) return;

    setSubmitting(true);
    const result = await submitApplication(type, {
      motivation,
      platform_experience: platformExperience || undefined,
      company_name: companyName || undefined,
      professional_profile: professionalProfile || undefined
    });

    setSubmitting(false);
    if (result.success) {
      onSuccess?.();
    }
  };

  if (existingApplication) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAmbassador ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            {isAmbassador
              ? t('partner.application.candidatureAmbassador', "Candidature Ambassadeur")
              : t('partner.application.candidatureB2B', "Candidature Partenaire B2B")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Badge 
              variant={existingApplication.status === 'approved' ? 'default' : 'secondary'}
              className="mb-4"
            >
              {existingApplication.status === 'pending' && t('partner.application.statusPending', "En cours d'examen")}
              {existingApplication.status === 'approved' && t('partner.application.statusApproved', "Approuvée")}
              {existingApplication.status === 'suspended' && t('partner.application.statusSuspended', "Suspendue")}
            </Badge>
            <p className="text-muted-foreground">
              {existingApplication.status === 'pending' 
                ? t('partner.application.pendingMessage', "Votre candidature est en cours d'examen par notre équipe.")
                : existingApplication.status === 'approved'
                ? t('partner.application.approvedMessage', "Félicitations ! Vous êtes maintenant partenaire Compass.")
                : t('partner.application.suspendedMessage', "Votre candidature a été suspendue. Contactez-nous pour plus d'informations.")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isAmbassador ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                {isAmbassador
                  ? t('partner.application.titleAmbassador', "Ambassadeur Compass")
                  : t('partner.application.titleB2B', "Partenaire B2B Compass")}
              </CardTitle>
              <CardDescription className="mt-2">
                {isAmbassador 
                  ? t('partner.application.descAmbassador', "Partagez votre expérience et contribuez à diffuser la lucidité")
                  : t('partner.application.descB2B', "Mettez Compass en relation avec des organisations")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              {t('partner.application.manualValidation', "Validation manuelle")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Benefits preview */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              {t('partner.application.recognition', "Reconnaissance accordée")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {isAmbassador ? (
                <>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> {t('partner.application.benefitCredits', "Crédits d'usage sur la plateforme")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> {t('partner.application.benefitFeatures', "Accès à certaines fonctionnalités avancées")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-3 w-3" /> {t('partner.application.benefitBadge', "Badge Ambassadeur Compass")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> {t('partner.application.benefitEarlyAccess', "Accès anticipé à certains modules")}
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> {t('partner.application.benefitRemuneration', "Rémunération claire et contractuelle")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> {t('partner.application.benefitB2BTools', "Accès à des outils B2B dédiés")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> {t('partner.application.benefitEcosystem', "Association à l'écosystème Compass")}
                  </li>
                </>
              )}
            </ul>
            {isAmbassador && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                ⚠️ {t('partner.application.warningNoFinancial', "Aucune rémunération financière directe.")}
              </p>
            )}
            {!isAmbassador && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                ⚠️ {t('partner.application.warningConditional', "La reconnaissance financière est conditionnée uniquement à l'existence d'un client actif et payant.")}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAmbassador && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('partner.application.labelCompany', "Entreprise / Organisation")}</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t('partner.application.placeholderCompany', "Nom de votre entreprise")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile">{t('partner.application.labelProfile', "Profil professionnel")}</Label>
                  <Textarea
                    id="profile"
                    value={professionalProfile}
                    onChange={(e) => setProfessionalProfile(e.target.value)}
                    placeholder={t('partner.application.placeholderProfile', "Décrivez brièvement votre parcours et votre réseau professionnel...")}
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">{t('partner.application.labelExperience', "Expérience avec Compass")}</Label>
              <Textarea
                id="experience"
                value={platformExperience}
                onChange={(e) => setPlatformExperience(e.target.value)}
                placeholder={t('partner.application.placeholderExperience', "Comment utilisez-vous la plateforme ? Quelles fonctionnalités appréciez-vous ?")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">{t('partner.application.labelMotivation', "Motivation *")}</Label>
              <Textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder={t('partner.application.placeholderMotivation', "Pourquoi souhaitez-vous rejoindre le programme ? Comment envisagez-vous de contribuer ?")}
                rows={4}
                required
              />
            </div>

            <div className="pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mb-4"
                onClick={() => setShowCharter(!showCharter)}
              >
                {showCharter 
                  ? t('partner.application.charterHide', "Masquer la charte éthique")
                  : t('partner.application.charterShow', "Consulter la charte éthique")}
              </Button>

              {showCharter && (
                <div className="mb-4">
                  <EthicsCharter />
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="charter"
                  checked={charterAccepted}
                  onCheckedChange={(checked) => setCharterAccepted(checked === true)}
                />
                <Label htmlFor="charter" className="text-sm leading-relaxed cursor-pointer">
                  {t('partner.application.charterAccept', "J'ai lu et j'accepte la charte éthique des partenaires Compass. Je m'engage à respecter ses principes dans toutes mes actions.")}
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!charterAccepted || !motivation.trim() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('partner.application.submitting', "Envoi en cours...")}
                </>
              ) : (
                t('partner.application.submit', "Soumettre ma candidature")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
