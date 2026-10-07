import {
  SchoolClass,
  Subject,
  UserAccount,
  Student,
  GradeRecord,
  SchoolSettings,
  AttendanceRecord,
  StudentReportSummary,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_SCHOOL_SETTINGS,
  calculateGradeDerived,
} from '../data/seedData';
import { SupabaseService } from './supabase';

const STORAGE_KEYS = {
  SETTINGS: 'erapor_settings_v1',
  CLASSES: 'erapor_classes_v1',
  SUBJECTS: 'erapor_subjects_v1',
  USERS: 'erapor_users_v1',
  STUDENTS: 'erapor_students_v1',
  GRADES: 'erapor_grades_v1',
  ATTENDANCE: 'erapor_attendance_v1',
  CURRENT_USER: 'erapor_current_user_v1',
};

// Safe JSON Parse Helper
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving to localStorage [${key}]:`, err);
  }
}

export const StorageService = {
  // Reset all to default seed data
  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.GRADES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  },

  // Clear/Hapus Seluruh Nilai Rapor PTS (Kosongkan nilai 33 kelas)
  clearAllGrades: async (syncSupabase: boolean = true): Promise<{ success: boolean; message: string }> => {
    setStored(STORAGE_KEYS.GRADES, []);
    if (syncSupabase) {
      await SupabaseService.deleteAllDataFromSupabase('grades_only');
    }
    return { success: true, message: 'Seluruh nilai rapor siswa di 33 kelas telah berhasil dihapus dan dikosongkan.' };
  },

  // Clear/Hapus Seluruh Data Siswa & Nilai
  clearAllStudentsAndGrades: async (syncSupabase: boolean = true): Promise<{ success: boolean; message: string }> => {
    setStored(STORAGE_KEYS.GRADES, []);
    setStored(STORAGE_KEYS.ATTENDANCE, []);
    setStored(STORAGE_KEYS.STUDENTS, []);
    if (syncSupabase) {
      await SupabaseService.deleteAllDataFromSupabase('all');
    }
    return { success: true, message: 'Seluruh data siswa, presensi, dan nilai telah berhasil dihapus.' };
  },

  // Clear/Hapus Data Siswa (per kelas atau seluruh 33 kelas)
  clearStudents: async (classId?: string, syncSupabase: boolean = true): Promise<{ success: boolean; message: string }> => {
    if (classId && classId !== 'ALL') {
      const allStudents = StorageService.getStudents();
      const updatedStudents = allStudents.filter(s => s.classId !== classId);
      setStored(STORAGE_KEYS.STUDENTS, updatedStudents);

      const allGrades = getStored<GradeRecord[]>(STORAGE_KEYS.GRADES, []);
      const updatedGrades = allGrades.filter(g => g.classId !== classId);
      setStored(STORAGE_KEYS.GRADES, updatedGrades);

      const allAtt = getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
      const updatedAtt = allAtt.filter(a => a.classId !== classId);
      setStored(STORAGE_KEYS.ATTENDANCE, updatedAtt);

      if (syncSupabase) {
        await SupabaseService.deleteStudentsFromSupabase(classId);
      }
      return { success: true, message: `Data siswa & nilai untuk kelas ${classId} berhasil dihapus.` };
    }

    setStored(STORAGE_KEYS.STUDENTS, []);
    setStored(STORAGE_KEYS.GRADES, []);
    setStored(STORAGE_KEYS.ATTENDANCE, []);

    if (syncSupabase) {
      await SupabaseService.deleteStudentsFromSupabase();
    }
    return { success: true, message: 'Seluruh data siswa (33 kelas) beserta nilai telah berhasil dihapus.' };
  },

  // Clear/Hapus Data Akun Guru Mapel (Super Admin selalu dipertahankan)
  clearTeachers: async (syncSupabase: boolean = true): Promise<{ success: boolean; message: string }> => {
    const users = StorageService.getUsers();
    const adminUser = users.find(u => u.role === 'SUPER_ADMIN') || INITIAL_USERS[0];
    setStored(STORAGE_KEYS.USERS, [adminUser]);

    if (syncSupabase) {
      await SupabaseService.deleteTeachersFromSupabase();
    }
    return { success: true, message: 'Seluruh akun guru mapel berhasil dihapus. Akun Super Admin tetap aman.' };
  },

  // Clear/Hapus Data Kelas
  clearClasses: async (syncSupabase: boolean = true): Promise<{ success: boolean; message: string }> => {
    setStored(STORAGE_KEYS.CLASSES, []);

    if (syncSupabase) {
      await SupabaseService.deleteClassesFromSupabase();
    }
    return { success: true, message: 'Seluruh data kelas berhasil dihapus.' };
  },

  // Clear/Hapus Semua Data Total (Nilai, Siswa, Guru Tambahan)
  clearAllData: async (syncSupabase: boolean = true): Promise<{ success: boolean; message: string }> => {
    setStored(STORAGE_KEYS.GRADES, []);
    setStored(STORAGE_KEYS.ATTENDANCE, []);
    setStored(STORAGE_KEYS.STUDENTS, []);
    
    // Keep Super Admin account so admin is never locked out
    const users = StorageService.getUsers();
    const adminUser = users.find(u => u.role === 'SUPER_ADMIN') || INITIAL_USERS[0];
    setStored(STORAGE_KEYS.USERS, [adminUser]);

    if (syncSupabase) {
      await SupabaseService.deleteAllDataFromSupabase('all');
    }
    return { success: true, message: 'Seluruh data aplikasi (nilai, siswa, akun guru) telah dibersihkan secara total.' };
  },

  // Settings
  getSettings: (): SchoolSettings => {
    const s = getStored<SchoolSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTINGS);
    return {
      ...INITIAL_SCHOOL_SETTINGS,
      ...s,
      logoPemdaUrl: s.logoPemdaUrl !== undefined ? s.logoPemdaUrl : INITIAL_SCHOOL_SETTINGS.logoPemdaUrl,
      logoSekolahUrl: (s.logoSekolahUrl && !s.logoSekolahUrl.startsWith('data:image/svg+xml') && s.logoSekolahUrl !== 'https://i.ibb.co.com/rGJLMWct/LOGO-SEKOLAH-3-D-SMPN-1-RAJAPOLAH.png') ? s.logoSekolahUrl : INITIAL_SCHOOL_SETTINGS.logoSekolahUrl,
    };
  },
  saveSettings: (settings: SchoolSettings) => {
    setStored(STORAGE_KEYS.SETTINGS, settings);
    // Asynchronous Supabase sync (non-blocking)
    SupabaseService.syncSettings(settings).catch(() => {});
  },

  // Classes (33 Classes)
  getClasses: (): SchoolClass[] => {
    return getStored<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  },
  saveClasses: (classes: SchoolClass[]) => {
    setStored(STORAGE_KEYS.CLASSES, classes);
    SupabaseService.syncClasses(classes).catch(() => {});
  },

  // Subjects (11 Subjects - Seluruhnya Kelompok A & Muatan Lokal)
  getSubjects: (): Subject[] => {
    const list = getStored<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    let updated = false;
    
    // Fallback normalizer for kelompok
    let normalized = list.map(s => {
      if ((s.kelompok as string) === 'Kelompok B (Umum)' && s.id !== 'PRAKARYA') {
        updated = true;
        return { ...s, kelompok: 'Kelompok A (Umum)' as const };
      }
      return s;
    });

    // Check if Prakarya is missing (to support older accounts)
    const hasPrakarya = normalized.some(s => s.id === 'PRAKARYA');
    if (!hasPrakarya) {
      const prakarya = INITIAL_SUBJECTS.find(s => s.id === 'PRAKARYA');
      if (prakarya) {
        // Insert before Mulok
        const mulokIndex = normalized.findIndex(s => s.id === 'MULOK');
        if (mulokIndex !== -1) {
          normalized.splice(mulokIndex, 0, prakarya);
        } else {
          normalized.push(prakarya);
        }
        updated = true;
      }
    }

    if (updated) {
      // Re-order urutan
      normalized = normalized.map((s, index) => ({ ...s, urutan: index + 1 }));
      setStored(STORAGE_KEYS.SUBJECTS, normalized);
      SupabaseService.syncSubjects(normalized).catch(() => {});
    }
    return normalized;
  },
  saveSubjects: (subjects: Subject[]) => {
    setStored(STORAGE_KEYS.SUBJECTS, subjects);
    SupabaseService.syncSubjects(subjects).catch(() => {});
  },

  // Users (Super Admin & Guru Mapel)
  getUsers: (): UserAccount[] => {
    let list = getStored<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

    // Hapus akun contoh guru jika masih tersimpan di localStorage browser
    const sampleGuruIds = [
      'user-guru-mtk', 'user-guru-bindo', 'user-guru-ipa', 'user-guru-infor',
      'user-guru-paibp', 'user-guru-ppkn', 'user-guru-bing', 'user-guru-ips',
      'user-guru-pjok', 'user-guru-seni', 'user-guru-mulok'
    ];
    const filtered = list.filter(u => !sampleGuruIds.includes(u.id));
    if (filtered.length !== list.length) {
      list = filtered;
      setStored(STORAGE_KEYS.USERS, list);
    }

    // Ensure Super Admin has Username: Superadmin and Password: Superadmin
    const adminIndex = list.findIndex(u => u.role === 'SUPER_ADMIN' || u.id === 'user-admin');
    if (adminIndex !== -1) {
      const curr = list[adminIndex];
      if (curr.nip !== 'Superadmin' || curr.password !== 'Superadmin') {
        list[adminIndex] = {
          ...curr,
          id: 'user-admin',
          nip: 'Superadmin',
          username: 'Superadmin',
          nama: 'Super Administrator',
          password: 'Superadmin',
          role: 'SUPER_ADMIN'
        };
        setStored(STORAGE_KEYS.USERS, list);
      }
    } else {
      list = [INITIAL_USERS[0], ...list];
      setStored(STORAGE_KEYS.USERS, list);
    }
    return list;
  },
  saveUsers: (users: UserAccount[]) => {
    setStored(STORAGE_KEYS.USERS, users);
    SupabaseService.syncUsers(users).catch(() => {});
  },

  // Current logged in user (Sesi aktif disimpan per tab/session browser)
  getCurrentUser: (): UserAccount | null => {
    try {
      const sessionRaw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (sessionRaw) {
        const user = JSON.parse(sessionRaw);
        if (user) {
          if (user.role === 'SUPER_ADMIN' || user.id === 'user-admin') {
            return {
              ...user,
              nip: 'Superadmin',
              username: 'Superadmin',
              password: 'Superadmin',
              role: 'SUPER_ADMIN',
              nama: user.nama === 'H. Bambang Suryono, M.Pd.' ? 'Super Administrator' : user.nama
            };
          }
          return user;
        }
      }
    } catch {}

    // Default ke null agar saat link dibuka langsung ke halaman Login
    return null;
  },
  setCurrentUser: (user: UserAccount | null) => {
    try {
      if (user) {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch {}
  },

  // Authentication by Username / NIP / NUPTK & Password (Offline-first with real-time Supabase cloud fallback)
  login: async (identifier: string, pass: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();
    const users = StorageService.getUsers();

    // 1. Khusus Akun Super Admin Terpisah (Mendukung Username 'Superadmin' atau NIP)
    if (cleanId === 'superadmin' || cleanId === '197901012005011001') {
      const admin = users.find(u => u.role === 'SUPER_ADMIN' || u.id === 'user-admin') || INITIAL_USERS[0];
      if (
        cleanPass.toLowerCase() === 'superadmin' ||
        cleanPass === admin.password ||
        cleanPass === 'admin123'
      ) {
        const activeAdmin: UserAccount = {
          ...admin,
          id: 'user-admin',
          nip: 'Superadmin',
          username: 'Superadmin',
          nama: 'Super Administrator',
          password: 'Superadmin',
          role: 'SUPER_ADMIN'
        };
        StorageService.setCurrentUser(activeAdmin);
        // Background sync to ensure admin has latest database
        StorageService.initCloudSync(true).catch(() => {});
        return { success: true, user: activeAdmin };
      } else {
        return { success: false, message: 'Password Superadmin salah. Silakan masukkan password: Superadmin' };
      }
    }

    // 2. Akun Guru Mapel: Periksa Local Storage terlebih dahulu
    let found = users.find(u =>
      u.nip.toLowerCase() === cleanId ||
      (u.username && u.username.toLowerCase() === cleanId)
    );

    // 3. Jika akun belum ada di local browser, langsung periksa ke Cloud Supabase!
    if (!found) {
      try {
        const cloudUser = await SupabaseService.getUserByCredentials(cleanId);
        if (cloudUser) {
          found = cloudUser;
          // Simpan/perbarui ke daftar user lokal
          const currentList = StorageService.getUsers();
          const merged = [...currentList.filter(u => u.id !== cloudUser.id), cloudUser];
          setStored(STORAGE_KEYS.USERS, merged);
        }
      } catch (err) {
        console.warn('Gagal memverifikasi user ke Supabase:', err);
      }
    }

    if (!found) {
      return { success: false, message: 'Username atau NIP/NUPTK tidak terdaftar dalam sistem.' };
    }

    // 4. Verifikasi Password (dengan cloud check jika ada pembaruan password di cloud)
    if (found.password !== cleanPass) {
      try {
        const cloudUser = await SupabaseService.getUserByCredentials(cleanId);
        if (cloudUser && cloudUser.password === cleanPass) {
          found = cloudUser;
          const currentList = StorageService.getUsers();
          const merged = [...currentList.filter(u => u.id !== cloudUser.id), cloudUser];
          setStored(STORAGE_KEYS.USERS, merged);
        } else {
          return { success: false, message: 'Password salah. Silakan periksa kembali.' };
        }
      } catch {
        return { success: false, message: 'Password salah. Silakan periksa kembali.' };
      }
    }

    // Simpan sesi aktif
    StorageService.setCurrentUser(found);

    // Otomatis tarik seluruh data siswa & kelas dari Supabase di background agar data lengkap
    StorageService.initCloudSync(false).catch(() => {});

    return { success: true, user: found };
  },

  logout: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {}
  },

  // Students
  getStudents: (): Student[] => {
    return getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudents: (students: Student[]) => {
    setStored(STORAGE_KEYS.STUDENTS, students);
    SupabaseService.syncStudents(students).catch(() => {});
  },
  getStudentsByClass: (classId: string): Student[] => {
    const all = StorageService.getStudents();
    return all.filter(s => s.classId === classId).sort((a, b) => a.nama.localeCompare(b.nama));
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => {
    return getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },
  saveAttendance: (records: AttendanceRecord[]) => {
    setStored(STORAGE_KEYS.ATTENDANCE, records);
  },
  getAttendanceForStudent: (studentId: string): AttendanceRecord | undefined => {
    const all = StorageService.getAttendance();
    return all.find(a => a.studentId === studentId);
  },
  updateAttendance: (record: AttendanceRecord) => {
    const all = StorageService.getAttendance();
    const idx = all.findIndex(a => a.studentId === record.studentId);
    if (idx >= 0) {
      all[idx] = record;
    } else {
      all.push(record);
    }
    StorageService.saveAttendance(all);
  },

  // Grades
  getGrades: (): GradeRecord[] => {
    return getStored<GradeRecord[]>(STORAGE_KEYS.GRADES, INITIAL_GRADES);
  },
  saveGrades: (grades: GradeRecord[]) => {
    setStored(STORAGE_KEYS.GRADES, grades);
    SupabaseService.syncGrades(grades).catch(() => {});
  },

  // Bulk update or upsert grades
  saveBatchGrades: (newRecords: GradeRecord[]) => {
    const allGrades = StorageService.getGrades();
    const recordMap = new Map(allGrades.map(g => [`${g.studentId}_${g.mapelId}`, g]));

    for (const rec of newRecords) {
      recordMap.set(`${rec.studentId}_${rec.mapelId}`, rec);
    }

    const updated = Array.from(recordMap.values());
    StorageService.saveGrades(updated);
    // Asynchronously push to Supabase
    SupabaseService.syncGrades(newRecords).catch(() => {});
    return updated;
  },

  // Full Push to Supabase
  syncAllToSupabase: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const settings = StorageService.getSettings();
      const classes = StorageService.getClasses();
      const subjects = StorageService.getSubjects();
      const users = StorageService.getUsers();
      const students = StorageService.getStudents();
      const grades = StorageService.getGrades();

      const [resSettings, resClasses, resSubjects, resUsers, resStudents, resGrades] =
        await Promise.all([
          SupabaseService.syncSettings(settings),
          SupabaseService.syncClasses(classes),
          SupabaseService.syncSubjects(subjects),
          SupabaseService.syncUsers(users),
          SupabaseService.syncStudents(students),
          SupabaseService.syncGrades(grades),
        ]);

      if (resSettings || resGrades || resStudents || resUsers) {
        return {
          success: true,
          message: 'Sinkronisasi ke Supabase berhasil! Data tersimpan di cloud database.',
        };
      } else {
        return {
          success: false,
          message: 'Tabel database di Supabase belum dibuat. Silakan salin & jalankan SQL schema di Supabase SQL Editor.',
        };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal sinkronisasi ke Supabase.' };
    }
  },

  // Full Pull from Supabase
  pullFromSupabase: async (): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      const data = await SupabaseService.pullFromSupabase();
      if (!data) {
        return { success: false, message: 'Tidak dapat mengambil data dari Supabase.' };
      }

      let updatedItems = 0;
      if (data.settings) {
        setStored(STORAGE_KEYS.SETTINGS, data.settings);
        updatedItems++;
      }
      if (data.classes && data.classes.length > 0) {
        setStored(STORAGE_KEYS.CLASSES, data.classes);
        updatedItems += data.classes.length;
      }
      if (data.subjects && data.subjects.length > 0) {
        setStored(STORAGE_KEYS.SUBJECTS, data.subjects);
        updatedItems += data.subjects.length;
      }
      if (data.users && data.users.length > 0) {
        setStored(STORAGE_KEYS.USERS, data.users);
        updatedItems += data.users.length;
      }
      if (data.students && data.students.length > 0) {
        setStored(STORAGE_KEYS.STUDENTS, data.students);
        updatedItems += data.students.length;
      }
      if (data.grades && data.grades.length > 0) {
        setStored(STORAGE_KEYS.GRADES, data.grades);
        updatedItems += data.grades.length;
      }
      if (data.attendance && data.attendance.length > 0) {
        setStored(STORAGE_KEYS.ATTENDANCE, data.attendance);
        updatedItems += data.attendance.length;
      }

      setStored('erapor_last_sync_v1', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('erapor_data_synced', { detail: { count: updatedItems } }));

      return {
        success: true,
        message: `Berhasil mengunduh data dari Supabase (${updatedItems} data ter-update).`,
        count: updatedItems
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengambil data dari Supabase.' };
    }
  },

  // Singleton / debounced background synchronization on app startup
  initCloudSync: (() => {
    let activePromise: Promise<boolean> | null = null;
    return async (force: boolean = false): Promise<boolean> => {
      if (activePromise && !force) return activePromise;
      activePromise = (async () => {
        try {
          const res = await StorageService.pullFromSupabase();
          return res.success;
        } catch (err) {
          console.warn('Background cloud sync error:', err);
          return false;
        } finally {
          setTimeout(() => { activePromise = null; }, 5000);
        }
      })();
      return activePromise;
    };
  })(),

  getLastSyncTime: (): string | null => {
    return getStored<string | null>('erapor_last_sync_v1', null);
  },

  // Get grades for a specific class and mapel
  getGradesByClassAndMapel: (classId: string, mapelId: string): GradeRecord[] => {
    const all = StorageService.getGrades();
    return all.filter(g => g.classId === classId && g.mapelId === mapelId);
  },

  // Calculate 3-Month Rekapitulasi / Leger for a Class
  getClassSummary: (classId: string): {
    summaries: StudentReportSummary[];
    classAverage: number;
    highestAverage: number;
    lowestAverage: number;
    tuntasPercentage: number;
    totalStudents: number;
    mapelAverages: { [mapelId: string]: number };
    atRiskStudents: StudentReportSummary[];
  } => {
    const students = StorageService.getStudentsByClass(classId);
    const subjects = StorageService.getSubjects();
    const allGrades = StorageService.getGrades().filter(g => g.classId === classId);
    const attendance = StorageService.getAttendance().filter(a => a.classId === classId);

    // Group grades by student
    const studentGradeMap = new Map<string, { [mapelId: string]: GradeRecord }>();
    for (const s of students) {
      studentGradeMap.set(s.id, {});
    }

    for (const g of allGrades) {
      const studentMap = studentGradeMap.get(g.studentId);
      if (studentMap) {
        studentMap[g.mapelId] = g;
      }
    }

    // Build Student Summaries
    const summaries: StudentReportSummary[] = students.map(student => {
      const sGrades = studentGradeMap.get(student.id) || {};
      const gradeValues = Object.values(sGrades).map(g => g.nilaiAkhir);
      
      const totalNilai = gradeValues.reduce((sum, v) => sum + v, 0);
      const gradeCount = subjects.length; // 11 mapel
      const rataRata = gradeValues.length > 0 ? Number((totalNilai / gradeCount).toFixed(1)) : 0;

      let jumlahMapelTuntas = 0;
      let jumlahMapelBelumTuntas = 0;

      for (const subj of subjects) {
        const rec = sGrades[subj.id];
        if (rec) {
          if (rec.nilaiAkhir >= subj.kkm) {
            jumlahMapelTuntas++;
          } else {
            jumlahMapelBelumTuntas++;
          }
        } else {
          // not yet filled
          jumlahMapelBelumTuntas++;
        }
      }

      const sAttendance = attendance.find(a => a.studentId === student.id);

      return {
        student,
        grades: sGrades,
        totalNilai,
        rataRata,
        ranking: 0,
        jumlahMapelTuntas,
        jumlahMapelBelumTuntas,
        kehadiran: sAttendance
      };
    });

    // Calculate Rank
    summaries.sort((a, b) => b.rataRata - a.rataRata || b.totalNilai - a.totalNilai);
    summaries.forEach((sum, index) => {
      sum.ranking = index + 1;
    });

    // Class aggregate stats
    const totalStudents = summaries.length;
    const avgSum = summaries.reduce((acc, s) => acc + s.rataRata, 0);
    const classAverage = totalStudents > 0 ? Number((avgSum / totalStudents).toFixed(1)) : 0;
    const highestAverage = summaries.length > 0 ? summaries[0].rataRata : 0;
    const lowestAverage = summaries.length > 0 ? summaries[summaries.length - 1].rataRata : 0;

    const tuntasStudents = summaries.filter(s => s.jumlahMapelBelumTuntas === 0 && s.totalNilai > 0).length;
    const tuntasPercentage = totalStudents > 0 ? Math.round((tuntasStudents / totalStudents) * 100) : 0;

    // Mapel averages
    const mapelAverages: { [mapelId: string]: number } = {};
    for (const subj of subjects) {
      const subjGrades = allGrades.filter(g => g.mapelId === subj.id);
      if (subjGrades.length > 0) {
        const sumVal = subjGrades.reduce((acc, g) => acc + g.nilaiAkhir, 0);
        mapelAverages[subj.id] = Number((sumVal / subjGrades.length).toFixed(1));
      } else {
        mapelAverages[subj.id] = 0;
      }
    }

    // At risk students (rata-rata < KKM or > 2 mapel belum tuntas)
    const atRiskStudents = summaries.filter(s => s.rataRata < 75 || s.jumlahMapelBelumTuntas > 2);

    return {
      summaries,
      classAverage,
      highestAverage,
      lowestAverage,
      tuntasPercentage,
      totalStudents,
      mapelAverages,
      atRiskStudents
    };
  },

  // Generate Auto Dummy / Quick Fill for a Class & Subject
  quickFillClassMapel: (classId: string, mapelId: string, type: 'kkm' | 'acak' | 'tinggi', userNama: string) => {
    const students = StorageService.getStudentsByClass(classId);
    const subjects = StorageService.getSubjects();
    const settings = StorageService.getSettings();
    const subject = subjects.find(s => s.id === mapelId) || subjects[0];

    const records: GradeRecord[] = students.map(student => {
      let t1 = 75, t2 = 75, t3 = 75, uh1 = 75, uh2 = 75, pts = 75;

      if (type === 'kkm') {
        t1 = subject.kkm;
        t2 = subject.kkm;
        t3 = subject.kkm;
        uh1 = subject.kkm;
        uh2 = subject.kkm;
        pts = subject.kkm;
      } else if (type === 'tinggi') {
        t1 = 88; t2 = 90; t3 = 92;
        uh1 = 89; uh2 = 91;
        pts = 90;
      } else {
        // Realistis acak
        const randSeed = Math.floor(Math.random() * 20);
        const base = Math.min(95, Math.max(65, 76 + randSeed - 8));
        t1 = Math.min(100, Math.max(60, base + Math.floor(Math.random() * 6) - 3));
        t2 = Math.min(100, Math.max(60, base + Math.floor(Math.random() * 6) - 3));
        t3 = Math.min(100, Math.max(60, base + Math.floor(Math.random() * 6) - 3));
        uh1 = Math.min(100, Math.max(60, base + Math.floor(Math.random() * 8) - 4));
        uh2 = Math.min(100, Math.max(60, base + Math.floor(Math.random() * 8) - 4));
        pts = Math.min(100, Math.max(55, base + Math.floor(Math.random() * 10) - 5));
      }

      const formatifAvg = Math.round((t1 + t2 + t3) / 3);
      const sumatifMateriAvg = Math.round((uh1 + uh2) / 2);
      const derived = calculateGradeDerived(
        formatifAvg,
        sumatifMateriAvg,
        pts,
        subject.kkm,
        settings.bobotFormatif,
        settings.bobotUH,
        settings.bobotPTS,
        subject.nama
      );

      return {
        id: `grd-${student.id}-${mapelId}`,
        studentId: student.id,
        classId,
        mapelId,
        semester: settings.semesterAktif,
        tahunAjaran: settings.tahunAjaran,
        triwulan: settings.semesterAktif === 'Ganjil' ? 1 : 2,
        nilaiTugas1: t1,
        nilaiTugas2: t2,
        nilaiTugas3: t3,
        nilaiFormatifAvg: formatifAvg,
        nilaiUH1: uh1,
        nilaiUH2: uh2,
        nilaiSumatifMateriAvg: sumatifMateriAvg,
        nilaiPTS: pts,
        nilaiAkhir: derived.nilaiAkhir,
        predikat: derived.predikat,
        keterangan: derived.keterangan as 'Tuntas' | 'Perlu Bimbingan',
        capaianKompetensi: derived.capaianKompetensi,
        updatedAt: new Date().toISOString(),
        updatedBy: userNama || 'Guru Mapel'
      };
    });

    return StorageService.saveBatchGrades(records);
  }
};
