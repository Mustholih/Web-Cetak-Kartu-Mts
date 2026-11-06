import * as XLSX from 'xlsx';
import { Student } from '../types';

export interface ParseResult {
  validStudents: Omit<Student, 'id'>[];
  errors: string[];
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
};
