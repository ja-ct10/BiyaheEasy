'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Briefcase, Bell, Smartphone, LogOut, Camera, Save } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || 'Juan dela Cruz',
    email: user?.email || 'juan@email.com',
    home_location: user?.home_location || 'SM North EDSA, Quezon City',
    work_location: user?.work_location || 'Ayala Center, Makati',
  });
  const [notifications, setNotifications] = useState({
    route_updates: true,
    budget_alerts: true,
    weekly_summary: false,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <AppShell>
      <div className="px-4 md:px-6 max-w-2xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-xl font-bold text-white">Profile</h1>
        </motion.div>

        {/* Avatar */}
        <Card hover={false} className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
                <User className="w-8 h-8 text-muted" />
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center" aria-label="Upload avatar">
                <Camera className="w-3 h-3 text-background" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{formData.full_name}</h3>
              <p className="text-xs text-muted">{formData.email}</p>
            </div>
          </div>
        </Card>

        {/* Personal Info */}
        <Card hover={false} className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-1">Personal Info</h3>
          <Input label="Full Name" icon={<User className="w-4 h-4" />} value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          <Input label="Email" icon={<Mail className="w-4 h-4" />} value={formData.email} disabled />
        </Card>

        {/* Locations */}
        <Card hover={false} className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-1">Frequent Locations</h3>
          <Input label="Home" icon={<MapPin className="w-4 h-4" />} value={formData.home_location} onChange={(e) => setFormData({ ...formData, home_location: e.target.value })} />
          <Input label="Work/School" icon={<Briefcase className="w-4 h-4" />} value={formData.work_location} onChange={(e) => setFormData({ ...formData, work_location: e.target.value })} />
        </Card>

        {/* Notifications */}
        <Card hover={false} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { key: 'route_updates', label: 'Route Disruption Alerts' },
              { key: 'budget_alerts', label: 'Budget Limit Warnings' },
              { key: 'weekly_summary', label: 'Weekly Commute Summary' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-btn bg-surface-2 cursor-pointer">
                <span className="text-sm text-white">{item.label}</span>
                <div className="relative">
                  <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })} className="sr-only peer" />
                  <div className="w-10 h-5 bg-surface rounded-full peer peer-checked:bg-accent/30 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-muted rounded-full peer-checked:translate-x-5 peer-checked:bg-accent transition-all" />
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* PWA */}
        <Card hover={false} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">App Settings</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-btn bg-surface-2">
              <span className="text-sm text-white">Offline Mode</span>
              <span className="px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 text-[10px] font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-btn bg-surface-2">
              <span className="text-sm text-white">Auto-sync</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">Enabled</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pb-4">
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
            <Save className="w-4 h-4" />Save Changes
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/5" onClick={signOut}>
            <LogOut className="w-4 h-4" />Sign Out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
