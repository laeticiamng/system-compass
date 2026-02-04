import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  Award,
  Star,
  ArrowRight,
  FileText,
  Video,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
interface CourseModule {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'exercise';
  completed: boolean;
  locked: boolean;
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: 'strategy' | 'finance' | 'geopolitics' | 'legal' | 'operations';
  level: 'foundation' | 'intermediate' | 'advanced' | 'master';
  duration: string;
  modules: CourseModule[];
  skills: string[];
  certification: boolean;
  instructor: {
    name: string;
    title: string;
    institution: string;
  };
  rating: number;
  enrollments: number;
  progress?: number;
}

interface Quiz {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  source?: string;
}

// Mock data
const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Stratégie d\'Internationalisation',
    subtitle: 'De l\'analyse à l\'exécution : méthodologies éprouvées',
    category: 'strategy',
    level: 'intermediate',
    duration: '8 heures',
    skills: ['Analyse PESTEL', 'Porter\'s Five Forces', 'Matrices de décision', 'Due diligence'],
    certification: true,
    instructor: {
      name: 'Prof. Jean-Marc Huissoud',
      title: 'Professeur de Géopolitique',
      institution: 'HEC Paris'
    },
    rating: 4.8,
    enrollments: 2340,
    progress: 35,
    modules: [
      { id: 'm1', title: 'Introduction : pourquoi s\'internationaliser ?', duration: '25 min', type: 'video', completed: true, locked: false },
      { id: 'm2', title: 'Analyse macro-environnementale (PESTEL)', duration: '45 min', type: 'video', completed: true, locked: false },
      { id: 'm3', title: 'Exercice pratique : PESTEL appliqué', duration: '30 min', type: 'exercise', completed: false, locked: false },
      { id: 'm4', title: 'Les 5 Forces de Porter adaptées à l\'international', duration: '40 min', type: 'video', completed: false, locked: false },
      { id: 'm5', title: 'Quiz d\'évaluation - Module 1', duration: '15 min', type: 'quiz', completed: false, locked: false },
      { id: 'm6', title: 'Matrice de décision multicritères', duration: '50 min', type: 'video', completed: false, locked: true },
      { id: 'm7', title: 'Étude de cas : expansion APAC', duration: '60 min', type: 'reading', completed: false, locked: true },
      { id: 'm8', title: 'Due diligence pays : checklist complète', duration: '35 min', type: 'video', completed: false, locked: true },
      { id: 'm9', title: 'Examen final et certification', duration: '45 min', type: 'quiz', completed: false, locked: true },
    ]
  },
  {
    id: 'course-2',
    title: 'Finance Internationale pour Entrepreneurs',
    subtitle: 'Valorisation, fiscalité, structuration juridique',
    category: 'finance',
    level: 'advanced',
    duration: '12 heures',
    skills: ['DCF Analysis', 'Monte Carlo', 'Fiscalité internationale', 'Holding structures'],
    certification: true,
    instructor: {
      name: 'Prof. Anne-Sophie Dupont',
      title: 'Professeur de Finance',
      institution: 'INSEAD'
    },
    rating: 4.9,
    enrollments: 1890,
    modules: [
      { id: 'm1', title: 'Fondamentaux de la valorisation', duration: '40 min', type: 'video', completed: false, locked: false },
      { id: 'm2', title: 'Méthode DCF : théorie et pratique', duration: '55 min', type: 'video', completed: false, locked: false },
      { id: 'm3', title: 'Simulation Monte Carlo', duration: '45 min', type: 'video', completed: false, locked: true },
      { id: 'm4', title: 'Fiscalité internationale : principes', duration: '50 min', type: 'video', completed: false, locked: true },
      { id: 'm5', title: 'Structures de holding : comparatif', duration: '60 min', type: 'reading', completed: false, locked: true },
    ]
  },
  {
    id: 'course-3',
    title: 'Géopolitique et Risques Pays',
    subtitle: 'Comprendre les dynamiques de pouvoir mondiales',
    category: 'geopolitics',
    level: 'foundation',
    duration: '6 heures',
    skills: ['Analyse géopolitique', 'Risk assessment', 'Soft power', 'Indicateurs institutionnels'],
    certification: false,
    instructor: {
      name: 'Dr. Marie Leclerc',
      title: 'Chercheuse en Relations Internationales',
      institution: 'Sciences Po Paris'
    },
    rating: 4.7,
    enrollments: 3210,
    modules: [
      { id: 'm1', title: 'Introduction à la géopolitique moderne', duration: '30 min', type: 'video', completed: false, locked: false },
      { id: 'm2', title: 'Les grandes puissances : cartographie', duration: '45 min', type: 'video', completed: false, locked: false },
      { id: 'm3', title: 'Indicateurs de risque pays', duration: '40 min', type: 'video', completed: false, locked: false },
    ]
  }
];

