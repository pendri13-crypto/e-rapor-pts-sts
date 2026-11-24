import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  Sparkles,
  Search,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
  Info,
  CalendarCheck,
  HeartPulse,
  Clock,
  UserX,
  FileText
} from 'lucide-react';
import { UserAccount, SchoolClass, Student, AttendanceRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { SuccessPopup } from '../common/SuccessPopup';

interface AttendanceInputViewProps {
  currentUser: UserAccount;
  initialClassId?: string;
  onNavigateToLeger?: (classId: string) => void;
}

interface EditableAttendanceRow {
  student: Student;
  sakit: number | '';
  izin: number | '';
  alpa: number | '';
  catatanWaliKelas: string;
  isDirty?: boolean;
}

export const AttendanceInputView: React.FC<AttendanceInputViewProps> = ({
  currentUser,
  initialClassId,
  onNavigateToLeger,
}) => {
  const classes = StorageService.getClasses();
  const settings = StorageService.getSettings();

  // Filter accessible classes based on user role
  const accessibleClasses = currentUser.role === 'SUPER_ADMIN'
    ? classes
    : currentUser.isWaliKelas && currentUser.waliKelasId
      ? classes.filter(c => c.id === currentUser.waliKelasId || currentUser.assignedClassIds.includes(c.id))
      : classes.filter(c => currentUser.assignedClassIds.includes(c.id));

  // Determine initial selected class
  const defaultClassId = initialClassId && accessibleClasses.some(c => c.id === initialClassId)
    ? initialClassId
    : (currentUser.waliKelasId && accessibleClasses.some(c => c.id === currentUser.waliKelasId))
      ? currentUser.waliKelasId
      : (accessibleClasses[0]?.id || 'VII-A');

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState<EditableAttendanceRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupMsg, setSuccessPopupMsg] = useState('');

  const currentClass = classes.find(c => c.id === selectedClassId);

  // Load attendance data for selected class
  useEffect(() => {
    if (!selectedClassId) return;

    const students = StorageService.getStudentsByClass(selectedClassId);
    const existingAttendance = StorageService.getAttendanceByClass(selectedClassId);
    const attMap = new Map<string, AttendanceRecord>(existingAttendance.map(a => [a.studentId, a]));

    const initialRows: EditableAttendanceRow[] = students.map(student => {
      const att = attMap.get(student.id);
      return {
        student,
        sakit: att ? att.sakit : 0,
        izin: att ? att.izin : 0,
        alpa: att ? att.alpa : 0,
        catatanWaliKelas: att?.catatanWaliKelas || 'Pertahankan prestasi belajar, selalu giat dalam berdiskusi di kelas dan tingkatkan kedisiplinan.',
        isDirty: false
      };
    });

    setRows(initialRows);
  }, [selectedClassId]);

  // Handle cell edit
  const handleInputChange = (
    studentId: string,
    field: 'sakit' | 'izin' | 'alpa' | 'catatanWaliKelas',
    value: string
  ) => {
    setRows(prev =>
      prev.map(row => {
        if (row.student.id !== studentId) return row;

        if (field === 'catatanWaliKelas') {
          return { ...row, catatanWaliKelas: value, isDirty: true };
        }

        const numVal = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
        return {
          ...row,
          [field]: isNaN(Number(numVal)) ? '' : numVal,
          isDirty: true
        };
      })
    );
  };

  // Keyboard navigation: Enter moves down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colKey: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.querySelector<HTMLInputElement>(
        `input[data-row="${rowIndex + 1}"][data-col="${colKey}"]`
      );
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  // Quick fill all students with 0 (Nihil / Hadir Penuh)
  const handleQuickFillNihil = () => {
    setRows(prev =>
      prev.map(row => ({
        ...row,
        sakit: 0,
        izin: 0,
        alpa: 0,
        isDirty: true
      }))
    );
    setSaveSuccessMsg('Semua siswa diisi nihil (S: 0, I: 0, A: 0). Jangan lupa klik "Simpan Kehadiran".');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Save all attendance records
  const handleSaveAll = () => {
    setIsSaving(true);

    const recordsToSave: AttendanceRecord[] = rows.map(r => ({
      studentId: r.student.id,
      classId: selectedClassId,
      sakit: typeof r.sakit === 'number' ? r.sakit : 0,
      izin: typeof r.izin === 'number' ? r.izin : 0,
      alpa: typeof r.alpa === 'number' ? r.alpa : 0,
      catatanWaliKelas: r.catatanWaliKelas.trim()
    }));

    StorageService.saveAttendanceForClass(selectedClassId, recordsToSave);

    setRows(prev => prev.map(r => ({ ...r, isDirty: false })));
    setIsSaving(false);
    setSuccessPopupMsg(`Data kehadiran kelas ${currentClass?.nama} (S, I, A) berhasil disimpan dan disinkronkan ke Leger & Rapor!`);
    setShowSuccessPopup(true);
  };

  // Reset attendance for this class
  const handleResetClass = () => {
    if (confirm(`Yakin ingin mengosongkan data kehadiran untuk kelas ${currentClass?.nama}?`)) {
      setRows(prev =>
        prev.map(r => ({
          ...r,
          sakit: 0,
          izin: 0,
          alpa: 0,
          isDirty: true
        }))
      );
    }
  };

  // Quick fill template comment
  const handleApplyDefaultNotes = () => {
    const defaultNote = 'Pertahankan prestasi belajar, selalu giat dalam berdiskusi di kelas dan tingkatkan kedisiplinan beribadah.';
    setRows(prev =>
      prev.map(r => ({
        ...r,
        catatanWaliKelas: defaultNote,
        isDirty: true
      }))
    );
    setSaveSuccessMsg('Catatan standar wali kelas diterapkan ke seluruh siswa.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Filtered rows by search
  const filteredRows = rows.filter(
    r =>
      r.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student.nis.includes(searchQuery)
  );

  // Statistics
  const totalSiswa = rows.length;
  const totalS = rows.reduce((acc, r) => acc + (typeof r.sakit === 'number' ? r.sakit : 0), 0);
  const totalI = rows.reduce((acc, r) => acc + (typeof r.izin === 'number' ? r.izin : 0), 0);
  const totalA = rows.reduce((acc, r) => acc + (typeof r.alpa === 'number' ? r.alpa : 0), 0);
  const totalAbsen = totalS + totalI + totalA;
  const siswaPernahAbsen = rows.filter(r => {
    const s = typeof r.sakit === 'number' ? r.sakit : 0;
    const i = typeof r.izin === 'number' ? r.izin : 0;
    const a = typeof r.alpa === 'number' ? r.alpa : 0;
    return s + i + a > 0;
  }).length;
  const siswaNihil = totalSiswa - siswaPernahAbsen;

  const hasDirtyRows = rows.some(r => r.isDirty);

  return (
    <div className="space-y-6">
      {/* Page Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Presensi & Ketidakhadiran Siswa
              </span>
              <span className="text-xs text-slate-400">
                Periode: {settings.namaPeriodePTS || 'PTS 3 Bulanan'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-teal-600" />
              <span>Input Kehadiran Siswa</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Pencatatan rekapitulasi ketidakhadiran siswa selama tengah semester. Nilai yang dimasukkan akan otomatis terintegrasi ke <strong>Buku Leger Nilai</strong> dan <strong>Lembar Cetak Rapor PTS</strong> siswa.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickFillNihil}
              type="button"
              className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200/80 transition-colors flex items-center gap-1.5 active:scale-95"
              title="Isi seluruh siswa dengan angka 0 (Nihil / Hadir Penuh)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Isi Semua Nihil (0)</span>
            </button>

            <button
              onClick={handleApplyDefaultNotes}
              type="button"
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
              title="Terapkan kalimat motivasi standar wali kelas"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Catatan Standar</span>
            </button>

            {onNavigateToLeger && (
              <button
                onClick={() => onNavigateToLeger(selectedClassId)}
                type="button"
                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Buka Buku Leger Nilai untuk melihat rekap kehadiran"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Lihat Leger</span>
              </button>
            )}

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              type="button"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 ${
                hasDirtyRows
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-teal-600/30 animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Kehadiran'}</span>
            </button>
          </div>
        </div>

        {/* Legend Banner: S, I, A Details */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-indigo-50 border border-teal-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Rincian Kode Kehadiran:</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/90 text-amber-900 font-bold border border-amber-300 shadow-2xs">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                <span>S = Sakit</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100/90 text-blue-900 font-bold border border-blue-300 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>I = Ijin</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100/90 text-rose-900 font-bold border border-rose-300 shadow-2xs">
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>A = Alfa</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              *Penulisan pada aplikasi menggunakan singkatan resmi <strong>S</strong>, <strong>I</strong>, <strong>A</strong> (satuan hari).
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Siswa</span>
            <span className="text-xl font-black text-slate-900">{totalSiswa}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
            <span className="text-[11px] text-amber-800 font-bold block flex items-center justify-center gap-1">
              <span>Sakit (S)</span>
            </span>
            <span className="text-xl font-black text-amber-700">{totalS} <span className="text-xs font-normal text-amber-600">hari</span></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
            <span className="text-[11px] text-blue-800 font-bold block flex items-center justify-center gap-1">
              <span>Ijin (I)</span>
            </span>
            <span className="text-xl font-black text-blue-700">{totalI} <span className="text-xs font-normal text-blue-600">hari</span></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
            <span className="text-[11px] text-rose-800 font-bold block flex items-center justify-center gap-1">
              <span>Alfa (A)</span>
            </span>
            <span className="text-xl font-black text-rose-700">{totalA} <span className="text-xs font-normal text-rose-600">hari</span></span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
            <span className="text-[11px] text-emerald-800 font-bold block">Hadir 100% (Nihil)</span>
            <span className="text-xl font-black text-emerald-700">{siswaNihil} <span className="text-xs font-normal text-emerald-600">siswa</span></span>
          </div>
        </div>

        {/* Filter Controls (Class Selector & Search) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pilih Kelas (33 Kelas)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <optgroup label="Tingkat VII (Fase D)">
                {accessibleClasses.filter(c => c.tingkat === 'VII').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} (Wali: {c.waliKelasNama})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tingkat VIII (Fase D)">
                {accessibleClasses.filter(c => c.tingkat === 'VIII').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} (Wali: {c.waliKelasNama})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tingkat IX (Fase D)">
                {accessibleClasses.filter(c => c.tingkat === 'IX').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} (Wali: {c.waliKelasNama})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Cari Nama / NIS Siswa
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama siswa..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Current Class Badge */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-teal-950">
                {currentClass?.nama} • {rows.length} Siswa
              </p>
              <p className="text-[11px] text-teal-700">
                Wali Kelas: {currentClass?.waliKelasNama}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-600 text-white rounded-md">
                {currentClass?.tingkat ? `Fase D (${currentClass.tingkat})` : 'SMP'}
              </span>
            </div>
          </div>
        </div>

        {/* Temporary Notification */}
        {saveSuccessMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Daftar Kehadiran Siswa</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {filteredRows.length} dari {rows.length} Siswa
            </span>
            {hasDirtyRows && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Ada perubahan belum disimpan
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Tekan <em>Enter</em> untuk pindah ke baris siswa berikutnya</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-center border-b border-slate-800">
                <th rowSpan={2} className="py-3 px-3 w-10 border-r border-slate-800">No</th>
                <th rowSpan={2} className="py-3 px-3 w-24 border-r border-slate-800 text-left">NIS</th>
                <th rowSpan={2} className="py-3 px-3 min-w-[200px] border-r border-slate-800 text-left">Nama Siswa</th>
                <th rowSpan={2} className="py-3 px-2 w-10 border-r border-slate-800">JK</th>
                <th colSpan={3} className="py-2 px-2 bg-slate-800 border-r border-slate-700">
                  Rincian Ketidakhadiran (Hari)
                </th>
                <th rowSpan={2} className="py-3 px-2 w-20 bg-slate-800 border-r border-slate-700">
                  Total Absen
                </th>
                <th rowSpan={2} className="py-3 px-4 min-w-[280px] text-left">
                  Catatan Wali Kelas (Dicetak pada Rapor)
                </th>
              </tr>
              <tr className="bg-slate-800 text-slate-200 font-semibold text-[11px] text-center border-b border-slate-700">
                <th className="py-1.5 px-2 w-16 bg-amber-950 text-amber-300 font-bold border-r border-slate-700" title="S = Sakit">
                  S
                </th>
                <th className="py-1.5 px-2 w-16 bg-blue-950 text-blue-300 font-bold border-r border-slate-700" title="I = Ijin">
                  I
                </th>
                <th className="py-1.5 px-2 w-16 bg-rose-950 text-rose-300 font-bold border-r border-slate-700" title="A = Alfa">
                  A
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredRows.map((row, index) => {
                const s = typeof row.sakit === 'number' ? row.sakit : 0;
                const i = typeof row.izin === 'number' ? row.izin : 0;
                const a = typeof row.alpa === 'number' ? row.alpa : 0;
                const totalRowAbsen = s + i + a;

                return (
                  <tr
                    key={row.student.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.isDirty ? 'bg-amber-50/40' : ''
                    } ${totalRowAbsen > 0 ? 'bg-slate-50/40' : ''}`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-sans">{index + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{row.student.nis}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900 truncate max-w-[200px]">
                      {row.student.nama}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-sans">{row.student.jenisKelamin}</td>

                    {/* S (Sakit) Input */}
                    <td className="py-2 px-1 border-x border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="sakit"
                        value={row.sakit}
                        onChange={(e) => handleInputChange(row.student.id, 'sakit', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'sakit')}
                        className={`w-full py-1 px-1.5 text-center text-xs font-bold rounded-lg border outline-none transition-all ${
                          s > 0
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-black focus:ring-2 focus:ring-amber-500'
                            : 'bg-white border-slate-200 text-slate-600 focus:bg-white focus:ring-2 focus:ring-teal-500'
                        }`}
                      />
                    </td>

                    {/* I (Ijin) Input */}
                    <td className="py-2 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="izin"
                        value={row.izin}
                        onChange={(e) => handleInputChange(row.student.id, 'izin', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'izin')}
                        className={`w-full py-1 px-1.5 text-center text-xs font-bold rounded-lg border outline-none transition-all ${
                          i > 0
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-black focus:ring-2 focus:ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-600 focus:bg-white focus:ring-2 focus:ring-teal-500'
                        }`}
                      />
                    </td>

                    {/* A (Alfa) Input */}
                    <td className="py-2 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="alpa"
                        value={row.alpa}
                        onChange={(e) => handleInputChange(row.student.id, 'alpa', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'alpa')}
                        className={`w-full py-1 px-1.5 text-center text-xs font-bold rounded-lg border outline-none transition-all ${
                          a > 0
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-black focus:ring-2 focus:ring-rose-500'
                            : 'bg-white border-slate-200 text-slate-600 focus:bg-white focus:ring-2 focus:ring-teal-500'
                        }`}
                      />
                    </td>

                    {/* Total Absen (S+I+A) */}
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-sans">
                      {totalRowAbsen > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          {totalRowAbsen} hari
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-bold">Nihil</span>
                      )}
                    </td>

                    {/* Catatan Wali Kelas */}
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={row.catatanWaliKelas}
                        onChange={(e) => handleInputChange(row.student.id, 'catatanWaliKelas', e.target.value)}
                        placeholder="Ketik catatan / saran wali kelas..."
                        className="w-full py-1 px-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info inside table card */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold">Keterangan:</span>
            <span><strong>S</strong> = Sakit • <strong>I</strong> = Ijin • <strong>A</strong> = Alfa</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              type="button"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Semua Kehadiran</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        message={successPopupMsg}
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
};
