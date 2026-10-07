import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  LogOut,
  Shield,
  BookOpen,
  School,
  Sparkles,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  CheckCircle,
  Settings,
  Database,
  LayoutDashboard,
  Check,
  UserCheck,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { UserAccount } from '../types';
import { StorageService } from '../services/storage';
import { SupabaseService, SUPABASE_URL } from '../services/supabase';

interface NavbarProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onSwitchUser: (user: UserAccount) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  activeTab,
  setActiveTab,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getUsers());
  const [settings, setSettings] = useState(() => StorageService.getSettings());

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncFeedback('Sinkronisasi...');
    try {
      const res = await StorageService.pullFromSupabase();
      if (res.success) {
        setUsers(StorageService.getUsers());
        setSettings(StorageService.getSettings());
        setSyncFeedback('Tersinkron!');
        setTimeout(() => setSyncFeedback(null), 2500);
      } else {
        setSyncFeedback('Gagal');
        setTimeout(() => setSyncFeedback(null), 2500);
      }
    } catch {
      setSyncFeedback('Gagal');
      setTimeout(() => setSyncFeedback(null), 2500);
    } finally {
      setIsManualSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    SupabaseService.checkConnection().then(res => {
      if (isMounted) {
        setSupabaseConnected(res.connected);
        setPingLatency(res.latencyMs);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: UserAccount) => {
    StorageService.setCurrentUser(user);
    onSwitchUser(user);
    setShowUserDropdown(false);
    setShowMobileMenu(false);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'GURU_MAPEL'],
    },
    {
      id: 'input-nilai',
      label: 'Input Nilai',
      icon: BookOpen,
      roles: ['SUPER_ADMIN', 'GURU_MAPEL'],
    },
    {
      id: 'rekap-3bulan',
      label: 'Rekap 3 Bulan',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'GURU_MAPEL'],
    },
    {
      id: 'leger-nilai',
      label: 'Leger & Rapor',
      icon: FileSpreadsheet,
      roles: ['SUPER_ADMIN', 'GURU_MAPEL'],
    },
    {
      id: 'data-master',
      label: 'Data Master',
      icon: School,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const visibleNavItems = navItems.filter(
    item => currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Brand & School Info */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center p-1 shadow-sm ring-2 ring-white group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                <img
                  src={settings.logoSekolahUrl || "https://i.ibb.co.com/QvMS2L2J/LOGO-SEKOLAH-SMPN-1-RAJAPOLAH.png"}
                  alt={settings.namaSekolah || "Logo SMPN 1 Rajapolah"}
                  className={`w-full h-full object-contain drop-shadow-xs ${(settings.logoSekolahUrl || "https://i.ibb.co.com/QvMS2L2J/LOGO-SEKOLAH-SMPN-1-RAJAPOLAH.png").includes('LOGO-SEKOLAH') ? 'scale-[1.65]' : ''}`}
                />
              </div>
              {/* Little glowing accent dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400/40" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                  e-Rapor PTS
                </span>
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/70">
                  SMP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-[160px] sm:max-w-xs">
                {settings.namaSekolah} • TP {settings.tahunAjaran}
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Pill Segmented Control */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-inner">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive ? 'bg-white text-teal-700 shadow-xs font-extrabold ring-1 ring-slate-900/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Area: Supabase Pill & Profile Button */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Supabase Status & Cloud Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              title={`Klik untuk sinkronisasi data terbaru dengan Cloud Supabase (${SUPABASE_URL})`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${supabaseConnected ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100 active:scale-95' : supabaseConnected === false ? 'bg-rose-50/80 text-rose-700 border-rose-200/80' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
            >
              <span className="relative flex h-2 w-2">
                {supabaseConnected && !isManualSyncing && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${supabaseConnected ? 'bg-emerald-500' : supabaseConnected === false ? 'bg-rose-500' : 'bg-slate-400'}`} />
              </span>
              <span className="font-medium">
                {syncFeedback || (isManualSyncing ? 'Sinkron...' : 'Cloud Sync')}
              </span>
              {isManualSyncing ? (
                <span className="inline-block w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : pingLatency ? (
                <span className="text-[10px] opacity-75 font-mono">
                  {pingLatency}ms
                </span>
              ) : null}
            </button>

            {/* Profile & Role Switcher Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all text-left ${showUserDropdown ? 'border-teal-300 bg-teal-50/50 shadow-sm ring-2 ring-teal-500/10' : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'}`}
              >
                {/* Role Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-gradient-to-tr from-amber-500 to-amber-600' : 'bg-gradient-to-tr from-teal-600 to-emerald-600'}`}>
                  {currentUser?.role === 'SUPER_ADMIN' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <span>{currentUser?.nama?.charAt(0) || 'G'}</span>
                  )}
                </div>

                {/* Profile Details (Hidden on tiny screens) */}
                <div className="hidden sm:block text-left pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                      {currentUser?.nama?.split(',')[0]}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md tracking-wider ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200/50' : 'bg-teal-100 text-teal-800 border border-teal-200/50'}`}>
                      {currentUser?.role === 'SUPER_ADMIN' ? 'Admin' : 'Guru'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {currentUser?.role === 'SUPER_ADMIN' ? 'Username: Superadmin' : `NIP: ${currentUser?.nip.slice(0, 8)}...`}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180 text-teal-600' : ''}`} />
              </button>

              {/* Enhanced Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">

                  {/* Active User Card */}
                  <div className="p-3 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-2xl text-white mb-2 shadow-sm border border-teal-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1.5 ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-teal-400 text-slate-950'}`}>
                          {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin (Non-Guru)' : `Guru ${currentUser?.mapelName}`}
                        </span>
                        <h4 className="font-bold text-xs leading-snug">{currentUser?.nama}</h4>
                        <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                          {currentUser?.role === 'SUPER_ADMIN' ? 'Username: Superadmin' : `NIP: ${currentUser?.nip}`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                      <span>{settings.namaSekolah}</span>
                      <span className="font-semibold text-emerald-400">● Aktif</span>
                    </div>
                  </div>

                  {/* Supabase status in dropdown */}
                  <div className="mt-2 pt-2 border-t border-slate-100 px-2 py-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-teal-600" />
                      <span>Supabase Cloud</span>
                    </span>
                    <span className={`text-[10px] font-bold ${supabaseConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {supabaseConnected ? 'Terhubung' : 'Offline'}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Aplikasi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (When hamburger open) */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Menu Navigasi
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3 py-2 text-xs">
            <span className="text-slate-500 font-medium">Status Database:</span>
            <span className={`font-bold flex items-center gap-1 ${supabaseConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Database className="w-3.5 h-3.5" />
              <span>{supabaseConnected ? 'Supabase Terhubung' : 'Offline'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Floating Bottom App Bar for Mobile (Always accessible, thumb friendly) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/90 py-1.5 px-3 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.04)] print:hidden">
        {visibleNavItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-teal-50 scale-110' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5 truncate max-w-[65px]">{item.label}</span>
            </button>
          );
        })}

        {/* Master or Settings for Admin, or Profile for Guru */}
        {currentUser?.role === 'SUPER_ADMIN' ? (
          <button
            onClick={() => setActiveTab('data-master')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${(activeTab === 'data-master' || activeTab === 'pengaturan') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <div className={`p-1 rounded-lg transition-transform ${activeTab === 'data-master' || activeTab === 'pengaturan' ? 'bg-teal-50 scale-110' : ''}`}>
              <Settings className="w-4 h-4" />
            </div>
            <span className="mt-0.5">Admin</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
