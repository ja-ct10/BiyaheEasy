'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Briefcase, Bell, Smartphone, LogOut, Camera, Save, Shield, CheckCircle2, Bus, Wallet } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { TRANSPORT_MODES, PRIORITY_OPTIONS } from '@/lib/constants';
import Image from 'next/image';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    home_location: '',
    work_location: '',
    avatar_url: '',
    preferred_transport_modes: [] as string[],
    preferred_priority: 'fastest',
    daily_budget_limit: 0,
  });

  const [notifications, setNotifications] = useState({
    route_updates: true,
    budget_alerts: true,
    weekly_summary: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        home_location: user.home_location || '',
        work_location: user.work_location || '',
        avatar_url: (user as any).avatar_url || '',
        preferred_transport_modes: (user as any).preferred_transport_modes || ['jeepney', 'bus', 'mrt'],
        preferred_priority: (user as any).preferred_priority || 'fastest',
        daily_budget_limit: (user as any).daily_budget_limit || 0,
      });
    }
  }, [user]);

  const initials = formData.full_name
    ? formData.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await profileService.uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatar_url: url }));
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleTransportMode = (modeId: string) => {
    setFormData((prev) => {
      const modes = prev.preferred_transport_modes.includes(modeId)
        ? prev.preferred_transport_modes.filter((m) => m !== modeId)
        : [...prev.preferred_transport_modes, modeId];
      return { ...prev, preferred_transport_modes: modes };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await profileService.updateProfile({
        full_name: formData.full_name,
        home_location: formData.home_location,
        work_location: formData.work_location,
        preferred_transport_modes: formData.preferred_transport_modes,
        preferred_priority: formData.preferred_priority,
        daily_budget_limit: formData.daily_budget_limit || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="px-4 md:px-6 max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-sm text-muted mt-0.5">Manage your account and commute preferences</p>
        </motion.div>

        {/* Avatar Card */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                {formData.avatar_url ? (
                  <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-accent/30">
                    <Image
                      src={formData.avatar_url}
                      alt="Avatar"
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-18 h-18 rounded-full bg-accent/15 border-2 border-accent/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-accent">{initials}</span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20 disabled:opacity-50"
                  aria-label="Upload avatar"
                >
                  <Camera className="w-3.5 h-3.5 text-background" strokeWidth={1.5} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{formData.full_name || 'Your Name'}</h3>
                <p className="text-sm text-muted">{formData.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Shield className="w-3 h-3 text-green-400" strokeWidth={1.5} />
                  <span className="text-[10px] text-green-400 font-medium">Verified Account</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Personal Info */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Personal Info</h3>
            <Input label="Full Name" icon={<User className="w-4 h-4" strokeWidth={1.5} />} value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
            <Input label="Email" icon={<Mail className="w-4 h-4" strokeWidth={1.5} />} value={formData.email} disabled />
          </Card>
        </motion.div>

        {/* Locations */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Frequent Locations</h3>
            <Input label="Home" icon={<MapPin className="w-4 h-4" strokeWidth={1.5} />} value={formData.home_location} onChange={(e) => setFormData({ ...formData, home_location: e.target.value })} placeholder="e.g. SM North EDSA, Quezon City" />
            <Input label="Work / School" icon={<Briefcase className="w-4 h-4" strokeWidth={1.5} />} value={formData.work_location} onChange={(e) => setFormData({ ...formData, work_location: e.target.value })} placeholder="e.g. Ayala Center, Makati" />
          </Card>
        </motion.div>

        {/* Commute Preferences */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Bus className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">Commute Preferences</h3>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Preferred Transport Modes</p>
              <div className="grid grid-cols-3 gap-2">
                {TRANSPORT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => toggleTransportMode(mode.id)}
                    className={cn(
                      'p-2.5 rounded-btn border text-xs font-medium transition-colors text-center',
                      formData.preferred_transport_modes.includes(mode.id)
                        ? 'bg-accent/10 border-accent/30 text-white'
                        : 'bg-surface-2 border-white/5 text-muted'
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Default Priority</p>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, preferred_priority: opt.id })}
                    className={cn(
                      'p-2.5 rounded-btn border text-center transition-colors',
                      formData.preferred_priority === opt.id
                        ? 'bg-accent/10 border-accent/30'
                        : 'bg-surface-2 border-white/5'
                    )}
                  >
                    <p className={cn('text-xs font-medium', formData.preferred_priority === opt.id ? 'text-accent' : 'text-white')}>{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Budget */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">Daily Budget Limit</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">₱</span>
              <input
                type="number"
                value={formData.daily_budget_limit || ''}
                onChange={(e) => setFormData({ ...formData, daily_budget_limit: Number(e.target.value) || 0 })}
                placeholder="e.g. 100"
                className="flex-1 px-3 py-2.5 rounded-input bg-surface-2 border border-white/5 text-white text-sm placeholder:text-muted/50 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
            <p className="text-[10px] text-muted">Routes exceeding this will be shown as &quot;Other Suggestions&quot;</p>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Bell className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'route_updates', label: 'Route Disruption Alerts' },
                { key: 'budget_alerts', label: 'Budget Limit Warnings' },
                { key: 'weekly_summary', label: 'Weekly Commute Summary' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-surface-2 cursor-pointer group">
                  <span className="text-sm text-white group-hover:text-white/90">{item.label}</span>
                  <div className="relative">
                    <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })} className="sr-only peer" />
                    <div className="w-10 h-5 bg-surface rounded-full peer peer-checked:bg-accent/30 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-muted rounded-full peer-checked:translate-x-5 peer-checked:bg-accent transition-all" />
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* PWA */}
        <motion.div variants={fadeUp}>
          <Card hover={false} className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Smartphone className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">App Settings</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
                <span className="text-sm text-white">Offline Mode</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-400/10 text-green-400 text-[10px] font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
                <span className="text-sm text-white">Auto-sync</span>
                <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">Enabled</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="space-y-3 pb-6">
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
            {saved ? <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/5" onClick={signOut}>
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign Out
          </Button>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
