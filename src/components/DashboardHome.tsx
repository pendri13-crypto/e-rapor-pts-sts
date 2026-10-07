import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Shield,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { UserAccount, SchoolClass, TingkatKelas } from '../types';
import { StorageService } from '../services/storage';

interface DashboardHomeProps {
  currentUser: UserAccount;
  onNavigate: (tab: string, classId?: string, mapelId?: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentUser,
  onNavigate,
}) => {
  const classes = StorageService.getClasses();
  const subjects = StorageService.getSubjects();
  const students = StorageService.getStudents();
  const grades = StorageService.getGrades();
  const settings = StorageService.getSettings();

  const [tingkatFilter, setTingkatFilter] = useState<'ALL' | TingkatKelas>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine classes visible to current user
  const accessibleClasses = currentUser.role === 'SUPER_ADMIN'
    ? classes
    : classes.filter(c => currentUser.assignedClassIds.includes(c.id));

  // Filtered by tingkat tab and search
  const displayedClasses = accessibleClasses.filter(c => {
    const matchTingkat = tingkatFilter === 'ALL' || c.tingkat === tingkatFilter;
    const matchSearch = c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.waliKelasNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTingkat && matchSearch;
  });

  // Calculate overall grade completion statistics
  const totalSlotsNeeded = classes.length * subjects.length; // 33 * 11 = 363 slots
  // Count unique classId + mapelId pairs that have grades
  const completedSlotsSet = new Set(grades.map(g => `${g.classId}_${g.mapelId}`));
  const completedSlots = completedSlotsSet.size;
  const progressPercent = Math.min(100, Math.round((completedSlots / (totalSlotsNeeded || 1)) * 100));

  // Calculate teacher specific stats
  const teacherClassCount = currentUser.role === 'SUPER_ADMIN' ? classes.length : currentUser.assignedClassIds.length;
  const teacherMapelName = currentUser.role === 'SUPER_ADMIN' ? 'Seluruh 11 Mapel' : (currentUser.mapelName || 'Mata Pelajaran');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-teal-900/40">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-200 border border-white/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{settings.namaPeriodePTS} • Triwulan 1</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.nama}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            {currentUser.role === 'SUPER_ADMIN' ? (
              <>
                Anda memiliki hak akses <strong>Super Admin</strong>. Anda dapat mengelola seluruh 33 kelas (VII-A hingga IX-K), memantau rekapitulasi nilai 3 bulanan, data guru & siswa, serta mencetak dokumen resmi rapor dan leger.
              </>
            ) : (
              <>
                Anda masuk sebagai <strong>Guru {currentUser.mapelName}</strong>. Terdaftar mengajar pada{' '}
                <strong>{currentUser.assignedClassIds.length} Kelas</strong>. Silakan input nilai formatif, sumatif, dan PTS siswa dengan cepat dan efisien.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('input-nilai')}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-950/40 transition-all flex items-center gap-2 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Input Nilai PTS Sekarang</span>
            </button>
            <button
              onClick={() => onNavigate('rekap-3bulan')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/15 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Rekapitulasi 3 Bulanan</span>
            </button>
            <button
              onClick={() => onNavigate('leger-nilai')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/15 transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Leger & Cetak Rapor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Kelas
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">33 Kelas</h3>
            <p className="text-xs text-teal-600 font-semibold mt-0.5">
              11 VII • 11 VIII • 11 IX (A - K)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mata Pelajaran
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">11 Mapel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              PAIBP, PPKN, BINDO, MTK, dst.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Siswa Terdata
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{students.length} Siswa</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">
              Aktif Semester {settings.semesterAktif}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rekap Nilai Masuk
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{completedSlots} / {totalSlotsNeeded}</h3>
            <div className="w-28 bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-600 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Grid of 33 Classes Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Daftar 33 Kelas SMP</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Lengkap A s.d K
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih kelas untuk langsung melakukan input nilai mata pelajaran atau melihat rekapitulasi otomatis
            </p>
          </div>

          {/* Tingkat Filter & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tingkat Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTingkatFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tingkatFilter === 'ALL'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({accessibleClasses.length})
              </button>
              <button
                onClick={() => setTingkatFilter('VII')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tingkatFilter === 'VII'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas VII (11)
              </button>
              <button
                onClick={() => setTingkatFilter('VIII')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tingkatFilter === 'VIII'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas VIII (11)
              </button>
              <button
                onClick={() => setTingkatFilter('IX')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tingkatFilter === 'IX'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas IX (11)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kelas / wali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Classes Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedClasses.map((item) => {
            const classStudents = students.filter(s => s.classId === item.id);
            // Count how many mapels have been filled for this class
            const filledMapelsCount = subjects.filter(sub => {
              return grades.some(g => g.classId === item.id && g.mapelId === sub.id);
            }).length;

            const isTeacherClass = currentUser.role === 'SUPER_ADMIN' || currentUser.assignedClassIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                      {item.nama}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      filledMapelsCount === 11
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : filledMapelsCount > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {filledMapelsCount} / 11 Mapel
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-1">
                    Wali: {item.waliKelasNama}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    NIP: {item.waliKelasNip}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{classStudents.length} Siswa</span>
                    <span className="text-teal-600 font-semibold text-[11px]">
                      Kurikulum Merdeka
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        filledMapelsCount === 11 ? 'bg-emerald-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${Math.round((filledMapelsCount / 11) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate('input-nilai', item.id)}
                    className="w-full py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-colors text-center"
                  >
                    Input Nilai
                  </button>
                  <button
                    onClick={() => onNavigate('rekap-3bulan', item.id)}
                    className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors text-center"
                  >
                    Rekap 3 Bulan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {displayedClasses.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <p className="text-sm">Tidak ada kelas yang cocok dengan filter pencarian.</p>
          </div>
        )}
      </div>

      {/* Information Box on 3-Month PTS Calculation */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Mekanisme Penilaian Tengah Semester (PTS) / 3 Bulanan</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Nilai Rapor Penilaian Tengah Semester (PTS) direkapitulasi secara otomatis dari 3 komponen utama:
          <strong> Nilai Rata-rata Tugas Formatif ({settings.bobotFormatif}%)</strong>, 
          <strong> Nilai Rata-rata Sumatif Lingkup Materi / Ulangan Harian ({settings.bobotUH}%)</strong>, dan 
          <strong> Nilai Tes Sumatif Tengah Semester / PTS ({settings.bobotPTS}%)</strong> dengan standar KKM {settings.kkmDefault}.
          Wali kelas dapat langsung mencetak Leger Nilai 11 mapel dan lembar Rapor Siswa resmi tanpa perlu menghitung manual.
        </p>
      </div>
    </div>
  );
};
