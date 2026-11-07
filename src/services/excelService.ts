import * as XLSX from 'xlsx';
import { Student, Teacher } from '../types';

export interface ParseResult {
  validStudents: Omit<Student, 'id'>[];
  errors: string[];
  totalRows: number;
}

export interface TeacherParseResult {
  validTeachers: Omit<Teacher, 'id'>[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}

export const ExcelService = {
  // Download standard template for MTs Miftahul Huda operator
  downloadTemplate(): void {
    const templateData = [
      {
        'No': 1,
        'Nama Lengkap': 'AHMAD FAIZIN AL-FARUQ',
        'NIS': '2607001',
        'NISN': '0112345678',
        'Kelas': '7A',
        'Tempat Lahir': 'Merangin',
        'Tanggal Lahir': '12/05/2013',
        'Jenis Kelamin': 'L',
        'Alamat': 'Desa Rawa Jaya RT 04, Tabir Selatan',
      },
      {
        'No': 2,
        'Nama Lengkap': 'AISYAH NUR FATIMAH',
        'NIS': '2607002',
        'NISN': '0112345679',
        'Kelas': '7A',
        'Tempat Lahir': 'Bangko',
        'Tanggal Lahir': '24/08/2013',
        'Jenis Kelamin': 'P',
        'Alamat': 'Jl. Poros Rawa Jaya Unit 1',
      },
      {
        'No': 3,
        'Nama Lengkap': 'BILAL AL-GHIFARI',
        'NIS': '2607003',
        'NISN': '0112345680',
        'Kelas': '7B',
        'Tempat Lahir': 'Merangin',
        'Tanggal Lahir': '03/03/2013',
        'Jenis Kelamin': 'L',
        'Alamat': 'Desa Bungo Antoi',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for neat look
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 28 }, // Nama
      { wch: 14 }, // NIS
      { wch: 16 }, // NISN
      { wch: 10 }, // Kelas
      { wch: 18 }, // Tempat Lahir
      { wch: 16 }, // Tanggal Lahir
      { wch: 14 }, // Jenis Kelamin (L/P)
      { wch: 35 }, // Alamat
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    XLSX.writeFile(workbook, 'Template_Data_Siswa_MTs_Miftahul_Huda.xlsx');
  },

  // Export current student list to Excel
  exportStudents(students: Student[], schoolName = 'MTs Miftahul Huda'): void {
    const rows = students.map((s, index) => ({
      'No': index + 1,
      'Nama Lengkap': s.nama,
      'NIS': s.nis,
      'NISN': s.nisn || '',
      'Kelas': s.kelas,
      'Tempat Lahir': s.tempatLahir || '',
      'Tanggal Lahir': s.tanggalLahir || '',
      'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)',
      'No Anggota Perpus': s.noAnggotaPerpus || `P-${s.nis}`,
      'Status Foto': s.fotoUrl ? 'Sudah Ada' : 'Belum Ada',
      'Kartu Perpus': s.isLibraryCardPrinted ? 'Sudah Dicetak' : 'Belum',
      'Kartu Siswa': s.isStudentCardPrinted ? 'Sudah Dicetak' : 'Belum',
      'Alamat': s.alamat || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 14 },
      { wch: 16 },
      { wch: 10 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa MTs');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Data_Siswa_${schoolName.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
  },

  // Read and parse uploaded Excel/CSV file
  async parseFile(file: File, existingStudents: Student[]): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            resolve({ validStudents: [], errors: ['File Excel tidak memiliki lembar kerja (sheet).'], totalRows: 0 });
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (rawRows.length === 0) {
            resolve({ validStudents: [], errors: ['File Excel kosong, tidak ada baris data.'], totalRows: 0 });
            return;
          }

          const validStudents: Omit<Student, 'id'>[] = [];
          const errors: string[] = [];
          const seenNisInFile = new Set<string>();
          const existingNisMap = new Map<string, string>();
          existingStudents.forEach((s) => existingNisMap.set(s.nis.trim().toLowerCase(), s.nama));

          rawRows.forEach((row, idx) => {
            const rowNum = idx + 2; // header is row 1

            // Helper to get value matching key variations
            const getVal = (keys: string[]): string => {
              for (const key of Object.keys(row)) {
                const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                for (const candidate of keys) {
                  if (normalized.includes(candidate)) {
                    return String(row[key]).trim();
                  }
                }
              }
              return '';
            };

            const nama = getVal(['nama', 'namalengkap', 'siswa', 'student']);
            const nis = getVal(['nis', 'noinduk', 'nomorinduk']);
            const nisn = getVal(['nisn']);
            const kelas = getVal(['kelas', 'tingkat', 'rombel', 'class']) || '7';
            const tempatLahir = getVal(['tempatlahir', 'tempat', 'tmp']);
            const tanggalLahir = getVal(['tanggallahir', 'tgllahir', 'tgl', 'birthdate']);
            const jkRaw = getVal(['jeniskelamin', 'jk', 'gender', 'sex', 'lp']).toUpperCase();
            const alamat = getVal(['alamat', 'domisili', 'address']);

            if (!nama) {
              errors.push(`Baris ${rowNum}: Nama siswa kosong.`);
              return;
            }

            if (!nis) {
              errors.push(`Baris ${rowNum}: NIS siswa "${nama}" kosong.`);
              return;
            }

            const cleanNis = String(nis).trim();
            const nisLower = cleanNis.toLowerCase();

            // Duplicate in file
            if (seenNisInFile.has(nisLower)) {
              errors.push(`Baris ${rowNum}: NIS "${cleanNis}" duplikat di dalam file ini.`);
              return;
            }
            seenNisInFile.add(nisLower);

            // Duplicate in existing database check
            if (existingNisMap.has(nisLower)) {
              errors.push(`Baris ${rowNum}: NIS "${cleanNis}" sudah ada di database atas nama "${existingNisMap.get(nisLower)}".`);
              return;
            }

            // Normalize JK
            const jenisKelamin: 'L' | 'P' =
              jkRaw.startsWith('L') || jkRaw.includes('LAKI') || jkRaw.includes('MALE')
                ? 'L'
                : 'P';

            validStudents.push({
              nis: cleanNis,
              nisn: String(nisn || '').trim(),
              nama: nama.toUpperCase(),
              kelas: kelas.toUpperCase(),
              tempatLahir: tempatLahir || 'Merangin',
              tanggalLahir: tanggalLahir || '-',
              jenisKelamin,
              alamat: alamat || 'Tabir Selatan, Merangin',
              noAnggotaPerpus: `P-${cleanNis}`,
              isLibraryCardPrinted: false,
              isStudentCardPrinted: false,
            });
          });

          resolve({
            validStudents,
            errors,
            totalRows: rawRows.length,
          });
        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // Download standard Excel template for teachers / exam supervisors
  downloadTeacherTemplate(): void {
    const templateData = [
      {
        'No': 1,
        'Nama Lengkap & Gelar': 'Dra. Hj. Siti Aminah, M.Pd.',
        'Inisial': 'SA',
        'NIP / NPK': '197203151998032001',
        'Mata Pelajaran': "Al-Qur'an Hadis",
        'No WhatsApp / HP': '081234567801',
      },
      {
        'No': 2,
        'Nama Lengkap & Gelar': "H. Ahmad Rifa'i, S.Pd.I.",
        'Inisial': 'AR',
        'NIP / NPK': '198402122009011015',
        'Mata Pelajaran': 'Fiqih',
        'No WhatsApp / HP': '081234567802',
      },
      {
        'No': 3,
        'Nama Lengkap & Gelar': 'Muhammad Ridwan, S.Pd.',
        'Inisial': 'MR',
        'NIP / NPK': '198805202011011003',
        'Mata Pelajaran': 'Matematika',
        'No WhatsApp / HP': '081398765431',
      },
      {
        'No': 4,
        'Nama Lengkap & Gelar': 'Nurul Hidayati, S.Ag.',
        'Inisial': 'NH',
        'NIP / NPK': '-',
        'Mata Pelajaran': 'Sejarah Kebudayaan Islam',
        'No WhatsApp / HP': '085277889901',
      },
      {
        'No': 5,
        'Nama Lengkap & Gelar': 'Zulkifli, S.Pd.',
        'Inisial': 'ZK',
        'NIP / NPK': '-',
        'Mata Pelajaran': 'Bahasa Indonesia',
        'No WhatsApp / HP': '085366554433',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set neat column widths
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 32 }, // Nama Lengkap & Gelar
      { wch: 12 }, // Inisial (2-3 huruf)
      { wch: 24 }, // NIP / NPK
      { wch: 28 }, // Mata Pelajaran
      { wch: 18 }, // No WhatsApp / HP
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru MTs');

    XLSX.writeFile(workbook, 'Template_Data_Guru_MTs_Miftahul_Huda.xlsx');
  },

  // Export current teacher list to Excel (.xlsx)
  exportTeachers(teachers: Teacher[], schoolName = 'MTs Miftahul Huda'): void {
    const rows = teachers.map((t, index) => ({
      'No': index + 1,
      'Inisial Pengawas': t.inisial,
      'Nama Lengkap & Gelar': t.nama,
      'NIP / NPK': t.nip || '-',
      'Mata Pelajaran': t.mataPelajaran || '-',
      'No WhatsApp / HP': t.noHp || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 18 }, // Inisial
      { wch: 35 }, // Nama
      { wch: 24 }, // NIP / NPK
      { wch: 28 }, // Mata Pelajaran
      { wch: 20 }, // No HP
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(
      workbook,
      `Data_Guru_${schoolName.replace(/\s+/g, '_')}_${dateStr}.xlsx`
    );
  },

  // Read and parse uploaded Excel/CSV file for teachers
  async parseTeacherFile(
    file: File,
    existingTeachers: Teacher[],
    mode: 'append' | 'replace' = 'append'
  ): Promise<TeacherParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            resolve({
              validTeachers: [],
              errors: ['File Excel tidak memiliki lembar kerja (sheet).'],
              warnings: [],
              totalRows: 0,
            });
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (rawRows.length === 0) {
            resolve({
              validTeachers: [],
              errors: ['File Excel kosong, tidak ditemukan baris data guru.'],
              warnings: [],
              totalRows: 0,
            });
            return;
          }

          const validTeachers: Omit<Teacher, 'id'>[] = [];
          const errors: string[] = [];
          const warnings: string[] = [];

          // Keep track of used initials
          const usedInitials = new Set<string>();
          if (mode === 'append') {
            existingTeachers.forEach((t) => usedInitials.add(t.inisial.trim().toUpperCase()));
          }

          // Initial suggestion helper from teacher name
          const generateInitial = (fullName: string): string => {
            const clean = fullName
              .replace(/\b(Drs|Dra|Dr|Prof|Hj|H|Ust|Ustadz|Kyai|S\.Pd|M\.Pd|S\.Pd\.I|M\.Pd\.I|S\.Ag|S\.Si|S\.E|S\.Kom|M\.Si)\b/gi, '')
              .replace(/[^a-zA-Z\s]/g, '')
              .trim();

            const parts = clean.split(/\s+/).filter(Boolean);
            let base = '';
            if (parts.length >= 2) {
              base = (parts[0][0] + parts[1][0]).toUpperCase();
            } else if (parts.length === 1 && parts[0].length >= 2) {
              base = parts[0].slice(0, 2).toUpperCase();
            } else {
              base = 'G' + Math.floor(Math.random() * 90 + 10);
            }

            // Ensure unique
            let candidate = base;
            let counter = 2;
            while (usedInitials.has(candidate)) {
              if (parts.length >= 3 && counter === 2) {
                candidate = (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase();
              } else {
                candidate = `${base}${counter}`;
              }
              counter++;
            }
            return candidate;
          };

          rawRows.forEach((row, idx) => {
            const rowNum = idx + 2;

            // Helper to get value matching key variations
            const getVal = (keys: string[]): string => {
              for (const key of Object.keys(row)) {
                const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                for (const candidate of keys) {
                  if (normalized.includes(candidate)) {
                    return String(row[key]).trim();
                  }
                }
              }
              return '';
            };

            const nama = getVal(['namalengkap', 'namaguru', 'nama', 'guru', 'pengawas', 'teacher', 'fullname']);
            const inisialRaw = getVal(['inisial', 'initial', 'kodeinisial', 'kodepengawas', 'kode', 'code']);
            const nip = getVal(['nip', 'npk', 'nik', 'nomorinduk', 'idpegawai']);
            const mataPelajaran = getVal(['matapelajaran', 'mapel', 'bidangstudi', 'bidang', 'pelajaran', 'subject']);
            const noHp = getVal(['nowhatsapp', 'whatsapp', 'nohp', 'hp', 'telepon', 'telp', 'wa', 'phone']);

            if (!nama) {
              errors.push(`Baris ${rowNum}: Nama guru kosong.`);
              return;
            }

            let finalInisial = inisialRaw.toUpperCase().replace(/[^A-Z0-9]/g, '');

            // If empty inisial, generate automatically
            if (!finalInisial) {
              finalInisial = generateInitial(nama);
              warnings.push(`Baris ${rowNum}: Inisial untuk "${nama}" dibuat otomatis menjadi "${finalInisial}".`);
            } else if (usedInitials.has(finalInisial)) {
              // Collision handling
              const newInisial = generateInitial(nama);
              warnings.push(
                `Baris ${rowNum}: Inisial "${finalInisial}" untuk "${nama}" sudah terpakai, diganti menjadi "${newInisial}".`
              );
              finalInisial = newInisial;
            }

            usedInitials.add(finalInisial);

            validTeachers.push({
              nama: nama.trim(),
              inisial: finalInisial,
              nip: nip.trim() || '-',
              mataPelajaran: mataPelajaran.trim() || '',
              noHp: noHp.trim() || '',
            });
          });

          resolve({
            validTeachers,
            errors,
            warnings,
            totalRows: rawRows.length,
          });
        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },
};
