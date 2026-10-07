import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Lock,
  UserCheck,
  Shield,
  ArrowRight,
  AlertCircle,
  School,
  KeyRound,
  Eye,
  EyeOff,
  Database,
  Search,
  CheckCircle2,
  X,
  HelpCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { UserAccount, SchoolSettings } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudConnected, setCloudConnected] = useState<boolean | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getUsers());
  const [settings, setSettings] = useState<SchoolSettings>(() => StorageService.getSettings());
  const [logoError, setLogoError] = useState(false);

  const schoolLogoUrl = settings.logoSekolahUrl || 'https://i.ibb.co.com/QvMS2L2J/LOGO-SEKOLAH-SMPN-1-RAJAPOLAH.png';

  // Otomatis sinkronisasi dengan Cloud Supabase saat halaman login dibuka
  useEffect(() => {
    let isMounted = true;
    setIsCloudSyncing(true);

    SupabaseService.checkConnection().then(res => {
      if (!isMounted) return;
      setCloudConnected(res.connected);
      if (res.connected) {
        StorageService.initCloudSync().then(() => {
          if (!isMounted) return;
          setUsers(StorageService.getUsers());
          setSettings(StorageService.getSettings());
          setIsCloudSyncing(false);
        }).catch(() => {
          if (isMounted) setIsCloudSyncing(false);
        });
      } else {
        setIsCloudSyncing(false);
      }
    });

    const handleSynced = () => {
      if (!isMounted) return;
      setUsers(StorageService.getUsers());
      setSettings(StorageService.getSettings());
      setIsCloudSyncing(false);
    };

    window.addEventListener('erapor_data_synced', handleSynced);
    return () => {
      isMounted = false;
      window.removeEventListener('erapor_data_synced', handleSynced);
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!nip.trim()) {
      setErrorMsg('Silakan masukkan Username atau NIP / NUPTK Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan Kata Sandi (Password) Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await StorageService.login(nip, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Login gagal. Periksa kembali NIP/NUPTK dan Password.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem saat proses login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTeacher = (u: UserAccount) => {
    setNip(u.nip);
    setPassword(u.password || 'guru123');
    setErrorMsg('');
    setShowHelpModal(false);
  };

  // Filter daftar guru untuk modal pencarian
  const filteredTeachers = useMemo(() => {
    const list = users.filter(u => u.role !== 'SUPER_ADMIN');
    if (!teacherSearch.trim()) return list;
    const q = teacherSearch.toLowerCase();
    return list.filter(u =>
      u.nama.toLowerCase().includes(q) ||
      u.nip.toLowerCase().includes(q) ||
      (u.mapelName && u.mapelName.toLowerCase().includes(q))
    );
  }, [users, teacherSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Header App */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500/40 to-emerald-500/40 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/95 backdrop-blur-md p-2 shadow-2xl shadow-teal-500/30 border border-white/40 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {!logoError ? (
                  <img
                    src={schoolLogoUrl}
                    alt={settings.namaSekolah || 'Logo SMPN 1 Rajapolah'}
                    onError={() => setLogoError(true)}
                    className={`w-full h-full object-contain filter drop-shadow-sm ${
                      schoolLogoUrl.includes('LOGO-SEKOLAH') ? 'scale-[1.65]' : ''
                    }`}
                  />
                ) : (
                  <GraduationCap className="w-10 h-10 text-teal-600" />
                )}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            e-Rapor Penilaian Tengah Semester
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Sistem Informasi Penilaian Tengah Semester (PTS/STS) • 33 Kelas (VII-A s.d. IX-K)
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-teal-300">
              <School className="w-3.5 h-3.5" />
              <span>{settings.namaSekolah} • TP {settings.tahunAjaran}</span>
            </div>

            {/* Cloud Database Indicator */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
              cloudConnected === true
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : cloudConnected === false
                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}>
              <Database className="w-3 h-3" />
              <span>
                {cloudConnected === true ? (
                  isCloudSyncing ? 'Sinkronisasi Cloud Database...' : `Cloud Database Terhubung (${users.length} Akun)`
                ) : cloudConnected === false ? (
                  'Mode Lokal (Database Offline)'
                ) : (
                  'Menghubungkan ke Cloud Database...'
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Main Login Form Card */}
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/40 border border-slate-100">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Autentikasi Pengguna</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masuk dengan nomor NIP (18 digit) atau NUPTK (16 digit)
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Username / NIP / NUPTK
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
                  >
                    <Search className="w-3 h-3" />
                    <span>Cari NIP Guru</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Masukkan NIP Guru atau Superadmin..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Admin: Username <strong>Superadmin</strong> • Guru: NIP / NUPTK
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Password default guru: <strong>guru123</strong> • Admin: <strong>Superadmin</strong>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Sistem e-Rapor</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick action buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setNip('Superadmin');
                  setPassword('Superadmin');
                }}
                className="text-slate-500 hover:text-teal-700 font-medium flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Isi Akun Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-teal-50 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Daftar 53 Akun Guru ({users.length - 1} Aktif)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Bantuan Login & Daftar NIP Guru */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  <span>Daftar NIP Akun Guru {settings.namaSekolah}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tombol <strong>Gunakan Akun</strong> untuk langsung mengisi NIP dan kata sandi di formulir login
                </p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Ketik nama guru atau mata pelajaran..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Ditemukan: <strong>{filteredTeachers.length}</strong> akun guru</span>
                <span>Password default seluruh guru: <strong>guru123</strong></span>
              </div>
            </div>

            {/* Modal Teacher List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Tidak ditemukan guru dengan kata kunci "{teacherSearch}".
                </div>
              ) : (
                filteredTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-teal-50/50 p-2.5 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">
                        {t.nama}
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                          NIP: {t.nip}
                        </span>
                        {t.mapelName && (
                          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[11px] font-sans">
                            {t.mapelName}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectTeacher(t)}
                      className="shrink-0 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      Gunakan Akun
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Database terhubung ke Supabase Cloud</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-3 py-1 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
