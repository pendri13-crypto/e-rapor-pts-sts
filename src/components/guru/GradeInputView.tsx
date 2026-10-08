import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Calculator,
  HelpCircle,
  FileCheck,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserAccount, SchoolClass, Subject, Student, GradeRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { calculateGradeDerived } from '../../data/seedData';
import { SuccessPopup } from '../common/SuccessPopup';

interface GradeInputViewProps {
  currentUser: UserAccount;
  initialClassId?: string;
  initialMapelId?: string;
}

interface EditableGradeRow {
  student: Student;
  recordId?: string;
  t1: number | '';
  t2: number | '';
  t3: number | '';
  uh1: number | '';
  uh2: number | '';
  pts: number | '';
  formatifAvg: number;
  uhAvg: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  keterangan: 'Tuntas' | 'Perlu Bimbingan';
  capaianKompetensi: string;
  isDirty?: boolean;
}

export const GradeInputView: React.FC<GradeInputViewProps> = ({
  currentUser,
  initialClassId,
  initialMapelId,
}) => {
  const classes = StorageService.getClasses();
  const subjects = StorageService.getSubjects();
  const settings = StorageService.getSettings();

  // Filter accessible classes based on user role
  const accessibleClasses = currentUser.role === 'SUPER_ADMIN'
    ? classes
    : classes.filter(c => currentUser.assignedClassIds.includes(c.id));

  // Determine initial selected class
  const defaultClassId = initialClassId && accessibleClasses.some(c => c.id === initialClassId)
    ? initialClassId
    : (accessibleClasses[0]?.id || 'VII-A');

  // Determine initial selected mapel
  const defaultMapelId = currentUser.role === 'GURU_MAPEL' && currentUser.mapelId
    ? currentUser.mapelId
    : (initialMapelId || subjects[0]?.id || 'PAIBP');

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [selectedMapelId, setSelectedMapelId] = useState<string>(defaultMapelId);
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState<EditableGradeRow[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showAutoFillMenu, setShowAutoFillMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupMsg, setSuccessPopupMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedMapelId) || subjects[0];

  // Load existing grades or initialize empty rows
  useEffect(() => {
    if (!selectedClassId || !selectedMapelId) return;

    const students = StorageService.getStudentsByClass(selectedClassId);
    const existingGrades = StorageService.getGradesByClassAndMapel(selectedClassId, selectedMapelId);
    const gradeMap = new Map<string, GradeRecord>(existingGrades.map(g => [g.studentId, g]));

    const initialRows: EditableGradeRow[] = students.map(student => {
      const g = gradeMap.get(student.id);
      if (g) {
        return {
          student,
          recordId: g.id,
          t1: g.nilaiTugas1,
          t2: g.nilaiTugas2,
          t3: g.nilaiTugas3,
          uh1: g.nilaiUH1,
          uh2: g.nilaiUH2,
          pts: g.nilaiPTS,
          formatifAvg: g.nilaiFormatifAvg,
          uhAvg: g.nilaiSumatifMateriAvg,
          nilaiAkhir: g.nilaiAkhir,
          predikat: g.predikat,
          keterangan: g.keterangan,
          capaianKompetensi: g.capaianKompetensi,
          isDirty: false
        };
      } else {
        // Empty defaults
        return {
          student,
          t1: '',
          t2: '',
          t3: '',
          uh1: '',
          uh2: '',
          pts: '',
          formatifAvg: 0,
          uhAvg: 0,
          nilaiAkhir: 0,
          predikat: 'D',
          keterangan: 'Perlu Bimbingan',
          capaianKompetensi: `Perlu pendampingan belajar pada materi ${currentSubject.nama}.`,
          isDirty: false
        };
      }
    });

    setRows(initialRows);
  }, [selectedClassId, selectedMapelId]);

  // Recalculate derived fields for a row
  const calculateRowValues = (row: Partial<EditableGradeRow>): {
    formatifAvg: number;
    uhAvg: number;
    nilaiAkhir: number;
    predikat: 'A' | 'B' | 'C' | 'D';
    keterangan: 'Tuntas' | 'Perlu Bimbingan';
    capaianKompetensi: string;
  } => {
    const t1 = typeof row.t1 === 'number' ? row.t1 : 0;
    const t2 = typeof row.t2 === 'number' ? row.t2 : 0;
    const t3 = typeof row.t3 === 'number' ? row.t3 : 0;
    
    // Count valid formatif inputs
    const validTugas = [row.t1, row.t2, row.t3].filter(v => typeof v === 'number') as number[];
    const formatifAvg = validTugas.length > 0
      ? Math.round(validTugas.reduce((a, b) => a + b, 0) / validTugas.length)
      : 0;

    const validUh = [row.uh1, row.uh2].filter(v => typeof v === 'number') as number[];
    const uhAvg = validUh.length > 0
      ? Math.round(validUh.reduce((a, b) => a + b, 0) / validUh.length)
      : 0;

    const pts = typeof row.pts === 'number' ? row.pts : 0;

    const derived = calculateGradeDerived(
      formatifAvg,
      uhAvg,
      pts,
      currentSubject.kkm,
      settings.bobotFormatif,
      settings.bobotUH,
      settings.bobotPTS,
      currentSubject.nama
    );

    return {
      formatifAvg,
      uhAvg,
      nilaiAkhir: derived.nilaiAkhir,
      predikat: derived.predikat,
      keterangan: derived.keterangan as 'Tuntas' | 'Perlu Bimbingan',
      capaianKompetensi: row.capaianKompetensi || derived.capaianKompetensi
    };
  };

  // Handle cell edits
  const handleInputChange = (
    studentId: string,
    field: 't1' | 't2' | 't3' | 'uh1' | 'uh2' | 'pts' | 'capaianKompetensi',
    value: string
  ) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.student.id !== studentId) return row;

        if (field === 'capaianKompetensi') {
          return { ...row, capaianKompetensi: value, isDirty: true };
        }

        const numVal = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
        const updatedRow: EditableGradeRow = {
          ...row,
          [field]: isNaN(Number(numVal)) ? '' : numVal,
          isDirty: true
        };

        const calc = calculateRowValues(updatedRow);
        return {
          ...updatedRow,
          ...calc
        };
      })
    );
  };

  // Handle keyboard navigation (Enter key moves to next row down)
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

  // Quick auto-fill
  const handleAutoFill = (type: 'kkm' | 'acak' | 'tinggi') => {
    StorageService.quickFillClassMapel(selectedClassId, selectedMapelId, type, currentUser.nama);
    setShowAutoFillMenu(false);
    
    // Refresh rows
    const students = StorageService.getStudentsByClass(selectedClassId);
    const existingGrades = StorageService.getGradesByClassAndMapel(selectedClassId, selectedMapelId);
    const gradeMap = new Map<string, GradeRecord>(existingGrades.map(g => [g.studentId, g]));

    const updatedRows = students.map(student => {
      const g = gradeMap.get(student.id);
      if (g) {
        return {
          student,
          recordId: g.id,
          t1: g.nilaiTugas1,
          t2: g.nilaiTugas2,
          t3: g.nilaiTugas3,
          uh1: g.nilaiUH1,
          uh2: g.nilaiUH2,
          pts: g.nilaiPTS,
          formatifAvg: g.nilaiFormatifAvg,
          uhAvg: g.nilaiSumatifMateriAvg,
          nilaiAkhir: g.nilaiAkhir,
          predikat: g.predikat,
          keterangan: g.keterangan,
          capaianKompetensi: g.capaianKompetensi,
          isDirty: false
        };
      }
      return rows.find(r => r.student.id === student.id)!;
    });

    setRows(updatedRows);
    setSaveSuccessMsg(`Berhasil mengisi otomatis nilai untuk ${students.length} siswa!`);
    setSuccessPopupMsg(`Pengisian otomatis nilai untuk ${students.length} siswa kelas ${selectedClassId} (${currentSubject.nama}) berhasil disimpan.`);
    setShowSuccessPopup(true);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Hapus semua nilai
  const handleClearGrades = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan SEMUA nilai di layar untuk kelas dan mata pelajaran ini?')) {
      const updatedRows = rows.map(row => {
        const uRow: EditableGradeRow = {
          ...row,
          t1: '', t2: '', t3: '', uh1: '', uh2: '', pts: '',
          isDirty: true
        };
        const calc = calculateRowValues(uRow);
        return { ...uRow, ...calc };
      });
      setRows(updatedRows);
      setSaveSuccessMsg('Semua nilai berhasil dikosongkan di layar. Jangan lupa klik "Simpan Semua Nilai" untuk menyimpannya permanen.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }
  };

  // Save all changes
  const handleSaveAll = () => {
    const recordsToSave: GradeRecord[] = rows.map(r => {
      const t1 = typeof r.t1 === 'number' ? r.t1 : 0;
      const t2 = typeof r.t2 === 'number' ? r.t2 : 0;
      const t3 = typeof r.t3 === 'number' ? r.t3 : 0;
      const uh1 = typeof r.uh1 === 'number' ? r.uh1 : 0;
      const uh2 = typeof r.uh2 === 'number' ? r.uh2 : 0;
      const pts = typeof r.pts === 'number' ? r.pts : 0;

      return {
        id: r.recordId || `grd-${r.student.id}-${selectedMapelId}`,
        studentId: r.student.id,
        classId: selectedClassId,
        mapelId: selectedMapelId,
        semester: settings.semesterAktif,
        tahunAjaran: settings.tahunAjaran,
        triwulan: settings.semesterAktif === 'Ganjil' ? 1 : 2,
        nilaiTugas1: t1,
        nilaiTugas2: t2,
        nilaiTugas3: t3,
        nilaiFormatifAvg: r.formatifAvg,
        nilaiUH1: uh1,
        nilaiUH2: uh2,
        nilaiSumatifMateriAvg: r.uhAvg,
        nilaiPTS: pts,
        nilaiAkhir: r.nilaiAkhir,
        predikat: r.predikat,
        keterangan: r.keterangan,
        capaianKompetensi: r.capaianKompetensi,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.nama
      };
    });

    StorageService.saveBatchGrades(recordsToSave);
    setRows(prev => prev.map(row => ({ ...row, isDirty: false })));
    setSaveSuccessMsg(`Berhasil menyimpan nilai untuk kelas ${selectedClassId} (${currentSubject.nama}) dan disinkronkan ke Supabase Cloud!`);
    setSuccessPopupMsg(`Nilai siswa kelas ${selectedClassId} mata pelajaran ${currentSubject.nama} telah tersimpan dan disinkronkan ke Supabase Cloud.`);
    setShowSuccessPopup(true);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const excelData = rows.map((r, i) => ({
      'No': i + 1,
      'NIS': String(r.student.nis),
      'NISN': String(r.student.nisn || '-'),
      'Nama_Siswa': r.student.nama,
      'JK': r.student.jenisKelamin,
      'Tugas_1': typeof r.t1 === 'number' ? r.t1 : '',
      'Tugas_2': typeof r.t2 === 'number' ? r.t2 : '',
      'Tugas_3': typeof r.t3 === 'number' ? r.t3 : '',
      'Rata_Formatif': r.formatifAvg || 0,
      'UH_1': typeof r.uh1 === 'number' ? r.uh1 : '',
      'UH_2': typeof r.uh2 === 'number' ? r.uh2 : '',
      'Rata_UH': r.uhAvg || 0,
      'Nilai_PTS': typeof r.pts === 'number' ? r.pts : '',
      'Nilai_Akhir': r.nilaiAkhir || 0,
      'Predikat': r.predikat || '-',
      'Keterangan': r.keterangan || '-',
      'Capaian_Kompetensi': r.capaianKompetensi || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for readable layout
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 12 }, // NIS
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama_Siswa
      { wch: 6 },  // JK
      { wch: 10 }, // Tugas_1
      { wch: 10 }, // Tugas_2
      { wch: 10 }, // Tugas_3
      { wch: 14 }, // Rata_Formatif
      { wch: 10 }, // UH_1
      { wch: 10 }, // UH_2
      { wch: 12 }, // Rata_UH
      { wch: 12 }, // Nilai_PTS
      { wch: 12 }, // Nilai_Akhir
      { wch: 10 }, // Predikat
      { wch: 16 }, // Keterangan
      { wch: 45 }  // Capaian_Kompetensi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Nilai_${selectedClassId}`);

    const fileName = `Nilai_PTS_${selectedClassId}_${selectedMapelId}_${settings.tahunAjaran.replace('/', '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setSaveSuccessMsg(`Berhasil mengekspor format Excel: ${fileName}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDownloadTemplate = () => {
    const excelData = rows.map((r, i) => ({
      'No': i + 1,
      'NIS': String(r.student.nis),
      'NISN': String(r.student.nisn || '-'),
      'Nama_Siswa': r.student.nama,
      'JK': r.student.jenisKelamin,
      'Tugas_1': '',
      'Tugas_2': '',
      'Tugas_3': '',
      'Rata_Formatif': '',
      'UH_1': '',
      'UH_2': '',
      'Rata_UH': '',
      'Nilai_PTS': '',
      'Nilai_Akhir': '',
      'Predikat': '',
      'Keterangan': '',
      'Capaian_Kompetensi': ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 6 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 10 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 16 }, { wch: 45 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Template_${selectedClassId}`);

    const fileName = `Template_Nilai_${selectedClassId}_${selectedMapelId}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setSaveSuccessMsg(`Berhasil mengunduh template: ${fileName}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Import from Excel (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setImportStatus('File Excel kosong atau format tidak sesuai.');
          setTimeout(() => setImportStatus(null), 4000);
          return;
        }

        let matchCount = 0;
        const updatedRows = [...rows];

        jsonData.forEach((row) => {
          // Match student NIS
          const nis = String(row['NIS'] || row['nis'] || row['Nis'] || row['Nomor Induk'] || '').trim();
          if (!nis) return;

          const t1Val = row['Tugas_1'] ?? row['Tugas 1'] ?? row['T1'] ?? row['t1'];
          const t2Val = row['Tugas_2'] ?? row['Tugas 2'] ?? row['T2'] ?? row['t2'];
          const t3Val = row['Tugas_3'] ?? row['Tugas 3'] ?? row['T3'] ?? row['t3'];
          const uh1Val = row['UH_1'] ?? row['UH 1'] ?? row['UH1'] ?? row['uh1'];
          const uh2Val = row['UH_2'] ?? row['UH 2'] ?? row['UH2'] ?? row['uh2'];
          const ptsVal = row['Nilai_PTS'] ?? row['Nilai PTS'] ?? row['PTS'] ?? row['pts'];
          const capaianVal = row['Capaian_Kompetensi'] ?? row['Capaian Kompetensi'] ?? row['Capaian'] ?? row['capaian'];

          const t1 = t1Val !== undefined && t1Val !== '' ? Math.max(0, Math.min(100, Number(t1Val))) : '';
          const t2 = t2Val !== undefined && t2Val !== '' ? Math.max(0, Math.min(100, Number(t2Val))) : '';
          const t3 = t3Val !== undefined && t3Val !== '' ? Math.max(0, Math.min(100, Number(t3Val))) : '';
          const uh1 = uh1Val !== undefined && uh1Val !== '' ? Math.max(0, Math.min(100, Number(uh1Val))) : '';
          const uh2 = uh2Val !== undefined && uh2Val !== '' ? Math.max(0, Math.min(100, Number(uh2Val))) : '';
          const pts = ptsVal !== undefined && ptsVal !== '' ? Math.max(0, Math.min(100, Number(ptsVal))) : '';

          const rowIdx = updatedRows.findIndex(r => r.student.nis === nis);
          if (rowIdx >= 0) {
            const uRow: EditableGradeRow = {
              ...updatedRows[rowIdx],
              t1: isNaN(Number(t1)) ? '' : t1,
              t2: isNaN(Number(t2)) ? '' : t2,
              t3: isNaN(Number(t3)) ? '' : t3,
              uh1: isNaN(Number(uh1)) ? '' : uh1,
              uh2: isNaN(Number(uh2)) ? '' : uh2,
              pts: isNaN(Number(pts)) ? '' : pts,
              capaianKompetensi: capaianVal ? String(capaianVal).trim() : updatedRows[rowIdx].capaianKompetensi,
              isDirty: true
            };
            const calc = calculateRowValues(uRow);
            updatedRows[rowIdx] = { ...uRow, ...calc };
            matchCount++;
          }
        });

        setRows(updatedRows);
        setImportStatus(`Berhasil membaca dan mencocokkan ${matchCount} nilai siswa dari file Excel!`);
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err: any) {
        console.error('Gagal membaca file Excel:', err);
        setImportStatus('Terjadi kesalahan saat memproses file Excel.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };

    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filtered rows for search query
  const filteredRows = rows.filter(r =>
    r.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student.nis.includes(searchQuery)
  ).sort((a, b) => {
    const nameA = a.student.nama.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const nameB = b.student.nama.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Input Nilai Praktis & Cepat
              </span>
              <span className="text-xs text-slate-500">
                Format Bobot: Formatif ({settings.bobotFormatif}%) • UH ({settings.bobotUH}%) • PTS ({settings.bobotPTS}%)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Penilaian Tengah Semester (PTS) Siswa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              KKM / KKTP Mata Pelajaran {currentSubject.nama}: <strong>{currentSubject.kkm}</strong> • Tekan <em>Enter</em> untuk langsung beralih ke siswa baris berikutnya.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Fill Preset */}
            <div className="relative">
              <button
                onClick={() => setShowAutoFillMenu(!showAutoFillMenu)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200/80 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Isi Cepat Nilai</span>
              </button>

              {showAutoFillMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in duration-100">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase">
                    Pilihan Isi Cepat
                  </div>
                  <button
                    onClick={() => handleAutoFill('kkm')}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-100 text-slate-800 font-medium"
                  >
                    🎯 Isi Nilai Standar KKM ({currentSubject.kkm})
                  </button>
                  <button
                    onClick={() => handleAutoFill('acak')}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-100 text-slate-800 font-medium"
                  >
                    🎲 Simulasi Realistis (70 - 95)
                  </button>
                  <button
                    onClick={() => handleAutoFill('tinggi')}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-100 text-slate-800 font-medium"
                  >
                    ⭐ Nilai Optimal Tuntas (90)
                  </button>
                </div>
              )}
            </div>

            {/* Excel Export/Import */}
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Unduh Template Excel Kosong"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh Template</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Ekspor Data Nilai Saat Ini"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Impor Excel"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Impor Excel</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            {/* Clear Grades Button */}
            <button
              onClick={handleClearGrades}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Kosongkan Semua Nilai di Layar"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Hapus Nilai</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua Nilai</span>
            </button>
          </div>
        </div>

        {/* Success / Alert Toasts */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {importStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Class Selector (Grouped 33 classes) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pilih Kelas (33 Kelas)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="Kelas VII (11 Kelas: VII-A s.d VII-K)">
                {accessibleClasses.filter(c => c.tingkat === 'VII').map(c => (
                  <option key={c.id} value={c.id}>{c.nama} (Wali: {c.waliKelasNama})</option>
                ))}
              </optgroup>
              <optgroup label="Kelas VIII (11 Kelas: VIII-A s.d VIII-K)">
                {accessibleClasses.filter(c => c.tingkat === 'VIII').map(c => (
                  <option key={c.id} value={c.id}>{c.nama} (Wali: {c.waliKelasNama})</option>
                ))}
              </optgroup>
              <optgroup label="Kelas IX (11 Kelas: IX-A s.d IX-K)">
                {accessibleClasses.filter(c => c.tingkat === 'IX').map(c => (
                  <option key={c.id} value={c.id}>{c.nama} (Wali: {c.waliKelasNama})</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Mapel Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pilih Mata Pelajaran (11 Mapel)
            </label>
            <select
              value={selectedMapelId}
              onChange={(e) => setSelectedMapelId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kelompok} • KKM: {s.kkm})
                </option>
              ))}
            </select>
            {currentUser.role === 'GURU_MAPEL' && currentUser.mapelName && (
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Mata pelajaran utama Anda: {currentUser.mapelName} (Dapat diganti)
              </span>
            )}
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
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Information badge */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-indigo-900">
                {currentClass?.nama} • {rows.length} Siswa
              </p>
              <p className="text-[11px] text-indigo-700">
                Wali: {currentClass?.waliKelasNama}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md">
                KKM {currentSubject.kkm}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Input Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-bold text-center border-b border-slate-700">
                <th rowSpan={2} className="py-3 px-3 w-10 border-r border-slate-700">No</th>
                <th rowSpan={2} className="py-3 px-3 w-24 border-r border-slate-700 text-left">NIS</th>
                <th rowSpan={2} className="py-3 px-3 min-w-[180px] border-r border-slate-700 text-left">Nama Siswa</th>
                <th rowSpan={2} className="py-3 px-2 w-10 border-r border-slate-700">JK</th>
                <th colSpan={4} className="py-2 px-2 bg-slate-700/80 border-r border-slate-600">
                  Tugas Formatif ({settings.bobotFormatif}%)
                </th>
                <th colSpan={3} className="py-2 px-2 bg-slate-700 border-r border-slate-600">
                  Sumatif Materi / UH ({settings.bobotUH}%)
                </th>
                <th rowSpan={2} className="py-3 px-2 w-20 bg-indigo-900 border-r border-slate-700">
                  PTS / STS ({settings.bobotPTS}%)
                </th>
                <th rowSpan={2} className="py-3 px-2 w-20 bg-blue-900 border-r border-slate-700">
                  Nilai Akhir
                </th>
                <th rowSpan={2} className="py-3 px-2 w-14 border-r border-slate-700">
                  Predikat
                </th>
                <th rowSpan={2} className="py-3 px-2 w-24 border-r border-slate-700">
                  Status
                </th>
                <th rowSpan={2} className="py-3 px-3 min-w-[240px] text-left">
                  Deskripsi Capaian Kompetensi
                </th>
              </tr>
              <tr className="bg-slate-700 text-slate-200 font-semibold text-[11px] text-center border-b border-slate-600">
                <th className="py-1.5 px-1 w-14 border-r border-slate-600">Tug 1</th>
                <th className="py-1.5 px-1 w-14 border-r border-slate-600">Tug 2</th>
                <th className="py-1.5 px-1 w-14 border-r border-slate-600">Tug 3</th>
                <th className="py-1.5 px-1 w-16 bg-slate-800 text-indigo-300 font-bold border-r border-slate-600">Rerata</th>
                <th className="py-1.5 px-1 w-14 border-r border-slate-600">UH 1</th>
                <th className="py-1.5 px-1 w-14 border-r border-slate-600">UH 2</th>
                <th className="py-1.5 px-1 w-16 bg-slate-800 text-blue-300 font-bold border-r border-slate-600">Rerata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredRows.map((row, index) => {
                const isUnderKkm = row.nilaiAkhir > 0 && row.nilaiAkhir < currentSubject.kkm;

                return (
                  <tr
                    key={row.student.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.isDirty ? 'bg-amber-50/40' : ''
                    } ${isUnderKkm ? 'bg-rose-50/30' : ''}`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-sans">{index + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{row.student.nis}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{row.student.nama}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-sans">{row.student.jenisKelamin}</td>

                    {/* Tugas 1 */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="t1"
                        value={row.t1}
                        onChange={(e) => handleInputChange(row.student.id, 't1', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 't1')}
                        className="w-full text-center py-1.5 px-1 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </td>

                    {/* Tugas 2 */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="t2"
                        value={row.t2}
                        onChange={(e) => handleInputChange(row.student.id, 't2', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 't2')}
                        className="w-full text-center py-1.5 px-1 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </td>

                    {/* Tugas 3 */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="t3"
                        value={row.t3}
                        onChange={(e) => handleInputChange(row.student.id, 't3', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 't3')}
                        className="w-full text-center py-1.5 px-1 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </td>

                    {/* Formatif Avg */}
                    <td className="py-2.5 px-1 text-center font-bold text-indigo-700 bg-indigo-50/30">
                      {row.formatifAvg || '-'}
                    </td>

                    {/* UH 1 */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="uh1"
                        value={row.uh1}
                        onChange={(e) => handleInputChange(row.student.id, 'uh1', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'uh1')}
                        className="w-full text-center py-1.5 px-1 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </td>

                    {/* UH 2 */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="uh2"
                        value={row.uh2}
                        onChange={(e) => handleInputChange(row.student.id, 'uh2', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'uh2')}
                        className="w-full text-center py-1.5 px-1 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </td>

                    {/* UH Avg */}
                    <td className="py-2.5 px-1 text-center font-bold text-blue-700 bg-blue-50/30">
                      {row.uhAvg || '-'}
                    </td>

                    {/* PTS Score */}
                    <td className="p-1 bg-indigo-50/20">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-row={index}
                        data-col="pts"
                        value={row.pts}
                        onChange={(e) => handleInputChange(row.student.id, 'pts', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'pts')}
                        className="w-full text-center py-1.5 px-1 font-bold rounded-lg border border-indigo-200 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-indigo-900"
                      />
                    </td>

                    {/* Final Weighted Score */}
                    <td className="py-2.5 px-2 text-center font-black text-sm bg-blue-50/40">
                      <span className={isUnderKkm ? 'text-rose-600' : 'text-slate-900'}>
                        {row.nilaiAkhir || '-'}
                      </span>
                    </td>

                    {/* Predikat Badge */}
                    <td className="py-2.5 px-1 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        row.predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                        row.predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {row.predikat}
                      </span>
                    </td>

                    {/* Keterangan Tuntas / Belum */}
                    <td className="py-2.5 px-2 text-center font-sans">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        row.keterangan === 'Tuntas'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.keterangan}
                      </span>
                    </td>

                    {/* Deskripsi Capaian Kompetensi */}
                    <td className="p-2 font-sans">
                      <input
                        type="text"
                        value={row.capaianKompetensi}
                        onChange={(e) => handleInputChange(row.student.id, 'capaianKompetensi', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary of Input */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <span>Total Siswa: <strong>{filteredRows.length}</strong></span>
            <span>Tuntas: <strong className="text-emerald-600">{filteredRows.filter(r => r.keterangan === 'Tuntas' && r.nilaiAkhir > 0).length}</strong></span>
            <span>Perlu Bimbingan: <strong className="text-rose-600">{filteredRows.filter(r => r.keterangan === 'Perlu Bimbingan' || r.nilaiAkhir === 0).length}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pop Up Notifikasi: Data Berhasil Disimpan */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Data Berhasil Disimpan"
        message={successPopupMsg}
      />
    </div>
  );
};
