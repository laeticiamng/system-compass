/**
 * FamilyWorkspace - Collaborative expatriation planning for couples/families
 * F5: Share profiles, compare preferences, and plan together
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Heart, Share2, Check, X,
  ChevronRight, UserPlus, Link2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FamilyMember {
  id: string;
  name: string;
  role: 'principal' | 'conjoint' | 'enfant';
  avatar: string;
  topCountries: string[];
  priorities: string[];
  readiness: number;
}

const DEMO_MEMBERS: FamilyMember[] = [
  {
    id: '1',
    name: 'Vous',
    role: 'principal',
    avatar: '👤',
    topCountries: ['Portugal', 'Espagne', 'Thaïlande', 'Canada'],
    priorities: ['Fiscalité', 'Sécurité', 'Climat'],
    readiness: 72,
  },
  {
    id: '2',
    name: 'Conjoint(e)',
    role: 'conjoint',
    avatar: '👩',
    topCountries: ['Espagne', 'Canada', 'Italie', 'Portugal'],
    priorities: ['Éducation', 'Santé', 'Culture'],
    readiness: 45,
  },
];

const COMPATIBILITY_COUNTRIES = [
  { country: 'Espagne', score: 92, emoji: '🇪🇸', sharedPriorities: ['Culture', 'Sécurité', 'Santé'] },
  { country: 'Portugal', score: 87, emoji: '🇵🇹', sharedPriorities: ['Fiscalité', 'Climat', 'Sécurité'] },
  { country: 'Canada', score: 84, emoji: '🇨🇦', sharedPriorities: ['Éducation', 'Sécurité', 'Santé'] },
  { country: 'Italie', score: 78, emoji: '🇮🇹', sharedPriorities: ['Culture', 'Climat', 'Gastronomie'] },
];

const SHARED_CHECKLIST = [
  { id: 'c1', label: 'Définir le budget familial mensuel', done: true, assignee: 'Vous' },
  { id: 'c2', label: 'Rechercher les écoles internationales', done: true, assignee: 'Conjoint(e)' },
  { id: 'c3', label: "Comparer les systèmes de santé", done: false, assignee: 'Vous' },
  { id: 'c4', label: 'Évaluer les opportunités professionnelles', done: false, assignee: 'Conjoint(e)' },
  { id: 'c5', label: 'Vérifier les conventions fiscales bilatérales', done: false, assignee: 'Vous' },
  { id: 'c6', label: 'Planifier la visite exploratoire', done: false, assignee: 'Ensemble' },
];

export default function FamilyWorkspace() {
  const [members] = useState<FamilyMember[]>(DEMO_MEMBERS);
  const [checklist, setChecklist] = useState(SHARED_CHECKLIST);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const toggleTask = (id: string) => {
    setChecklist(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedTasks = checklist.filter(t => t.done).length;
  const progress = Math.round((completedTasks / checklist.length) * 100);

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail('');
    setShowInvite(false);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/family-workspace?invite=demo123`);
    toast.success('Lien de partage copié !');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Espace Famille</h1>
              <p className="text-muted-foreground">
                Planifiez votre expatriation ensemble
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyShareLink} className="gap-1.5">
              <Link2 className="w-4 h-4" />
              Copier le lien
            </Button>
            <Button size="sm" onClick={() => setShowInvite(!showInvite)} className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              Inviter
            </Button>
          </div>
        </div>

        {/* Invite form */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <Input
                    type="email"
                    placeholder="email@partenaire.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleInvite} size="sm">Envoyer</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Members */}
      <div className="grid md:grid-cols-2 gap-4">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{member.avatar}</span>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {member.role === 'principal' ? 'Profil principal' : 'Partenaire'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{member.readiness}%</p>
                    <p className="text-[10px] text-muted-foreground">Préparation</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Pays favoris</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.topCountries.map((c, j) => (
                      <Badge key={c} variant={j === 0 ? 'default' : 'secondary'} className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Priorités</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.priorities.map(p => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Compatibility results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold">Compatibilité couple</h2>
              <Badge variant="secondary" className="ml-auto">Top 4</Badge>
            </div>

            <div className="space-y-3">
              {COMPATIBILITY_COUNTRIES.map((item, i) => (
                <motion.div
                  key={item.country}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.country}</span>
                      <span className={cn(
                        "text-sm font-bold",
                        item.score >= 90 ? "text-emerald-400" :
                        item.score >= 80 ? "text-primary" : "text-amber-400"
                      )}>
                        {item.score}%
                      </span>
                    </div>
                    <Progress value={item.score} className="h-1.5 mb-1.5" />
                    <div className="flex gap-1 flex-wrap">
                      {item.sharedPriorities.map(p => (
                        <span key={p} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shared checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold">Plan d'action partagé</h2>
              </div>
              <Badge variant="outline">{completedTasks}/{checklist.length} — {progress}%</Badge>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="space-y-2">
              {checklist.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    task.done ? "bg-muted/30 opacity-70" : "bg-muted/10 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    task.done ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {task.done && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={cn(
                    "flex-1 text-sm",
                    task.done && "line-through text-muted-foreground"
                  )}>
                    {task.label}
                  </span>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {task.assignee}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info */}
      <Card className="border-border/50">
        <CardContent className="p-6 text-center space-y-2">
          <Share2 className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-semibold">Expatriation = Décision familiale</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Partagez cet espace avec votre partenaire pour aligner vos critères,
            comparer vos préférences et construire un projet commun.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
