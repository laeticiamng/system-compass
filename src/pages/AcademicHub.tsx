/**
 * AcademicHub - Centre des outils académiques niveau grande école
 * Frameworks stratégiques, modélisation financière, analyse géopolitique
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Calculator, 
  Globe, 
  FileText,
  Target,
  Award,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  StrategicFrameworks,
  FinancialModeling, 
  GeopoliticalAnalysis, 
  CaseStudySystem,
  AcademicCourses 
} from '@/components/academic';

const ACADEMIC_MODULES = [
  {
    id: 'frameworks',
    title: 'Frameworks Stratégiques',
    description: 'PESTEL, Porter, SWOT, matrices de décision',
    icon: Target,
    level: 'MBA',
    authors: ['Michael Porter', 'Francis Aguilar'],
  },
  {
    id: 'financial',
    title: 'Modélisation Financière',
    description: 'DCF, Monte Carlo, optimisation fiscale',
    icon: Calculator,
    level: 'CFA',
    authors: ['Aswath Damodaran', 'McKinsey'],
  },
  {
    id: 'geopolitical',
    title: 'Analyse Géopolitique',
    description: 'Indicateurs institutionnels, soft power, risques',
    icon: Globe,
    level: 'Sciences Po',
    authors: ['World Bank', 'WEF', 'Transparency International'],
  },
  {
    id: 'cases',
    title: 'Études de Cas',
    description: 'Cas pratiques HEC/INSEAD anonymisés',
    icon: FileText,
    level: 'HEC',
    authors: ['Cas réels anonymisés'],
  },
  {
    id: 'courses',
    title: 'Cours Structurés',
    description: 'Formations certifiantes avec quiz',
    icon: BookOpen,
    level: 'INSEAD',
    authors: ['Professeurs experts'],
  },
];

export default function AcademicHub() {
  const [activeModule, setActiveModule] = useState('frameworks');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 md:pt-24">
      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Centre Académique
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Outils d'analyse et méthodologies enseignés dans les meilleures business schools mondiales 
            (HEC, INSEAD, LBS, Wharton). Niveau MBA/Master.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <Award className="w-3 h-3" />
              Niveau Grande École
            </Badge>
            <Badge variant="outline">Frameworks Académiques</Badge>
            <Badge variant="outline">Certifications</Badge>
          </div>
        </motion.div>

        {/* Module Selection - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mb-8 overflow-x-auto">
          {ACADEMIC_MODULES.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <motion.button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 md:p-4 rounded-xl border text-left transition-all min-w-0 ${
                  isActive 
                    ? 'border-primary bg-primary/10 shadow-lg' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1">{module.level}</Badge>
                </div>
                <h3 className="font-semibold text-xs md:text-sm mb-0.5 md:mb-1 truncate">{module.title}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 hidden sm:block">{module.description}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Active Module Content */}
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeModule === 'frameworks' && <StrategicFrameworks />}
          {activeModule === 'financial' && <FinancialModeling />}
          {activeModule === 'geopolitical' && <GeopoliticalAnalysis />}
          {activeModule === 'cases' && <CaseStudySystem />}
          {activeModule === 'courses' && <AcademicCourses />}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <CardTitle>Pourquoi ces outils ?</CardTitle>
              <CardDescription>
                Des méthodologies éprouvées pour des décisions éclairées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Rigueur Académique',
                    description: 'Frameworks utilisés par les consultants McKinsey, BCG et les dirigeants Fortune 500',
                    icon: GraduationCap,
                  },
                  {
                    title: 'Application Pratique',
                    description: 'Études de cas réels et outils interactifs pour votre situation spécifique',
                    icon: Target,
                  },
                  {
                    title: 'Décision Éclairée',
                    description: 'Quantification des risques et opportunités pour minimiser les biais cognitifs',
                    icon: CheckCircle,
                  },
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={idx} className="text-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
