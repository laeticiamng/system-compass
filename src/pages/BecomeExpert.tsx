/**
 * Become an Expert - Application page for new experts
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Briefcase,
  GraduationCap,
  Globe,
  Languages,
  DollarSign,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Shield,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

const SPECIALTIES = [
  { value: 'tax_law', label: 'Droit fiscal' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'business_setup', label: 'Création entreprise' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'wealth_management', label: 'Gestion de patrimoine' },
  { value: 'international_tax', label: 'Fiscalité internationale' },
  { value: 'golden_visa', label: 'Golden Visa' },
  { value: 'tax_residency', label: 'Résidence fiscale' },
  { value: 'estate_planning', label: 'Planification successorale' },
  { value: 'notary', label: 'Notariat' },
];

const COUNTRIES = [
  'france', 'switzerland', 'portugal', 'spain', 'italy', 
  'belgium', 'luxembourg', 'uk', 'uae', 'singapore', 
  'malta', 'cyprus', 'greece', 'netherlands', 'andorra'
];

const LANGUAGES = ['Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português', 'Nederlands', 'العربية'];

const applicationSchema = z.object({
  displayName: z.string().min(3, 'Minimum 3 caractères').max(100),
  bio: z.string().min(50, 'Minimum 50 caractères').max(1000),
  specialties: z.array(z.string()).min(1, 'Sélectionnez au moins une spécialité'),
  countries: z.array(z.string()).min(1, 'Sélectionnez au moins un pays'),
  languages: z.array(z.string()).min(1, 'Sélectionnez au moins une langue'),
  hourlyRate: z.number().min(50, 'Minimum 50€').max(1000, 'Maximum 1000€'),
  currency: z.string().default('EUR'),
  certificationTitle: z.string().optional(),
  certificationIssuer: z.string().optional(),
  certificationYear: z.number().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function BecomeExpert() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      specialties: [],
      countries: [],
      languages: [],
      hourlyRate: 150,
      currency: 'EUR',
      acceptTerms: false,
    },
  });

  const toggleArrayValue = (field: 'specialties' | 'countries' | 'languages', value: string) => {
    const current = form.getValues(field);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    form.setValue(field, updated, { shouldValidate: true });
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      return;
    }

    setIsSubmitting(true);

    try {
      const certifications = data.certificationTitle ? [{
        title: data.certificationTitle,
        issuer: data.certificationIssuer || '',
        year: data.certificationYear || new Date().getFullYear(),
        verified: false,
      }] : [];

      const { error } = await supabase.from('expert_applications').insert({
        user_id: user.id,
        display_name: data.displayName,
        bio: data.bio,
        specialties: data.specialties,
        countries: data.countries,
        languages: data.languages,
        hourly_rate: data.hourlyRate,
        currency: data.currency,
        certifications,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Vous avez déjà soumis une candidature');
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      toast.success('Candidature envoyée !');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 text-center">
        <Card>
          <CardContent className="p-8">
            <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté pour devenir expert sur notre plateforme.
            </p>
            <Button onClick={() => navigate('/auth')}>Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-emerald-500/30">
            <CardContent className="p-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Candidature envoyée !</h2>
              <p className="text-muted-foreground mb-6">
                Merci pour votre intérêt. Notre équipe examinera votre candidature dans les 48-72 heures.
                Vous recevrez un email de confirmation.
              </p>
              <div className="space-y-3 text-left max-w-md mx-auto bg-muted/50 rounded-lg p-4 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Vérification de vos qualifications
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Validation de vos certifications
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Configuration de votre compte Stripe
                </p>
              </div>
              <Button className="mt-6" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">Rejoignez notre réseau</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Devenez Expert</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Partagez votre expertise et accompagnez des particuliers et entreprises 
          dans leur projet d'expatriation. Commission plateforme : 15%.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { icon: Globe, title: 'Visibilité', desc: 'Accédez à une audience qualifiée' },
          { icon: DollarSign, title: 'Revenus', desc: 'Fixez vos propres tarifs' },
          { icon: Star, title: 'Réputation', desc: 'Système d\'avis vérifiés' },
        ].map((benefit, i) => (
          <Card key={i} className="text-center">
            <CardContent className="p-4">
              <benefit.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Formulaire de candidature</CardTitle>
          <CardDescription>
            Remplissez ce formulaire pour soumettre votre candidature. Notre équipe l'examinera sous 48-72h.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Identity */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Identité professionnelle
                </h3>
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom affiché</FormLabel>
                      <FormControl>
                        <Input placeholder="Me. Jean Dupont" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom qui apparaîtra sur votre profil public
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biographie</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez votre parcours, vos expertises et ce que vous apportez à vos clients..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/1000 caractères (minimum 50)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Specialties */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Spécialités
                </h3>
                
                <FormField
                  control={form.control}
                  name="specialties"
                  render={() => (
                    <FormItem>
                      <FormLabel>Domaines d'expertise</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SPECIALTIES.map(spec => {
                          const isSelected = form.watch('specialties').includes(spec.value);
                          return (
                            <Badge
                              key={spec.value}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleArrayValue('specialties', spec.value)}
                            >
                              {spec.label}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Countries */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Pays de compétence
                </h3>
                
                <FormField
                  control={form.control}
                  name="countries"
                  render={() => (
                    <FormItem>
                      <FormLabel>Pays où vous pouvez conseiller</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {COUNTRIES.map(country => {
                          const isSelected = form.watch('countries').includes(country);
                          return (
                            <Badge
                              key={country}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer capitalize transition-colors"
                              onClick={() => toggleArrayValue('countries', country)}
                            >
                              {country}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Languages */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Langues parlées
                </h3>
                
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => {
                          const isSelected = form.watch('languages').includes(lang);
                          return (
                            <Badge
                              key={lang}
                              variant={isSelected ? 'default' : 'outline'}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleArrayValue('languages', lang)}
                            >
                              {lang}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Tarification
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarif horaire</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={50} 
                            max={1000}
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Devise</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="CHF">CHF (Fr.)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Certification principale (optionnel)
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="certificationTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Avocat fiscaliste" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificationIssuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Émetteur</FormLabel>
                        <FormControl>
                          <Input placeholder="Barreau de Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Année</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2020"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Terms */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        J'accepte les conditions générales d'utilisation et la commission de 15%
                      </FormLabel>
                      <FormDescription>
                        En soumettant ce formulaire, vous acceptez nos{' '}
                        <a href="/disclaimer" className="underline">conditions</a>.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Soumettre ma candidature
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
