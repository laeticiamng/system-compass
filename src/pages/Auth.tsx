import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Compass, LogIn, UserPlus, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, Mail } from 'lucide-react';
import { z } from 'zod';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { PasswordResetDialog } from '@/components/auth/PasswordResetDialog';
import { toast } from 'sonner';

const emailSchema = z.string().email();

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const { user, loading, signUp, signIn } = useAuth();
  const { trackAccountCreated } = useAnalytics();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const isNewSignupRef = useRef(false);

  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      if (isNewSignupRef.current) {
        isNewSignupRef.current = false;
        setShowSignupSuccess(true);
        // Redirect after showing confirmation
        setTimeout(() => {
          navigate('/quick-test');
          setTimeout(() => {
            toast.success(t('auth.welcomeToast', 'Bienvenue ! Découvrez votre profil d\'expatrié 🧭'), {
              duration: 6000,
            });
          }, 500);
        }, 2500);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    try {
      emailSchema.parse(email);
    } catch {
      setError(t('auth.errors.invalidEmail'));
      setIsSubmitting(false);
      return;
    }

    // Password validation with i18n messages
    const passwordResult = z.string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .safeParse(password);
    if (!passwordResult.success) {
      setError(t('auth.errors.passwordTooShort'));
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setError(t('auth.errors.nameRequired'));
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.errors.invalidCredentials'));
          } else {
            setError(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError(t('auth.errors.alreadyRegistered'));
          } else {
            setError(error.message);
          }
        } else {
          isNewSignupRef.current = true;
          trackAccountCreated();
          // Send welcome email via Resend (fire-and-forget)
          supabase.functions.invoke('send-email', {
            body: { email, displayName, type: 'welcome' },
          }).catch((err: Error) => console.warn('[send-email] Failed:', err));
        }
      }
    } catch (err) {
      setError(t('auth.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(t('auth.errors.generic'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setIsAppleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(t('auth.errors.generic'));
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setMagicLinkSent(false);

    try {
      emailSchema.parse(email);
    } catch {
      setError(t('auth.errors.invalidEmail', 'Adresse email invalide'));
      return;
    }

    setIsMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${window.location.pathname.match(/^\/[a-z]{2}(?=\/|$)/)?.[0] || ''}/dashboard`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMagicLinkSent(true);
        toast.success(t('auth.magicLinkSent', 'Lien magique envoyé ! Vérifiez votre boîte mail.'));
      }
    } catch {
      setError(t('auth.errors.generic'));
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showSignupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold mb-2"
          >
            {t('auth.signupSuccess', 'Compte créé avec succès ! 🎉')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            {t('auth.redirecting', 'Redirection vers le test rapide...')}
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.8, ease: 'linear' }}
            className="mt-6 h-1 bg-primary rounded-full origin-left max-w-xs mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.meta.title', 'Connexion — Compass')}</title>
        <meta name="description" content={t('auth.meta.description', "Connectez-vous à Compass pour accéder à vos analyses de pays et recommandations personnalisées. Créez un compte gratuit.")} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('auth.meta.ogTitle', 'Connexion — Compass')} />
        <meta property="og:description" content={t('auth.meta.ogDescription', "Accédez à vos analyses de pays et stratégies de sortie personnalisées.")} />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('auth.meta.ogTitle', 'Connexion — Compass')} />
        <meta name="twitter:description" content={t('auth.meta.ogDescription', "Accédez à vos analyses de pays et stratégies de sortie personnalisées.")} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-md relative">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary mb-4 glow-gold">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2 gold-text">
            {isLogin ? t('auth.login') : t('auth.signup')}
          </h1>
          <p className="text-muted-foreground">{t('auth.subtitle')}</p>
        </div>

        <div className="glass-card-elevated rounded-xl p-8 animate-scale-in border-primary/10 glow-card">
          {/* Toggle */}
          <div className="flex gap-2 mb-8 p-1 rounded-lg bg-muted/50 border border-primary/10">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2.5 rounded-md font-medium transition-all",
                isLogin ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              {t('auth.login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2.5 rounded-md font-medium transition-all",
                !isLogin ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.displayNamePlaceholder')}
                  className="bg-background"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-background"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background pr-10"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && password && (
                <PasswordStrengthMeter password={password} showRequirements={true} />
              )}
            </div>

            {/* Remember me checkbox and password reset */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    {t('auth.rememberMe', 'Se souvenir de moi')}
                  </Label>
                </div>
                <PasswordResetDialog />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full gap-2 btn-premium text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isLogin ? t('auth.loginButton') : t('auth.signupButton')}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinueWith', 'ou')}</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {t('auth.continueWithGoogle', 'Continuer avec Google')}
            </Button>

            {/* Apple Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3"
              onClick={handleAppleSignIn}
              disabled={isAppleLoading}
            >
              {isAppleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              {t('auth.continueWithApple', 'Continuer avec Apple')}
            </Button>

            {/* Magic Link */}
            {isLogin && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('auth.orUseMagicLink', 'ou sans mot de passe')}</span>
                  </div>
                </div>

                {magicLinkSent ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t('auth.magicLinkSentTitle', 'Lien envoyé !')}</p>
                      <p className="text-xs text-muted-foreground">{t('auth.magicLinkSentDesc', 'Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter.')}</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-3 border-primary/20 hover:bg-primary/5"
                    onClick={handleMagicLink}
                    disabled={isMagicLinkLoading || !email}
                  >
                    {isMagicLinkLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {t('auth.magicLink', 'Recevoir un lien de connexion par email')}
                  </Button>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
