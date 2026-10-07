import { SchoolClass, Subject, UserAccount, Student, GradeRecord, SchoolSettings, AttendanceRecord } from '../types';

export const DEFAULT_LOGO_PEMDA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="4"/><polygon points="50,15 62,38 88,40 68,58 74,84 50,70 26,84 32,58 12,40 38,38" fill="%23f59e0b"/><circle cx="50" cy="50" r="16" fill="%23ffffff"/><path d="M42,56 C42,48 58,48 58,56 Z M50,38 L50,47" stroke="%231e3a8a" stroke-width="3" fill="%23f59e0b"/></svg>`;

export const DEFAULT_LOGO_SEKOLAH = 'https://i.ibb.co.com/QvMS2L2J/LOGO-SEKOLAH-SMPN-1-RAJAPOLAH.png';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMPN 1 RAJAPOLAH',
  npsn: '20210846',
  alamatSekolah: 'Jln. Kebon Kalapa No. 48 Manggungjaya',
  kelurahan: 'Manggungjaya',
  kecamatan: 'Rajapolah',
  kabupatenKota: 'Kab. Tasikmalaya',
  provinsi: 'Jawa Barat',
  kodePos: '46153',
  telepon: '(0265) 420212',
  email: 'smpn1rajapolah@sch.id',
  namaKepalaSekolah: 'H. Ucu Karni, M.Pd.',
  nipKepalaSekolah: '1967111619931005',
  tahunAjaran: '2026/2027',
  semesterAktif: 'Ganjil',
  namaPeriodePTS: 'Penilaian Tengah Semester (PTS) Ganjil',
  tanggalRapor: '9 Oktober 2026',
  tempatRapor: 'Kab. Tasikmalaya',
  logoPemdaUrl: DEFAULT_LOGO_PEMDA,
  logoSekolahUrl: DEFAULT_LOGO_SEKOLAH,
  bobotFormatif: 0,
  bobotUH: 0,
  bobotPTS: 100,
  kkmDefault: 75,
};

// 11 Mata Pelajaran Resmi SMP
export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'PAIBP', kode: 'PAI', nama: 'PAIBP', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 1 },
  { id: 'PPKN', kode: 'PPKN', nama: 'PPKN', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 2 },
  { id: 'BINDO', kode: 'BIND', nama: 'Bahasa Indonesia', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 3 },
  { id: 'MTK', kode: 'MTK', nama: 'Matematika', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 4 },
  { id: 'IPA', kode: 'IPA', nama: 'IPA', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 5 },
  { id: 'IPS', kode: 'IPS', nama: 'IPS', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 6 },
  { id: 'BING', kode: 'BING', nama: 'Bahasa Inggris', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 7 },
  { id: 'INFOR', kode: 'INF', nama: 'Informatika', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 8 },
  { id: 'PJOK', kode: 'PJOK', nama: 'PJOK', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 9 },
  { id: 'SENI', kode: 'SBD', nama: 'Seni Budaya', kkm: 75, kelompok: 'Kelompok A (Umum)', urutan: 10 },
  { id: 'PRAKARYA', kode: 'PRK', nama: 'Prakarya', kkm: 75, kelompok: 'Kelompok B (Umum)', urutan: 11 },
  { id: 'MULOK', kode: 'MLK', nama: 'Mulok Bahasa Daerah', kkm: 75, kelompok: 'Muatan Lokal', urutan: 12 },
];

const KELAS_LETTERS: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K')[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'
];

// Data Wali Kelas Resmi 33 Kelas SMPN 1 Rajapolah
const WALI_KELAS_MAP: Record<string, [string, string]> = {
  "IX-A": ["NANIK DWI ASTUTI, M.Pd","198106142009022005"],
  "IX-B": ["WIDI RESTUTI, S.Pd","197303171998022002"],
  "IX-C": ["IRA TRISTIAWATI, S.Kom","197805022021212001"],
  "IX-D": ["MEY MEY TRI KUSDIANI, S.pd","199605162020122006"],
  "IX-E": ["DEDE NURHAYATI, S.Pd","197901172008012006"],
  "IX-F": ["RIDA RIDIAWATI, S.Pd","197403112006042010"],
  "IX-G": ["SITI SAADAH, S.Pd","199109032024212030"],
  "IX-H": ["KENDRA PERMANA, S.Pd","197006151997021004"],
  "IX-I": ["IMAS HALIMAH, S.Pd","197609292002122002"],
  "IX-J": ["ARIS SUNANDAR, S.Pd","199609022025211089"],
  "IX-K": ["AI TARLIANI, S.Pd","196911121998022003"],
  "VII-A": ["EDI DARWADI, S.Pd","197610012021211001"],
  "VII-B": ["SAEPUL HAKIM, S.Pd","7555775676130202"],
  "VII-C": ["RINA YULIANA, S.Pd","198112262014102002"],
  "VII-D": ["RIKA MUDRIKA, S.H.I","198005102023212008"],
  "VII-E": ["WIDYA IMARDHEA, S.Pd","7459777678230133"],
  "VII-F": ["NENG AJENG AYU LESTARI, S.Pd","199810062024212017"],
  "VII-G": ["ENUNG RIWAYATI, S.Pd","197209042007012006"],
  "VII-H": ["MIFTAH SAEPUL ANWAR, S.Pd","199707012022211001"],
  "VII-I": ["RENI NURAENI, S.Pd","197601012007012031"],
  "VII-J": ["FAHMI MIFTAHULZAMAN, S.Pd","199902182024211010"],
  "VII-K": ["Hj. ANI MARDIANI, S.Pd","196910162021212001"],
  "VIII-A": ["HENI NUR AZIZAH, S.Pd","199701162025212120"],
  "VIII-B": ["Hj. SRINANINGSIH, S.Pd","196911041995122004"],
  "VIII-C": ["NENDEN SRI UTARI, S.Pd","198806052011012003"],
  "VIII-D": ["PENDRI PRAYOGA, S.Kom","198808312022211005"],
  "VIII-E": ["ANWAR MUSADAD, S.Pd.Kn.","196908201994121001"],
  "VIII-F": ["Hj. YEYEH SOFIAH, S.Pd","196904101995122005"],
  "VIII-G": ["ELIS KURNIATI, S.Pd","198102032024212007"],
  "VIII-H": ["YONA MAHYA MAULANI, S.Pd","6844775676230252"],
  "VIII-I": ["SANTI SRI RAHAYU, S.Pd","199108272025212137"],
  "VIII-J": ["TARISNIYATI DARISMAN, S.Pd","198112022024212009"],
  "VIII-K": ["CEPI ROMDONI FAJAR, S.Pd","198704272025211123"]
};

// Generator 33 Kelas Resmi SMPN 1 Rajapolah (VII-A s.d IX-K)
export const INITIAL_CLASSES: SchoolClass[] = (() => {
  const classes: SchoolClass[] = [];
  const tingkatList: ('VII' | 'VIII' | 'IX')[] = ['VII', 'VIII', 'IX'];

  for (const tingkat of tingkatList) {
    for (const kode of KELAS_LETTERS) {
      const classId = `${tingkat}-${kode}`;
      const wali = WALI_KELAS_MAP[classId] || ['', ''];
      classes.push({
        id: classId,
        tingkat,
        kode,
        nama: `Kelas ${tingkat}-${kode}`,
        waliKelasNama: wali[0],
        waliKelasNip: wali[1],
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        fase: 'D'
      });
    }
  }
  return classes;
})();

// Data 53 Guru Resmi SMPN 1 Rajapolah [NIP, Nama, MapelId, MapelName, AssignedClasses]
const TEACHER_LIST: [string, string, string, string, string[]][] = [
  ["196712271990022002","ADE IPIN SUPRIATIN, S.Pd","MTK","Matematika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196612071991032005","AI NURLINA, S.Pd","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196911121998022003","AI TARLIANI, S.Pd","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197812232009021003","ANAS NURDIN, S.Pd","PJOK","PJOK",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196908201994121001","ANWAR MUSADAD, S.Pd.Kn.","PPKN","PPKN",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199609022025211089","ARIS SUNANDAR, S.Pd","BK","Bimbingan Konseling",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197012122005011005","ASEP FATHURROHMAN, S.Ag.","PAIBP","PAIBP",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197006081997022001","BEAH RUBAEAH","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198704272025211123","CEPI ROMDONI FAJAR, S.Pd","PJOK","PJOK",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198107302011011002","CEPIANA ABAS, S.Pd.,M.Pd","BINGG","Bahasa Inggris",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197901172008012006","DEDE NURHAYATI, S.Pd","MTK","Matematika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196901161992031009","DIDI SADRI USMAN, S.Pd","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196707211995012001","Dra. Hj. TETI ROHDIATI, M.Pd.","IPS","IPS",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196610241993031006","Drs. PEPEN SARIP EPENDI","MULOK","Mulok Bahasa Daerah",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197610012021211001","EDI DARWADI, S.Pd","PJOK","PJOK",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198102032024212007","ELIS KURNIATI, S.Pd","SBD","Seni Budaya",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197209042007012006","ENUNG RIWAYATI, S.Pd","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196808241991032003","ENUNG WASILAH, S.Pd","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196812301998022002","ERNE RIYANAWATI, S.Pd","BINGG","Bahasa Inggris",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199902182024211010","FAHMI MIFTAHULZAMAN, S.Pd","PPKN","PPKN",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199711082025211091","FAUZAN ILHAM, S.Pd","PJOK","PJOK",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196807101998021002","H. BASAR, S.Ag., MM.Pd.","PAIBP","PAIBP",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196904101991031006","H. TATANG SUDANAWAN, S.Pd","MTK","Matematika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196808131991011001","H. YUSUF NURJAMAN, S.Pd.,M.M","MTK","Matematika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196801011992031015","HARID HARYAMAN, S.Pd.Fis.","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199701162025212120","HENI NUR AZIZAH, S.Pd","PAIBP","PAIBP",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196910162021212001","Hj. ANI MARDIANI, S.Pd","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196911041995122004","Hj. SRINANINGSIH, S.Pd","BINGG","Bahasa Inggris",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196904101995122005","Hj. YEYEH SOFIAH, S.Pd","IPS","IPS",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196905081994122004","IMAS AMALIA, S.Pd.Mat.","MTK","Matematika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197609292002122002","IMAS HALIMAH, S.Pd","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197805022021212001","IRA TRISTIAWATI, S.Kom","INF","Informatika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197006151997021004","KENDRA PERMANA, S.Pd","PPKN","PPKN",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198307232009022004","LINA LESTARI, S.Pd","IPS","IPS",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["2543769669110002","M. GALIH GULIGAH, S.Kom","INF","Informatika",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["196812141992031003","MAMAT RAHMAT, S.Pd","BK","BK",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199605162020122006","MEY MEY TRI KUSDIANI, S.pd","SBD","Seni Budaya",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199707012022211001","MIFTAH SAEPUL ANWAR, S.Pd","SBD","Seni Budaya",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198106142009022005","NANIK DWI ASTUTI, M.Pd","BINGG","Bahasa Inggris",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198806052011012003","NENDEN SRI UTARI, S.Pd","MULOK","Mulok Bahasa Daerah",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199810062024212017","NENG AJENG AYU LESTARI, S.Pd","BK","Bimbingan Konseling",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198808312022211005","PENDRI PRAYOGA, S.Kom","INF","Mata Pelajaran",["VII-J","VII-K","VIII-A","VIII-B","VIII-C","VIII-D","VIII-E","VIII-F","VIII-G","VIII-H","VIII-I","VIII-J","VIII-K"]],
  ["197601012007012031","RENI NURAENI, S.Pd","BINGG","Bahasa Inggris",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197403112006042010","RIDA RIDIAWATI, S.Pd","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198005102023212008","RIKA MUDRIKA, S.H.I","PAIBP","PAIBP",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198112262014102002","RINA YULIANA, S.Pd","PPKN","PPKN",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["7555775676130202","SAEPUL HAKIM, S.Pd","IPS","IPS",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199108272025212137","SANTI SRI RAHAYU, S.Pd","IPS","IPS",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["199109032024212030","SITI SAADAH, S.Pd","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["198112022024212009","TARISNIYATI DARISMAN, S.Pd","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["197303171998022002","WIDI RESTUTI, S.Pd","IPA","IPA",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["7459777678230133","WIDYA IMARDHEA, S.Pd","SBD","Seni Budaya",["VII-A","VII-B","VII-C","VII-D","VII-E"]],
  ["6844775676230252","YONA MAHYA MAULANI, S.Pd","BINDO","Bahasa Indonesia",["VII-A","VII-B","VII-C","VII-D","VII-E"]]
];

// Daftar Akun Pengguna Bawaan (Super Admin + 53 Guru Mapel Resmi)
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin',
    nip: 'Superadmin',
    username: 'Superadmin',
    nama: 'Super Administrator',
    role: 'SUPER_ADMIN',
    assignedClassIds: INITIAL_CLASSES.map(c => c.id),
    password: 'Superadmin',
    email: 'superadmin@smpn1cemerlang.sch.id',
    noHp: '081234567890'
  },
  ...TEACHER_LIST.map(([nip, nama, mapelId, mapelName, assignedClassIds]) => ({
    id: `user-guru-${nip}`,
    nip,
    nama,
    role: 'GURU_MAPEL' as const,
    mapelId,
    mapelName,
    assignedClassIds,
    password: 'guru123',
    isWaliKelas: Object.values(WALI_KELAS_MAP).some(w => w[1] === nip)
  }))
];

export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_GRADES: GradeRecord[] = [];

export function calculateGradeDerived(
  formatif: number,
  uh: number,
  pts: number,
  kkm: number = 75,
  bobotFormatif: number = 30,
  bobotUH: number = 30,
  bobotPTS: number = 40,
  mapelName: string = 'Mata Pelajaran'
) {
  const nilaiAkhir = Math.round(
    (formatif * (bobotFormatif / 100)) +
    (uh * (bobotUH / 100)) +
    (pts * (bobotPTS / 100))
  );

  let predikat: 'A' | 'B' | 'C' | 'D' = 'C';
  if (nilaiAkhir >= 90) predikat = 'A';
  else if (nilaiAkhir >= 80) predikat = 'B';
  else if (nilaiAkhir >= 70) predikat = 'C';
  else predikat = 'D';

  const keterangan = nilaiAkhir >= kkm ? 'Tuntas' : 'Perlu Bimbingan';

  let capaianKompetensi = '';
  if (predikat === 'A') {
    capaianKompetensi = `Sangat istimewa dalam menguasai seluruh capaian pembelajaran ${mapelName} pada penilaian tengah semester dan mampu bernalar kritis secara konsisten.`;
  } else if (predikat === 'B') {
    capaianKompetensi = `Menunjukkan pemahaman yang baik dan tuntas dalam menguasai materi pokok ${mapelName} tengah semester, dengan sedikit bimbingan lanjutan.`;
  } else if (predikat === 'C') {
    capaianKompetensi = `Cukup menguasai materi ${mapelName} namun perlu meningkatkan latihan soal terstruktur dan penyelesaian tugas formatif.`;
  } else {
    capaianKompetensi = `Perlu pendampingan khusus dan bimbingan remedial intensif pada pemahaman konsep dasar ${mapelName}.`;
  }

  return { nilaiAkhir, predikat, keterangan, capaianKompetensi };
}
