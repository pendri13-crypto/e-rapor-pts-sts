import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  School,
  Save,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Calendar,
  AlertTriangle,
  Sparkles,
  Database,
  Cloud,
  ArrowUpCircle,
  ArrowDownCircle,
  Copy,
  Check,
  Code2,
  X,
  RefreshCw,
  Trash2,
  AlertOctagon,
  ShieldAlert,
  Clock,
  CalendarDays,
  Plus,
  BookOpenCheck,
  CheckCircle,
  Image,
  UploadCloud,
  Eye,
  FileImage,
  Printer
} from 'lucide-react';
import { SchoolSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { SupabaseService, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SQL_SCHEMA } from '../../services/supabase';
import { DEFAULT_LOGO_PEMDA, DEFAULT_LOGO_SEKOLAH } from '../../data/seedData';
import { SuccessPopup } from '../common/SuccessPopup';

type SettingsTab = 'tahun-ajaran' | 'logo-kop' | 'profil' | 'bobot' | 'supabase' | 'danger';
type DeleteScope = 'grades' | 'students' | 'all';

const DEFAULT_ACADEMIC_YEARS = [
  '2022/2023',
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027'
];

export const PengaturanSekolahView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('tahun-ajaran');
  const [settings, setSettings] = useState<SchoolSettings>(StorageService.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('Pengaturan berhasil disimpan!');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState<string>('');

  // Academic Years List State
  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ERAPOR_ACADEMIC_YEARS');
      if (stored) return JSON.parse(stored);
    } catch { }
    return DEFAULT_ACADEMIC_YEARS;
  });
  const [newYearInput, setNewYearInput] = useState('');
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [syncClassesYear, setSyncClassesYear] = useState(true);

  // Logo File Input Refs
  const pemdaFileInputRef = useRef<HTMLInputElement>(null);
  const sekolahFileInputRef = useRef<HTMLInputElement>(null);

  // Supabase states
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    tested: boolean;
    connected: boolean;
    latencyMs?: number;
    error?: string;
  }>({ tested: false, connected: false });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [isPulling, setIsPulling] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Delete All Data Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteScope, setDeleteScope] = useState<DeleteScope>('grades');
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResultMsg, setDeleteResultMsg] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    const res = await SupabaseService.checkConnection();
    setIsTestingSupabase(false);
    setSupabaseStatus({
      tested: true,
      connected: res.connected,
      latencyMs: res.latencyMs,
      error: res.error,
    });
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await StorageService.syncAllToSupabase();
    setIsSyncing(false);
    setSyncFeedback(res);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handlePullFromSupabase = async () => {
    setIsPulling(true);
    setSyncFeedback(null);
    const res = await StorageService.pullFromSupabase();
    setIsPulling(false);
    if (res.success) {
      setSettings(StorageService.getSettings());
      setSyncFeedback({ success: true, message: res.message });
    } else {
      setSyncFeedback({ success: false, message: res.message });
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleInputChange = (field: keyof SchoolSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Logo Upload Handlers
  const handlePemdaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Ukuran file maksimal 2.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleInputChange('logoPemdaUrl', dataUrl);
      setSuccessMsg('Logo Pemda berhasil diunggah! Klik tombol "Simpan Logo" untuk menyimpan permanen.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    };
    reader.readAsDataURL(file);
    if (pemdaFileInputRef.current) pemdaFileInputRef.current.value = '';
  };

  const handleSekolahFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Ukuran file maksimal 2.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleInputChange('logoSekolahUrl', dataUrl);
      setSuccessMsg('Logo Sekolah berhasil diunggah! Klik tombol "Simpan Logo" untuk menyimpan permanen.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    };
    reader.readAsDataURL(file);
    if (sekolahFileInputRef.current) sekolahFileInputRef.current.value = '';
  };

  const handleSaveAll = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const sumBobot = Number(settings.bobotFormatif) + Number(settings.bobotUH) + Number(settings.bobotPTS);
    if (sumBobot !== 100) {
      alert(`Peringatan: Total persentase bobot harus 100%! Saat ini: ${sumBobot}% (Formatif ${settings.bobotFormatif} + UH ${settings.bobotUH} + PTS ${settings.bobotPTS})`);
      return;
    }

    StorageService.saveSettings(settings);

    // If requested, synchronize academic year & semester to all 33 classes
    if (syncClassesYear) {
      const classes = StorageService.getClasses();
      const updatedClasses = classes.map(c => ({
        ...c,
        tahunAjaran: settings.tahunAjaran,
        semester: settings.semesterAktif
      }));
      StorageService.saveClasses(updatedClasses);
    }

    setSuccessMsg(customMsg || 'Pengaturan berhasil disimpan dan disinkronkan ke Supabase Cloud!');
    setPopupMsg(customMsg || 'Seluruh data pengaturan telah berhasil disimpan dan disinkronkan ke Supabase Cloud.');
    setSaveSuccess(true);
    setShowSuccessPopup(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Switch Active Academic Year
  const handleSwitchAcademicYear = (year: string) => {
    const updated = {
      ...settings,
      tahunAjaran: year
    };
    setSettings(updated);
    StorageService.saveSettings(updated);

    if (syncClassesYear) {
      const classes = StorageService.getClasses();
      const updatedClasses = classes.map(c => ({
        ...c,
        tahunAjaran: year
      }));
      StorageService.saveClasses(updatedClasses);
    }

    setSuccessMsg(`Tahun Ajaran aktif berhasil dialihkan ke ${year}!`);
    setPopupMsg(`Tahun Ajaran aktif berhasil dialihkan ke ${year} dan diterapkan ke seluruh kelas.`);
    setSaveSuccess(true);
    setShowSuccessPopup(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Add New Academic Year to list
  const handleAddNewYear = () => {
    if (!newYearInput.trim()) return;
    const trimmed = newYearInput.trim();
    if (!academicYears.includes(trimmed)) {
      const updated = [...academicYears, trimmed];
      setAcademicYears(updated);
      localStorage.setItem('ERAPOR_ACADEMIC_YEARS', JSON.stringify(updated));
    }
    handleSwitchAcademicYear(trimmed);
    setNewYearInput('');
    setShowAddYearModal(false);
  };

  // Delete Academic Year from list
  const handleDeleteAcademicYear = (yearToDelete: string) => {
    if (academicYears.length <= 1) {
      alert('Minimal harus ada 1 Tahun Ajaran yang terdaftar di dalam sistem.');
      return;
    }

    if (settings.tahunAjaran === yearToDelete) {
      alert(`Tahun Ajaran ${yearToDelete} saat ini sedang berstatus aktif. Silakan pilih atau aktifkan tahun ajaran lain terlebih dahulu sebelum menghapus tahun ajaran ini.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Tahun Ajaran "${yearToDelete}" dari daftar sistem?`)) {
      const updated = academicYears.filter(y => y !== yearToDelete);
      setAcademicYears(updated);
      localStorage.setItem('ERAPOR_ACADEMIC_YEARS', JSON.stringify(updated));
      setSuccessMsg(`Tahun Ajaran ${yearToDelete} berhasil dihapus dari daftar.`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  // Delete All Data Handlers
  const openDeleteModal = (scope: DeleteScope) => {
    setDeleteScope(scope);
    setConfirmInput('');
    setDeleteResultMsg(null);
    setShowDeleteModal(true);
  };

  const handleExecuteDelete = async () => {
    if (confirmInput.trim().toUpperCase() !== 'HAPUS') {
      alert('Silakan ketik kata "HAPUS" untuk mengonfirmasi penghapusan data.');
      return;
    }

    setIsDeleting(true);
    try {
      let res: { success: boolean; message: string };
      if (deleteScope === 'grades') {
        res = await StorageService.clearAllGrades(true);
      } else if (deleteScope === 'students') {
        res = await StorageService.clearAllStudentsAndGrades(true);
      } else {
        res = await StorageService.clearAllData(true);
      }

      setIsDeleting(false);
      setDeleteResultMsg(res);
      setTimeout(() => {
        setShowDeleteModal(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteResultMsg({ success: false, message: err?.message || 'Terjadi kesalahan saat menghapus data.' });
    }
  };

  const handleResetDefaults = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mengembalikan seluruh data (nilai, siswa, akun) ke data awal default simulasi? Seluruh perubahan nilai yang belum diekspor akan tereset.')) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Hak Akses Super Admin
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Pengaturan Sistem e-Rapor
            </h1>
            <p className="text-xs text-slate-500">
              Kelola Tahun Ajaran, Logo Pemda & Sekolah (KOP Rapor A4), Profil Satuan Pendidikan, dan Database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openDeleteModal('all')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Data</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Kembalikan dataset awal contoh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Success Feedback Alert */}
        {saveSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sub-menu Tabs for Settings */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('tahun-ajaran')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'tahun-ajaran'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Tahun Ajaran & Semester</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${activeTab === 'tahun-ajaran' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
              {settings.tahunAjaran}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logo-kop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'logo-kop'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
          >
            <Image className="w-4 h-4" />
            <span>Logo Pemda & Sekolah (KOP A4)</span>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'profil'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
          >
            <School className="w-4 h-4" />
            <span>Profil Sekolah</span>
          </button>

          <button
            onClick={() => setActiveTab('bobot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'bobot'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Bobot PTS & KKM</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'supabase'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Supabase</span>
            {supabaseStatus.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'danger'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/25'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Zona Hapus Data</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TAB MENU TAHUN AJARAN & SEMESTER */}
      {/* ============================================================ */}
      {activeTab === 'tahun-ajaran' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Active Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  Periode Akademik Aktif
                </span>
                <h2 className="text-2xl font-black mt-1">
                  Tahun Ajaran {settings.tahunAjaran} — Semester {settings.semesterAktif}
                </h2>
                <p className="text-xs text-indigo-100 mt-1 max-w-xl">
                  {settings.namaPeriodePTS} • Ditandatangani di {settings.tempatRapor}, {settings.tanggalRapor}. Seluruh nilai rapor siswa di 33 kelas mengacu pada periode ini.
                </p>
              </div>

              <button
                onClick={() => setShowAddYearModal(true)}
                className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-900 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Tambah Tahun Ajaran</span>
              </button>
            </div>
          </div>

          {/* Form Pengaturan Tahun Ajaran & Titimangsa */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Konfigurasi Tahun Ajaran & Semester</h3>
                  <p className="text-xs text-slate-500">Pilih tahun ajaran aktif dan semester yang sedang berjalan.</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Tahun Ajaran Input & Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Tahun Ajaran (TP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={settings.tahunAjaran}
                      onChange={(e) => handleInputChange('tahunAjaran', e.target.value)}
                      placeholder="Contoh: 2024/2025"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Pilihan Cepat:</span>
                    {academicYears.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleInputChange('tahunAjaran', year)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all border ${settings.tahunAjaran === year
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semester Switch (Interactive Cards) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Semester Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('semesterAktif', 'Ganjil')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${settings.semesterAktif === 'Ganjil'
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/10'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                    >
                      <div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${settings.semesterAktif === 'Ganjil' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                          Semester 1
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">Semester Ganjil</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Penilaian Tengah Semester (Juli - Desember)</p>
                      </div>
                      {settings.semesterAktif === 'Ganjil' && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('semesterAktif', 'Genap')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${settings.semesterAktif === 'Genap'
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/10'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                    >
                      <div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${settings.semesterAktif === 'Genap' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                          Semester 2
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">Semester Genap</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Penilaian Tengah Semester (Januari - Juni)</p>
                      </div>
                      {settings.semesterAktif === 'Genap' && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nama Resmi Periode Asesmen */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Resmi Periode Asesmen
                  </label>
                  <input
                    type="text"
                    value={settings.namaPeriodePTS}
                    onChange={(e) => handleInputChange('namaPeriodePTS', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('namaPeriodePTS', `Asesmen Sumatif Tengah Semester (ASTS) ${settings.semesterAktif}`)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                    >
                      Kurikulum Merdeka (ASTS / STS)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('namaPeriodePTS', `Penilaian Tengah Semester (PTS) ${settings.semesterAktif}`)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                    >
                      K13 / Umum (PTS)
                    </button>
                  </div>
                </div>

                {/* Titimangsa Rapor */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Titimangsa Rapor</label>
                    <input
                      type="text"
                      value={settings.tempatRapor}
                      onChange={(e) => handleInputChange('tempatRapor', e.target.value)}
                      placeholder="Contoh: Cemerlang"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Pembagian Rapor</label>
                    <input
                      type="text"
                      value={settings.tanggalRapor}
                      onChange={(e) => handleInputChange('tanggalRapor', e.target.value)}
                      placeholder="Contoh: 4 Oktober 2024"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Auto Sync to 33 Classes Option */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="pr-3">
                    <span className="font-bold text-slate-800 block text-xs">
                      Sinkronkan ke Seluruh 33 Kelas
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Otomatis perbarui Tahun Ajaran & Semester di semua data kelas saat tombol simpan ditekan.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncClassesYear}
                    onChange={(e) => setSyncClassesYear(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveAll(undefined, 'Tahun Ajaran & Periode Rapor berhasil diperbarui!')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-3 active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Tahun Ajaran</span>
                </button>
              </div>
            </div>

            {/* Riwayat & Daftar Tahun Ajaran */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Daftar Tahun Ajaran Sekolah</h3>
                </div>
                <button
                  onClick={() => setShowAddYearModal(true)}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Klik tombol <strong>"Aktifkan"</strong> untuk beralih tahun ajaran secara cepat.
              </p>

              <div className="space-y-2">
                {academicYears.map((year) => {
                  const isActive = settings.tahunAjaran === year;
                  return (
                    <div
                      key={year}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${isActive
                          ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                          : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                          TP
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs font-mono">{year}</span>
                            {isActive && (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Sedang Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {isActive ? `Semester ${settings.semesterAktif}` : 'Arsip / Periode Lain'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isActive ? (
                          <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 px-2.5 py-1 bg-indigo-100/60 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchAcademicYear(year)}
                            className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
                          >
                            Aktifkan
                          </button>
                        )}

                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteAcademicYear(year)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title={`Hapus Tahun Ajaran ${year}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => alert(`Tahun Ajaran ${year} sedang berstatus aktif dan tidak dapat dihapus. Silakan aktifkan tahun ajaran lain terlebih dahulu.`)}
                            className="p-1.5 text-slate-300 hover:text-slate-400 rounded-xl transition-all"
                            title="Tahun ajaran aktif tidak dapat dihapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TAB MENU LOGO PEMDA & LOGO SEKOLAH (KOP RAPOR A4) */}
      {/* ============================================================ */}
      {activeTab === 'logo-kop' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Image className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Logo Pemerintah Daerah & Logo Sekolah (KOP Rapor A4)
                </h2>
                <p className="text-xs text-slate-500">
                  Logo yang diinput di sini akan otomatis muncul pada bagian kepala (KOP) saat mencetak Rapor Siswa ukuran A4 ke PDF atau printer fisik.
                </p>
              </div>
            </div>

            {/* Grid 2 Card: Logo Pemda & Logo Sekolah */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Card 1: Logo Pemda */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Logo Pemerintah Daerah (Pemda / Dinas)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Posisi Kiri KOP A4
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Logo lambang Kabupaten/Kota, Provinsi, atau Tut Wuri Handayani.
                  </p>

                  {/* Logo Preview Box */}
                  <div className="mt-4 flex items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[140px]">
                    {settings.logoPemdaUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={settings.logoPemdaUrl}
                          alt="Logo Pemda"
                          className="h-24 w-24 object-contain"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">Logo Pemda Terpasang</span>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <FileImage className="w-10 h-10 mx-auto mb-1 text-slate-300" />
                        <span className="text-xs font-semibold">Belum ada logo terunggah</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="mt-4 space-y-2">
                    <input
                      type="file"
                      ref={pemdaFileInputRef}
                      onChange={handlePemdaFileChange}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => pemdaFileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Pilih File Gambar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange('logoPemdaUrl', DEFAULT_LOGO_PEMDA)}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                        title="Gunakan Logo Lambang Default"
                      >
                        Gunakan Default
                      </button>

                      {settings.logoPemdaUrl && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('logoPemdaUrl', '')}
                          className="py-2 px-3 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                          title="Hapus Logo"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="mt-2">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Atau Tempel Tautan Gambar URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://.../logo-pemda.png"
                        value={settings.logoPemdaUrl?.startsWith('data:') ? '' : settings.logoPemdaUrl || ''}
                        onChange={(e) => handleInputChange('logoPemdaUrl', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Logo Sekolah */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Logo Resmi Satuan Pendidikan (Sekolah)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Posisi Kanan KOP A4
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Logo resmi sekolah yang melambangkan identitas satuan pendidikan Anda.
                  </p>

                  {/* Logo Preview Box */}
                  <div className="mt-4 flex items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[140px]">
                    {settings.logoSekolahUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={settings.logoSekolahUrl}
                          alt="Logo Sekolah"
                          className="h-24 w-24 object-contain"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">Logo Sekolah Terpasang</span>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <FileImage className="w-10 h-10 mx-auto mb-1 text-slate-300" />
                        <span className="text-xs font-semibold">Belum ada logo terunggah</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="mt-4 space-y-2">
                    <input
                      type="file"
                      ref={sekolahFileInputRef}
                      onChange={handleSekolahFileChange}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => sekolahFileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Pilih File Gambar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange('logoSekolahUrl', DEFAULT_LOGO_SEKOLAH)}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                        title="Gunakan Logo Sekolah Default"
                      >
                        Gunakan Default
                      </button>

                      {settings.logoSekolahUrl && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('logoSekolahUrl', '')}
                          className="py-2 px-3 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                          title="Hapus Logo"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="mt-2">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Atau Tempel Tautan Gambar URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://.../logo-sekolah.png"
                        value={settings.logoSekolahUrl?.startsWith('data:') ? '' : settings.logoSekolahUrl || ''}
                        onChange={(e) => handleInputChange('logoSekolahUrl', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW KOP RAPOR A4 */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Pratinjau KOP Dokumen Resmi (Cetak PDF A4)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  Berikut tampilan kepala surat yang akan otomatis tercetak di dokumen Rapor PTS:
                </span>
              </div>

              {/* Replica KOP */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-sm max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                  {/* Logo Pemda */}
                  <div className="w-32 h-32 flex items-center justify-center shrink-0">
                    {settings.logoPemdaUrl ? (
                      <img
                        src={settings.logoPemdaUrl}
                        alt="Logo Pemda"
                        className="max-h-32 max-w-32 object-contain scale-110"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                        <School className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* KOP Text */}
                  <div className="flex-1 px-2 text-center leading-tight">
                    <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
                      PEMERINTAH DAERAH KABUPATEN TASIKMALAYA
                    </h4>
                    <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
                      DINAS PENDIDIKAN DAN KEBUDAYAAN
                    </h4>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 mt-1 mb-0.5">
                      {settings.namaSekolah}
                    </h2>
                    <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
                      NPSN: {settings.npsn} • {settings.alamatSekolah}, {settings.kecamatan}, {settings.kabupatenKota}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Telepon: {settings.telepon} • Pos-el: {settings.email} • Kode Pos: {settings.kodePos}
                    </p>
                  </div>

                  {/* Logo Sekolah */}
                  <div className="w-32 h-32 flex items-center justify-center shrink-0">
                    {settings.logoSekolahUrl ? (
                      <img
                        src={settings.logoSekolahUrl}
                        alt="Logo Sekolah"
                        className="max-h-32 max-w-32 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                        <span className="text-[10px] font-bold text-center leading-tight">LOGO<br />SEKOLAH</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Double Border Standard Dinas */}
                <div className="w-full border-t-2 border-slate-900 mt-3" />
                <div className="w-full border-t border-slate-900 mt-0.5" />

                <div className="text-center my-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider underline">
                    LAPORAN PENILAIAN TENGAH SEMESTER (PTS)
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-600 mt-0.5">
                    TAHUN PELAJARAN {settings.tahunAjaran} — SEMESTER {settings.semesterAktif.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Save Button for Logo */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAll(undefined, 'Logo Pemda & Logo Sekolah berhasil disimpan secara permanen!')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Logo & KOP Rapor A4</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB PROFIL IDENTITAS SATUAN PENDIDIKAN */}
      {/* ============================================================ */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveAll} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <School className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Identitas Satuan Pendidikan</h2>
                <p className="text-xs text-slate-500">Profil ini akan dicetak pada bagian kepala (kop) lembar Rapor PTS.</p>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Profil</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                value={settings.namaSekolah}
                onChange={(e) => handleInputChange('namaSekolah', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={settings.npsn}
                  onChange={(e) => handleInputChange('npsn', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={settings.telepon}
                  onChange={(e) => handleInputChange('telepon', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah (Pos-el)</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                placeholder="smpn1rajapolah@sch.id"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode POS</label>
                <input
                  type="text"
                  value={settings.kodePos || ''}
                  onChange={(e) => handleInputChange('kodePos', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  placeholder="46153"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={settings.kelurahan || ''}
                  onChange={(e) => handleInputChange('kelurahan', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Manggungjaya"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={settings.alamatSekolah}
                onChange={(e) => handleInputChange('alamatSekolah', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={settings.kecamatan}
                  onChange={(e) => handleInputChange('kecamatan', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={settings.kabupatenKota}
                  onChange={(e) => handleInputChange('kabupatenKota', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  value={settings.provinsi}
                  onChange={(e) => handleInputChange('provinsi', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={settings.namaKepalaSekolah}
                onChange={(e) => handleInputChange('namaKepalaSekolah', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={settings.nipKepalaSekolah}
                onChange={(e) => handleInputChange('nipKepalaSekolah', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* 4. TAB BOBOT PTS & KKM */}
      {/* ============================================================ */}
      {activeTab === 'bobot' && (
        <form onSubmit={handleSaveAll} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Bobot Penilaian Tengah Semester & KKM</h2>
                <p className="text-xs text-slate-500">Rumus NA PTS = (Formatif × Bobot) + (UH × Bobot) + (PTS × Bobot)</p>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Bobot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex justify-between mb-1.5">
                <label className="font-bold text-slate-700">Tugas Formatif (%)</label>
                <span className="font-mono font-bold text-indigo-600 text-sm">{settings.bobotFormatif}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.bobotFormatif}
                onChange={(e) => handleInputChange('bobotFormatif', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Rata-rata tugas 3 bulanan</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex justify-between mb-1.5">
                <label className="font-bold text-slate-700">Ulangan Harian / Sumatif (%)</label>
                <span className="font-mono font-bold text-blue-600 text-sm">{settings.bobotUH}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.bobotUH}
                onChange={(e) => handleInputChange('bobotUH', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Rata-rata UH per bab/materi</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex justify-between mb-1.5">
                <label className="font-bold text-slate-700">Tes Tengah Semester / PTS (%)</label>
                <span className="font-mono font-bold text-amber-600 text-sm">{settings.bobotPTS}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.bobotPTS}
                onChange={(e) => handleInputChange('bobotPTS', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Nilai ujian resmi PTS</span>
            </div>
          </div>

          {/* 3 MENU PENGATURAN KKM PER TINGKATAN KELAS */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Standar KKM / KKTP Berdasarkan Tingkatan Kelas (3 Menu Tingkat)</span>
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Standar KKM dibuat per tingkatan karena setiap jenjang memiliki target batas ketuntasan minimal yang berbeda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Menu 1: KKM Kelas VII */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-indigo-50/50 to-white border border-indigo-200 rounded-2xl relative overflow-hidden shadow-xs hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Tingkat Kelas VII (Fase D)
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">11 Rombel</span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">KKM Kelas VII</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Standar ketuntasan kelas VII-A s.d VII-K</p>
                  </div>
                  <div className="w-20 shrink-0">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={settings.kkmKelas7 ?? 76}
                      onChange={(e) => handleInputChange('kkmKelas7', Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-indigo-300 rounded-xl text-center font-black text-base text-indigo-700 shadow-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Menu 2: KKM Kelas VIII */}
              <div className="p-4 bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-white border border-emerald-200 rounded-2xl relative overflow-hidden shadow-xs hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tingkat Kelas VIII (Fase D)
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">11 Rombel</span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">KKM Kelas VIII</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Standar ketuntasan kelas VIII-A s.d VIII-K</p>
                  </div>
                  <div className="w-20 shrink-0">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={settings.kkmKelas8 ?? 78}
                      onChange={(e) => handleInputChange('kkmKelas8', Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-emerald-300 rounded-xl text-center font-black text-base text-emerald-700 shadow-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Menu 3: KKM Kelas IX */}
              <div className="p-4 bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-white border border-amber-200 rounded-2xl relative overflow-hidden shadow-xs hover:border-amber-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Tingkat Kelas IX (Fase D)
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">11 Rombel</span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">KKM Kelas IX</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Standar ketuntasan kelas IX-A s.d IX-K</p>
                  </div>
                  <div className="w-20 shrink-0">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={settings.kkmKelas9 ?? 80}
                      onChange={(e) => handleInputChange('kkmKelas9', Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-amber-300 rounded-xl text-center font-black text-base text-amber-700 shadow-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
              <span>Batas KKM di atas otomatis diterapkan pada formulir input nilai guru, kalkulasi ketuntasan siswa, buku leger nilai, dan rekapitulasi sesuai kelas masing-masing.</span>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* 5. TAB DATABASE SUPABASE CLOUD */}
      {/* ============================================================ */}
      {activeTab === 'supabase' && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden animate-in fade-in duration-150">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Database Supabase Cloud</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${supabaseStatus.connected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                      {supabaseStatus.connected ? '● Terhubung' : '● Menunggu Sinkronisasi'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Penyimpanan cloud terpusat untuk 33 kelas, nilai rapor PTS, dan akun guru.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingSupabase}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi ({supabaseStatus.latencyMs ? `${supabaseStatus.latencyMs}ms` : 'Ping'})</span>
                </button>

                <button
                  onClick={() => setShowSqlModal(true)}
                  className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Skrip SQL DDL</span>
                </button>
              </div>
            </div>

            {/* Config details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 font-mono">
                <span className="text-[10px] text-slate-400 block mb-1">SUPABASE API URL:</span>
                <span className="text-indigo-300 break-all select-all font-semibold">
                  {SUPABASE_URL}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 font-mono">
                <span className="text-[10px] text-slate-400 block mb-1">ANON PUBLIC KEY:</span>
                <span className="text-slate-300 break-all truncate block">
                  {SUPABASE_ANON_KEY.slice(0, 30)}...{SUPABASE_ANON_KEY.slice(-15)}
                </span>
              </div>
            </div>

            {/* Sync actions */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSyncAllToSupabase}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-70"
                >
                  <ArrowUpCircle className="w-4 h-4 text-slate-900" />
                  <span>{isSyncing ? 'Mengunggah ke Cloud...' : 'Sinkronkan Semua Data ke Supabase'}</span>
                </button>

                <button
                  onClick={handlePullFromSupabase}
                  disabled={isPulling}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/15 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-70"
                >
                  <ArrowDownCircle className="w-4 h-4 text-indigo-300" />
                  <span>{isPulling ? 'Mengambil Data...' : 'Tarik Data dari Supabase'}</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                *Setiap input nilai oleh guru juga otomatis tersimpan lokal & cloud.
              </span>
            </div>

            {/* Sync feedback toast */}
            {syncFeedback && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${syncFeedback.success
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncFeedback.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. TAB ZONA HAPUS DATA */}
      {/* ============================================================ */}
      {activeTab === 'danger' && (
        <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-sm p-6 sm:p-7 space-y-4 overflow-hidden relative animate-in fade-in duration-150">
          <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-900">Zona Tindakan Kritis & Hapus Data (Super Admin)</h2>
              <p className="text-xs text-rose-600">
                Gunakan opsi di bawah ini untuk membersihkan atau mengosongkan data secara terkontrol.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Opsi 1: Kosongkan Nilai Saja */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-xs text-slate-900">Kosongkan Seluruh Nilai PTS</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menghapus semua nilai tugas, UH, dan PTS siswa di 33 kelas. Data siswa dan akun guru tetap aman. Cocok untuk mulai semester/periode baru.
                </p>
              </div>
              <button
                onClick={() => openDeleteModal('grades')}
                className="mt-4 w-full py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors"
              >
                Hapus Nilai Saja (Kosongkan)
              </button>
            </div>

            {/* Opsi 2: Hapus Siswa & Nilai */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-xs text-slate-900">Hapus Data Siswa & Nilai</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menghapus seluruh daftar peserta didik di 33 kelas beserta nilai dan presensi. Struktur 33 kelas dan akun guru tetap dipertahankan.
                </p>
              </div>
              <button
                onClick={() => openDeleteModal('students')}
                className="mt-4 w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Hapus Siswa & Nilai
              </button>
            </div>

            {/* Opsi 3: Factory Reset / Hapus Total */}
            <div className="p-4 rounded-2xl bg-rose-100/60 border border-rose-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <h3 className="font-bold text-xs text-rose-950">Hapus Semua Data Total</h3>
                </div>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  Membersihkan seluruh nilai, siswa, presensi, dan akun guru tambahan (baik di browser lokal & Supabase Cloud). Akun Super Admin tetap tersimpan.
                </p>
              </div>
              <button
                onClick={() => openDeleteModal('all')}
                className="mt-4 w-full py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Hapus Semua Data Total
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL TAMBAH TAHUN AJARAN BARU */}
      {/* ============================================================ */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <CalendarDays className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Tambah Tahun Ajaran Baru</h3>
              </div>
              <button
                onClick={() => setShowAddYearModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Format Tahun Ajaran (Contoh: 2025/2026)
                </label>
                <input
                  type="text"
                  placeholder="2025/2026"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddNewYear}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Simpan & Aktifkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL KONFIRMASI HAPUS DATA */}
      {/* ============================================================ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-black text-sm text-slate-900">Konfirmasi Penghapusan Data</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                <p className="font-bold text-xs mb-1">
                  {deleteScope === 'grades' && 'Anda akan MENGOSONGKAN SELURUH NILAI SISWA (33 Kelas).'}
                  {deleteScope === 'students' && 'Anda akan MENGHAPUS SELURUH SISWA & NILAI (33 Kelas).'}
                  {deleteScope === 'all' && 'PERINGATAN TINGKAT TINGGI: Anda akan MENGHAPUS SELURUH DATA SISTEM (Nilai, Siswa, Akun Guru) baik lokal maupun Supabase Cloud!'}
                </p>
                <p className="text-[11px] text-rose-700">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ketik kata <span className="font-mono text-rose-600 font-black">HAPUS</span> di bawah untuk melanjutkan:
                </label>
                <input
                  type="text"
                  placeholder="Ketik HAPUS..."
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {deleteResultMsg && (
                <div className={`p-2.5 rounded-xl font-medium ${deleteResultMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                  {deleteResultMsg.message}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={isDeleting || confirmInput.trim().toUpperCase() !== 'HAPUS'}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isDeleting ? 'Menghapus Data...' : 'Ya, Hapus Data Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SQL SCHEMA MODAL */}
      {/* ============================================================ */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-700 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Skrip SQL DDL Supabase</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3">
              Jalankan skrip SQL di bawah ini pada menu <strong>SQL Editor</strong> di dashboard Supabase (<span className="text-indigo-400 font-mono">https://supabase.com/dashboard/project/spurcsvvhtmjqtefbmnp/sql</span>) untuk membuat tabel database jika belum ada.
            </p>

            <div className="mt-3 relative flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono text-emerald-400 h-96 overflow-y-auto pr-2 leading-relaxed selection:bg-indigo-600 selection:text-white">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop Up Notifikasi: Data Berhasil Disimpan */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Data Berhasil Disimpan"
        message={popupMsg}
      />
    </div>
  );
};
