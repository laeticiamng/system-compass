/**
 * ProfileEditForm - Complete user profile editing form
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import { User, Globe, Shield, Save, Loader2 } from 'lucide-react';

export function ProfileEditForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile, updateProfile, isLoading, isUpdating } = useUserProfile();
  
  const [formData, setFormData] = useState({
    displayName: profile?.display_name || '',
    birthCountry: profile?.birth_country || '',
    currentCountry: profile?.current_country || '',
    educationLevel: profile?.education_level || '',
    riskTolerance: profile?.risk_tolerance || 'moderate',
    desiredLife: profile?.desired_life || '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      updateProfile({
        display_name: formData.displayName,
        birth_country: formData.birthCountry,
        current_country: formData.currentCountry,
        education_level: formData.educationLevel,
        risk_tolerance: formData.riskTolerance,
        desired_life: formData.desiredLife,
      });
      toast.success(t('profile.saved', 'Profil mis à jour'));
    } catch {
      toast.error(t('profile.error', 'Erreur lors de la mise à jour'));
    }
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('profile.basicInfo', 'Informations de base')}
          </CardTitle>
          <CardDescription>
            {t('profile.basicInfoDesc', 'Vos informations personnelles')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('profile.displayName', 'Nom affiché')}</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email', 'Email')}</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.emailReadOnly', 'L\'email ne peut pas être modifié ici')}
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="birthCountry">{t('profile.birthCountry', 'Pays de naissance')}</Label>
              <Input
                id="birthCountry"
                value={formData.birthCountry}
                onChange={(e) => handleChange('birthCountry', e.target.value)}
                placeholder="France"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentCountry">{t('profile.currentCountry', 'Pays de résidence')}</Label>
              <Input
                id="currentCountry"
                value={formData.currentCountry}
                onChange={(e) => handleChange('currentCountry', e.target.value)}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Preferences */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('profile.preferences', 'Préférences')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('profile.educationLevel', 'Niveau d\'éducation')}</Label>
              <Select 
                value={formData.educationLevel}
                onValueChange={(value) => handleChange('educationLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">Baccalauréat</SelectItem>
                  <SelectItem value="bachelor">Licence / Bachelor</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="phd">Doctorat</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('profile.riskTolerance', 'Tolérance au risque')}</Label>
              <Select 
                value={formData.riskTolerance}
                onValueChange={(value) => handleChange('riskTolerance', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible - Stabilité prioritaire</SelectItem>
                  <SelectItem value="moderate">Modérée - Équilibre</SelectItem>
                  <SelectItem value="high">Élevée - Opportunités</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desiredLife">{t('profile.desiredLife', 'Vie souhaitée')}</Label>
            <Input
              id="desiredLife"
              value={formData.desiredLife}
              onChange={(e) => handleChange('desiredLife', e.target.value)}
              placeholder="Décrivez brièvement votre vie idéale..."
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Privacy Note */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t('profile.privacy', 'Confidentialité')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('profile.privacyNote', 'Vos données sont protégées et ne sont jamais partagées avec des tiers. Vous pouvez les supprimer à tout moment depuis les paramètres de votre compte.')}
          </p>
        </CardContent>
      </Card>
      
      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating} className="gap-2">
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t('profile.save', 'Enregistrer les modifications')}
        </Button>
      </div>
    </form>
  );
}
