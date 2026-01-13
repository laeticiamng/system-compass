import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Loader2, 
  HeartPulse, 
  Scale, 
  ShieldAlert, 
  Building2,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  ExternalLink,
  TrendingUp,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { useTerrainRealities, TerrainRealitiesResult } from '@/hooks/useTerrainRealities';
import { useCountries } from '@/lib/countries-store';
import { TerrainRealitiesPdfExport } from '@/components/terrain/TerrainRealitiesPdfExport';
import { RiskOverviewChart } from '@/components/terrain/RiskOverviewChart';
import { ShareReportButton } from '@/components/terrain/ShareReportButton';

function RiskBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const { t } = useTranslation();
  const colors = {
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    low: 'bg-green-500/20 text-green-300 border-green-500/30'
  };
  const labels = {
    high: t('terrainRealities.riskHigh'),
    medium: t('terrainRealities.riskMedium'),
    low: t('terrainRealities.riskLow')
  };
  return (
    <Badge variant="outline" className={colors[level]}>
      {labels[level]}
    </Badge>
  );
}

function HealthcareSection({ data }: { data: TerrainRealitiesResult['healthcare_realities'] }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-400" />
          {t('terrainRealities.healthcare')}
        </h3>
        <RiskBadge level={data.risk_level} />
      </div>

      {/* Faux médicaments */}
      <Card className="bg-card/30 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-red-400">
            <XCircle className="h-4 w-4" />
            {t('terrainRealities.fakeMedications')}
          </CardTitle>
          <CardDescription>
            {t('terrainRealities.prevalence')}: {data.fake_medications.prevalence}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.fake_medications.affected_categories.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t('terrainRealities.affectedCategories')}
              </p>
              <div className="flex flex-wrap gap-1">
                {data.fake_medications.affected_categories.map((cat, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">{cat}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.fake_medications.protection_measures.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t('terrainRealities.protection')}
              </p>
              <ul className="space-y-1">
                {data.fake_medications.protection_measures.map((measure, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                    {measure}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Équipements médicaux */}
      <Card className="bg-card/30 border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            {t('terrainRealities.medicalEquipment')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.medical_equipment.issues.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.medical_equipment.issues.map((issue, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-amber-500/10">{issue}</Badge>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">{data.medical_equipment.affected_facilities}</p>
          {data.medical_equipment.reliable_alternatives.length > 0 && (
            <div>
              <p className="text-xs text-green-400 uppercase mb-1">
                {t('terrainRealities.reliableAlternatives')}
              </p>
              <ul className="space-y-1">
                {data.medical_equipment.reliable_alternatives.map((alt, i) => (
                  <li key={i} className="text-sm">{alt}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maladies chroniques - VIH */}
      <Card className="bg-card/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
            <Stethoscope className="h-4 w-4" />
            {t('terrainRealities.chronicDiseases')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* VIH */}
          <div>
            <p className="text-xs font-medium uppercase mb-2">{t('terrainRealities.hivTreatment')}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t('terrainRealities.availability')}:</span>{' '}
                <span className="capitalize">{data.chronic_disease_management.hiv_treatment.availability}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('terrainRealities.testReliability')}:</span>{' '}
                <span className="capitalize">{data.chronic_disease_management.hiv_treatment.test_reliability}</span>
              </div>
            </div>
            {data.chronic_disease_management.hiv_treatment.issues_reported.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-red-400 mb-1">{t('terrainRealities.reportedIssues')}:</p>
                <ul className="space-y-1">
                  {data.chronic_disease_management.hiv_treatment.issues_reported.map((issue, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.chronic_disease_management.hiv_treatment.reliable_centers && data.chronic_disease_management.hiv_treatment.reliable_centers.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-green-400 mb-1">{t('terrainRealities.reliableCenters')}:</p>
                <div className="flex flex-wrap gap-1">
                  {data.chronic_disease_management.hiv_treatment.reliable_centers.map((center, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{center}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.chronic_disease_management.hiv_treatment.international_support && data.chronic_disease_management.hiv_treatment.international_support.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-blue-400 mb-1">{t('terrainRealities.internationalSupport')}:</p>
                <div className="flex flex-wrap gap-1">
                  {data.chronic_disease_management.hiv_treatment.international_support.map((org, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-blue-500/10">{org}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Diabète */}
          <div>
            <p className="text-xs font-medium uppercase mb-2">{t('terrainRealities.diabetesCare')}</p>
            <div className="text-sm">
              <span className="text-muted-foreground">{t('terrainRealities.availability')}:</span>{' '}
              <span className="capitalize">{data.chronic_disease_management.diabetes_care.availability}</span>
            </div>
            {data.chronic_disease_management.diabetes_care.issues.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {data.chronic_disease_management.diabetes_care.issues.map((issue, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{issue}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Cancer */}
          <div>
            <p className="text-xs font-medium uppercase mb-2">{t('terrainRealities.cancerCare')}</p>
            <div className="text-sm">
              <span className="text-muted-foreground">{t('terrainRealities.availability')}:</span>{' '}
              <span className="capitalize">{data.chronic_disease_management.cancer_care.availability}</span>
            </div>
            {data.chronic_disease_management.cancer_care.issues.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {data.chronic_disease_management.cancer_care.issues.map((issue, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{issue}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {data.recommendations.length > 0 && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-xs font-medium text-green-400 uppercase mb-2">
            {t('terrainRealities.recommendations')}
          </p>
          <ul className="space-y-1">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JusticeSection({ data }: { data: TerrainRealitiesResult['justice_realities'] }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-400" />
          {t('terrainRealities.justice')}
        </h3>
        <RiskBadge level={data.risk_level} />
      </div>

      {/* Corruption */}
      <Card className="bg-card/30 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-red-400">
            {t('terrainRealities.corruptionPatterns')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avocats */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{t('terrainRealities.lawyers')}</span>
              <Badge variant="outline" className="text-xs">{data.corruption_patterns.lawyer_corruption.prevalence}</Badge>
            </div>
            {data.corruption_patterns.lawyer_corruption.mechanism && (
              <p className="text-xs text-muted-foreground mb-2">{data.corruption_patterns.lawyer_corruption.mechanism}</p>
            )}
            <div className="flex flex-wrap gap-1">
              {data.corruption_patterns.lawyer_corruption.protection.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
              ))}
            </div>
          </div>

          {/* Juges */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{t('terrainRealities.judges')}</span>
              <Badge variant="outline" className="text-xs">{data.corruption_patterns.judicial_corruption.prevalence}</Badge>
            </div>
            {data.corruption_patterns.judicial_corruption.typical_bribes_range && (
              <p className="text-xs text-muted-foreground">
                {t('terrainRealities.typicalBribes')}: {data.corruption_patterns.judicial_corruption.typical_bribes_range}
              </p>
            )}
          </div>

          {/* Police */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{t('terrainRealities.police')}</span>
              <Badge variant="outline" className="text-xs">{data.corruption_patterns.police_corruption.prevalence}</Badge>
            </div>
            {data.corruption_patterns.police_corruption.common_scenarios && (
              <div className="flex flex-wrap gap-1">
                {data.corruption_patterns.police_corruption.common_scenarios.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-muted/50">{s}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Délais */}
      <Card className="bg-card/30 border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
            <Clock className="h-4 w-4" />
            {t('terrainRealities.averageDelays')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">{t('terrainRealities.civilCases')}</p>
              <p className="font-medium">{data.average_delays.civil_cases}</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">{t('terrainRealities.criminalCases')}</p>
              <p className="font-medium">{data.average_delays.criminal_cases}</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">{t('terrainRealities.commercial')}</p>
              <p className="font-medium">{data.average_delays.commercial_disputes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recours d'urgence */}
      {data.emergency_recourses.length > 0 && (
        <Card className="bg-card/30 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-400">
              <ShieldAlert className="h-4 w-4" />
              {t('terrainRealities.emergencyRecourses')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.emergency_recourses.map((recourse, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{recourse.name}</span>
                  <RiskBadge level={recourse.effectiveness === 'high' ? 'low' : recourse.effectiveness === 'low' ? 'high' : 'medium'} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{recourse.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">{t('terrainRealities.timeline')}:</span> {recourse.timeline}</div>
                  <div><span className="text-muted-foreground">{t('terrainRealities.cost')}:</span> {recourse.cost_range}</div>
                </div>
                <p className="text-xs mt-2 text-primary">{t('terrainRealities.howToAccess')}: {recourse.how_to_access}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contacts fiables */}
      {data.reliable_contacts.length > 0 && (
        <Card className="bg-card/30 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
              <Phone className="h-4 w-4" />
              {t('terrainRealities.reliableContacts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.reliable_contacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.type} • {contact.specialty}</p>
                  </div>
                  {contact.contact_info && (
                    <span className="text-xs text-primary">{contact.contact_info}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SecuritySection({ data }: { data: TerrainRealitiesResult['security_realities'] }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-400" />
          {t('terrainRealities.security')}
        </h3>
        <RiskBadge level={data.risk_level} />
      </div>

      {/* Trafic d'êtres humains */}
      <Card className="bg-card/30 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-red-400">
            {t('terrainRealities.humanTrafficking')}
          </CardTitle>
          <CardDescription>
            {t('terrainRealities.prevalence')}: {data.human_trafficking.prevalence}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.human_trafficking.common_scenarios.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t('terrainRealities.commonScenarios')}
              </p>
              <div className="flex flex-wrap gap-1">
                {data.human_trafficking.common_scenarios.map((s, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.human_trafficking.risk_zones && data.human_trafficking.risk_zones.length > 0 && (
            <div>
              <p className="text-xs text-red-400 uppercase mb-1">
                {t('terrainRealities.riskZones')}
              </p>
              <div className="flex flex-wrap gap-1">
                {data.human_trafficking.risk_zones.map((zone, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-red-500/10">
                    <MapPin className="h-3 w-3 mr-1" />{zone}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.human_trafficking.warning_signs.length > 0 && (
            <div>
              <p className="text-xs text-amber-400 uppercase mb-1">
                {t('terrainRealities.warningSigns')}
              </p>
              <ul className="space-y-1">
                {data.human_trafficking.warning_signs.map((sign, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.human_trafficking.emergency_contacts.length > 0 && (
            <div className="p-2 bg-red-500/10 rounded">
              <p className="text-xs text-red-400 font-medium mb-1">
                {t('terrainRealities.emergencyContacts')}
              </p>
              <ul className="space-y-1">
                {data.human_trafficking.emergency_contacts.map((c, i) => (
                  <li key={i} className="text-xs">{c}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Criminalité organisée */}
      <Card className="bg-card/30 border-orange-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-orange-400">
            {t('terrainRealities.organizedCrime')}
          </CardTitle>
          <CardDescription>
            {t('terrainRealities.prevalence')}: {data.organized_crime.prevalence}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.organized_crime.types.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.organized_crime.types.map((type, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-orange-500/10">{type}</Badge>
              ))}
            </div>
          )}
          {data.organized_crime.risk_zones.length > 0 && (
            <div>
              <p className="text-xs text-orange-400 uppercase mb-1">
                {t('terrainRealities.riskZones')}
              </p>
              <div className="flex flex-wrap gap-1">
                {data.organized_crime.risk_zones.map((zone, i) => (
                  <Badge key={i} variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{zone}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.organized_crime.protection.length > 0 && (
            <div>
              <p className="text-xs text-green-400 uppercase mb-1">
                {t('terrainRealities.protection')}
              </p>
              <ul className="space-y-1">
                {data.organized_crime.protection.map((p, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Petite délinquance */}
      <Card className="bg-card/30 border-yellow-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-400">
            {t('terrainRealities.pettyCrime')}
          </CardTitle>
          <CardDescription>
            {t('terrainRealities.prevalence')}: {data.petty_crime.prevalence}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.petty_crime.hotspots.length > 0 && (
            <div>
              <p className="text-xs text-yellow-400 uppercase mb-1">
                {t('terrainRealities.hotspots')}
              </p>
              <div className="flex flex-wrap gap-1">
                {data.petty_crime.hotspots.map((spot, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-yellow-500/10"><MapPin className="h-3 w-3 mr-1" />{spot}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.petty_crime.protection.length > 0 && (
            <div>
              <p className="text-xs text-green-400 uppercase mb-1">
                {t('terrainRealities.protection')}
              </p>
              <ul className="space-y-1">
                {data.petty_crime.protection.map((p, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommandations */}
      {data.recommendations.length > 0 && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-xs font-medium text-green-400 uppercase mb-2">
            {t('terrainRealities.recommendations')}
          </p>
          <ul className="space-y-1">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AdministrationSection({ data }: { data: TerrainRealitiesResult['administration_realities'] }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-400" />
          {t('terrainRealities.administration')}
        </h3>
        <RiskBadge level={data.risk_level} />
      </div>

      {/* Fiabilité des documents */}
      <Card className="bg-card/30 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-purple-400">
            {t('terrainRealities.documentReliability')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">{t('terrainRealities.birthCertificates')}</p>
              <p className="font-medium text-sm capitalize">{data.document_reliability.birth_certificates}</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">{t('terrainRealities.landTitles')}</p>
              <p className="font-medium text-sm capitalize">{data.document_reliability.land_titles}</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">{t('terrainRealities.businessLicenses')}</p>
              <p className="font-medium text-sm capitalize">{data.document_reliability.business_licenses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corruption par secteur */}
      {data.corruption_by_sector.length > 0 && (
        <Card className="bg-card/30 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">
              {t('terrainRealities.corruptionBySector')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.corruption_by_sector.map((sector, i) => (
              <div key={i} className="p-2 bg-muted/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{sector.sector}</span>
                  <Badge variant="outline" className="text-xs">{sector.prevalence}</Badge>
                </div>
                {sector.typical_amounts && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('terrainRealities.typicalAmounts')}: {sector.typical_amounts}
                  </p>
                )}
                {sector.how_to_avoid.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sector.how_to_avoid.map((tip, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">{tip}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Méthodes de vérification */}
      {data.document_reliability.verification_methods && data.document_reliability.verification_methods.length > 0 && (
        <Card className="bg-card/30 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400">
              {t('terrainRealities.verificationMethods')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {data.document_reliability.verification_methods.map((method, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-400 mt-1 shrink-0" />
                  {method}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommandations */}
      {data.recommendations.length > 0 && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-xs font-medium text-green-400 uppercase mb-2">
            {t('terrainRealities.recommendations')}
          </p>
          <ul className="space-y-1">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TerrainRealities() {
  const { countryId } = useParams<{ countryId: string }>();
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { generateRealities, isLoading, result, error, reset } = useTerrainRealities();

  const country = countries.find(c => c.id === countryId);
  const countryName = country?.name || countryId || '';

  useEffect(() => {
    if (countryName && !result && !isLoading) {
      generateRealities(countryName);
    }
  }, [countryName]);

  const handleRefresh = () => {
    reset();
    generateRealities(countryName);
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/country/${countryId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.back', 'Retour')}
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-orange-400" />
              {t('terrainRealities.title', 'Réalités Terrain')}
            </h1>
            <p className="text-sm text-muted-foreground">{countryName}</p>
          </div>
          {result && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('terrainRealities.confirmRefresh')}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('terrainRealities.confirmRefresh')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('terrainRealities.refreshWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefresh}>{t('terrainRealities.confirmRefresh')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Disclaimer */}
        <Alert className="mb-6 bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-sm text-amber-200">
            {t('terrainRealities.disclaimer', 
              'Ces informations sont compilées à partir de sources ouvertes (ONG, médias, rapports officiels). Elles peuvent ne pas refléter la situation actuelle. Vérifiez toujours auprès des ambassades et organisations sur le terrain.'
            )}
          </AlertDescription>
        </Alert>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {t('terrainRealities.generating', 'Analyse des réalités terrain en cours...')}
                </p>
              </div>
            </div>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overview with Risk Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-card/50 border-primary/20 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">{result.country_name}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ShareReportButton countryId={countryId || ''} countryName={countryName} />
                      <TerrainRealitiesPdfExport data={result} countryName={countryName} />
                    </div>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span>{t('terrainRealities.lastUpdated')}: {result.last_updated}</span>
                    <span>{t('terrainRealities.confidence')}: {Math.round(result.confidence_score * 100)}%</span>
                    {result.cached && (
                      <Badge variant="outline" className="text-xs">
                        {t('terrainRealities.cachedResult')}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <RiskOverviewChart data={result} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="healthcare" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="healthcare" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                  <HeartPulse className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{t('terrainRealities.healthcareTab', 'Santé')}</span>
                </TabsTrigger>
                <TabsTrigger value="justice" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                  <Scale className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{t('terrainRealities.justiceTab', 'Justice')}</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{t('terrainRealities.securityTab', 'Sécurité')}</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{t('terrainRealities.adminTab', 'Admin')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="healthcare" className="mt-4">
                <HealthcareSection data={result.healthcare_realities} />
              </TabsContent>
              <TabsContent value="justice" className="mt-4">
                <JusticeSection data={result.justice_realities} />
              </TabsContent>
              <TabsContent value="security" className="mt-4">
                <SecuritySection data={result.security_realities} />
              </TabsContent>
              <TabsContent value="admin" className="mt-4">
                <AdministrationSection data={result.administration_realities} />
              </TabsContent>
            </Tabs>

            {/* Développements positifs */}
            {result.positive_developments.length > 0 && (
              <Card className="bg-card/30 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    {t('terrainRealities.positiveDevelopments', 'Développements positifs')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.positive_developments.map((dev, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-green-500/10 rounded">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm">{dev.development}</p>
                          <p className="text-xs text-muted-foreground">
                            {dev.domain} • {dev.since} • {dev.source}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sources */}
            {result.sources.length > 0 && (
              <Card className="bg-card/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {t('terrainRealities.sources')} ({result.sources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, i) => (
                      source.url ? (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          <Badge variant="outline" className="text-xs hover:bg-primary/10 cursor-pointer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {source.name} ({source.year})
                          </Badge>
                        </a>
                      ) : (
                        <Badge key={i} variant="outline" className="text-xs">
                          {source.name} ({source.year})
                        </Badge>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
