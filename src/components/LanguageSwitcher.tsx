import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) 
    || SUPPORTED_LANGUAGES[0];

  // Handle RTL languages
  useEffect(() => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language);
    const dir = lang && 'dir' in lang && lang.dir === 'rtl' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('app_lang', langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2 px-2', className)}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang.flag}</span>
          <span className="hidden md:inline text-xs">{currentLang.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'cursor-pointer gap-2',
              i18n.language === lang.code && 'bg-primary/10 text-primary'
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {'beta' in lang && lang.beta && (
              <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 text-muted-foreground">
                Beta
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
