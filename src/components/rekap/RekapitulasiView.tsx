import React, { useState } from 'react';
import {
  Layers,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  Search,
  Filter,
  Users,
  BookOpen,
  ArrowUpRight,
  Eye,
  FileSpreadsheet,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserAccount, SchoolClass, StudentReportSummary, TingkatKelas } from '../../types';
import { StorageService } from '../../services/storage';
import { ExcelService } from '../../services/excelService';
import { RaporCetakModal } from '../cetak/RaporCetakModal';

interface RekapitulasiViewProps {
  currentUser: UserAccount;
  initialClassId?: string;
  onNavigateToLeger: (classId: string) => void;
  onNavigateToInput: (classId: string, mapelId?: string) => void;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  currentUser,
  initialClassId,
  onNavigateToLeger,
  onNavigateToInput,
}) => {
  const classes = StorageService.getClasses();
  const subjects = StorageService.getSubjects();
  const settings = StorageService.getSettings();

  const accessibleClasses = currentUser.role === 'SUPER_ADMIN'
    ? classes
    : classes.filter(c => currentUser.assignedClassIds.includes(c.id));

  const defaultClassId = initialClassId && accessibleClasses.some(c => c.id === initialClassId)
    ? initialClassId
    : (accessibleClasses[0]?.id || 'VII-A');

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [activeSubTab, setActiveSubTab] = useState<'ranking' | 'analisis-mapel' | 'remedial'>('ranking');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Student modal for previewing/printing official report card
  const [selectedStudentForRapor, setSelectedStudentForRapor] = useState<StudentReportSummary | null>(null);
  const [showBatchPrintAll, setShowBatchPrintAll] = useState(false);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const summaryData = StorageService.getClassSummary(selectedClassId);

  // Filtered summaries
  const filteredSummaries = summaryData.summaries.filter(s =>
    s.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student.nis.includes(searchQuery)
  );

  // Top 3 Podium
  const top1 = summaryData.summaries[0];
  const top2 = summaryData.summaries[1];
  const top3 = summaryData.summaries[2];

  // Export Rekap Summary to Excel (.xlsx)
  const handleExportRekapExcel = () => {
    ExcelService.exportRekap3BulanToExcel(
      summaryData.summaries,
      currentClass?.nama || selectedClassId,
      selectedClassId,
      settings.tahunAjaran
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Rekapitulasi Otomatis per 3 Bulan (Triwulan 1 PTS)</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tahun Ajaran {settings.tahunAjaran} ({settings.semesterAktif})
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Rekapitulasi Tengah Semester: {currentClass?.nama}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Wali Kelas: <strong>{currentClass?.waliKelasNama}</strong> (NIP: {currentClass?.waliKelasNip}) • Total {summaryData.totalStudents} Siswa
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBatchPrintAll(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
              title="Cetak Rapor Seluruh Siswa Kelas Ini ke PDF Format A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rapor Semua Siswa (PDF A4)</span>
            </button>

            <button
              onClick={() => onNavigateToLeger(selectedClassId)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Lihat Leger 11 Mapel</span>
            </button>

            <button
              onClick={handleExportRekapExcel}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Unduh Rekapitulasi 3 Bulan Kelas Ini ke Format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Rekap (Excel)</span>
            </button>
          </div>
        </div>

        {/* Class Selection Dropdown */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase">Pilih Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="Tingkat VII (11 Kelas)">
                {accessibleClasses.filter(c => c.tingkat === 'VII').map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </optgroup>
              <optgroup label="Tingkat VIII (11 Kelas)">
                {accessibleClasses.filter(c => c.tingkat === 'VIII').map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </optgroup>
              <optgroup label="Tingkat IX (11 Kelas)">
                {accessibleClasses.filter(c => c.tingkat === 'IX').map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Standar KKM: <strong>{settings.kkmDefault}</strong></span>
            <span>•</span>
            <span>Komponen: <strong>11 Mapel Lengkap</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards for the selected class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rata-rata Nilai Kelas
            </p>
            <h3 className="text-2xl font-black text-indigo-700 mt-1">
              {summaryData.classAverage || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Skala 0 - 100 (3 Bulanan)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ketuntasan Belajar
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {summaryData.tuntasPercentage}%
            </h3>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              {summaryData.summaries.filter(s => s.jumlahMapelBelumTuntas === 0 && s.totalNilai > 0).length} dari {summaryData.totalStudents} Siswa Tuntas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nilai Tertinggi (Rank 1)
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {top1?.rataRata || '-'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold truncate max-w-[150px] mt-0.5">
              {top1?.student.nama || 'Belum ada data'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Perlu Bimbingan / Remidi
            </p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {summaryData.atRiskStudents.length} Siswa
            </h3>
            <p className="text-xs text-rose-600 font-medium mt-0.5">
              Memiliki nilai &lt; KKM
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveSubTab('ranking')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ranking'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Peringkat & Rapor PTS ({summaryData.summaries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analisis-mapel')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'analisis-mapel'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analisis 11 Mata Pelajaran</span>
          </button>

          <button
            onClick={() => setActiveSubTab('remedial')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'remedial'
                ? 'bg-white text-rose-700 border-t-2 border-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Siswa Perlu Remedial ({summaryData.atRiskStudents.length})</span>
          </button>
        </div>

        {/* Tab 1: Ranking & Report Card Printing */}
        {activeSubTab === 'ranking' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Peringkat Siswa Berdasarkan Rata-rata 3 Bulan
                </h3>
                <p className="text-xs text-slate-500">
                  Klik tombol <strong>"Cetak Rapor"</strong> pada siswa untuk melihat & mencetak lembar rapor resmi tengah semester.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-3 px-3 text-center w-14">Rank</th>
                    <th className="py-3 px-3 w-24">NIS</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-2 text-center w-12">JK</th>
                    <th className="py-3 px-3 text-center">Total Nilai</th>
                    <th className="py-3 px-3 text-center">Rata-rata</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-3 text-center">Mapel Tuntas</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummaries.map((item) => {
                    const isTop3 = item.ranking <= 3;
                    const isTuntas = item.jumlahMapelBelumTuntas === 0 && item.totalNilai > 0;

                    let predikat = 'D';
                    if (item.rataRata >= 90) predikat = 'A';
                    else if (item.rataRata >= 80) predikat = 'B';
                    else if (item.rataRata >= 70) predikat = 'C';

                    return (
                      <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center">
                          {item.ranking === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xs shadow-xs">
                              1
                            </span>
                          ) : item.ranking === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs">
                              2
                            </span>
                          ) : item.ranking === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono font-medium">{item.ranking}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{item.student.nis}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.student.nama}</td>
                        <td className="py-3 px-2 text-center text-slate-500">{item.student.jenisKelamin}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                          {item.totalNilai || '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-sm text-slate-900">
                          {item.rataRata || '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                            predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {predikat}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">
                          <span className="text-emerald-600 font-bold">{item.jumlahMapelTuntas}</span> / {subjects.length}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isTuntas
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isTuntas ? 'Tuntas' : 'Perlu Remidi'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedStudentForRapor(item)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Rapor PTS</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Mapel Analysis */}
        {activeSubTab === 'analisis-mapel' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Analisis Capaian Rata-Rata 11 Mata Pelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Membandingkan penguasaan kompetensi siswa per mata pelajaran di kelas {currentClass?.nama}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(subj => {
                const avg = summaryData.mapelAverages[subj.id] || 0;
                const isUnderKkm = avg > 0 && avg < subj.kkm;
                const isFilled = avg > 0;

                return (
                  <div
                    key={subj.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          {subj.urutan}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{subj.nama}</h4>
                          <span className="text-[10px] text-slate-400">{subj.kelompok}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-base font-black ${
                          !isFilled ? 'text-slate-400' : isUnderKkm ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {avg || '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">KKM: {subj.kkm}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          !isFilled ? 'bg-slate-300' : isUnderKkm ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, avg)}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className={isUnderKkm ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                        {isFilled ? (isUnderKkm ? '⚠️ Di bawah KKM' : '✓ Memenuhi KKM') : 'Belum Terisi'}
                      </span>
                      <button
                        onClick={() => onNavigateToInput(selectedClassId, subj.id)}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Input / Edit Nilai &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Remedial Assistance */}
        {activeSubTab === 'remedial' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <h4 className="font-bold flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Program Pendampingan Remedial Tengah Semester</span>
              </h4>
              <p className="mt-1 leading-relaxed">
                Daftar siswa di bawah ini membutuhkan bimbingan atau tes remedial pada mata pelajaran yang belum mencapai KKM ({settings.kkmDefault}). Wali kelas dapat berkoordinasi langsung dengan masing-masing guru mapel.
              </p>
            </div>

            {summaryData.atRiskStudents.length === 0 ? (
              <div className="py-12 text-center text-emerald-600 font-bold text-sm bg-emerald-50/50 rounded-2xl border border-emerald-100">
                🎉 Luar biasa! Seluruh siswa di kelas {currentClass?.nama} telah tuntas mencapai KKM pada seluruh mata pelajaran.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="py-3 px-3 w-12 text-center">No</th>
                      <th className="py-3 px-3 w-24">NIS</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-3 text-center">Rerata</th>
                      <th className="py-3 px-4">Mata Pelajaran Belum Tuntas (&lt; KKM)</th>
                      <th className="py-3 px-3 text-center">Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryData.atRiskStudents.map((item, idx) => {
                      // Find which subjects are under KKM
                      const failedSubjects = subjects.filter(s => {
                        const rec = item.grades[s.id];
                        return !rec || rec.nilaiAkhir < s.kkm;
                      });

                      return (
                        <tr key={item.student.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{item.student.nis}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{item.student.nama}</td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-rose-600">
                            {item.rataRata}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {failedSubjects.map(sub => {
                                const score = item.grades[sub.id]?.nilaiAkhir ?? 0;
                                return (
                                  <span
                                    key={sub.id}
                                    className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold"
                                  >
                                    {sub.nama}: {score} (KKM: {sub.kkm})
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => setSelectedStudentForRapor(item)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                            >
                              Lihat Rapor
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rapor Print Modal - Individual */}
      {selectedStudentForRapor && (
        <RaporCetakModal
          summary={selectedStudentForRapor}
          schoolClass={currentClass!}
          onClose={() => setSelectedStudentForRapor(null)}
        />
      )}

      {/* Rapor Print Modal - Batch All Students (PDF A4) */}
      {showBatchPrintAll && currentClass && (
        <RaporCetakModal
          summaries={summaryData.summaries}
          schoolClass={currentClass}
          onClose={() => setShowBatchPrintAll(false)}
        />
      )}
    </div>
  );
};
