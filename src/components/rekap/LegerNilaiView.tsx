import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Search,
  Filter,
  Users,
  Award,
  ChevronDown,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { UserAccount, SchoolClass } from '../../types';
import { StorageService } from '../../services/storage';
import { ExcelService } from '../../services/excelService';

interface LegerNilaiViewProps {
  currentUser: UserAccount;
  initialClassId?: string;
  onNavigateToInput: (classId: string, mapelId?: string) => void;
}

export const LegerNilaiView: React.FC<LegerNilaiViewProps> = ({
  currentUser,
  initialClassId,
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
  const [searchQuery, setSearchQuery] = useState('');

  const currentClass = classes.find(c => c.id === selectedClassId);
  const summaryData = StorageService.getClassSummary(selectedClassId);

  const filteredSummaries = summaryData.summaries.filter(s =>
    s.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student.nis.includes(searchQuery)
  );

  const handlePrintLeger = () => {
    window.print();
  };

  const handleExportLegerExcel = () => {
    ExcelService.exportLegerToExcel(
      summaryData.summaries,
      subjects,
      currentClass?.nama || selectedClassId,
      selectedClassId,
      settings.tahunAjaran
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Dokumen Resmi Leger Nilai PTS
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Matriks 11 Mata Pelajaran • {settings.namaPeriodePTS}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Buku Leger Nilai: {currentClass?.nama}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Wali Kelas: <strong>{currentClass?.waliKelasNama}</strong> (NIP: {currentClass?.waliKelasNip})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLegerExcel}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Unduh Leger Nilai 11 Mapel Kelas Ini ke Format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Leger (Excel)</span>
            </button>
            <button
              onClick={handlePrintLeger}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Leger (Landscape)</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 uppercase">Pilih Kelas:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="Kelas VII (11 Kelas)">
                {accessibleClasses.filter(c => c.tingkat === 'VII').map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </optgroup>
              <optgroup label="Kelas VIII (11 Kelas)">
                {accessibleClasses.filter(c => c.tingkat === 'VIII').map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </optgroup>
              <optgroup label="Kelas IX (11 Kelas)">
                {accessibleClasses.filter(c => c.tingkat === 'IX').map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari siswa dalam leger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Leger Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Kop for Leger */}
        <div className="hidden print:block text-center pb-4 mb-4 border-b-2 border-slate-900">
          <h2 className="text-base font-bold uppercase">{settings.namaSekolah}</h2>
          <h3 className="text-sm font-extrabold uppercase">
            LEGER NILAI PENILAIAN TENGAH SEMESTER (PTS)
          </h3>
          <p className="text-xs">
            Kelas: {currentClass?.nama} • Semester: {settings.semesterAktif} • Tahun Ajaran: {settings.tahunAjaran} • Wali Kelas: {currentClass?.waliKelasNama} (NIP. {currentClass?.waliKelasNip})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-800 text-white font-bold text-center border-b border-slate-700">
                <th rowSpan={2} className="py-2.5 px-2 w-8 border border-slate-700">No</th>
                <th rowSpan={2} className="py-2.5 px-2 w-20 border border-slate-700 text-left">NIS</th>
                <th rowSpan={2} className="py-2.5 px-3 min-w-[160px] border border-slate-700 text-left">Nama Siswa</th>
                <th rowSpan={2} className="py-2.5 px-1 w-8 border border-slate-700">JK</th>
                <th colSpan={11} className="py-1.5 px-2 bg-slate-900 border border-slate-700">
                  Mata Pelajaran (Nilai Akhir PTS)
                </th>
                <th rowSpan={2} className="py-2.5 px-2 w-14 bg-indigo-900 border border-slate-700">Total</th>
                <th rowSpan={2} className="py-2.5 px-2 w-14 bg-blue-900 border border-slate-700">Rerata</th>
                <th rowSpan={2} className="py-2.5 px-2 w-12 bg-amber-900 border border-slate-700">Rank</th>
                <th colSpan={3} className="py-1.5 px-2 bg-slate-700 border border-slate-700">Absen</th>
              </tr>
              <tr className="bg-slate-700 text-slate-200 font-semibold text-[10px] text-center border-b border-slate-600">
                {subjects.map(s => (
                  <th
                    key={s.id}
                    className="py-1.5 px-1.5 w-12 border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors"
                    onClick={() => onNavigateToInput(selectedClassId, s.id)}
                    title={`${s.nama} (KKM: ${s.kkm}) - Klik untuk input nilai`}
                  >
                    {s.kode}
                  </th>
                ))}
                <th className="py-1.5 px-1 w-7 border border-slate-600" title="Sakit">S</th>
                <th className="py-1.5 px-1 w-7 border border-slate-600" title="Izin">I</th>
                <th className="py-1.5 px-1 w-7 border border-slate-600" title="Alpa">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredSummaries.map((item, index) => {
                return (
                  <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-2 text-center text-slate-500 font-sans border border-slate-200">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 text-slate-600 border border-slate-200">
                      {item.student.nis}
                    </td>
                    <td className="py-2 px-3 font-sans font-bold text-slate-900 border border-slate-200 truncate max-w-[180px]">
                      {item.student.nama}
                    </td>
                    <td className="py-2 px-1 text-center font-sans text-slate-500 border border-slate-200">
                      {item.student.jenisKelamin}
                    </td>

                    {/* 11 Mapel scores */}
                    {subjects.map(subj => {
                      const rec = item.grades[subj.id];
                      const score = rec?.nilaiAkhir ?? null;
                      const isUnderKkm = score !== null && score < subj.kkm;

                      return (
                        <td
                          key={subj.id}
                          className={`py-2 px-1 text-center border border-slate-200 ${
                            score === null ? 'text-slate-300' :
                            isUnderKkm ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-800'
                          }`}
                        >
                          {score !== null ? score : '-'}
                        </td>
                      );
                    })}

                    {/* Total & Average & Rank */}
                    <td className="py-2 px-1 text-center font-bold text-indigo-700 bg-indigo-50/30 border border-slate-200">
                      {item.totalNilai || '-'}
                    </td>
                    <td className="py-2 px-1 text-center font-black text-slate-900 bg-blue-50/30 border border-slate-200">
                      {item.rataRata || '-'}
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-amber-800 bg-amber-50/30 border border-slate-200">
                      {item.ranking}
                    </td>

                    {/* Attendance */}
                    <td className="py-2 px-1 text-center font-sans border border-slate-200 text-slate-600">
                      {item.kehadiran?.sakit ?? 0}
                    </td>
                    <td className="py-2 px-1 text-center font-sans border border-slate-200 text-slate-600">
                      {item.kehadiran?.izin ?? 0}
                    </td>
                    <td className="py-2 px-1 text-center font-sans border border-slate-200 text-slate-600">
                      {item.kehadiran?.alpa ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Printable Signatures for Leger */}
        <div className="hidden print:grid grid-cols-2 gap-8 text-center text-xs mt-8 pt-6 border-t border-slate-300">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-16" />
            <p className="font-bold underline">{settings.namaKepalaSekolah}</p>
            <p className="text-[10px]">NIP. {settings.nipKepalaSekolah}</p>
          </div>
          <div>
            <p>{settings.tempatRapor}, {settings.tanggalRapor}</p>
            <p className="font-bold">Wali Kelas {currentClass?.nama}</p>
            <div className="h-16" />
            <p className="font-bold underline">{currentClass?.waliKelasNama}</p>
            <p className="text-[10px]">NIP. {currentClass?.waliKelasNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
