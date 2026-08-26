'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Monitor, Moon, Sun, Globe, Check, Languages } from 'lucide-react';

export function AppearanceSettings() {
  const t = useTranslations('Settings');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 animate-pulse bg-muted/20 rounded-xl border border-border/40" />;
  }

  const handleLanguageChange = (nextLocale: 'en' | 'fr') => {
    if (nextLocale === currentLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const themeOptions = [
    { id: 'light', name: t('themeLight'), icon: <Sun className="w-5 h-5 mb-2 text-amber-500" />, desc: t('themeLightDesc') },
    { id: 'dark', name: t('themeDark'), icon: <Moon className="w-5 h-5 mb-2 text-primary" />, desc: t('themeDarkDesc') },
    { id: 'system', name: t('themeSystem'), icon: <Monitor className="w-5 h-5 mb-2 text-muted-foreground" />, desc: t('themeSystemDesc') },
  ];

  const languageOptions = [
    {
      id: 'en',
      code: 'EN',
      name: 'English',
      nativeName: 'English (US / Global)',
      desc: currentLocale === 'fr' ? 'Interface standard en anglais.' : 'Standard English interface.',
    },
    {
      id: 'fr',
      code: 'FR',
      name: 'Français',
      nativeName: 'Français (International)',
      desc: currentLocale === 'fr' ? 'Interface et terminologie en français.' : 'French interface and terminology.',
    },
  ];

  return (
    <div className="space-y-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. LANGUAGE & LOCALIZATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
            <Languages className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {t('languageTitle')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('languageDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languageOptions.map((lang) => {
            const isSelected = currentLocale === lang.id;
            return (
              <button
                key={lang.id}
                disabled={isPending}
                onClick={() => handleLanguageChange(lang.id as 'en' | 'fr')}
                className={`relative flex flex-col items-start p-4 border rounded-xl transition-all duration-200 text-left bg-card/50 backdrop-blur-sm ${
                  isSelected 
                    ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' 
                    : 'border-border/50 hover:bg-muted/30 hover:border-border'
                } ${isPending ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted/60 border border-border/40 text-foreground">
                      {lang.code}
                    </span>
                    <span className="font-bold text-sm text-foreground">{lang.name}</span>
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{lang.nativeName}</span>
                <span className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">{lang.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* 2. THEME SELECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-muted/40 text-foreground border border-border/40">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {t('themeTitle')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('themeDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex flex-col items-start p-4 border rounded-xl transition-all duration-200 text-left bg-card/50 backdrop-blur-sm ${
                theme === opt.id 
                  ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' 
                  : 'border-border/50 hover:bg-muted/30 hover:border-border'
              }`}
            >
              {opt.icon}
              <span className="font-bold text-sm text-foreground">{opt.name}</span>
              <span className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
