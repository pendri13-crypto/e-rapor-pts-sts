import React, { useRef } from 'react';
import { Printer, X, Download, School, Check, User, Users, FileText } from 'lucide-react';
import { StudentReportSummary, SchoolClass, Subject, SchoolSettings } from '../../types';
import { StorageService } from '../../services/storage';

interface RaporCetakModalProps {
  summary?: StudentReportSummary | null;
  summaries?: StudentReportSummary[];
  schoolClass: SchoolClass;
  onClose: () => void;
}

interface StudentReportDocumentProps {
  summary: StudentReportSummary;
  schoolClass: SchoolClass;
  settings: SchoolSettings;
  kelA: Subject[];
  mulok: Subject[];
  totalStudentsInClass: number;
}

const StudentReportDocument: React.FC<StudentReportDocumentProps> = ({
  summary,
  schoolClass,
  settings,
  kelA,
  mulok,
  totalStudentsInClass,
}) => {
  return (
    <div className="text-slate-900 bg-white font-sans text-xs selection:bg-none relative z-0 min-h-[297mm]">
      {/* WATERMARK */}
      {settings.logoSekolahUrl && (
        <div className="absolute inset-0 z-[-1] flex items-center justify-center opacity-[0.06] pointer-events-none overflow-hidden select-none">
          <img src={settings.logoSekolahUrl} alt="Watermark" className="w-[80%] max-w-[500px] object-contain grayscale" />
        </div>
      )}

      {/* KOP RESMI SEKOLAH */}
      <div className="pb-2.5 mb-3 text-center relative">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Pemda / Dinas (Kiri) */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 print:w-32 print:h-32 flex items-center justify-center shrink-0">
            {settings.logoPemdaUrl ? (
              <img
                src={settings.logoPemdaUrl}
                alt="Logo Pemda"
                className="w-full h-full max-h-32 max-w-32 sm:max-h-36 sm:max-w-36 print:max-h-32 print:max-w-32 object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-slate-400 text-xs">
                <School className="w-12 h-12 text-slate-700" />
              </div>
            )}
          </div>

          {/* Teks KOP Resmi */}
          <div className="flex-1 px-3 text-center">
            <h3 className="text-sm sm:text-base print:text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
              PEMERINTAH DAERAH KABUPATEN TASIKMALAYA
            </h3>
            <h3 className="text-sm sm:text-base print:text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h3>
            <h1 className="text-xl sm:text-2xl print:text-2xl font-black uppercase tracking-tight text-slate-950 mt-1 mb-0.5 leading-tight">
              {settings.namaSekolah}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
              NPSN: {settings.npsn} • {settings.alamatSekolah}, {settings.kecamatan}, {settings.kabupatenKota}
            </p>
            <p className="text-[10px] sm:text-[10.5px] text-slate-500 mt-0.5">
              Telepon: {settings.telepon} • Pos-el: {settings.email} • Kode Pos: {settings.kodePos}
            </p>
          </div>

          {/* Logo Sekolah (Kanan) */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 print:w-32 print:h-32 flex items-center justify-center shrink-0">
            {settings.logoSekolahUrl ? (
              <img
                src={settings.logoSekolahUrl}
                alt="Logo Sekolah"
                className="w-full h-full max-h-32 max-w-32 sm:max-h-36 sm:max-w-36 print:max-h-32 print:max-w-32 object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-slate-400 text-xs">
                <span className="text-[11px] font-bold text-center leading-tight">LOGO<br />SEKOLAH</span>
              </div>
            )}
          </div>
        </div>

        {/* Double Border standard KOP Dinas */}
        <div className="w-full border-t-2 border-slate-900 mt-2" />
        <div className="w-full border-t border-slate-900 mt-0.5" />
      </div>

      {/* Judul Dokumen */}
      <div className="text-center my-3">
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider underline">
          LAPORAN PENILAIAN TENGAH SEMESTER (PTS)
        </h2>
        <p className="text-[10.5px] font-semibold text-slate-700 mt-0.5">
          TAHUN PELAJARAN {settings.tahunAjaran} — SEMESTER {settings.semesterAktif.toUpperCase()}
        </p>
      </div>

      {/* Identitas Siswa */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-[10.5px] bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
        <div className="space-y-0.5">
          <div className="flex">
            <span className="w-32 text-slate-600">Nama Peserta Didik</span>
            <span className="w-3">:</span>
            <span className="font-bold text-slate-900 uppercase truncate">{summary.student.nama}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">NIS / NISN</span>
            <span className="w-3">:</span>
            <span className="font-mono text-slate-800">{summary.student.nis} / {summary.student.nisn || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Jenis Kelamin</span>
            <span className="w-3">:</span>
            <span className="text-slate-800">{summary.student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex">
            <span className="w-28 text-slate-600">Kelas / Fase</span>
            <span className="w-3">:</span>
            <span className="font-bold text-slate-900">{schoolClass.nama} / Fase D</span>
          </div>
          <div className="flex">
            <span className="w-28 text-slate-600">Wali Kelas</span>
            <span className="w-3">:</span>
            <span className="text-slate-800 truncate">{schoolClass.waliKelasNama}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-slate-600">Peringkat Kelas</span>
            <span className="w-3">:</span>
            <span className="font-bold text-indigo-700">Peringkat ke-{summary.ranking} dari {totalStudentsInClass} Siswa</span>
          </div>
        </div>
      </div>

      {/* TABEL PENILAIAN 11 MATA PELAJARAN */}
      <div className="mb-4">
        <table className="w-full text-left border-collapse border border-slate-400 text-[10.5px]">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-400">
              <th className="border border-slate-400 py-1 px-1.5 w-7">No</th>
              <th className="border border-slate-400 py-1 px-2.5 text-left">Mata Pelajaran</th>
              <th className="border border-slate-400 py-1 px-1.5 w-16">Nilai Akhir</th>
              <th className="border border-slate-400 py-1 px-1.5 w-14">Predikat</th>
              <th className="border border-slate-400 py-1 px-2.5 text-left">Capaian Kompetensi / Catatan Kemajuan</th>
            </tr>
          </thead>
          <tbody>
            {/* Kelompok A */}
            <tr className="bg-slate-50 font-bold text-[9.5px]">
              <td colSpan={5} className="border border-slate-400 py-0.5 px-2 uppercase text-slate-700">
                A. Kelompok Mata Pelajaran Umum
              </td>
            </tr>
            {kelA.map((subj, idx) => {
              const rec = summary.grades[subj.id];
              const score = rec?.nilaiAkhir ?? '-';
              const predikat = rec?.predikat ?? '-';
              const capaian = rec?.capaianKompetensi ?? `Mengikuti proses pembelajaran mata pelajaran ${subj.nama}.`;
              return (
                <tr key={subj.id} className="border-b border-slate-300">
                  <td className="border border-slate-300 py-1 px-1.5 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 py-1 px-2.5 font-semibold text-slate-900">{subj.nama}</td>
                  <td className="border border-slate-300 py-1 px-1.5 text-center font-bold font-mono">{score}</td>
                  <td className="border border-slate-300 py-1 px-1.5 text-center font-bold">{predikat}</td>
                  <td className="border border-slate-300 py-1 px-2.5 text-slate-700 leading-tight text-[9.5px]">{capaian}</td>
                </tr>
              );
            })}

            {/* Muatan Lokal */}
            {mulok.length > 0 && (
              <>
                <tr className="bg-slate-50 font-bold text-[9.5px]">
                  <td colSpan={5} className="border border-slate-400 py-0.5 px-2 uppercase text-slate-700">
                    B. Muatan Lokal
                  </td>
                </tr>
                {mulok.map((subj, idx) => {
                  const rec = summary.grades[subj.id];
                  const score = rec?.nilaiAkhir ?? '-';
                  const predikat = rec?.predikat ?? '-';
                  const capaian = rec?.capaianKompetensi ?? `Mengikuti proses pembelajaran muatan lokal ${subj.nama}.`;
                  return (
                    <tr key={subj.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 py-1 px-1.5 text-center">{kelA.length + idx + 1}</td>
                      <td className="border border-slate-300 py-1 px-2.5 font-semibold text-slate-900">{subj.nama}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center font-bold font-mono">{score}</td>
                      <td className="border border-slate-300 py-1 px-1.5 text-center font-bold">{predikat}</td>
                      <td className="border border-slate-300 py-1 px-2.5 text-slate-700 leading-tight text-[9.5px]">{capaian}</td>
                    </tr>
                  );
                })}
              </>
            )}

            {/* Total & Average Row */}
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
              <td colSpan={2} className="border border-slate-400 py-1 px-2.5 text-right">
                Jumlah Nilai (11 Mata Pelajaran) :
              </td>
              <td className="border border-slate-400 py-1 px-1.5 text-center font-mono font-bold text-slate-900">
                {summary.totalNilai}
              </td>
              <td colSpan={2} className="border border-slate-400 py-1 px-2.5 text-left text-[10px]">
                Rata-rata: <strong>{summary.rataRata}</strong> • Status: <strong>{summary.jumlahMapelBelumTuntas === 0 && summary.totalNilai > 0 ? 'Tuntas Seluruh Mapel' : `${summary.jumlahMapelBelumTuntas} Mapel Perlu Bimbingan`}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Kehadiran & Catatan Wali Kelas */}
      <div className="grid grid-cols-12 gap-3 mb-4 text-[10px]">
        {/* Kehadiran */}
        <div className="col-span-5">
          <table className="w-full border border-slate-400 text-left">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-400 text-center">
                <th colSpan={2} className="py-0.5 px-2">Ketidakhadiran (3 Bulan)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="py-0.5 px-2.5">Sakit (S)</td>
                <td className="py-0.5 px-2 text-center font-bold">{summary.kehadiran?.sakit ?? 0} hari</td>
              </tr>
              <tr>
                <td className="py-0.5 px-2.5">Izin (I)</td>
                <td className="py-0.5 px-2 text-center font-bold">{summary.kehadiran?.izin ?? 0} hari</td>
              </tr>
              <tr>
                <td className="py-0.5 px-2.5">Tanpa Keterangan (A)</td>
                <td className="py-0.5 px-2 text-center font-bold">{summary.kehadiran?.alpa ?? 0} hari</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Catatan Wali Kelas */}
        <div className="col-span-7 border border-slate-400 p-2 rounded-sm flex flex-col justify-between">
          <div>
            <span className="font-bold block mb-0.5 text-slate-800 text-[10.5px]">Catatan Wali Kelas:</span>
            <p className="italic text-slate-700 text-[9.5px] leading-relaxed">
              "{summary.kehadiran?.catatanWaliKelas || 'Pertahankan prestasi belajar, selalu giat dalam berdiskusi di kelas dan tingkatkan kedisiplinan beribadah serta mematuhi tata tertib sekolah.'}"
            </p>
          </div>
          <div className="text-[9px] text-slate-500 pt-1 text-right">
            Status: {summary.rataRata >= 75 ? 'Memenuhi Standar Kelulusan Tengah Semester' : 'Perlu Pendampingan Lanjutan'}
          </div>
        </div>
      </div>

      {/* KOLOM TANDA TANGAN RESMI */}
      <div className="pt-3 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-3 text-[10.5px]">
          <div className="text-center">
            <p className="text-slate-700">&nbsp;</p>
            <p className="text-slate-700">Mengetahui,</p>
            <p className="font-bold text-slate-800">Orang Tua / Wali Siswa</p>
            <div className="h-12" />
            <p className="border-b border-slate-400 w-32 mx-auto" />
            <p className="text-[9.5px] text-slate-500 mt-0.5">( ............................................ )</p>
          </div>

          <div className="text-center">
            <p className="text-slate-700">&nbsp;</p>
            <p className="text-slate-700">&nbsp;</p>
            <p className="font-bold text-slate-800">Wali Kelas,</p>
            <div className="h-12" />
            <p className="font-bold underline text-slate-900">{schoolClass.waliKelasNama}</p>
            <p className="text-[9.5px] text-slate-600 font-mono">NIP. {schoolClass.waliKelasNip}</p>
          </div>

          <div className="text-left">
            <p className="text-slate-700">{settings.tempatRapor}, {settings.tanggalRapor}</p>
            <p className="text-slate-700">Mengetahui,</p>
            <p className="font-bold text-slate-800">Kepala {settings.namaSekolah}</p>
            <div className="h-12" />
            <p className="font-bold underline text-slate-900">{settings.namaKepalaSekolah}</p>
            <p className="text-[9.5px] text-slate-600 font-mono">NIP. {settings.nipKepalaSekolah}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RaporCetakModal: React.FC<RaporCetakModalProps> = ({
  summary,
  summaries,
  schoolClass,
  onClose,
}) => {
  const settings = StorageService.getSettings();
  const subjects = StorageService.getSubjects();
  const printRef = useRef<HTMLDivElement>(null);

  const studentList: StudentReportSummary[] = summaries && summaries.length > 0
    ? summaries
    : (summary ? [summary] : []);

  const isBatch = studentList.length > 1;

  const handlePrint = () => {
    window.print();
  };

  const kelA = subjects.filter(s => s.kelompok === 'Kelompok A (Umum)');
  const mulok = subjects.filter(s => s.kelompok === 'Muatan Lokal');
  const totalStudentsInClass = StorageService.getStudentsByClass(schoolClass.id).length || studentList.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none max-h-[92vh] flex flex-col">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-bold text-sm block">
                {isBatch
                  ? `Cetak Rapor Massal PDF (Seluruh Siswa Kelas ${schoolClass.nama})`
                  : `Pratinjau Cetak Rapor PTS: ${summary?.student.nama || 'Siswa'}`
                }
              </span>
              <span className="text-[11px] text-indigo-300 font-normal">
                {isBatch
                  ? `Total ${studentList.length} Siswa • Format Siap Cetak PDF Kertas A4 (1 Siswa = 1 Halaman)`
                  : 'Format Resmi Kemendikbud Standar Kertas A4'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isBatch ? `Cetak Semua (${studentList.length} Siswa) / PDF` : 'Cetak / Simpan PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div ref={printRef} className="overflow-y-auto flex-1 bg-slate-100 print:bg-white p-4 sm:p-6 print:p-0 space-y-6 print:space-y-0">
          {studentList.map((item, index) => (
            <div
              key={item.student.id}
              className={`bg-white p-6 sm:p-10 shadow-lg print:shadow-none border border-slate-200 print:border-none max-w-4xl mx-auto rounded-2xl print:rounded-none ${
                index < studentList.length - 1 ? 'page-break' : ''
              }`}
            >
              <StudentReportDocument
                summary={item}
                schoolClass={schoolClass}
                settings={settings}
                kelA={kelA}
                mulok={mulok}
                totalStudentsInClass={totalStudentsInClass}
              />
            </div>
          ))}
        </div>

        {/* Modal Footer Controls (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Petunjuk Cetak PDF:</span>
            <span>Pada dialog cetak browser, pilih Destination: <strong>"Save as PDF"</strong> dan Paper Size: <strong>"A4"</strong>.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isBatch ? `Cetak Semua (${studentList.length} Halaman A4)` : 'Cetak Dokumen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
