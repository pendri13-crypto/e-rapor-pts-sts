import { createClient } from '@supabase/supabase-js';
import {
  GradeRecord,
  SchoolSettings,
  Student,
  UserAccount,
  SchoolClass,
  Subject,
  AttendanceRecord
} from '../types';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://spurcsvvhtmjqtefbmnp.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXJjc3Z2aHRtanF0ZWZibW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTY1MjQsImV4cCI6MjEwNjc3MjUyNH0.epfG5s7RSnI85AvPMKqdBzdiXE-wPxT8s_o10IHbLbQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// SQL Schema DDL if user wants to create tables in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ====================================================
-- SCHEMA DATABASE e-RAPOR PENILAIAN TENGAH SEMESTER (PTS)
-- SUPABASE POSTGRESQL DDL
-- ====================================================

-- 1. Tabel Profil Sekolah & Pengaturan Bobot PTS
CREATE TABLE IF NOT EXISTS school_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  nama_sekolah TEXT NOT NULL,
  npsn TEXT,
  alamat_sekolah TEXT,
  kelurahan TEXT,
  kecamatan TEXT,
  kabupaten_kota TEXT,
  provinsi TEXT,
  kode_pos TEXT,
  telepon TEXT,
  email TEXT,
  nama_kepala_sekolah TEXT,
  nip_kepala_sekolah TEXT,
  tahun_ajaran TEXT DEFAULT '2024/2025',
  semester_aktif TEXT DEFAULT 'Ganjil',
  nama_periode_pts TEXT DEFAULT 'Penilaian Tengah Semester (PTS) Ganjil',
  tanggal_rapor TEXT,
  tempat_rapor TEXT,
  logo_pemda_url TEXT,
  logo_sekolah_url TEXT,
  bobot_formatif INTEGER DEFAULT 30,
  bobot_uh INTEGER DEFAULT 30,
  bobot_pts INTEGER DEFAULT 40,
  kkm_default INTEGER DEFAULT 75,
  kkm_kelas7 INTEGER DEFAULT 76,
  kkm_kelas8 INTEGER DEFAULT 78,
  kkm_kelas9 INTEGER DEFAULT 80,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel 33 Kelas (VII-A s.d IX-K)
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  tingkat TEXT NOT NULL,
  kode TEXT NOT NULL,
  nama TEXT NOT NULL,
  wali_kelas_nama TEXT,
  wali_kelas_nip TEXT,
  tahun_ajaran TEXT DEFAULT '2024/2025',
  semester TEXT DEFAULT 'Ganjil',
  fase TEXT DEFAULT 'D',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel 11 Mata Pelajaran Resmi SMP
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL,
  nama TEXT NOT NULL,
  kkm INTEGER DEFAULT 75,
  kelompok TEXT NOT NULL,
  urutan INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Akun Guru & Super Admin
CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY,
  nip TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL,
  mapel_id TEXT,
  mapel_name TEXT,
  assigned_class_ids TEXT[] DEFAULT '{}',
  password TEXT NOT NULL,
  email TEXT,
  no_hp TEXT,
  is_wali_kelas BOOLEAN DEFAULT FALSE,
  wali_kelas_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Siswa
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nis TEXT NOT NULL,
  nisn TEXT,
  nama TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL,
  class_id TEXT NOT NULL,
  tempat_lahir TEXT,
  tanggal_lahir TEXT,
  nama_wali TEXT,
  alamat TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Nilai Rapor PTS (Praktis: Formatif, UH, PTS)
