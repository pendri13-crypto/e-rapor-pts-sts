export type UserRole = 'SUPER_ADMIN' | 'GURU_MAPEL';

export interface UserAccount {
  id: string;
  nip: string; // NIP (18 digit), NUPTK (16 digit), atau Username 'Superadmin'
  username?: string; // Khusus Super Admin terpisah: 'Superadmin'
  nama: string;
  role: UserRole;
  mapelId?: string; // ID mapel jika guru mapel, misal 'PAIBP', 'MTK'
  mapelName?: string;
  assignedClassIds: string[]; // Daftar ID kelas yang diajar (misal: ["VII-A", "VII-B", ...])
  password: string;
  email?: string;
  noHp?: string;
  isWaliKelas?: boolean;
  waliKelasId?: string; // ID kelas yang diwalikan (misal: "VII-A")
}

export type TingkatKelas = 'VII' | 'VIII' | 'IX';
export type AbjadKelas = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';

export interface SchoolClass {
  id: string; // 'VII-A', 'VII-B', ..., 'IX-K'
  tingkat: TingkatKelas;
  kode: AbjadKelas;
  nama: string; // 'Kelas VII-A'
  waliKelasNama: string;
  waliKelasNip: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  fase: 'D'; // Kurikulum Merdeka Fase D untuk SMP
}

export interface Subject {
  id: string;
  kode: string;
  nama: string;
  kkm: number; // Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) / KKM
  kelompok: 'Kelompok A (Umum)' | 'Kelompok B (Umum)' | 'Muatan Lokal';
  urutan: number;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  classId: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  namaWali?: string;
  alamat?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  classId: string;
  mapelId: string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  triwulan: number; // 1 = 3 Bulan Pertama (PTS Ganjil), 2 = 3 Bulan Kedua (PTS Genap)
  // Komponen Penilaian Praktis
  nilaiTugas1: number;
  nilaiTugas2: number;
  nilaiTugas3: number;
  nilaiFormatifAvg: number;
  nilaiUH1: number; // Sumatif Lingkup Materi 1
  nilaiUH2: number; // Sumatif Lingkup Materi 2
  nilaiSumatifMateriAvg: number;
  nilaiPTS: number; // Tes Sumatif Tengah Semester (PTS/STS)
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  keterangan: 'Tuntas' | 'Perlu Bimbingan';
  capaianKompetensi: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AttendanceRecord {
  studentId: string;
  classId: string;
  sakit: number;
  izin: number;
  alpa: number;
  catatanWaliKelas: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  alamatSekolah: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunAjaran: string;
  semesterAktif: 'Ganjil' | 'Genap';
  namaPeriodePTS: string; // "Penilaian Tengah Semester (PTS) Ganjil" / "Asesmen Sumatif Tengah Semester (STS)"
  tanggalRapor: string;
  tempatRapor: string;
  logoPemdaUrl?: string; // Logo Pemerintah Daerah / Dinas Pendidikan (Base64 atau URL)
  logoSekolahUrl?: string; // Logo Resmi Satuan Pendidikan / Sekolah (Base64 atau URL)
  // Bobot Nilai (%)
  bobotFormatif: number; // e.g. 30%
  bobotUH: number;       // e.g. 30%
  bobotPTS: number;      // e.g. 40%
  kkmDefault: number;    // e.g. 75
  kkmKelas7?: number;
  kkmKelas8?: number;
  kkmKelas9?: number;
}

export interface StudentReportSummary {
  student: Student;
  grades: { [mapelId: string]: GradeRecord };
  totalNilai: number;
  rataRata: number;
  ranking: number;
  jumlahMapelTuntas: number;
  jumlahMapelBelumTuntas: number;
  kehadiran?: AttendanceRecord;
}
