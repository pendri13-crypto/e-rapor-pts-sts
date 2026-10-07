import * as XLSX from 'xlsx';
import { UserAccount, Student, SchoolClass, Subject, StudentReportSummary } from '../types';
import { INITIAL_CLASSES, INITIAL_SUBJECTS } from '../data/seedData';

export const ExcelService = {
  // ==========================================
  // 1. DATA GURU (TEACHERS) EXCEL
  // ==========================================

  // Unduh Template Excel untuk Tambah/Upload Guru
  downloadTeacherTemplate: () => {
    const templateData = [
      {
        'NIP_NUPTK': '198205142008012015',
        'Nama_Lengkap': 'Dra. Siti Nurhaliza',
        'Role': 'GURU_MAPEL',
        'Kode_Mapel': 'MTK',
        'Nama_Mapel': 'Matematika',
        'Kelas_Yang_Diajar': 'VII-A, VII-B, VII-C, VII-D, VII-E',
        'Password': 'guru123',
        'Email': 'siti.nurhaliza@sekolah.sch.id',
        'No_HP': '081234567890'
      },
      {
        'NIP_NUPTK': '198603202011011003',
        'Nama_Lengkap': 'Budi Santoso, S.Pd.',
        'Role': 'GURU_MAPEL',
        'Kode_Mapel': 'BINDO',
        'Nama_Mapel': 'Bahasa Indonesia',
        'Kelas_Yang_Diajar': 'VII-A, VII-B, VII-C, VIII-A, VIII-B, IX-A',
        'Password': 'guru123',
        'Email': 'budi.santoso@sekolah.sch.id',
        'No_HP': '081298765432'
      },
      {
        'NIP_NUPTK': '199011152015022004',
        'Nama_Lengkap': 'Rina Wulandari, S.Pd.',
        'Role': 'GURU_MAPEL',
        'Kode_Mapel': 'IPA',
        'Nama_Mapel': 'IPA',
        'Kelas_Yang_Diajar': 'VII-A, VII-B, VII-C, VII-D, VII-E',
        'Password': 'guru123',
        'Email': 'rina.wulandari@sekolah.sch.id',
        'No_HP': '081345678901'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set Column Widths
    worksheet['!cols'] = [
      { wch: 22 }, // NIP
      { wch: 28 }, // Nama
      { wch: 15 }, // Role
      { wch: 14 }, // Kode Mapel
      { wch: 22 }, // Nama Mapel
      { wch: 35 }, // Kelas
      { wch: 14 }, // Password
      { wch: 28 }, // Email
      { wch: 16 }, // No HP
    ];

    // Reference Sheet: List of 11 Subjects & 33 Classes
    const refData = [
      { 'KODE_MAPEL': 'PAIBP', 'NAMA_MAPEL': 'PAIBP' },
      { 'KODE_MAPEL': 'PPKN', 'NAMA_MAPEL': 'PPKN' },
      { 'KODE_MAPEL': 'BINDO', 'NAMA_MAPEL': 'Bahasa Indonesia' },
      { 'KODE_MAPEL': 'MTK', 'NAMA_MAPEL': 'Matematika' },
      { 'KODE_MAPEL': 'IPA', 'NAMA_MAPEL': 'IPA' },
      { 'KODE_MAPEL': 'IPS', 'NAMA_MAPEL': 'IPS' },
      { 'KODE_MAPEL': 'BING', 'NAMA_MAPEL': 'Bahasa Inggris' },
      { 'KODE_MAPEL': 'INFOR', 'NAMA_MAPEL': 'Informatika' },
      { 'KODE_MAPEL': 'PJOK', 'NAMA_MAPEL': 'PJOK' },
      { 'KODE_MAPEL': 'SENI', 'NAMA_MAPEL': 'Seni Budaya' },
      { 'KODE_MAPEL': 'MULOK', 'NAMA_MAPEL': 'Mulok Bahasa Daerah' },
    ];
    const refWorksheet = XLSX.utils.json_to_sheet(refData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Guru');
    XLSX.utils.book_append_sheet(workbook, refWorksheet, 'Referensi_Mapel');

    XLSX.writeFile(workbook, 'Template_Upload_Guru_eRapor_PTS.xlsx');
  },

  // Export Data Guru Aktif ke Excel
  exportTeachersToExcel: (teachers: UserAccount[]) => {
    const list = teachers.filter(u => u.role === 'GURU_MAPEL');
    const data = list.map((u, idx) => ({
      'No': idx + 1,
      'NIP_NUPTK': u.nip,
      'Nama_Lengkap': u.nama,
      'Peran': 'Guru Mapel',
      'Mata_Pelajaran': u.mapelName || '-',
      'Kode_Mapel': u.mapelId || '-',
      'Jumlah_Kelas': u.assignedClassIds.length,
      'Daftar_Kelas': u.assignedClassIds.join(', '),
      'Wali_Kelas': u.isWaliKelas ? `Ya (${u.waliKelasId})` : 'Tidak',
      'Email': u.email || '-',
      'No_HP': u.noHp || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 28 },
      { wch: 15 },
      { wch: 24 },
      { wch: 14 },
      { wch: 14 },
      { wch: 40 },
      { wch: 16 },
      { wch: 26 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Guru');
    XLSX.writeFile(workbook, `Data_Guru_eRapor_PTS_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  // Parse Excel File Guru
  parseTeachersFromExcel: async (file: File): Promise<{ teachers: UserAccount[]; errors: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          const teachers: UserAccount[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, idx) => {
            const rowNum = idx + 2; // header is row 1
            const nip = String(row['NIP_NUPTK'] || row['NIP'] || row['nip'] || '').trim();
            const nama = String(row['Nama_Lengkap'] || row['Nama'] || row['nama'] || '').trim();

            if (!nip) {
              errors.push(`Baris ${rowNum}: NIP/NUPTK kosong`);
              return;
            }
            if (!nama) {
              errors.push(`Baris ${rowNum}: Nama Guru kosong`);
              return;
            }

            const rawRole = String(row['Role'] || row['role'] || 'GURU_MAPEL').trim().toUpperCase();
            const role: 'SUPER_ADMIN' | 'GURU_MAPEL' = rawRole.includes('ADMIN') ? 'SUPER_ADMIN' : 'GURU_MAPEL';

            const kodeMapel = String(row['Kode_Mapel'] || row['Mapel'] || 'MTK').trim().toUpperCase();
            const mapelObj = INITIAL_SUBJECTS.find(s => s.id === kodeMapel || s.nama.toLowerCase().includes(kodeMapel.toLowerCase()));
            const mapelName = mapelObj?.nama || String(row['Nama_Mapel'] || 'Mata Pelajaran');

            // Parse classes list
            const rawKelas = String(row['Kelas_Yang_Diajar'] || row['Daftar_Kelas'] || row['Kelas'] || '').trim();
            let assignedClassIds: string[] = [];

            if (rawKelas.toUpperCase() === 'SEMUA' || role === 'SUPER_ADMIN') {
              assignedClassIds = INITIAL_CLASSES.map(c => c.id);
            } else if (rawKelas) {
              const splitted = rawKelas.split(/[,;\n]/).map(k => k.trim().toUpperCase());
              assignedClassIds = splitted.filter(k => INITIAL_CLASSES.some(c => c.id === k));
            }

            if (assignedClassIds.length === 0 && role === 'GURU_MAPEL') {
              // Default to 5 classes if not specified
              assignedClassIds = ['VII-A', 'VII-B', 'VII-C', 'VII-D', 'VII-E'];
            }

            teachers.push({
              id: `user-guru-${nip}-${Date.now()}`,
              nip,
              nama,
              role,
              mapelId: kodeMapel,
              mapelName,
              assignedClassIds,
              password: String(row['Password'] || row['password'] || 'guru123').trim(),
              email: String(row['Email'] || row['email'] || '').trim() || undefined,
              noHp: String(row['No_HP'] || row['Telepon'] || '').trim() || undefined
            });
          });

          resolve({ teachers, errors });
        } catch (err: any) {
          reject(new Error(err?.message || 'Gagal memproses file Excel guru.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsArrayBuffer(file);
    });
  },

  // ==========================================
  // 2. DATA SISWA (STUDENTS) EXCEL
  // ==========================================

  // Unduh Template Excel untuk Tambah/Upload Siswa
  downloadStudentTemplate: (targetClassId?: string) => {
    const classId = targetClassId || 'VII-A';
    const templateData = [
      {
        'Kelas': classId,
        'NIS': '24250001',
        'NISN': '0071234567',
        'Nama_Peserta_Didik': 'Achmad Rizky Pratama',
        'Jenis_Kelamin': 'L',
        'Tempat_Lahir': 'Cemerlang',
        'Tanggal_Lahir': '2011-05-15',
        'Nama_Wali': 'Bambang Pratama',
        'Alamat': 'Jl. Melati No. 12, Sukamaju'
      },
      {
        'Kelas': classId,
        'NIS': '24250002',
        'NISN': '0071234568',
        'Nama_Peserta_Didik': 'Adinda Putri Maharani',
        'Jenis_Kelamin': 'P',
        'Tempat_Lahir': 'Cemerlang',
        'Tanggal_Lahir': '2011-07-20',
        'Nama_Wali': 'Agus Maharani',
        'Alamat': 'Jl. Kenanga No. 4, Sukamaju'
      },
      {
        'Kelas': classId,
        'NIS': '24250003',
        'NISN': '0071234569',
        'Nama_Peserta_Didik': 'Aisyah Nur Ramadhani',
        'Jenis_Kelamin': 'P',
        'Tempat_Lahir': 'Cemerlang',
        'Tanggal_Lahir': '2011-08-11',
        'Nama_Wali': 'Dedi Ramadhan',
        'Alamat': 'Jl. Mawar No. 15, Sukamaju'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    worksheet['!cols'] = [
      { wch: 12 }, // Kelas
      { wch: 16 }, // NIS
      { wch: 18 }, // NISN
      { wch: 30 }, // Nama
      { wch: 14 }, // JK
      { wch: 18 }, // Tempat Lahir
      { wch: 16 }, // Tgl Lahir
      { wch: 24 }, // Nama Wali
      { wch: 35 }, // Alamat
    ];

    // Reference Sheet: 33 Classes
    const refClasses = INITIAL_CLASSES.map(c => ({
      'ID_KELAS': c.id,
      'TINGKAT': c.tingkat,
      'NAMA_KELAS': c.nama,
      'WALI_KELAS': c.waliKelasNama
    }));
    const refWorksheet = XLSX.utils.json_to_sheet(refClasses);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');
    XLSX.utils.book_append_sheet(workbook, refWorksheet, 'Daftar_33_Kelas');

    XLSX.writeFile(workbook, `Template_Upload_Siswa_${classId}_eRapor.xlsx`);
  },

  // Export Data Siswa ke Excel (Per Kelas atau Semua 33 Kelas)
  exportStudentsToExcel: (students: Student[], selectedClassId?: string) => {
    const filtered = selectedClassId && selectedClassId !== 'ALL'
      ? students.filter(s => s.classId === selectedClassId)
      : students;

    const data = filtered.map((s, idx) => ({
      'No': idx + 1,
      'Kelas': s.classId,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama_Peserta_Didik': s.nama,
      'Jenis_Kelamin': s.jenisKelamin,
      'Tempat_Lahir': s.tempatLahir || '-',
      'Tanggal_Lahir': s.tanggalLahir || '-',
      'Nama_Wali': s.namaWali || '-',
      'Alamat': s.alamat || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 16 },
      { wch: 18 },
      { wch: 30 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 24 },
      { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();
    const sheetName = selectedClassId && selectedClassId !== 'ALL' ? `Siswa_${selectedClassId}` : 'Semua_Siswa';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = selectedClassId && selectedClassId !== 'ALL'
      ? `Data_Siswa_Kelas_${selectedClassId}.xlsx`
      : `Data_Siswa_Seluruh_33_Kelas.xlsx`;

    XLSX.writeFile(workbook, fileName);
  },

  // Parse Excel File Siswa
  parseStudentsFromExcel: async (
    file: File,
    defaultClassId: string = 'VII-A'
  ): Promise<{ students: Student[]; errors: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          const students: Student[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, idx) => {
            const rowNum = idx + 2;
            const nis = String(row['NIS'] || row['nis'] || '').trim();
            const nama = String(row['Nama_Peserta_Didik'] || row['Nama_Siswa'] || row['Nama'] || row['nama'] || '').trim();

            if (!nama) {
              errors.push(`Baris ${rowNum}: Nama Siswa kosong`);
              return;
            }

            const rawClass = String(row['Kelas'] || row['kelas'] || defaultClassId).trim().toUpperCase();
            // Validate if exists in 33 classes
            const matchedClass = INITIAL_CLASSES.find(c => c.id === rawClass) || INITIAL_CLASSES[0];
            const classId = matchedClass.id;

            const jkRaw = String(row['Jenis_Kelamin'] || row['JK'] || row['jk'] || 'L').trim().toUpperCase();
            const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';

            const autoNis = nis || `2425${(idx + 1).toString().padStart(4, '0')}`;
            const nisn = String(row['NISN'] || row['nisn'] || `007${autoNis}`).trim();

            students.push({
              id: `std-${classId}-${autoNis}-${Date.now()}`,
              nis: autoNis,
              nisn,
              nama,
              jenisKelamin,
              classId,
              tempatLahir: String(row['Tempat_Lahir'] || '').trim() || undefined,
              tanggalLahir: String(row['Tanggal_Lahir'] || '').trim() || undefined,
              namaWali: String(row['Nama_Wali'] || '').trim() || undefined,
              alamat: String(row['Alamat'] || '').trim() || undefined
            });
          });

          resolve({ students, errors });
        } catch (err: any) {
          reject(new Error(err?.message || 'Gagal memproses file Excel siswa.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file Excel'));
      reader.readAsArrayBuffer(file);
    });
  },

  // ==========================================
  // 3. DATA KELAS (33 CLASSES & WALI KELAS)
  // ==========================================

  downloadClassTemplate: () => {
    const data = INITIAL_CLASSES.map(c => ({
      'ID_Kelas': c.id,
      'Tingkat': c.tingkat,
      'Nama_Kelas': c.nama,
      'Nama_Wali_Kelas': c.waliKelasNama,
      'NIP_Wali_Kelas': c.waliKelasNip,
      'Tahun_Ajaran': c.tahunAjaran,
      'Semester': c.semester,
      'Fase': c.fase
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 30 },
      { wch: 22 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_33_Kelas');
    XLSX.writeFile(workbook, 'Template_Data_33_Kelas_WaliKelas.xlsx');
  },

  exportClassesToExcel: (classes: SchoolClass[], studentCounts?: Record<string, number>) => {
    const data = classes.map((c, idx) => ({
      'No': idx + 1,
      'ID_Kelas': c.id,
      'Tingkat': c.tingkat,
      'Nama_Kelas': c.nama,
      'Nama_Wali_Kelas': c.waliKelasNama,
      'NIP_Wali_Kelas': c.waliKelasNip,
      'Jumlah_Siswa': studentCounts?.[c.id] ?? 0,
      'Tahun_Ajaran': c.tahunAjaran,
      'Semester': c.semester,
      'Fase': c.fase
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 30 },
      { wch: 22 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_33_Kelas');
    XLSX.writeFile(workbook, `Data_33_Kelas_WaliKelas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  parseClassesFromExcel: async (file: File): Promise<{ classes: Partial<SchoolClass>[]; errors: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          const classes: Partial<SchoolClass>[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, idx) => {
            const rowNum = idx + 2;
            const id = String(row['ID_Kelas'] || row['ID'] || row['id'] || '').trim().toUpperCase();
            if (!id) {
              errors.push(`Baris ${rowNum}: ID Kelas kosong`);
              return;
            }

            const nama = String(row['Nama_Kelas'] || row['Nama'] || row['nama'] || `Kelas ${id}`).trim();
            const waliKelasNama = String(row['Nama_Wali_Kelas'] || row['Wali_Kelas'] || row['wali'] || '').trim();
            const waliKelasNip = String(row['NIP_Wali_Kelas'] || row['NIP_Wali'] || '').trim();

            classes.push({
              id,
              nama,
              waliKelasNama,
              waliKelasNip
            });
          });

          resolve({ classes, errors });
        } catch (err: any) {
          reject(new Error(err?.message || 'Gagal memproses file Excel kelas.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file Excel kelas'));
      reader.readAsArrayBuffer(file);
    });
  },

  // ==========================================
  // 5. REKAPITULASI 3 BULAN EXCEL (.xlsx)
  // ==========================================
  exportRekap3BulanToExcel: (
    summaries: StudentReportSummary[],
    className: string,
    classId: string,
    tahunAjaran: string
  ) => {
    const excelData = summaries.map((s) => ({
      'Peringkat': s.ranking,
      'NIS': String(s.student.nis),
      'NISN': String(s.student.nisn || '-'),
      'Nama_Siswa': s.student.nama,
      'JK': s.student.jenisKelamin,
      'Total_Nilai_11_Mapel': s.totalNilai,
      'Rata_Rata': s.rataRata,
      'Mapel_Tuntas': s.jumlahMapelTuntas,
      'Mapel_Belum_Tuntas': s.jumlahMapelBelumTuntas,
      'Status_Kelulusan': s.jumlahMapelBelumTuntas === 0 && s.totalNilai > 0 ? 'Tuntas Seluruh Mapel' : `${s.jumlahMapelBelumTuntas} Mapel Perlu Bimbingan`
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 10 }, // Peringkat
      { wch: 14 }, // NIS
      { wch: 16 }, // NISN
      { wch: 32 }, // Nama_Siswa
      { wch: 6 },  // JK
      { wch: 22 }, // Total_Nilai
      { wch: 12 }, // Rata_Rata
      { wch: 14 }, // Mapel_Tuntas
      { wch: 20 }, // Mapel_Belum_Tuntas
      { wch: 26 }, // Status_Kelulusan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap_${classId}`);

    const fileName = `Rekapitulasi_3Bulan_${classId}_${tahunAjaran.replace('/', '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  // ==========================================
  // 6. LEGER NILAI PTS 11 MAPEL EXCEL (.xlsx)
  // ==========================================
  exportLegerToExcel: (
    summaries: StudentReportSummary[],
    subjects: Subject[],
    className: string,
    classId: string,
    tahunAjaran: string
  ) => {
    const excelData = summaries.map((s, idx) => {
      const row: Record<string, string | number> = {
        'No': idx + 1,
        'NIS': String(s.student.nis),
        'NISN': String(s.student.nisn || '-'),
        'Nama_Siswa': s.student.nama,
        'JK': s.student.jenisKelamin,
      };

      // Add each subject score
      subjects.forEach(sub => {
        row[sub.kode] = s.grades[sub.id]?.nilaiAkhir ?? 0;
      });

      row['Total_Nilai'] = s.totalNilai;
      row['Rerata'] = s.rataRata;
      row['Peringkat'] = s.ranking;
      row['Sakit'] = s.kehadiran?.sakit ?? 0;
      row['Izin'] = s.kehadiran?.izin ?? 0;
      row['Alpa'] = s.kehadiran?.alpa ?? 0;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 14 }, // NIS
      { wch: 16 }, // NISN
      { wch: 32 }, // Nama_Siswa
      { wch: 6 },  // JK
      ...subjects.map(() => ({ wch: 10 })), // 11 mapel columns
      { wch: 14 }, // Total_Nilai
      { wch: 10 }, // Rerata
      { wch: 10 }, // Peringkat
      { wch: 8 },  // Sakit
      { wch: 8 },  // Izin
      { wch: 8 },  // Alpa
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Leger_${classId}`);

    const fileName = `Leger_Nilai_PTS_${classId}_${tahunAjaran.replace('/', '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
};
