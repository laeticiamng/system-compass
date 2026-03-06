/**
 * Consultation Success Page - Shown after successful payment
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Calendar, Clock, User, Video, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConsultationDetails {
  id: string;
  scheduled_at: string | null;
  duration_minutes: number;
  amount: number;
  status: string;
  expert: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function ConsultationSuccess() {
  const { id } = useParams<{ id: string }>();
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConsultation() {
      if (!id) return;

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          amount,
          status,
          expert:experts(display_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setConsultation(data as unknown as ConsultationDetails);
      }
      setLoading(false);
    }

    fetchConsultation();
  }, [id]);

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Consultation non trouvée</h1>
        <Button asChild>
          <Link to="/experts">Retour aux experts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-emerald-500/30 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Paiement confirmé !</h1>
            <p className="opacity-90">
              Votre consultation est réservée
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Consultation Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Expert</p>
                  <p className="font-medium">{consultation.expert?.display_name || 'Expert'}</p>
                </div>
              </div>

              {consultation.scheduled_at && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(consultation.scheduled_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="font-medium">{consultation.duration_minutes} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Video className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mode</p>
                  <p className="font-medium">Vidéoconférence</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <Badge variant="secondary" className="gap-1">
                <Mail className="w-3 h-3" />
                Email de confirmation envoyé
              </Badge>
            </div>

            {/* Next Steps */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium mb-2">Prochaines étapes</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  L'expert confirmera le créneau sous 24h
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Vous recevrez le lien de visioconférence par email
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Préparez vos questions avant le rendez-vous
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/dashboard">Mon tableau de bord</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/experts">
                  Voir d'autres experts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
