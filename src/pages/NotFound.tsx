import { useLocation } from "react-router-dom";
import { LocalizedLink as Link } from '@/components/i18n';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Home, Map, Zap, Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const suggestions = [
    { href: "/", icon: Home, label: t('notFound.home', 'Accueil') },
    { href: "/countries", icon: Map, label: t('notFound.countries', 'Explorer les pays') },
    { href: "/quick-test", icon: Zap, label: t('notFound.quickTest', 'Test rapide') },
  ];

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-muted">
            <Compass className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-2">
          {t('notFound.title', 'Page introuvable')}
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          {t('notFound.description', "La page que vous cherchez n'existe pas ou a été déplacée.")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {suggestions.map((s) => {
            const Icon = s.icon;
            return (
              <Button key={s.href} variant="outline" asChild>
                <Link to={s.href} className="gap-2">
                  <Icon className="w-4 h-4" />
                  {s.label}
                </Link>
              </Button>
            );
          })}
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.backHome', "Retour à l'accueil")}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