const sampleQuiz: Quiz[] = [
  {
    id: 'q1',
    question: 'Dans le modèle des 5 Forces de Porter, quel facteur influence le plus directement la rentabilité d\'un secteur ?',
    options: [
      { id: 'a', text: 'Le pouvoir de négociation des fournisseurs' },
      { id: 'b', text: 'L\'intensité de la rivalité concurrentielle' },
      { id: 'c', text: 'La menace des produits substituts' },
      { id: 'd', text: 'Les barrières à l\'entrée' }
    ],
    correctAnswer: 'b',
    explanation: 'Bien que toutes les forces influencent la rentabilité, l\'intensité de la rivalité concurrentielle est au centre du modèle et affecte directement les marges et la capacité des entreprises à capturer de la valeur.',
    source: 'Porter, M. E. (1979). How Competitive Forces Shape Strategy. Harvard Business Review.'
  },
  {
    id: 'q2',
    question: 'Quel est le principal avantage de la simulation Monte Carlo par rapport à une analyse DCF classique ?',
    options: [
      { id: 'a', text: 'Elle est plus rapide à calculer' },
      { id: 'b', text: 'Elle quantifie l\'incertitude et fournit une distribution de résultats' },
      { id: 'c', text: 'Elle nécessite moins d\'hypothèses' },
      { id: 'd', text: 'Elle est plus précise' }
    ],
    correctAnswer: 'b',
    explanation: 'La simulation Monte Carlo permet de modéliser l\'incertitude en générant des milliers de scénarios possibles, donnant une distribution complète des résultats plutôt qu\'une seule valeur ponctuelle.',
    source: 'Damodaran, A. (2012). Investment Valuation. Wiley Finance.'
  },
  {
    id: 'q3',
    question: 'Dans l\'analyse PESTEL, quel facteur est le plus susceptible de changer rapidement ?',
    options: [
      { id: 'a', text: 'Facteurs Politiques' },
      { id: 'b', text: 'Facteurs Économiques' },
      { id: 'c', text: 'Facteurs Technologiques' },
      { id: 'd', text: 'Facteurs Légaux' }
    ],
    correctAnswer: 'c',
    explanation: 'Les facteurs technologiques évoluent généralement plus rapidement que les autres dimensions, nécessitant une veille continue et une capacité d\'adaptation rapide.',
    source: 'Aguilar, F. J. (1967). Scanning the Business Environment. Macmillan.'
  }
];

