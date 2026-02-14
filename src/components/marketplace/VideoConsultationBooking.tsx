/**
 * Video Consultation Booking - Schedule video calls with experts
 * Integrates with Daily.co for video conferencing
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Video, 
  Calendar as CalendarIcon, 
  Clock, 
  Euro, 
  CheckCircle2,
  User,
  Mail,
  MessageSquare,
  Shield,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface Expert {
  id: string;
  name: string;
  type: string;
  photo?: string;
  rating: number;
  pricePerHour: number;
  currency: string;
  availableSlots: { date: Date; times: string[] }[];
}

interface BookingFormData {
  date: Date | undefined;
  time: string;
  duration: '30' | '60' | '90';
  name: string;
  email: string;
  topic: string;
  notes: string;
}

interface VideoConsultationBookingProps {
  expert: Expert;
  onClose?: () => void;
}
// Platform commission for marketplace (15%)
// const PLATFORM_COMMISSION = 0.15;

export function VideoConsultationBooking({ expert, onClose }: VideoConsultationBookingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'calendar' | 'details' | 'confirm' | 'success'>('calendar');
  const [formData, setFormData] = useState<BookingFormData>({
    date: undefined,
    time: '',
    duration: '60',
    name: '',
    email: '',
    topic: '',
    notes: '',
  });

  // Generate mock available slots for next 14 days
  const availableSlots = Array.from({ length: 14 }, (_, i) => ({
    date: addDays(new Date(), i + 1),
    times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
      .filter(() => Math.random() > 0.3), // Random availability
  })).filter(slot => slot.times.length > 0);

  const selectedSlot = availableSlots.find(
    slot => formData.date && format(slot.date, 'yyyy-MM-dd') === format(formData.date, 'yyyy-MM-dd')
  );

  const calculatePrice = () => {
    const hours = parseInt(formData.duration, 10) / 60;
    return expert.pricePerHour * hours;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleDetailsSubmit = () => {
    if (!formData.name || !formData.email || !formData.topic) {
      toast.error(t('consultation.fillRequired', 'Veuillez remplir tous les champs obligatoires'));
      return;
    }
    setStep('confirm');
  };

  const handleBookingConfirm = async () => {
    // In production, this would:
    // 1. Create a Daily.co room
    // 2. Create a payment intent via Stripe
    // 3. Send confirmation emails
    // 4. Save booking to database
    
    toast.success(t('consultation.confirmed', 'Réservation confirmée !'), {
      description: t('consultation.confirmedDesc', 'Vous recevrez un email avec le lien de la visioconférence.'),
    });
    
    setStep('success');
  };

  const isDateAvailable = (date: Date) => {
    return availableSlots.some(
      slot => format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-bold text-primary">
            {expert.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Consultation vidéo avec {expert.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              {expert.rating} • {expert.type}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Calendar */}
        {step === 'calendar' && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-3 block">Sélectionnez une date</Label>
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateSelect}
                  locale={fr}
                  disabled={(date) => 
                    date < new Date() || 
                    date > addDays(new Date(), 30) ||
                    !isDateAvailable(date)
                  }
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label className="mb-3 block">Durée de la consultation</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value as '30' | '60' | '90' }))}
                >
                  <SelectTrigger className="mb-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes - {(expert.pricePerHour * 0.5).toFixed(0)}€</SelectItem>
                    <SelectItem value="60">1 heure - {expert.pricePerHour}€</SelectItem>
                    <SelectItem value="90">1h30 - {(expert.pricePerHour * 1.5).toFixed(0)}€</SelectItem>
                  </SelectContent>
                </Select>

                {formData.date && selectedSlot && (
                  <>
                    <Label className="mb-3 block">Créneaux disponibles</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedSlot.times.map((time) => (
                        <Button
                          key={time}
                          variant={formData.time === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTimeSelect(time)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {!formData.date && (
                  <div className="text-center text-muted-foreground py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Sélectionnez une date pour voir les créneaux</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={!formData.date || !formData.time}
                onClick={() => setStep('details')}
              >
                Continuer
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <>
            <div className="bg-secondary/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  {formData.date && format(formData.date, 'EEEE d MMMM', { locale: fr })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {formData.time} ({formData.duration} min)
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Euro className="h-4 w-4 text-primary" />
                  <span className="font-bold">{calculatePrice()}€</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Votre nom *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jean@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Sujet de la consultation *
                </Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Ex: Expatriation en Suisse - Fiscalité"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes supplémentaires (optionnel)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Décrivez brièvement votre situation et vos questions..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('calendar')}>
                Retour
              </Button>
              <Button onClick={handleDetailsSubmit}>
                Confirmer la réservation
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Récapitulatif</h3>
                
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expert</span>
                    <span className="font-medium">{expert.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{formData.date && format(formData.date, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heure</span>
                    <span>{formData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span>{formData.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sujet</span>
                    <span>{formData.topic}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{calculatePrice()}€</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Shield className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-500">Paiement sécurisé</p>
                  <p className="text-muted-foreground">
                    Votre paiement est protégé. Remboursement garanti si l'expert annule.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('details')}>
                Modifier
              </Button>
              <Button onClick={handleBookingConfirm} className="gap-2">
                <Euro className="h-4 w-4" />
                Payer {calculatePrice()}€
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Réservation confirmée !</h3>
            <p className="text-muted-foreground mb-6">
              Un email de confirmation avec le lien de visioconférence vous sera envoyé à <strong>{formData.email}</strong>.
            </p>
            
            <div className="bg-secondary/30 rounded-lg p-4 mb-6 inline-block">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  {formData.date && format(formData.date, 'd MMMM', { locale: fr })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {formData.time}
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Visio
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button>
                Ajouter au calendrier
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dialog wrapper for easy usage
export function VideoConsultationDialog({ 
  expert, 
  open, 
  onOpenChange 
}: { 
  expert: Expert; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <VideoConsultationBooking expert={expert} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
