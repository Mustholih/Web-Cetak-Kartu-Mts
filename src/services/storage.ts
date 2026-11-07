import {
  Student,
  SchoolIdentity,
  LibraryCardConfig,
  StudentCardConfig,
  PrintSettings,
  ExamInfo,
  ExamRoom,
  ExamAllocation,
  ExamScheduleItem,
  Teacher,
} from '../types';
import {
  DEFAULT_SCHOOL_IDENTITY,
  DEFAULT_STUDENTS,
  DEFAULT_LIBRARY_CARD_CONFIG,
  DEFAULT_STUDENT_CARD_CONFIG,
  DEFAULT_EXAM_INFO,
  DEFAULT_EXAM_ROOMS,
  DEFAULT_EXAM_SCHEDULE,
  DEFAULT_TEACHERS,
} from './defaultData';

const KEYS = {
  STUDENTS: 'mts_miftahul_huda_students_v1',
  IDENTITY: 'mts_miftahul_huda_identity_v1',
  LIBRARY_CONFIG: 'mts_miftahul_huda_lib_config_v1',
  STUDENT_CONFIG: 'mts_miftahul_huda_std_config_v1',
  PRINT_SETTINGS: 'mts_miftahul_huda_print_settings_v1',
  ACADEMIC_YEARS: 'mts_miftahul_huda_academic_years_v1',
  ADMIN_PIN: 'mts_miftahul_huda_admin_pin_v1',
  EXAM_INFO: 'mts_miftahul_huda_exam_info_v1',
  EXAM_ROOMS: 'mts_miftahul_huda_exam_rooms_v1',
  EXAM_ALLOCATIONS: 'mts_miftahul_huda_exam_allocations_v1',
  EXAM_SCHEDULE: 'mts_miftahul_huda_exam_schedule_v1',
  TEACHERS: 'mts_miftahul_huda_teachers_v1',
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
      // Clean up any exam allocation for this student
      const allocations = this.getExamAllocations();
      const newAllocations = allocations.filter((a) => a.studentId !== id);
      if (newAllocations.length !== allocations.length) {
        this.saveExamAllocations(newAllocations);
      }
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

    // Clean up exam allocations
    const allocations = this.getExamAllocations();
    const newAllocations = allocations.filter((a) => !idSet.has(a.studentId));
    this.saveExamAllocations(newAllocations);

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

  // ===== EXAM MANAGEMENT PERSISTENCE =====
  getExamInfo(): ExamInfo {
    try {
      const data = localStorage.getItem(KEYS.EXAM_INFO);
      if (!data) {
        this.saveExamInfo(DEFAULT_EXAM_INFO);
        return DEFAULT_EXAM_INFO;
      }
      return { ...DEFAULT_EXAM_INFO, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_EXAM_INFO;
    }
  },

  saveExamInfo(info: ExamInfo): void {
    localStorage.setItem(KEYS.EXAM_INFO, JSON.stringify(info));
  },

  getExamRooms(): ExamRoom[] {
    try {
      const data = localStorage.getItem(KEYS.EXAM_ROOMS);
      if (!data) {
        this.saveExamRooms(DEFAULT_EXAM_ROOMS);
        return DEFAULT_EXAM_ROOMS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_EXAM_ROOMS;
    }
  },

  saveExamRooms(rooms: ExamRoom[]): void {
    localStorage.setItem(KEYS.EXAM_ROOMS, JSON.stringify(rooms));
  },

  getExamAllocations(): ExamAllocation[] {
    try {
      const data = localStorage.getItem(KEYS.EXAM_ALLOCATIONS);
      if (!data) {
        // Pre-allocate initial students automatically into default rooms
        const students = this.getStudents();
        const rooms = this.getExamRooms();
        const initial = this.autoAllocateStudents(
          students,
          rooms,
          'by_class',
          DEFAULT_EXAM_INFO.nomorPesertaPrefix
        );
        this.saveExamAllocations(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveExamAllocations(allocations: ExamAllocation[]): void {
    localStorage.setItem(KEYS.EXAM_ALLOCATIONS, JSON.stringify(allocations));
  },

  getExamSchedule(): ExamScheduleItem[] {
    try {
      const data = localStorage.getItem(KEYS.EXAM_SCHEDULE);
      if (!data) {
        this.saveExamSchedule(DEFAULT_EXAM_SCHEDULE);
        return DEFAULT_EXAM_SCHEDULE;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_EXAM_SCHEDULE;
    }
  },

  saveExamSchedule(schedule: ExamScheduleItem[]): void {
    localStorage.setItem(KEYS.EXAM_SCHEDULE, JSON.stringify(schedule));
  },

  getTeachers(): Teacher[] {
    try {
      const data = localStorage.getItem(KEYS.TEACHERS);
      if (!data) {
        this.saveTeachers(DEFAULT_TEACHERS);
        return DEFAULT_TEACHERS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_TEACHERS;
    }
  },

  saveTeachers(teachers: Teacher[]): void {
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
  },

  addTeacher(teacher: Omit<Teacher, 'id'>): { success: boolean; message: string; teacher?: Teacher } {
    const teachers = this.getTeachers();
    const cleanInisial = (teacher.inisial || '').trim().toUpperCase();
    if (!cleanInisial) {
      return { success: false, message: 'Inisial guru tidak boleh kosong!' };
    }
    const exists = teachers.some((t) => t.inisial.trim().toUpperCase() === cleanInisial);
    if (exists) {
      return { success: false, message: `Inisial "${cleanInisial}" sudah digunakan oleh guru lain!` };
    }

    const newTeacher: Teacher = {
      ...teacher,
      inisial: cleanInisial,
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    teachers.push(newTeacher);
    this.saveTeachers(teachers);
    return { success: true, message: 'Data guru berhasil ditambahkan.', teacher: newTeacher };
  },

  updateTeacher(teacher: Teacher): { success: boolean; message: string } {
    const teachers = this.getTeachers();
    const cleanInisial = (teacher.inisial || '').trim().toUpperCase();
    const existsOther = teachers.some(
      (t) => t.id !== teacher.id && t.inisial.trim().toUpperCase() === cleanInisial
    );
    if (existsOther) {
      return { success: false, message: `Inisial "${cleanInisial}" sudah digunakan oleh guru lain!` };
    }

    const index = teachers.findIndex((t) => t.id === teacher.id);
    if (index === -1) {
      return { success: false, message: 'Data guru tidak ditemukan.' };
    }

    teachers[index] = {
      ...teacher,
      inisial: cleanInisial,
    };
    this.saveTeachers(teachers);
    return { success: true, message: 'Data guru berhasil diperbarui.' };
  },

  deleteTeacher(id: string): boolean {
    const teachers = this.getTeachers();
    const filtered = teachers.filter((t) => t.id !== id);
    if (filtered.length !== teachers.length) {
      this.saveTeachers(filtered);
      return true;
    }
    return false;
  },

  importTeachers(newTeachers: Omit<Teacher, 'id'>[], mode: 'append' | 'replace' = 'append'): Teacher[] {
    const existing = mode === 'replace' ? [] : this.getTeachers();
    const created: Teacher[] = newTeachers.map((t, idx) => ({
      ...t,
      id: `t-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
    }));

    const result = [...existing, ...created];
    this.saveTeachers(result);
    return result;
  },

  // Intelligent Automatic Student Room & Desk Distribution
  autoAllocateStudents(
    students: Student[],
    rooms: ExamRoom[],
    mode: 'by_class' | 'cross_class' | 'alphabetical' | 'by_nis',
    nomorPrefix: string = '02-15-023-'
  ): ExamAllocation[] {
    if (rooms.length === 0 || students.length === 0) return [];

    let orderedStudents: Student[] = [];

    if (mode === 'alphabetical') {
      orderedStudents = [...students].sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (mode === 'by_nis') {
      orderedStudents = [...students].sort((a, b) => a.nis.localeCompare(b.nis));
    } else if (mode === 'cross_class') {
      // Cross-class distribution: interleave Kelas 7, 8, 9
      const grouped: Record<string, Student[]> = {};
      students.forEach((s) => {
        const grade = s.kelas.charAt(0);
        if (!grouped[grade]) grouped[grade] = [];
        grouped[grade].push(s);
      });
      const grades = Object.keys(grouped).sort();
      let hasMore = true;
      let ptr = 0;
      while (hasMore) {
        hasMore = false;
        grades.forEach((g) => {
          if (ptr < grouped[g].length) {
            orderedStudents.push(grouped[g][ptr]);
            hasMore = true;
          }
        });
        ptr++;
      }
    } else {
      // by_class: 7A, 7B, 8A, 8B, 9A, 9B
      orderedStudents = [...students].sort((a, b) => {
        if (a.kelas === b.kelas) return a.nama.localeCompare(b.nama);
        return a.kelas.localeCompare(b.kelas);
      });
    }

    const allocations: ExamAllocation[] = [];
    let studentIndex = 0;

    for (let r = 0; r < rooms.length; r++) {
      const room = rooms[r];
      const capacity = room.kapasitas || 20;

      for (let seat = 1; seat <= capacity; seat++) {
        if (studentIndex >= orderedStudents.length) break;

        const std = orderedStudents[studentIndex];
        const nomorPeserta = `${nomorPrefix}${String(studentIndex + 1).padStart(3, '0')}`;

        allocations.push({
          id: `alloc-${std.id}`,
          studentId: std.id,
          roomId: room.id,
          nomorPeserta,
          nomorMeja: seat,
          isCardPrinted: false,
        });

        studentIndex++;
      }

      if (studentIndex >= orderedStudents.length) break;
    }

    return allocations;
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
      version: '2.0',
      exportedAt: new Date().toISOString(),
      school: this.getSchoolIdentity(),
      students: this.getStudents(),
      libraryConfig: this.getLibraryConfig(),
      studentConfig: this.getStudentConfig(),
      academicYears: this.getAcademicYears(),
      examInfo: this.getExamInfo(),
      examRooms: this.getExamRooms(),
      examAllocations: this.getExamAllocations(),
      examSchedule: this.getExamSchedule(),
      teachers: this.getTeachers(),
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
      if (parsed.examInfo) this.saveExamInfo(parsed.examInfo);
      if (parsed.examRooms) this.saveExamRooms(parsed.examRooms);
      if (parsed.examAllocations) this.saveExamAllocations(parsed.examAllocations);
      if (parsed.examSchedule) this.saveExamSchedule(parsed.examSchedule);
      if (parsed.teachers) this.saveTeachers(parsed.teachers);

      return {
        success: true,
        count: parsed.students.length,
        message: `Berhasil memulihkan ${parsed.students.length} data siswa, guru & pengawas, serta manajemen ujian!`,
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
    localStorage.removeItem(KEYS.EXAM_INFO);
    localStorage.removeItem(KEYS.EXAM_ROOMS);
    localStorage.removeItem(KEYS.EXAM_ALLOCATIONS);
    localStorage.removeItem(KEYS.EXAM_SCHEDULE);
    localStorage.removeItem(KEYS.TEACHERS);
    this.saveStudents(DEFAULT_STUDENTS);
    this.saveSchoolIdentity(DEFAULT_SCHOOL_IDENTITY);
    this.saveLibraryConfig(DEFAULT_LIBRARY_CARD_CONFIG);
    this.saveStudentConfig(DEFAULT_STUDENT_CARD_CONFIG);
    this.saveExamInfo(DEFAULT_EXAM_INFO);
    this.saveExamRooms(DEFAULT_EXAM_ROOMS);
    this.saveExamSchedule(DEFAULT_EXAM_SCHEDULE);
    this.saveTeachers(DEFAULT_TEACHERS);
    const initial = this.autoAllocateStudents(
      DEFAULT_STUDENTS,
      DEFAULT_EXAM_ROOMS,
      'by_class',
      DEFAULT_EXAM_INFO.nomorPesertaPrefix
    );
    this.saveExamAllocations(initial);
  },
};
