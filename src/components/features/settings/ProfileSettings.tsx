'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useUsers';
import { UserProfile } from '@/lib/api/users';
import { User, Mail, Shield } from 'lucide-react';

export function ProfileSettings() {
  const t = useTranslations('Settings');
  const tAuth = useTranslations('Auth');
  const { data: user, isLoading } = useCurrentUser();
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.first_name || user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (isLoading) {
    return <div className="animate-pulse flex flex-col gap-6"><div className="h-32 bg-muted/20 rounded-xl w-full border border-border/40" /></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const isPending = updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Badge Header */}
      <div className="flex items-center gap-6 p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-3xl font-black text-primary-foreground shadow-md z-10">
           {formData.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{user?.username}</h2>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mt-1">
            <Shield className="w-3.5 h-3.5" /> Edge Node Administrator
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{t('profileTitle')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> {tAuth('nameLabel')}</label>
              <input
                required
                className="flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all shadow-sm"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {tAuth('emailLabel')}</label>
              <input
                required
                type="email"
                className="flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all shadow-sm"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="operator@upemba.local"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <button
            type="submit"
            disabled={isPending || (formData.name === user?.name && formData.email === user?.email)}
            className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
          >
           {isPending ? 'Syncing...' : 'Save Profile'}
          </button>
        </div>
        
        {updateMutation.isSuccess && (
          <p className="text-sm text-emerald-500 text-right">Profile updated successfully.</p>
        )}
      </form>
    </div>
  );
}
