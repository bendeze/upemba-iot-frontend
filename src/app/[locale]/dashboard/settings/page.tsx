'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Palette, ShieldCheck } from 'lucide-react';
import { ProfileSettings } from '@/components/features/settings/ProfileSettings';
import { AppearanceSettings } from '@/components/features/settings/AppearanceSettings';
import { SecuritySettings } from '@/components/features/settings/SecuritySettings';

type SettingsTab = 'profile' | 'appearance' | 'security';

export default function SettingsDashboardPage() {
  const t = useTranslations('Settings');
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile', label: t('tabProfile'), icon: <User className="w-4 h-4" /> },
    { id: 'appearance', label: t('tabAppearance'), icon: <Palette className="w-4 h-4" /> },
    { id: 'security', label: t('tabSecurity'), icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl w-full flex flex-col pt-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('pageTitle')}
        </h1>
        <p className="text-muted-foreground mt-1.5 tracking-wide text-sm">
          {t('pageDesc')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start mt-4">
        
        {/* SettingsSidebar */}
        <aside className="w-full md:w-64 shrink-0 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <nav className="flex md:flex-col gap-1.5 md:gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/50'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Pane Renderer */}
        <main className="flex-1 min-w-0 w-full">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </main>

      </div>
    </div>
  );
}
