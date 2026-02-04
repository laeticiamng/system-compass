import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Marie L.',
    role: 'Entrepreneure',
    country: '🇫🇷',
    content: "Grâce à Pyramid Compass, j'ai pu anticiper les vraies contraintes de mon expatriation au Portugal. Les analyses de système m'ont évité des erreurs coûteuses.",
    rating: 5,
  },
  {
    id: '2',
    name: 'Thomas K.',
    role: 'Cadre Tech',
    country: '🇩🇪',
    content: "L'outil de comparaison de pays m'a permis de prendre une décision éclairée. Les données sur la fiscalité et la qualité de vie sont exceptionnellement précises.",
    rating: 5,
  },
  {
    id: '3',
    name: 'Sophie M.',
    role: 'Consultante',
    country: '🇧🇪',
    content: "Les clés de sortie personnalisées ont été un game-changer. J'ai trouvé une stratégie que je n'aurais jamais imaginée seule.",
    rating: 5,
  },
  {
    id: '4',
    name: 'Alexandre D.',
    role: 'Investisseur',
    country: '🇨🇭',
    content: "La profondeur d'analyse des systèmes de pouvoir est impressionnante. Ça m'a aidé à comprendre les vraies règles du jeu avant de m'engager.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <p className="text-primary font-medium mb-3 md:mb-5 tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm">
            {t('testimonials.badge', 'Témoignages')}
          </p>
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,3.5rem)] font-bold">
            {t('testimonials.title', 'Ce que disent nos utilisateurs')}
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full glass-card border-primary/10 hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  
                  {/* Content */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {testimonial.name} {testimonial.country}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center"
        >
          <div>
            <p className="text-3xl md:text-4xl font-bold gold-text">15K+</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('testimonials.stat.users', 'Utilisateurs actifs')}
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold gold-text">38</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('testimonials.stat.countries', 'Pays analysés')}
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold gold-text">4.9/5</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('testimonials.stat.rating', 'Note moyenne')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