CREATE TABLE IF NOT EXISTS grade_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  mapel_id TEXT NOT NULL,
  semester TEXT DEFAULT 'Ganjil',
  tahun_ajaran TEXT DEFAULT '2024/2025',
  triwulan INTEGER DEFAULT 1,
  nilai_tugas1 NUMERIC DEFAULT 0,
  nilai_tugas2 NUMERIC DEFAULT 0,
  nilai_tugas3 NUMERIC DEFAULT 0,
  nilai_formatif_avg NUMERIC DEFAULT 0,
  nilai_uh1 NUMERIC DEFAULT 0,
  nilai_uh2 NUMERIC DEFAULT 0,
  nilai_sumatif_materi_avg NUMERIC DEFAULT 0,
  nilai_pts NUMERIC DEFAULT 0,
  nilai_akhir NUMERIC DEFAULT 0,
  predikat TEXT DEFAULT 'C',
  keterangan TEXT DEFAULT 'Tuntas',
  capaian_kompetensi TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- 7. Tabel Ketidakhadiran & Catatan Siswa
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  sakit INTEGER DEFAULT 0,
  izin INTEGER DEFAULT 0,
  alpa INTEGER DEFAULT 0,
  catatan_wali_kelas TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Izinkan Read & Write Publik Anonim untuk Aplikasi
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Settings" ON school_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Classes" ON classes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Users" ON user_accounts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Students" ON students FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE grade_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Grades" ON grade_records FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Attendance" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
`;

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  syncedTables?: string[];
  error?: any;
}

export const SupabaseService = {
  // Test Connection
  checkConnection: async (): Promise<{ connected: boolean; latencyMs: number; error?: string }> => {
    const start = Date.now();
    try {
      // Test querying auth or settings table
      const { data, error } = await supabase.from('school_settings').select('id').limit(1);
      const latencyMs = Date.now() - start;

      if (error && error.code === '42P01') {
        // Table doesn't exist yet, but database connection to Supabase is active!
        return { connected: true, latencyMs, error: 'Database terhubung (Tabel belum digenerate)' };
      }

      if (error) {
        // Still check if it reached supabase
        return { connected: false, latencyMs, error: error.message };
      }

      return { connected: true, latencyMs };
    } catch (err: any) {
      return { connected: false, latencyMs: Date.now() - start, error: err?.message || 'Gagal terhubung' };
    }
  },

  // Push Grades to Supabase
  syncGrades: async (grades: GradeRecord[]): Promise<boolean> => {
    try {
      const payload = grades.map(g => ({
        id: g.id,
        student_id: g.studentId,
        class_id: g.classId,
        mapel_id: g.mapelId,
        semester: g.semester,
        tahun_ajaran: g.tahunAjaran,
        triwulan: g.triwulan,
        nilai_tugas1: g.nilaiTugas1,
        nilai_tugas2: g.nilaiTugas2,
        nilai_tugas3: g.nilaiTugas3,
        nilai_formatif_avg: g.nilaiFormatifAvg,
        nilai_uh1: g.nilaiUH1,
        nilai_uh2: g.nilaiUH2,
        nilai_sumatif_materi_avg: g.nilaiSumatifMateriAvg,
        nilai_pts: g.nilaiPTS,
        nilai_akhir: g.nilaiAkhir,
        predikat: g.predikat,
        keterangan: g.keterangan,
        capaian_kompetensi: g.capaianKompetensi,
        updated_at: g.updatedAt,
        updated_by: g.updatedBy
      }));

      // Chunk in blocks of 100 for network safety
      for (let i = 0; i < payload.length; i += 100) {
        const chunk = payload.slice(i, i + 100);
        const { error } = await supabase.from('grade_records').upsert(chunk, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase syncGrades warning:', error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncGrades error:', err);
      return false;
    }
  },

  // Push Students to Supabase
  syncStudents: async (students: Student[]): Promise<boolean> => {
    try {
      const payload = students.map(s => ({
        id: s.id,
        nis: s.nis,
        nisn: s.nisn,
        nama: s.nama,
        jenis_kelamin: s.jenisKelamin,
        class_id: s.classId,
        tempat_lahir: s.tempatLahir,
        tanggal_lahir: s.tanggalLahir,
        nama_wali: s.namaWali,
        alamat: s.alamat,
      }));

      for (let i = 0; i < payload.length; i += 100) {
        const chunk = payload.slice(i, i + 100);
        const { error } = await supabase.from('students').upsert(chunk, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase syncStudents warning:', error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncStudents error:', err);
      return false;
    }
  },

  // Push Users to Supabase
  syncUsers: async (users: UserAccount[]): Promise<boolean> => {
    try {
      const payload = users.map(u => ({
        id: u.id,
        nip: u.nip,
        nama: u.nama,
        role: u.role,
        mapel_id: u.mapelId,
        mapel_name: u.mapelName,
        assigned_class_ids: u.assignedClassIds,
        password: u.password,
        email: u.email,
        no_hp: u.noHp,
        is_wali_kelas: u.isWaliKelas ?? false,
        wali_kelas_id: u.waliKelasId,
      }));

      const { error } = await supabase.from('user_accounts').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncUsers warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncUsers error:', err);
      return false;
    }
  },

  // Push Settings to Supabase
  syncSettings: async (settings: SchoolSettings): Promise<boolean> => {
    try {
      const payload = {
        id: 'default',
        nama_sekolah: settings.namaSekolah,
        npsn: settings.npsn,
        alamat_sekolah: settings.alamatSekolah,
        kelurahan: settings.kelurahan,
        kecamatan: settings.kecamatan,
        kabupaten_kota: settings.kabupatenKota,
        provinsi: settings.provinsi,
        kode_pos: settings.kodePos,
        telepon: settings.telepon,
        email: settings.email,
        nama_kepala_sekolah: settings.namaKepalaSekolah,
        nip_kepala_sekolah: settings.nipKepalaSekolah,
        tahun_ajaran: settings.tahunAjaran,
        semester_aktif: settings.semesterAktif,
        nama_periode_pts: settings.namaPeriodePTS,
        tanggal_rapor: settings.tanggalRapor,
        tempat_rapor: settings.tempatRapor,
        logo_pemda_url: settings.logoPemdaUrl,
        logo_sekolah_url: settings.logoSekolahUrl,
        bobot_formatif: settings.bobotFormatif,
        bobot_uh: settings.bobotUH,
        bobot_pts: settings.bobotPTS,
        kkm_default: settings.kkmDefault,
        kkm_kelas7: settings.kkmKelas7,
        kkm_kelas8: settings.kkmKelas8,
        kkm_kelas9: settings.kkmKelas9,
      };

      const { error } = await supabase.from('school_settings').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncSettings warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncSettings error:', err);
      return false;
    }
  },

  // Sync Classes to Supabase
  syncClasses: async (classes: SchoolClass[]): Promise<boolean> => {
    try {
      const payload = classes.map(c => ({
        id: c.id,
        tingkat: c.tingkat,
        kode: c.kode,
        nama: c.nama,
        wali_kelas_nama: c.waliKelasNama,
        wali_kelas_nip: c.waliKelasNip,
        tahun_ajaran: c.tahunAjaran,
        semester: c.semester,
        fase: c.fase
      }));

      const { error } = await supabase.from('classes').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncClasses warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncClasses error:', err);
      return false;
    }
  },

  // Sync Subjects to Supabase
  syncSubjects: async (subjects: Subject[]): Promise<boolean> => {
    try {
      const payload = subjects.map(s => ({
        id: s.id,
        kode: s.kode,
        nama: s.nama,
        kkm: s.kkm,
        kelompok: s.kelompok,
        urutan: s.urutan
      }));

      const { error } = await supabase.from('subjects').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncSubjects warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncSubjects error:', err);
      return false;
    }
  },

  // Helper to fetch all rows in chunks of 1000 to bypass PostgREST limit
  fetchAllRows: async <T = any>(table: string, orderColumn?: string): Promise<T[]> => {
    let all: T[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      let query = supabase.from(table).select('*').range(from, from + pageSize - 1);
      if (orderColumn) {
        query = query.order(orderColumn, { ascending: true });
      }
      const { data, error } = await query;
      if (error) {
        console.warn(`Error fetching ${table} at offset ${from}:`, error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all = all.concat(data as T[]);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return all;
  },

  // Query user directly from Supabase by NIP or username
  getUserByCredentials: async (identifier: string): Promise<UserAccount | null> => {
    try {
      const cleanId = identifier.trim().toLowerCase();
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .ilike('nip', cleanId)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        nip: data.nip,
        username: data.username || (data.nip === 'Superadmin' ? 'Superadmin' : undefined),
        nama: data.nama,
        role: data.role,
        mapelId: data.mapel_id,
        mapelName: data.mapel_name,
        assignedClassIds: data.assigned_class_ids || [],
        password: data.password,
        email: data.email,
        noHp: data.no_hp,
        isWaliKelas: data.is_wali_kelas,
        waliKelasId: data.wali_kelas_id
      };
    } catch (err) {
      console.warn('getUserByCredentials error:', err);
      return null;
    }
  },

  // Fetch grades specifically for a class and mapel
  fetchGradesForClassAndMapel: async (classId: string, mapelId: string): Promise<GradeRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('grade_records')
        .select('*')
        .eq('class_id', classId)
        .eq('mapel_id', mapelId);

      if (error || !data) return [];
      return data.map((g: any) => ({
        id: g.id,
        studentId: g.student_id,
        classId: g.class_id,
        mapelId: g.mapel_id,
        semester: g.semester,
        tahunAjaran: g.tahun_ajaran,
        triwulan: g.triwulan,
        nilaiTugas1: Number(g.nilai_tugas1) || 0,
        nilaiTugas2: Number(g.nilai_tugas2) || 0,
        nilaiTugas3: Number(g.nilai_tugas3) || 0,
        nilaiFormatifAvg: Number(g.nilai_formatif_avg) || 0,
        nilaiUH1: Number(g.nilai_uh1) || 0,
        nilaiUH2: Number(g.nilai_uh2) || 0,
        nilaiSumatifMateriAvg: Number(g.nilai_sumatif_materi_avg) || 0,
        nilaiPTS: Number(g.nilai_pts) || 0,
        nilaiAkhir: Number(g.nilai_akhir) || 0,
        predikat: g.predikat,
        keterangan: g.keterangan,
        capaianKompetensi: g.capaian_kompetensi,
        updatedAt: g.updated_at,
        updatedBy: g.updated_by
      }));
    } catch (err) {
      console.warn('fetchGradesForClassAndMapel error:', err);
      return [];
    }
  },

  // Pull All Remote Data from Supabase with full pagination
  pullFromSupabase: async (): Promise<{
    settings?: SchoolSettings;
    grades?: GradeRecord[];
    students?: Student[];
    users?: UserAccount[];
    classes?: SchoolClass[];
    subjects?: Subject[];
    attendance?: AttendanceRecord[];
  } | null> => {
    try {
      const [resSettings, resClasses, resSubjects, resUsers, rawStudents, rawGrades, rawAttendance] =
        await Promise.allSettled([
          supabase.from('school_settings').select('*').limit(1).maybeSingle(),
          supabase.from('classes').select('*'),
          supabase.from('subjects').select('*').order('urutan', { ascending: true }),
          supabase.from('user_accounts').select('*'),
          SupabaseService.fetchAllRows('students', 'nis'),
          SupabaseService.fetchAllRows('grade_records'),
          SupabaseService.fetchAllRows('attendance_records')
        ]);

      const result: any = {};

      if (resSettings.status === 'fulfilled' && resSettings.value.data) {
        const s = resSettings.value.data;
        result.settings = {
          namaSekolah: s.nama_sekolah,
          npsn: s.npsn,
          alamatSekolah: s.alamat_sekolah,
          kelurahan: s.kelurahan,
          kecamatan: s.kecamatan,
          kabupatenKota: s.kabupaten_kota,
          provinsi: s.provinsi,
          kodePos: s.kode_pos,
          telepon: s.telepon,
          email: s.email,
          namaKepalaSekolah: s.nama_kepala_sekolah,
          nipKepalaSekolah: s.nip_kepala_sekolah,
          tahunAjaran: s.tahun_ajaran,
          semesterAktif: s.semester_aktif,
          namaPeriodePTS: s.nama_periode_pts,
          tanggalRapor: s.tanggal_rapor,
          tempatRapor: s.tempat_rapor,
          logoPemdaUrl: s.logo_pemda_url,
          logoSekolahUrl: s.logo_sekolah_url,
          bobotFormatif: s.bobot_formatif,
          bobotUH: s.bobot_uh,
          bobotPTS: s.bobot_pts,
          kkmDefault: s.kkm_default,
          kkmKelas7: s.kkm_kelas7,
          kkmKelas8: s.kkm_kelas8,
          kkmKelas9: s.kkm_kelas9,
        };
      }

      if (resClasses.status === 'fulfilled' && resClasses.value.data && resClasses.value.data.length > 0) {
        result.classes = resClasses.value.data.map((c: any) => ({
          id: c.id,
          tingkat: c.tingkat,
          kode: c.kode,
          nama: c.nama,
          waliKelasNama: c.wali_kelas_nama || '',
          waliKelasNip: c.wali_kelas_nip || '',
          tahunAjaran: c.tahun_ajaran || '2026/2027',
          semester: c.semester || 'Ganjil',
          fase: c.fase || 'D'
        }));
      }

      if (resSubjects.status === 'fulfilled' && resSubjects.value.data && resSubjects.value.data.length > 0) {
        result.subjects = resSubjects.value.data.map((sub: any) => ({
          id: sub.id,
          kode: sub.kode,
          nama: sub.nama,
          kkm: sub.kkm,
          kelompok: sub.kelompok,
          urutan: sub.urutan
        }));
      }

      if (rawGrades.status === 'fulfilled' && rawGrades.value && rawGrades.value.length > 0) {
        result.grades = rawGrades.value.map((g: any) => ({
          id: g.id,
          studentId: g.student_id,
          classId: g.class_id,
          mapelId: g.mapel_id,
          semester: g.semester,
          tahunAjaran: g.tahun_ajaran,
          triwulan: g.triwulan,
          nilaiTugas1: Number(g.nilai_tugas1) || 0,
          nilaiTugas2: Number(g.nilai_tugas2) || 0,
          nilaiTugas3: Number(g.nilai_tugas3) || 0,
          nilaiFormatifAvg: Number(g.nilai_formatif_avg) || 0,
          nilaiUH1: Number(g.nilai_uh1) || 0,
          nilaiUH2: Number(g.nilai_uh2) || 0,
          nilaiSumatifMateriAvg: Number(g.nilai_sumatif_materi_avg) || 0,
          nilaiPTS: Number(g.nilai_pts) || 0,
          nilaiAkhir: Number(g.nilai_akhir) || 0,
          predikat: g.predikat,
          keterangan: g.keterangan,
          capaianKompetensi: g.capaian_kompetensi,
          updatedAt: g.updated_at,
          updatedBy: g.updated_by
        }));
      }

      if (rawStudents.status === 'fulfilled' && rawStudents.value && rawStudents.value.length > 0) {
        result.students = rawStudents.value.map((st: any) => ({
          id: st.id,
          nis: st.nis,
          nisn: st.nisn,
          nama: st.nama,
          jenisKelamin: st.jenis_kelamin,
          classId: st.class_id,
          tempatLahir: st.tempat_lahir,
          tanggalLahir: st.tanggal_lahir,
          namaWali: st.nama_wali,
          alamat: st.alamat
        }));
      }

      if (resUsers.status === 'fulfilled' && resUsers.value.data && resUsers.value.data.length > 0) {
        result.users = resUsers.value.data.map((u: any) => ({
          id: u.id,
          nip: u.nip,
          username: u.username || (u.nip === 'Superadmin' ? 'Superadmin' : undefined),
          nama: u.nama,
          role: u.role,
          mapelId: u.mapel_id,
          mapelName: u.mapel_name,
          assignedClassIds: u.assigned_class_ids || [],
          password: u.password,
          email: u.email,
          noHp: u.no_hp,
          isWaliKelas: u.is_wali_kelas,
          waliKelasId: u.wali_kelas_id
        }));
      }

      if (rawAttendance.status === 'fulfilled' && rawAttendance.value && rawAttendance.value.length > 0) {
        result.attendance = rawAttendance.value.map((a: any) => ({
          id: a.id,
          studentId: a.student_id,
          classId: a.class_id,
          sakit: Number(a.sakit) || 0,
          izin: Number(a.izin) || 0,
          alpa: Number(a.alpa) || 0,
          catatanWaliKelas: a.catatan_wali_kelas || ''
        }));
      }

      return result;
    } catch (err) {
      console.warn('Failed to pull from Supabase:', err);
      return null;
    }
  },  // Delete students from Supabase (specific class or all)
  deleteStudentsFromSupabase: async (classId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (classId && classId !== 'ALL') {
        await Promise.allSettled([
          supabase.from('grade_records').delete().eq('class_id', classId),
          supabase.from('attendance_records').delete().eq('class_id', classId),
          supabase.from('students').delete().eq('class_id', classId),
        ]);
        return { success: true, message: `Data siswa kelas ${classId} berhasil dihapus dari Supabase.` };
      }

      await Promise.allSettled([
        supabase.from('grade_records').delete().neq('id', '___non_existent___'),
        supabase.from('attendance_records').delete().neq('id', '___non_existent___'),
        supabase.from('students').delete().neq('id', '___non_existent___'),
      ]);
      return { success: true, message: 'Seluruh data siswa berhasil dihapus dari Supabase.' };
    } catch (err: any) {
      console.warn('Error deleting students from Supabase:', err);
      return { success: false, message: err?.message || 'Gagal menghapus data siswa dari Supabase.' };
    }
  },

  // Delete teachers from Supabase (keep Super Admin)
  deleteTeachersFromSupabase: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .delete()
        .neq('role', 'SUPER_ADMIN')
        .neq('nip', 'Superadmin');
      if (error) throw error;
      return { success: true, message: 'Seluruh akun guru mapel berhasil dihapus dari Supabase.' };
    } catch (err: any) {
      console.warn('Error deleting teachers from Supabase:', err);
      return { success: false, message: err?.message || 'Gagal menghapus data guru dari Supabase.' };
    }
  },

  // Delete classes from Supabase
  deleteClassesFromSupabase: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.from('classes').delete().neq('id', '___non_existent___');
      if (error) throw error;
      return { success: true, message: 'Seluruh data kelas berhasil dihapus dari Supabase.' };
    } catch (err: any) {
      console.warn('Error deleting classes from Supabase:', err);
      return { success: false, message: err?.message || 'Gagal menghapus data kelas dari Supabase.' };
    }
  },

  // Delete all data in Supabase Cloud
  deleteAllDataFromSupabase: async (scope: 'all' | 'grades_only' = 'all'): Promise<{ success: boolean; message: string }> => {
    try {
      if (scope === 'grades_only') {
        const { error: gErr } = await supabase.from('grade_records').delete().neq('id', '___non_existent___');
        if (gErr) throw gErr;
        return { success: true, message: 'Seluruh nilai berhasil dihapus dari database Supabase.' };
      }

      // Delete grades, attendance, students, teachers
      await Promise.allSettled([
        supabase.from('grade_records').delete().neq('id', '___non_existent___'),
        supabase.from('attendance_records').delete().neq('id', '___non_existent___'),
        supabase.from('students').delete().neq('id', '___non_existent___'),
        supabase.from('user_accounts').delete().neq('role', 'SUPER_ADMIN').neq('nip', 'Superadmin'),
      ]);

      return { success: true, message: 'Seluruh data (nilai, siswa, akun guru) berhasil dibersihkan dari Supabase Cloud.' };
    } catch (err: any) {
      console.warn('Error deleting from Supabase:', err);
      return { success: false, message: err?.message || 'Gagal menghapus data dari Supabase.' };
    }
  }
};
