import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, 
  Clock, 
  Video, 
  Phone, 
  MessageSquare,
  CheckCircle,
  Loader2,
  Euro
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface ConsultationBookingFormProps {
  expertId: string;
  expertName: string;
  priceRange: { min: number; max: number; currency: string };
  availableModes?: ('video' | 'phone' | 'chat')[];
  onSubmit?: (data: BookingData) => Promise<boolean>;
  onCancel?: () => void;
}

interface BookingData {
  expertId: string;
  date: Date;
  time: string;
  mode: 'video' | 'phone' | 'chat';
  subject: string;
  message: string;
  name: string;
  email: string;
  phone?: string;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const CONSULTATION_MODES = {
  video: { icon: Video, label: 'Vidéoconférence', description: 'Google Meet ou Zoom' },
  phone: { icon: Phone, label: 'Téléphone', description: 'Appel téléphonique' },
  chat: { icon: MessageSquare, label: 'Messagerie', description: 'Échange écrit' },
};

export function ConsultationBookingForm({
  expertId,
  expertName,
  priceRange,
  availableModes = ['video', 'phone', 'chat'],
  onSubmit,
  onCancel,
}: ConsultationBookingFormProps) {
  const [step, setStep] = useState<'datetime' | 'details' | 'confirm'>('datetime');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'video' | 'phone' | 'chat'>(availableModes[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleNext = () => {
    if (step === 'datetime') {
      if (!selectedDate || !selectedTime) {
        toast.error('Veuillez sélectionner une date et un horaire');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      if (!subject.trim() || !name.trim() || !email.trim()) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('datetime');
    else if (step === 'confirm') setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;
    
    setIsSubmitting(true);
    try {
      const bookingData: BookingData = {
        expertId,
        date: selectedDate,
        time: selectedTime,
        mode: selectedMode,
        subject,
        message,
        name,
        email,
        phone: phone || undefined,
      };

      if (onSubmit) {
        const success = await onSubmit(bookingData);
        if (success) {
          toast.success('Demande de consultation envoyée !', {
            description: `${expertName} vous contactera sous peu.`,
          });
        }
      } else {
        toast.success('Demande de consultation envoyée !');
      }
    } catch {
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ModeIcon = CONSULTATION_MODES[selectedMode].icon;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Réserver une consultation</span>
          <Badge variant="outline" className="gap-1">
            <Euro className="w-3 h-3" />
            {priceRange.min}-{priceRange.max}{priceRange.currency}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          {['datetime', 'details', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === s ? 'bg-primary text-primary-foreground' : 
                  ['datetime', 'details', 'confirm'].indexOf(step) > i 
                    ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
              `}>
                {i + 1}
              </div>
              {i < 2 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mode de consultation</Label>
              <div className="grid grid-cols-3 gap-2">
                {availableModes.map((mode) => {
                  const ModeIconComp = CONSULTATION_MODES[mode].icon;
                  return (
                    <Button
                      key={mode}
                      variant={selectedMode === mode ? 'default' : 'outline'}
                      className="flex-col h-auto py-3 gap-1"
                      onClick={() => setSelectedMode(mode)}
                    >
                      <ModeIconComp className="w-5 h-5" />
                      <span className="text-xs">{CONSULTATION_MODES[mode].label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {selectedDate 
                        ? format(selectedDate, 'PPP', { locale: fr })
                        : 'Sélectionner une date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horaire</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un horaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet de la consultation *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Optimisation fiscale, visa golden..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez brièvement votre situation..."
                rows={3}
              />
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedDate && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <h4 className="font-semibold mb-3">Récapitulatif</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Expert:</strong> {expertName}</p>
                <p><strong>Date:</strong> {format(selectedDate, 'PPP', { locale: fr })}</p>
                <p><strong>Horaire:</strong> {selectedTime}</p>
                <p className="flex items-center gap-1">
                  <strong>Mode:</strong>
                  <ModeIcon className="w-4 h-4" />
                  {CONSULTATION_MODES[selectedMode].label}
                </p>
                <p><strong>Sujet:</strong> {subject}</p>
                <p><strong>Contact:</strong> {name} ({email})</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 inline mr-2 text-emerald-500" />
              En confirmant, vous acceptez les conditions générales et la politique de confidentialité.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={step === 'datetime' ? onCancel : handleBack}
          >
            {step === 'datetime' ? 'Annuler' : 'Retour'}
          </Button>

          {step === 'confirm' ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmer
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Continuer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