export function AcademicCourses() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const getLevelColor = (level: Course['level']): string => {
    switch (level) {
      case 'foundation': return 'bg-green-500/10 text-green-600';
      case 'intermediate': return 'bg-blue-500/10 text-blue-600';
      case 'advanced': return 'bg-purple-500/10 text-purple-600';
      case 'master': return 'bg-red-500/10 text-red-600';
    }
  };

  const getModuleIcon = (type: CourseModule['type']) => {
    switch (type) {
      case 'video': return Video;
      case 'reading': return BookOpen;
      case 'quiz': return HelpCircle;
      case 'exercise': return FileText;
    }
  };

  const calculateQuizScore = () => {
    let correct = 0;
    sampleQuiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    return (correct / sampleQuiz.length) * 100;
  };

  if (activeQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Quiz d'Évaluation</h2>
            <p className="text-muted-foreground">Testez vos connaissances niveau grande école</p>
          </div>
          <Button variant="ghost" onClick={() => { setActiveQuiz(false); setQuizSubmitted(false); setQuizAnswers({}); }}>
            ← Retour aux cours
          </Button>
        </div>

        <div className="space-y-6">
          {sampleQuiz.map((quiz, idx) => (
            <Card key={quiz.id} className={cn(
              quizSubmitted && quizAnswers[quiz.id] === quiz.correctAnswer && "border-green-500",
              quizSubmitted && quizAnswers[quiz.id] !== quiz.correctAnswer && "border-red-500"
            )}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {idx + 1}
                  </span>
                  {quiz.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quiz.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [quiz.id]: option.id }))}
                      disabled={quizSubmitted}
                      className={cn(
                        "w-full p-4 rounded-lg border text-left transition-all",
                        quizAnswers[quiz.id] === option.id && !quizSubmitted && "border-primary bg-primary/5",
                        quizSubmitted && option.id === quiz.correctAnswer && "border-green-500 bg-green-500/10",
                        quizSubmitted && quizAnswers[quiz.id] === option.id && option.id !== quiz.correctAnswer && "border-red-500 bg-red-500/10",
                        !quizSubmitted && "hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium">
                          {option.id.toUpperCase()}
                        </span>
                        <span>{option.text}</span>
                        {quizSubmitted && option.id === quiz.correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {quizSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <p className="text-sm font-medium mb-2">Explication :</p>
                    <p className="text-sm text-muted-foreground">{quiz.explanation}</p>
                    {quiz.source && (
                      <p className="text-xs text-muted-foreground mt-2 italic">Source : {quiz.source}</p>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!quizSubmitted ? (
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setQuizSubmitted(true)}
            disabled={Object.keys(quizAnswers).length < sampleQuiz.length}
          >
            Soumettre mes réponses
          </Button>
        ) : (
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className={cn(
                    "w-10 h-10",
                    calculateQuizScore() >= 70 ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Score : {calculateQuizScore().toFixed(0)}%
                </h3>
                <p className="text-muted-foreground mb-4">
                  {calculateQuizScore() >= 70 
                    ? "Félicitations ! Vous maîtrisez les concepts fondamentaux."
                    : "Continuez à étudier les cours pour améliorer votre score."}
                </p>
                <Button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (selectedCourse) {
    const completedModules = selectedCourse.modules.filter(m => m.completed).length;
    const totalModules = selectedCourse.modules.length;
    const progressPercent = (completedModules / totalModules) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedCourse(null)}>← Retour</Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{selectedCourse.title}</h1>
            <p className="text-muted-foreground">{selectedCourse.subtitle}</p>
          </div>
        </div>

        {/* Course Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedCourse.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCourse.instructor.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedCourse.instructor.institution}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedCourse.duration}</p>
                  <p className="text-xs text-muted-foreground">Durée totale</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {selectedCourse.rating}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedCourse.enrollments.toLocaleString()} inscrits</p>
                </div>
                {selectedCourse.certification && (
                  <div className="text-center">
                    <Award className="w-8 h-8 text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground">Certification</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progression</span>
                <span className="text-sm text-muted-foreground">{completedModules}/{totalModules} modules</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        <Card>
          <CardHeader>
            <CardTitle>Programme du cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedCourse.modules.map((module) => {
                const ModuleIcon = getModuleIcon(module.type);
                
                return (
                  <div 
                    key={module.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-all",
                      module.completed && "bg-green-500/5 border-green-200",
                      module.locked && "opacity-50",
                      !module.completed && !module.locked && "hover:border-primary/50 cursor-pointer"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      module.completed && "bg-green-500 text-white",
                      module.locked && "bg-muted",
                      !module.completed && !module.locked && "bg-primary/10 text-primary"
                    )}>
                      {module.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : module.locked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <ModuleIcon className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium">{module.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">{module.type}</Badge>
                      </div>
                    </div>
                    
                    {!module.locked && !module.completed && (
                      <Button size="sm" variant="ghost">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Commencer
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Compétences acquises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedCourse.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold mb-2">
              Cours Structurés Niveau Grande École
            </h2>
            <p className="text-muted-foreground">
              Formations certifiantes inspirées des programmes MBA/Master des meilleures 
              business schools (HEC, INSEAD, LBS, Wharton). Progression pédagogique et évaluations.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="gap-1">
                <Award className="w-3 h-3" />
                Certifications
              </Badge>
              <Badge variant="outline">Vidéos HD</Badge>
              <Badge variant="outline">Quiz interactifs</Badge>
              <Badge variant="outline">Études de cas</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Quiz Access */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Quiz d'évaluation rapide</h3>
                <p className="text-sm text-muted-foreground">Testez vos connaissances en stratégie et finance internationale</p>
              </div>
            </div>
            <Button onClick={() => setActiveQuiz(true)}>
              Commencer le quiz <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => {
          const completedModules = course.modules.filter(m => m.completed).length;
          
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              <Card className="h-full hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">{course.category}</Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Instructor */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{course.instructor.name}</p>
                        <p className="text-muted-foreground">{course.instructor.institution}</p>
                      </div>
                    </div>
                    
                    {/* Progress if started */}
                    {course.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>{completedModules}/{course.modules.length}</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    
                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {course.rating}
                        </span>
                      </div>
                      {course.certification && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Certifiant
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default AcademicCourses;
