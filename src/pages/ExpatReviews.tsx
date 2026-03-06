/**
 * ExpatReviews - Full UGC system: verified reviews, journal, criteria ratings, profile filtering
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Clock, ThumbsUp, Quote, Filter,
  MessageSquare, Shield, Users, ChevronDown, BookOpen,
  BarChart3, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUgcReviews, type UgcReview } from '@/hooks/useUgcReviews';
import { useUgcJournal, type JournalEntry } from '@/hooks/useUgcJournal';
import { ReviewForm } from '@/components/ugc/ReviewForm';
import { JournalForm } from '@/components/ugc/JournalForm';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';

const PROFILE_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'digital_nomad', label: 'Digital Nomad' },
  { value: 'family', label: 'Famille' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'retiree', label: 'Retraité' },
  { value: 'remote_worker', label: 'Remote' },
];

const CRITERIA_LABELS: Record<string, string> = {
  rating_admin: 'Admin',
  rating_cost: 'Coût',
  rating_integration: 'Intégration',
  rating_safety: 'Sécurité',
  rating_quality_life: 'Qualité de vie',
};

const MOOD_EMOJI: Record<string, string> = {
  excited: '🤩', happy: '😊', neutral: '😐',
  stressed: '😰', homesick: '🏠', frustrated: '😤',
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={cn(
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
          s <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
        )} />
      ))}
    </div>
  );
}

function CriteriaBar({ label, value }: { label: string; value: number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="font-medium w-4 text-right">{value}</span>
    </div>
  );
}

function ReviewCard({ review, onVote }: { review: UgcReview; onVote: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const durationLabel = review.duration_months
    ? review.duration_months >= 12
      ? `${Math.floor(review.duration_months / 12)} an${Math.floor(review.duration_months / 12) > 1 ? 's' : ''}`
      : `${review.duration_months} mois`
    : null;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {(review.author_name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{review.author_name}</span>
                {review.is_verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px]" variant="secondary">
                    <Shield className="w-2.5 h-2.5 mr-0.5" /> Vérifié
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span className="capitalize">{review.country_id.replace(/-/g, ' ')}</span>
                {review.from_country && <><span>•</span><span>{review.from_country} →</span></>}
                {durationLabel && <><span>•</span><Clock className="w-3 h-3" /><span>{durationLabel}</span></>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StarRating rating={review.rating_overall} />
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
          </div>
        </div>

        <h3 className="font-semibold text-sm">{review.title}</h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] capitalize">{review.profile_type.replace(/_/g, ' ')}</Badge>
          {review.tags?.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
        </div>

        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pt-3 border-t border-border/50">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-primary shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground leading-relaxed italic">{review.content}</p>
            </div>

            {/* Criteria */}
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Notation par critère
              </div>
              {Object.entries(CRITERIA_LABELS).map(([key, label]) => (
                <CriteriaBar key={key} label={label} value={review[key as keyof UgcReview] as number | null} />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {review.pros?.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs font-semibold text-emerald-500 mb-2">✅ Points positifs</p>
                  <ul className="space-y-1">
                    {review.pros.map(p => <li key={p} className="text-xs text-muted-foreground">• {p}</li>)}
                  </ul>
                </div>
              )}
              {review.cons?.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-400 mb-2">⚠️ Points de vigilance</p>
                  <ul className="space-y-1">
                    {review.cons.map(c => <li key={c} className="text-xs text-muted-foreground">• {c}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={e => { e.stopPropagation(); onVote(); }}>
                <ThumbsUp className="w-3.5 h-3.5" /> Utile ({review.helpful_count})
              </Button>
              <span className="text-[10px] text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{MOOD_EMOJI[entry.mood] || '📝'}</span>
            <div>
              <h4 className="font-semibold text-sm">{entry.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{entry.country_id.replace(/-/g, ' ')}</span>
                {entry.month_number && <><span>•</span><span>Mois {entry.month_number}</span></>}
                {entry.author_name && <><span>•</span><span>{entry.author_name}</span></>}
              </div>
            </div>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
        </div>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              {new Date(entry.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ExpatReviews() {
  const { user } = useAuth();
  const navigate = useLocalizedNavigate();
  const [profileFilter, setProfileFilter] = useState('all');
  const { reviews, isLoading: loadingReviews, createReview, voteReview } = useUgcReviews(undefined, profileFilter);
  const { entries: journalEntries, isLoading: loadingJournal, createEntry } = useUgcJournal(true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <MessageSquare className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Retours d'expatriés</h1>
            <p className="text-muted-foreground">Avis vérifiés et journaux de bord partagés par la communauté</p>
          </div>
        </div>

        {/* Stats from real data */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avis publiés', value: reviews.length, icon: MessageSquare },
            { label: 'Journaux partagés', value: journalEntries.length, icon: BookOpen },
            { label: 'Profils contributeurs', value: new Set([...reviews.map(r => r.user_id), ...journalEntries.map(e => e.user_id)]).size, icon: Users },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-3 text-center">
                  <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {user ? (
          <>
            <ReviewForm onSubmit={data => createReview.mutate(data)} isSubmitting={createReview.isPending} />
            <JournalForm onSubmit={data => createEntry.mutate(data)} isSubmitting={createEntry.isPending} />
          </>
        ) : (
          <Button onClick={() => navigate('/auth')} variant="outline" className="gap-2">
            <Shield className="w-4 h-4" /> Connectez-vous pour contribuer
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews" className="gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Avis ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Journaux ({journalEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4 mt-4">
          {/* Profile Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {PROFILE_FILTERS.map(f => (
              <Button
                key={f.value}
                variant={profileFilter === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProfileFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {loadingReviews ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun avis pour ce filtre.</p>
                <p className="text-sm text-muted-foreground mt-1">Soyez le premier à partager votre expérience !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ReviewCard review={review} onVote={() => voteReview.mutate(review.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="journal" className="space-y-4 mt-4">
          {loadingJournal ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : journalEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun journal partagé pour le moment.</p>
                <p className="text-sm text-muted-foreground mt-1">Partagez votre quotidien d'expatrié !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {journalEntries.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <JournalCard entry={entry} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
