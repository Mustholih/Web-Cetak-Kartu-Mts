import {
  Student,
  SchoolIdentity,
  LibraryCardConfig,
  StudentCardConfig,
  PrintSettings,
} from '../types';
import {
  DEFAULT_SCHOOL_IDENTITY,
  DEFAULT_STUDENTS,
  DEFAULT_LIBRARY_CARD_CONFIG,
  DEFAULT_STUDENT_CARD_CONFIG,
} from './defaultData';

const KEYS = {
  STUDENTS: 'mts_miftahul_huda_students_v1',
  IDENTITY: 'mts_miftahul_huda_identity_v1',
  LIBRARY_CONFIG: 'mts_miftahul_huda_lib_config_v1',
  STUDENT_CONFIG: 'mts_miftahul_huda_std_config_v1',
  PRINT_SETTINGS: 'mts_miftahul_huda_print_settings_v1',
  ACADEMIC_YEARS: 'mts_miftahul_huda_academic_years_v1',
  ADMIN_PIN: 'mts_miftahul_huda_admin_pin_v1',
};

export const StorageService = {
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      if (!data) {
        this.saveStudents(DEFAULT_STUDENTS);
        return DEFAULT_STUDENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading students from storage:', e);
      return DEFAULT_STUDENTS;
    }
  },

  saveStudents(students: Student[]): void {
    try {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Error saving students:', e);
    }
  },

  addStudent(student: Omit<Student, 'id'>): { success: boolean; message: string; student?: Student } {
    const students = this.getStudents();
    // Validate duplicate NIS
    const exists = students.some((s) => s.nis.trim() === student.nis.trim());
    if (exists) {
      return { success: false, message: `NIS "${student.nis}" sudah terdaftar atas nama siswa lain!` };
    }

    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      noAnggotaPerpus: student.noAnggotaPerpus || `P-${student.nis.trim()}`,
      isLibraryCardPrinted: false,
      isStudentCardPrinted: false,
      updatedAt: new Date().toISOString(),
    };

    students.unshift(newStudent);
    this.saveStudents(students);
    return { success: true, message: 'Data siswa berhasil ditambahkan.', student: newStudent };
  },

  updateStudent(student: Student): { success: boolean; message: string } {
    const students = this.getStudents();
    // Validate duplicate NIS with other students
    const existsOther = students.some(
      (s) => s.id !== student.id && s.nis.trim() === student.nis.trim()
    );
    if (existsOther) {
      return { success: false, message: `NIS "${student.nis}" sudah digunakan oleh siswa lain!` };
    }

    const index = students.findIndex((s) => s.id === student.id);
    if (index === -1) {
      return { success: false, message: 'Data siswa tidak ditemukan.' };
    }

    students[index] = {
      ...student,
      updatedAt: new Date().toISOString(),
    };
    this.saveStudents(students);
    return { success: true, message: 'Data siswa berhasil diperbarui.' };
  },

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter((s) => s.id !== id);
    if (filtered.length !== students.length) {
      this.saveStudents(filtered);
      return true;
    }
    return false;
  },

  deleteMultipleStudents(ids: string[]): number {
    const students = this.getStudents();
    const idSet = new Set(ids);
    const filtered = students.filter((s) => !idSet.has(s.id));
    const count = students.length - filtered.length;
    this.saveStudents(filtered);
    return count;
  },

  updatePhotoForStudent(nisnNisOrId: string, photoDataUrl: string): boolean {
    const students = this.getStudents();
    const cleanQuery = nisnNisOrId.trim();
    const target = students.find(
      (s) =>
        (s.nisn && s.nisn.trim() === cleanQuery) ||
        s.nis.trim() === cleanQuery ||
        s.id === cleanQuery
    );
    if (target) {
      target.fotoUrl = photoDataUrl;
      target.updatedAt = new Date().toISOString();
      this.saveStudents(students);
      return true;
    }
    return false;
  },

  getSchoolIdentity(): SchoolIdentity {
    try {
      const data = localStorage.getItem(KEYS.IDENTITY);
      if (!data) {
        this.saveSchoolIdentity(DEFAULT_SCHOOL_IDENTITY);
        return DEFAULT_SCHOOL_IDENTITY;
      }
      return { ...DEFAULT_SCHOOL_IDENTITY, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading school identity:', e);
      return DEFAULT_SCHOOL_IDENTITY;
    }
  },

  saveSchoolIdentity(identity: SchoolIdentity): void {
    try {
      localStorage.setItem(KEYS.IDENTITY, JSON.stringify(identity));
    } catch (e) {
      console.error('Error saving school identity:', e);
    }
  },

  getLibraryConfig(): LibraryCardConfig {
    try {
      const data = localStorage.getItem(KEYS.LIBRARY_CONFIG);
      if (!data) {
        this.saveLibraryConfig(DEFAULT_LIBRARY_CARD_CONFIG);
        return DEFAULT_LIBRARY_CARD_CONFIG;
      }
      return { ...DEFAULT_LIBRARY_CARD_CONFIG, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_LIBRARY_CARD_CONFIG;
    }
  },

  saveLibraryConfig(config: LibraryCardConfig): void {
    try {
      localStorage.setItem(KEYS.LIBRARY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving library config:', e);
    }
  },

  getStudentConfig(): StudentCardConfig {
    try {
      const data = localStorage.getItem(KEYS.STUDENT_CONFIG);
      if (!data) {
        this.saveStudentConfig(DEFAULT_STUDENT_CARD_CONFIG);
        return DEFAULT_STUDENT_CARD_CONFIG;
      }
      return { ...DEFAULT_STUDENT_CARD_CONFIG, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_STUDENT_CARD_CONFIG;
    }
  },

  saveStudentConfig(config: StudentCardConfig): void {
    try {
      localStorage.setItem(KEYS.STUDENT_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving student config:', e);
    }
  },

  getAcademicYears(): string[] {
    try {
      const data = localStorage.getItem(KEYS.ACADEMIC_YEARS);
      if (!data) {
        const defaults = ['2024/2025', '2025/2026', '2026/2027', '2027/2028'];
        localStorage.setItem(KEYS.ACADEMIC_YEARS, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(data);
    } catch (e) {
      return ['2025/2026', '2026/2027', '2027/2028'];
    }
  },

  saveAcademicYears(years: string[]): void {
    localStorage.setItem(KEYS.ACADEMIC_YEARS, JSON.stringify(years));
  },

  getAdminPin(): string {
    return localStorage.getItem(KEYS.ADMIN_PIN) || 'admin123';
  },

  setAdminPin(pin: string): void {
    localStorage.setItem(KEYS.ADMIN_PIN, pin);
  },

  exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      school: this.getSchoolIdentity(),
      students: this.getStudents(),
      libraryConfig: this.getLibraryConfig(),
      studentConfig: this.getStudentConfig(),
      academicYears: this.getAcademicYears(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importFullBackup(jsonString: string): { success: boolean; count?: number; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.students)) {
        return { success: false, message: 'Format file backup tidak valid!' };
      }
      if (parsed.school) this.saveSchoolIdentity(parsed.school);
      if (parsed.students) this.saveStudents(parsed.students);
      if (parsed.libraryConfig) this.saveLibraryConfig(parsed.libraryConfig);
      if (parsed.studentConfig) this.saveStudentConfig(parsed.studentConfig);
      if (parsed.academicYears) this.saveAcademicYears(parsed.academicYears);

      return {
        success: true,
        count: parsed.students.length,
        message: `Berhasil memulihkan ${parsed.students.length} data siswa dan konfigurasi madrasah!`,
      };
    } catch (err: any) {
      return { success: false, message: `Gagal membaca file backup: ${err.message}` };
    }
  },

  resetToDefaults(): void {
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.IDENTITY);
    localStorage.removeItem(KEYS.LIBRARY_CONFIG);
    localStorage.removeItem(KEYS.STUDENT_CONFIG);
    this.saveStudents(DEFAULT_STUDENTS);
    this.saveSchoolIdentity(DEFAULT_SCHOOL_IDENTITY);
    this.saveLibraryConfig(DEFAULT_LIBRARY_CARD_CONFIG);
    this.saveStudentConfig(DEFAULT_STUDENT_CARD_CONFIG);
  },
};
