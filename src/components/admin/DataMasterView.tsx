import React, { useState, useRef, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  BookOpen,
  KeyRound,
  CheckCircle2,
  X,
  Check,
  UserPlus,
  AlertOctagon,
  ShieldAlert,
  RefreshCw,
  Download,
  Upload,
  FileSpreadsheet,
  FileUp,
  AlertCircle,
  Building2,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserAccount, Student, SchoolClass, Subject } from '../../types';
import { StorageService } from '../../services/storage';
import { ExcelService } from '../../services/excelService';
import { INITIAL_USERS } from '../../data/seedData';
import { SuccessPopup } from '../common/SuccessPopup';

export const DataMasterView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guru' | 'siswa' | 'kelas'>('guru');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');

  // Teacher State
  const [users, setUsers] = useState<UserAccount[]>(StorageService.getUsers());
  const [editingTeacher, setEditingTeacher] = useState<UserAccount | null>(null);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Class State (33 Classes)
  const [classes, setClasses] = useState<SchoolClass[]>(StorageService.getClasses());
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [classSearch, setClassSearch] = useState('');
  const [classTingkatFilter, setClassTingkatFilter] = useState<'ALL' | 'VII' | 'VIII' | 'IX'>('ALL');

  // Student State
  const [selectedClassId, setSelectedClassId] = useState<string>('VII-A');
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const subjects = StorageService.getSubjects();

  // Excel Upload States - Guru
  const teacherFileInputRef = useRef<HTMLInputElement>(null);
  const [importedTeachersPreview, setImportedTeachersPreview] = useState<{
    teachers: UserAccount[];
    errors: string[];
    fileName: string;
  } | null>(null);
  const [teacherImportMode, setTeacherImportMode] = useState<'upsert' | 'replace'>('upsert');

  // Excel Upload States - Siswa
  const studentFileInputRef = useRef<HTMLInputElement>(null);
  const [importedStudentsPreview, setImportedStudentsPreview] = useState<{
    students: Student[];
    errors: string[];
    fileName: string;
  } | null>(null);
  const [studentImportMode, setStudentImportMode] = useState<'upsert' | 'replace_class' | 'replace_all'>('upsert');

  // Excel Upload States - Kelas
  const classFileInputRef = useRef<HTMLInputElement>(null);
  const [importedClassesPreview, setImportedClassesPreview] = useState<{
    classes: Partial<SchoolClass>[];
    errors: string[];
    fileName: string;
  } | null>(null);

  // General Toast / Notification
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Delete All Data Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResultMsg, setDeleteResultMsg] = useState<{ success: boolean; message: string } | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // Student counts map for all classes
  const studentCountsByClass = useMemo(() => {
    const map: Record<string, number> = {};
    classes.forEach(c => { map[c.id] = 0; });
    students.forEach(s => {
      map[s.classId] = (map[s.classId] || 0) + 1;
    });
    return map;
  }, [classes, students]);

  const handleExecuteDelete = async () => {
    if (confirmInput.trim().toUpperCase() !== 'HAPUS') {
      alert('Silakan ketik kata "HAPUS" untuk mengonfirmasi penghapusan.');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await StorageService.clearAllData(true);
      setIsDeleting(false);
      setDeleteResultMsg(res);
      setTimeout(() => {
        setShowDeleteModal(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteResultMsg({ success: false, message: err?.message || 'Gagal menghapus data.' });
    }
  };

  // Save changes to storage
  const handleSaveTeacher = (teacher: UserAccount) => {
    let updated: UserAccount[];
    if (users.some(u => u.id === teacher.id)) {
      updated = users.map(u => u.id === teacher.id ? teacher : u);
    } else {
      updated = [...users, teacher];
    }
    setUsers(updated);
    StorageService.saveUsers(updated);
    setEditingTeacher(null);
    setIsAddTeacherOpen(false);
    showToast(`Data guru ${teacher.nama} berhasil disimpan.`);
    setPopupMsg(`Data akun guru ${teacher.nama} (${teacher.mapelName || 'Guru Mapel'}) berhasil disimpan ke sistem dan cloud.`);
    setShowSuccessPopup(true);
  };

  const handleDeleteTeacher = (id: string) => {
    if (id === 'user-admin') {
      alert('Akun Super Admin utama tidak dapat dihapus.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus akun guru ini?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      StorageService.saveUsers(updated);
      showToast('Akun guru berhasil dihapus.');
    }
  };

  const handleSaveStudent = (student: Student) => {
    let updated: Student[];
    if (students.some(s => s.id === student.id)) {
      updated = students.map(s => s.id === student.id ? student : s);
    } else {
      updated = [...students, student];
    }
    setStudents(updated);
    StorageService.saveStudents(updated);
    setEditingStudent(null);
    setIsAddStudentOpen(false);
    showToast(`Data siswa ${student.nama} berhasil disimpan.`);
    setPopupMsg(`Data siswa ${student.nama} (NIS: ${student.nis}) berhasil disimpan ke sistem dan cloud.`);
    setShowSuccessPopup(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Hapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      StorageService.saveStudents(updated);
      showToast('Data siswa berhasil dihapus.');
    }
  };

  // Save Class & Homeroom Teacher (Wali Kelas)
  const handleSaveClass = (updatedClass: SchoolClass) => {
    const updated = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
    setClasses(updated);
    StorageService.saveClasses(updated);
    setEditingClass(null);
    showToast(`Data ${updatedClass.nama} dan Wali Kelas (${updatedClass.waliKelasNama}) berhasil diperbarui!`);
    setPopupMsg(`Data ${updatedClass.nama} dan Wali Kelas (${updatedClass.waliKelasNama}) berhasil disimpan.`);
    setShowSuccessPopup(true);
  };

  // ==========================================
  // EXCEL HANDLERS - GURU
  // ==========================================
  const handleTeacherFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await ExcelService.parseTeachersFromExcel(file);
      if (res.teachers.length === 0) {
        alert('Tidak ditemukan data guru valid pada file Excel tersebut.');
        return;
      }
      setImportedTeachersPreview({
        teachers: res.teachers,
        errors: res.errors,
        fileName: file.name
      });
    } catch (err: any) {
      alert(err.message || 'Gagal membaca file Excel');
    }

    if (teacherFileInputRef.current) teacherFileInputRef.current.value = '';
  };

  const handleConfirmTeacherImport = () => {
    if (!importedTeachersPreview) return;
    const newTeachers = importedTeachersPreview.teachers;

    let finalUsers: UserAccount[];
    if (teacherImportMode === 'replace') {
      const admin = users.find(u => u.role === 'SUPER_ADMIN') || users[0];
      finalUsers = [admin, ...newTeachers.filter(t => t.id !== admin.id && t.nip !== admin.nip)];
    } else {
      const map = new Map(users.map(u => [u.nip, u]));
      newTeachers.forEach(t => map.set(t.nip, t));
      finalUsers = Array.from(map.values());
    }

    setUsers(finalUsers);
    StorageService.saveUsers(finalUsers);
    showToast(`Berhasil mengimpor ${newTeachers.length} data guru dari file Excel dan tersimpan ke Supabase!`);
    setPopupMsg(`Berhasil mengimpor dan menyimpan ${newTeachers.length} data guru ke sistem.`);
    setShowSuccessPopup(true);
    setImportedTeachersPreview(null);
  };

  // ==========================================
  // EXCEL HANDLERS - SISWA
  // ==========================================
  const handleStudentFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await ExcelService.parseStudentsFromExcel(file, selectedClassId);
      if (res.students.length === 0) {
        alert('Tidak ditemukan data siswa valid pada file Excel tersebut.');
        return;
      }
      setImportedStudentsPreview({
        students: res.students,
        errors: res.errors,
        fileName: file.name
      });
    } catch (err: any) {
      alert(err.message || 'Gagal membaca file Excel');
    }

    if (studentFileInputRef.current) studentFileInputRef.current.value = '';
  };

  const handleConfirmStudentImport = () => {
    if (!importedStudentsPreview) return;
    const newStudents = importedStudentsPreview.students;

    let finalStudents: Student[];
    if (studentImportMode === 'replace_all') {
      finalStudents = newStudents;
    } else if (studentImportMode === 'replace_class') {
      const otherClassStudents = students.filter(s => s.classId !== selectedClassId);
      const filteredForClass = newStudents.map(s => ({ ...s, classId: selectedClassId }));
      finalStudents = [...otherClassStudents, ...filteredForClass];
    } else {
      const map = new Map(students.map(s => [`${s.classId}_${s.nis}`, s]));
      newStudents.forEach(s => map.set(`${s.classId}_${s.nis}`, s));
      finalStudents = Array.from(map.values());
    }

    setStudents(finalStudents);
    StorageService.saveStudents(finalStudents);
    showToast(`Berhasil mengimpor ${newStudents.length} data siswa dari Excel dan tersimpan ke database!`);
    setPopupMsg(`Berhasil mengimpor dan menyimpan ${newStudents.length} data siswa ke database.`);
    setShowSuccessPopup(true);
    setImportedStudentsPreview(null);
  };

  // ==========================================
  // EXCEL HANDLERS - KELAS
  // ==========================================
  const handleClassFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await ExcelService.parseClassesFromExcel(file);
      if (res.classes.length === 0) {
        alert('Tidak ditemukan data kelas valid pada file Excel tersebut.');
        return;
      }
      setImportedClassesPreview({
        classes: res.classes,
        errors: res.errors,
        fileName: file.name
      });
    } catch (err: any) {
      alert(err.message || 'Gagal membaca file Excel kelas');
    }

    if (classFileInputRef.current) classFileInputRef.current.value = '';
  };

  const handleConfirmClassImport = () => {
    if (!importedClassesPreview) return;
    const incomingClasses = importedClassesPreview.classes;

    const classMap = new Map(classes.map(c => [c.id, c]));
    incomingClasses.forEach(inc => {
      if (!inc.id) return;
      const current = classMap.get(inc.id);
      if (current) {
        classMap.set(inc.id, {
          ...current,
          nama: inc.nama || current.nama,
          waliKelasNama: inc.waliKelasNama ?? current.waliKelasNama,
          waliKelasNip: inc.waliKelasNip ?? current.waliKelasNip,
        });
      }
    });

    const updated = Array.from(classMap.values());
    setClasses(updated);
    StorageService.saveClasses(updated);
    showToast(`Berhasil memperbarui ${incomingClasses.length} data kelas & wali kelas dari Excel!`);
    setPopupMsg(`Berhasil memperbarui dan menyimpan ${incomingClasses.length} data kelas & wali kelas.`);
    setShowSuccessPopup(true);
    setImportedClassesPreview(null);
  };

  // Filtered lists: GURU MAPEL ONLY (Admin is separated!)
  const teachersOnly = useMemo(() => users.filter(u => u.role === 'GURU_MAPEL'), [users]);
  const superAdminAccount = useMemo(() => users.find(u => u.role === 'SUPER_ADMIN') || INITIAL_USERS[0], [users]);

  const filteredTeachers = teachersOnly.filter(u =>
    u.nama.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    u.nip.includes(teacherSearch) ||
    (u.mapelName && u.mapelName.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  const filteredStudents = students
    .filter(s => s.classId === selectedClassId)
    .filter(s =>
      s.nama.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nis.includes(studentSearch)
    );

  const filteredClasses = classes.filter(c => {
    const matchTingkat = classTingkatFilter === 'ALL' || c.tingkat === classTingkatFilter;
    const matchSearch =
      c.nama.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.waliKelasNama.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.waliKelasNip.includes(classSearch);
    return matchTingkat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Tab Switcher & Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Hak Akses Super Admin
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Manajemen Data Master
            </h1>
            <p className="text-xs text-slate-500">
              Kelola data guru mapel, data siswa, dan 33 kelas lengkap dengan Nama Wali Kelas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('guru')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'guru' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Guru ({teachersOnly.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('siswa')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'siswa' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Data Siswa ({students.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('kelas')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'kelas' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Data Kelas (33 Kelas)</span>
              </button>
            </div>

            <button
              onClick={() => {
                setConfirmInput('');
                setDeleteResultMsg(null);
                setShowDeleteModal(true);
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUBTAB 1: GURU MAPEL */}
      {/* ============================================================ */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Card Status Akun Super Administrator Terpisah */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Akun Super Administrator Sistem
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    Terpisah (Bukan Bagian Guru)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Username: <strong className="font-mono text-indigo-700 font-extrabold">{superAdminAccount.nip}</strong> • 
                  Password: <strong className="font-mono text-slate-800">••••••••</strong> (Superadmin) • 
                  Nama: <strong className="text-slate-800">{superAdminAccount.nama}</strong>
                </p>
                <span className="text-[11px] text-amber-900 font-medium block mt-0.5">
                  *Status terpisah independen: Pengendali penuh sistem, 33 kelas, pengaturan tahun ajaran, KOP rapor A4, dan database.
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Sistem Terpisah</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari NIP, nama guru, atau mapel..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-72"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Excel Actions & Add Teacher */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={ExcelService.downloadTeacherTemplate}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Download Template Format Excel untuk Guru"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Template Excel Guru</span>
              </button>

              <button
                onClick={() => ExcelService.exportTeachersToExcel(teachersOnly)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Ekspor Seluruh Data Guru ke Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor Guru ({teachersOnly.length})</span>
              </button>

              <button
                onClick={() => teacherFileInputRef.current?.click()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                title="Unggah dan impor file Excel guru"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Excel Guru</span>
              </button>
              <input
                type="file"
                ref={teacherFileInputRef}
                onChange={handleTeacherFileSelect}
                accept=".xlsx,.xls"
                className="hidden"
              />

              <button
                onClick={() => setIsAddTeacherOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Manual</span>
              </button>
            </div>
          </div>

          {/* Table Guru */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-44">NIP / NUPTK</th>
                  <th className="py-3 px-4">Nama Lengkap Guru</th>
                  <th className="py-3 px-3">Peran / Role</th>
                  <th className="py-3 px-3">Mapel Diampu</th>
                  <th className="py-3 px-3">Kelas Yang Diajar</th>
                  <th className="py-3 px-3 text-center">Password</th>
                  <th className="py-3 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-500">{i + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{u.nip}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {u.nama}
                      {u.isWaliKelas && (
                        <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Wali {u.waliKelasId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Guru Mapel'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {u.mapelName || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-bold text-indigo-700">{u.assignedClassIds.length} Kelas</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                        {u.assignedClassIds.slice(0, 5).join(', ')}{u.assignedClassIds.length > 5 ? '...' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      ••••••••
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingTeacher(u)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Guru"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteTeacher(u.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 2: DATA SISWA 33 KELAS */}
      {/* ============================================================ */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter Kelas & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Pilih Kelas:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <optgroup label="Tingkat VII (11 Kelas)">
                  {classes.filter(c => c.tingkat === 'VII').map(c => (
                    <option key={c.id} value={c.id}>{c.nama} ({studentCountsByClass[c.id] || 0} Siswa)</option>
                  ))}
                </optgroup>
                <optgroup label="Tingkat VIII (11 Kelas)">
                  {classes.filter(c => c.tingkat === 'VIII').map(c => (
                    <option key={c.id} value={c.id}>{c.nama} ({studentCountsByClass[c.id] || 0} Siswa)</option>
                  ))}
                </optgroup>
                <optgroup label="Tingkat IX (11 Kelas)">
                  {classes.filter(c => c.tingkat === 'IX').map(c => (
                    <option key={c.id} value={c.id}>{c.nama} ({studentCountsByClass[c.id] || 0} Siswa)</option>
                  ))}
                </optgroup>
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Excel Actions & Add Student */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelService.downloadStudentTemplate(selectedClassId)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title={`Unduh format Excel untuk kelas ${selectedClassId}`}
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Template Excel Siswa</span>
              </button>

              <button
                onClick={() => ExcelService.exportStudentsToExcel(students, selectedClassId)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title={`Ekspor data siswa ${selectedClassId} ke Excel`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor Siswa ({selectedClassId})</span>
              </button>

              <button
                onClick={() => ExcelService.exportStudentsToExcel(students, 'ALL')}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Ekspor seluruh 33 kelas sekaligus"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Ekspor 33 Kelas</span>
              </button>

              <button
                onClick={() => studentFileInputRef.current?.click()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                title="Unggah dan impor file Excel siswa"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Excel Siswa</span>
              </button>
              <input
                type="file"
                ref={studentFileInputRef}
                onChange={handleStudentFileSelect}
                accept=".xlsx,.xls"
                className="hidden"
              />

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Table Siswa */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4 w-32">NISN</th>
                  <th className="py-3 px-4">Nama Peserta Didik</th>
                  <th className="py-3 px-2 text-center w-12">JK</th>
                  <th className="py-3 px-4">Alamat Domisili</th>
                  <th className="py-3 px-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{s.nis}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{s.nisn}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.nama}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600 font-bold">{s.jenisKelamin}</td>
                    <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">{s.alamat || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingStudent(s)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 3: DATA KELAS (33 KELAS & WALI KELAS) */}
      {/* ============================================================ */}
      {activeTab === 'kelas' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter Tingkat & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Filter Tingkat:</label>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setClassTingkatFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    classTingkatFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Semua (33)
                </button>
                <button
                  onClick={() => setClassTingkatFilter('VII')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    classTingkatFilter === 'VII' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Kelas VII (11)
                </button>
                <button
                  onClick={() => setClassTingkatFilter('VIII')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    classTingkatFilter === 'VIII' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Kelas VIII (11)
                </button>
                <button
                  onClick={() => setClassTingkatFilter('IX')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    classTingkatFilter === 'IX' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Kelas IX (11)
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari kelas atau nama wali..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Excel Actions for Classes */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={ExcelService.downloadClassTemplate}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Unduh Template Excel 33 Kelas & Wali Kelas"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Template Excel Kelas</span>
              </button>

              <button
                onClick={() => ExcelService.exportClassesToExcel(classes, studentCountsByClass)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Ekspor seluruh data 33 kelas dan wali kelas ke Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor Kelas (.xlsx)</span>
              </button>

              <button
                onClick={() => classFileInputRef.current?.click()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                title="Upload file Excel untuk update massal nama kelas dan wali kelas"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Excel Kelas</span>
              </button>
              <input
                type="file"
                ref={classFileInputRef}
                onChange={handleClassFileSelect}
                accept=".xlsx,.xls"
                className="hidden"
              />
            </div>
          </div>

          {/* Table Data Kelas */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-24 text-center">Kode Kelas</th>
                  <th className="py-3 px-3 w-24 text-center">Tingkat</th>
                  <th className="py-3 px-4 w-44">Nama Resmi Kelas</th>
                  <th className="py-3 px-4">Nama Lengkap Wali Kelas</th>
                  <th className="py-3 px-4 w-40">NIP Wali Kelas</th>
                  <th className="py-3 px-3 text-center w-28">Jumlah Siswa</th>
                  <th className="py-3 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 text-center font-bold font-mono text-indigo-700">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200">
                        {c.id}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-600">
                      Tingkat {c.tingkat}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {c.nama}
                    </td>
                    <td className="py-3 px-4">
                      {c.waliKelasNama ? (
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{c.waliKelasNama}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          Belum Ditugaskan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.waliKelasNip || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 text-[11px]">
                        {studentCountsByClass[c.id] || 0} Siswa
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setEditingClass(c)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl font-bold transition-all border border-indigo-200 hover:border-indigo-600 flex items-center justify-center gap-1.5 mx-auto active:scale-95 shadow-2xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Kelas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL EDIT DATA KELAS & WALI KELAS */}
      {/* ============================================================ */}
      {editingClass && (
        <ClassEditModal
          schoolClass={editingClass}
          teachers={users}
          onSave={handleSaveClass}
          onClose={() => setEditingClass(null)}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL PREVIEW UPLOAD EXCEL KELAS */}
      {/* ============================================================ */}
      {importedClassesPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-black text-sm text-slate-900">
                  Pratinjau Impor Excel Data Kelas ({importedClassesPreview.classes.length} Kelas)
                </h3>
              </div>
              <button
                onClick={() => setImportedClassesPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <p className="text-slate-600">
                File: <strong className="text-indigo-600">{importedClassesPreview.fileName}</strong>. Memperbarui nama kelas dan nama wali kelas secara otomatis.
              </p>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="py-2 px-3">ID Kelas</th>
                      <th className="py-2 px-3">Nama Kelas Baru</th>
                      <th className="py-2 px-3">Nama Wali Kelas</th>
                      <th className="py-2 px-3">NIP Wali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedClassesPreview.classes.slice(0, 8).map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">{c.id}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{c.nama}</td>
                        <td className="py-2 px-3">{c.waliKelasNama || '-'}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{c.waliKelasNip || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importedClassesPreview.classes.length > 8 && (
                <p className="text-[10px] text-slate-400 text-center italic">
                  + {importedClassesPreview.classes.length - 8} kelas lainnya...
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setImportedClassesPreview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClassImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan 33 Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PREVIEW UPLOAD EXCEL GURU */}
      {/* ============================================================ */}
      {importedTeachersPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-black text-sm text-slate-900">
                  Pratinjau Impor Excel Data Guru ({importedTeachersPreview.teachers.length} Guru)
                </h3>
              </div>
              <button
                onClick={() => setImportedTeachersPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <p className="text-slate-600">
                File: <strong className="text-indigo-600">{importedTeachersPreview.fileName}</strong>. Ditemukan{' '}
                <strong>{importedTeachersPreview.teachers.length} akun guru</strong> yang siap diimpor.
              </p>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="py-2 px-3">NIP/NUPTK</th>
                      <th className="py-2 px-3">Nama Lengkap</th>
                      <th className="py-2 px-2">Role</th>
                      <th className="py-2 px-3">Mapel</th>
                      <th className="py-2 px-2">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedTeachersPreview.teachers.slice(0, 6).map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{t.nip}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{t.nama}</td>
                        <td className="py-2 px-2">{t.role}</td>
                        <td className="py-2 px-3">{t.mapelName}</td>
                        <td className="py-2 px-2">{t.assignedClassIds.length} Kelas</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importedTeachersPreview.teachers.length > 6 && (
                <p className="text-[10px] text-slate-400 text-center italic">
                  + {importedTeachersPreview.teachers.length - 6} guru lainnya akan ikut terimpor...
                </p>
              )}

              {/* Import Mode Options */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block">Metode Impor:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="teacherMode"
                    checked={teacherImportMode === 'upsert'}
                    onChange={() => setTeacherImportMode('upsert')}
                    className="text-indigo-600"
                  />
                  <span>
                    <strong>Tambahkan / Perbarui (Upsert)</strong> — Update akun yang sudah ada (berdasarkan NIP) dan tambahkan guru baru.
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="teacherMode"
                    checked={teacherImportMode === 'replace'}
                    onChange={() => setTeacherImportMode('replace')}
                    className="text-indigo-600"
                  />
                  <span>
                    <strong>Ganti Seluruh Data Guru</strong> — Mengganti daftar guru yang ada dengan data dari file Excel (Akun Super Admin tetap aman).
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setImportedTeachersPreview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmTeacherImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Terapkan Data Guru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PREVIEW UPLOAD EXCEL SISWA */}
      {/* ============================================================ */}
      {importedStudentsPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-black text-sm text-slate-900">
                  Pratinjau Impor Excel Data Siswa ({importedStudentsPreview.students.length} Siswa)
                </h3>
              </div>
              <button
                onClick={() => setImportedStudentsPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <p className="text-slate-600">
                File: <strong className="text-indigo-600">{importedStudentsPreview.fileName}</strong>. Ditemukan{' '}
                <strong>{importedStudentsPreview.students.length} data siswa</strong> yang siap diunggah ke database.
              </p>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3">NIS</th>
                      <th className="py-2 px-3">Nama Peserta Didik</th>
                      <th className="py-2 px-2">JK</th>
                      <th className="py-2 px-3">Alamat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedStudentsPreview.students.slice(0, 6).map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-indigo-700">{s.classId}</td>
                        <td className="py-2 px-3 font-mono">{s.nis}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{s.nama}</td>
                        <td className="py-2 px-2 text-center font-bold">{s.jenisKelamin}</td>
                        <td className="py-2 px-3 text-slate-500 truncate max-w-xs">{s.alamat || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importedStudentsPreview.students.length > 6 && (
                <p className="text-[10px] text-slate-400 text-center italic">
                  + {importedStudentsPreview.students.length - 6} siswa lainnya akan ikut terimpor...
                </p>
              )}

              {/* Import Mode Options */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block">Metode Impor Siswa:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="studentMode"
                    checked={studentImportMode === 'upsert'}
                    onChange={() => setStudentImportMode('upsert')}
                    className="text-indigo-600"
                  />
                  <span>
                    <strong>Tambahkan / Perbarui (Upsert)</strong> — Update data siswa yang NIS-nya cocok dan tambahkan siswa baru.
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="studentMode"
                    checked={studentImportMode === 'replace_class'}
                    onChange={() => setStudentImportMode('replace_class')}
                    className="text-indigo-600"
                  />
                  <span>
                    <strong>Ganti Hanya Siswa di Kelas {selectedClassId}</strong> — Siswa kelas lain tetap aman.
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="studentMode"
                    checked={studentImportMode === 'replace_all'}
                    onChange={() => setStudentImportMode('replace_all')}
                    className="text-indigo-600"
                  />
                  <span>
                    <strong>Ganti Seluruh Data Siswa (33 Kelas)</strong> — Cocok untuk upload serentak awal tahun ajaran baru.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setImportedStudentsPreview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmStudentImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Terapkan Data Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH GURU MANUAL */}
      {(editingTeacher || isAddTeacherOpen) && (
        <TeacherFormModal
          teacher={editingTeacher}
          classes={classes}
          subjects={subjects}
          onSave={handleSaveTeacher}
          onClose={() => {
            setEditingTeacher(null);
            setIsAddTeacherOpen(false);
          }}
        />
      )}

      {/* MODAL EDIT / TAMBAH SISWA MANUAL */}
      {(editingStudent || isAddStudentOpen) && (
        <StudentFormModal
          student={editingStudent}
          currentClassId={selectedClassId}
          onSave={handleSaveStudent}
          onClose={() => {
            setEditingStudent(null);
            setIsAddStudentOpen(false);
          }}
        />
      )}

      {/* MODAL KONFIRMASI HAPUS SEMUA DATA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-black text-sm text-slate-900">Konfirmasi Hapus Semua Data</h3>
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
                  PERINGATAN: Anda akan menghapus seluruh data nilai, presensi, data peserta didik 33 kelas, dan akun guru mapel tambahan!
                </p>
                <p className="text-[11px] text-rose-700">
                  Data yang terhapus di browser lokal juga akan disinkronkan dan dibersihkan dari cloud database Supabase. Akun Super Admin Anda akan tetap dipertahankan.
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
                <div className={`p-2.5 rounded-xl font-medium ${
                  deleteResultMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
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
                  <span>{isDeleting ? 'Menghapus Data...' : 'Ya, Hapus Semua Data'}</span>
                </button>
              </div>
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

// ==========================================
// MODAL EDIT DATA KELAS & WALI KELAS
// ==========================================
const ClassEditModal: React.FC<{
  schoolClass: SchoolClass;
  teachers: UserAccount[];
  onSave: (updatedClass: SchoolClass) => void;
  onClose: () => void;
}> = ({ schoolClass, teachers, onSave, onClose }) => {
  const [nama, setNama] = useState(schoolClass.nama);
  const [waliKelasNama, setWaliKelasNama] = useState(schoolClass.waliKelasNama);
  const [waliKelasNip, setWaliKelasNip] = useState(schoolClass.waliKelasNip);
  const [tahunAjaran, setTahunAjaran] = useState(schoolClass.tahunAjaran);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(schoolClass.semester);

  // Quick select teacher handler
  const handleSelectTeacher = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = e.target.value;
    if (!teacherId) return;
    const found = teachers.find(t => t.id === teacherId);
    if (found) {
      setWaliKelasNama(found.nama);
      setWaliKelasNip(found.nip);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Nama kelas tidak boleh kosong.');
      return;
    }

    onSave({
      ...schoolClass,
      nama: nama.trim(),
      waliKelasNama: waliKelasNama.trim(),
      waliKelasNip: waliKelasNip.trim(),
      tahunAjaran: tahunAjaran.trim(),
      semester,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Building2 className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900">
              Edit Data Kelas {schoolClass.id} & Wali Kelas
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode / ID Kelas</label>
              <input
                type="text"
                value={schoolClass.id}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold font-mono text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tingkat</label>
              <input
                type="text"
                value={`Tingkat ${schoolClass.tingkat}`}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Resmi Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Kelas VII-A atau Kelas 7 Unggulan A"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Nama kelas ini yang akan tercetak pada kop dan lembar Rapor PTS siswa.
            </span>
          </div>

          {/* Quick Dropdown: Pilih Guru Terdaftar */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <label className="font-bold text-indigo-950 text-[11px]">
                Pilih Cepat Wali Kelas dari Guru Terdaftar:
              </label>
            </div>
            <select
              onChange={handleSelectTeacher}
              defaultValue=""
              className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>-- Pilih Guru (Otomatis isi Nama & NIP) --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nama} ({t.mapelName || 'Guru'}) - NIP: {t.nip}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Lengkap Wali Kelas (dengan Gelar)
            </label>
            <input
              type="text"
              value={waliKelasNama}
              onChange={(e) => setWaliKelasNama(e.target.value)}
              placeholder="Contoh: Dra. Hj. Siti Rahmawati, M.Pd."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              NIP Wali Kelas (18 Digit)
            </label>
            <input
              type="text"
              value={waliKelasNip}
              onChange={(e) => setWaliKelasNip(e.target.value)}
              placeholder="Contoh: 198005122008012011"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Data Kelas & Wali</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Guru
const TeacherFormModal: React.FC<{
  teacher: UserAccount | null;
  classes: SchoolClass[];
  subjects: Subject[];
  onSave: (teacher: UserAccount) => void;
  onClose: () => void;
}> = ({ teacher, classes, subjects, onSave, onClose }) => {
  const [nip, setNip] = useState(teacher?.nip || '');
  const [nama, setNama] = useState(teacher?.nama || '');
  const [mapelId, setMapelId] = useState(teacher?.mapelId || subjects[0]?.id || 'MTK');
  const [password, setPassword] = useState(teacher?.password || 'guru123');
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>(teacher?.assignedClassIds || []);

  const toggleClass = (classId: string) => {
    if (assignedClassIds.includes(classId)) {
      setAssignedClassIds(assignedClassIds.filter(id => id !== classId));
    } else {
      setAssignedClassIds([...assignedClassIds, classId]);
    }
  };

  const selectAllTingkat = (tingkat: 'VII' | 'VIII' | 'IX') => {
    const tingkatIds = classes.filter(c => c.tingkat === tingkat).map(c => c.id);
    const allSelected = tingkatIds.every(id => assignedClassIds.includes(id));
    if (allSelected) {
      setAssignedClassIds(assignedClassIds.filter(id => !tingkatIds.includes(id)));
    } else {
      setAssignedClassIds(Array.from(new Set([...assignedClassIds, ...tingkatIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip.trim() || !nama.trim()) {
      alert('NIP dan Nama tidak boleh kosong.');
      return;
    }
    const chosenSubject = subjects.find(s => s.id === mapelId);

    const saved: UserAccount = {
      id: teacher?.id || `user-guru-${Date.now()}`,
      nip: nip.trim(),
      nama: nama.trim(),
      role: 'GURU_MAPEL',
      mapelId,
      mapelName: chosenSubject?.nama || 'Mata Pelajaran',
      assignedClassIds,
      password: password.trim() || 'guru123',
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">
            {teacher ? 'Edit Akun Guru Mapel' : 'Tambah Guru Mapel Baru'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="18 digit NIP..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Guru (Gelar)</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Drs. ..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran Yang Diampu</label>
              <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Penugasan Kelas dari 33 Kelas */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">
                Pilih Kelas Yang Diajar ({assignedClassIds.length} dari 33 Kelas Dipilih)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => selectAllTingkat('VII')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold"
                >
                  Semua Kelas VII
                </button>
                <button
                  type="button"
                  onClick={() => selectAllTingkat('VIII')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold"
                >
                  Semua Kelas VIII
                </button>
                <button
                  type="button"
                  onClick={() => selectAllTingkat('IX')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold"
                >
                  Semua Kelas IX
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto grid grid-cols-3 sm:grid-cols-6 gap-2">
              {classes.map(c => {
                const isSelected = assignedClassIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.id)}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {c.nama.replace('Kelas ', '')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
            >
              Simpan Data Guru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Siswa
const StudentFormModal: React.FC<{
  student: Student | null;
  currentClassId: string;
  onSave: (student: Student) => void;
  onClose: () => void;
}> = ({ student, currentClassId, onSave, onClose }) => {
  const [nis, setNis] = useState(student?.nis || '');
  const [nisn, setNisn] = useState(student?.nisn || '');
  const [nama, setNama] = useState(student?.nama || '');
  const [jk, setJk] = useState<'L' | 'P'>(student?.jenisKelamin || 'L');
  const [alamat, setAlamat] = useState(student?.alamat || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !nama.trim()) {
      alert('NIS dan Nama Siswa tidak boleh kosong.');
      return;
    }

    const saved: Student = {
      id: student?.id || `std-${currentClassId}-${Date.now()}`,
      nis: nis.trim(),
      nisn: nisn.trim() || '0012345678',
      nama: nama.trim(),
      jenisKelamin: jk,
      classId: currentClassId,
      alamat: alamat.trim()
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">
            {student ? 'Edit Data Siswa' : `Tambah Siswa (${currentClassId})`}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
            <input
              type="text"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">NISN (10 Digit)</label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Peserta Didik</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="jk"
                  checked={jk === 'L'}
                  onChange={() => setJk('L')}
                />
                <span>Laki-laki (L)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="jk"
                  checked={jk === 'P'}
                  onChange={() => setJk('P')}
                />
                <span>Perempuan (P)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
            >
              Simpan Siswa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
