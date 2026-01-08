import { useTranslation } from 'react-i18next';
import { PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface QuizQuestion {
  id: string;
  icon: React.ReactNode;
  options: {
    text: string;
    scores: Partial<Record<PyramidType, number>>;
  }[];
}

interface QuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (scores: Partial<Record<PyramidType, number>>) => void;
}

export function QuestionCard({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onAnswer 
}: QuestionCardProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-card rounded-2xl p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm text-muted-foreground">
          {t('pyramidQuiz.question')} {currentIndex + 1} / {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i < currentIndex ? "bg-primary" : 
                i === currentIndex ? "bg-primary/70" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-xl bg-primary/10">
          {question.icon}
        </div>
        <h2 className="font-display text-xl font-semibold">
          {t(`pyramidQuiz.questions.${question.id}.question`)}
        </h2>
      </div>

      <div className="grid gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option.scores)}
            className="p-4 rounded-xl border border-border hover:border-primary/50 
                       hover:bg-primary/5 text-left transition-all duration-300 
                       hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-foreground">
              {t(`pyramidQuiz.questions.${question.id}.options.${option.text}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
