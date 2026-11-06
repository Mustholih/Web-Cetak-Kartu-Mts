export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  kelas: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  fotoUrl?: string;
  alamat?: string;
  noAnggotaPerpus?: string;
  isLibraryCardPrinted?: boolean;
  isStudentCardPrinted?: boolean;
  updatedAt?: string;
}

export interface SchoolIdentity {
  namaMadrasah: string;
  jenjang: string;
  nsm: string;
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  telepon: string;
  email: string;
  kepalaMadrasah: string;
  nipKepala: string;
  tahunPelajaran: string;
  kotaPenerbitan: string;
  tanggalTerbit: string;
  logoUrl: string;
  ttdUrl: string;
  stempelUrl: string;
  showStempel: boolean;
  showBarcode: boolean;
  showQrCode: boolean;
  stempelOpacity: number;
  ttdScale: number;
  ttdOffsetY: number;
}

export interface LibraryCardConfig {
  bgColor: string;
  bgSecondary: string;
  headerBg: string;
  headerTextColor: string;
  titleColor: string;
  borderColor: string;
  borderWidth: number;
  headerTitle: string;
  headerSubtitle: string;
  showPhoto: boolean;
  photoBorderRadius: number;
  photoBorderColor: string;
  watermarkOpacity: number;
  showBarcode: boolean;
  barcodeType: 'barcode' | 'qr';
  rulesTitle: string;
  rulesList: string[];
}

export interface StudentCardConfig {
  bgColor: string;
  headerBg: string;
  headerTextColor: string;
  accentColor: string;
  borderColor: string;
  borderWidth: number;
  headerTitle: string;
  subTitle: string;
  showPhoto: boolean;
  photoBorderRadius: number;
  photoBorderColor: string;
  watermarkOpacity: number;
  showBarcode: boolean;
  barcodeType: 'barcode' | 'qr';
  visiText: string;
  misiText: string[];
}

export interface PrintSettings {
  cardType: 'perpustakaan' | 'peserta_didik' | 'both';
  side: 'front' | 'back' | 'both';
  paperSize: 'A4' | 'F4';
  cardsPerPage: number; // e.g. 8 or 10 or 6
  showCropMarks: boolean;
  gapMm: number; // spacing between cards in mm (default 3)
  marginMm: number; // margin page in mm (default 8)
  filterClass: string; // 'all' | '7' | '8' | '9' | 'custom'
  selectedStudentIds: string[];
}

export interface BatchPhotoMatch {
  file: File;
  fileName: string;
  previewUrl: string;
  matchedStudentId?: string;
  matchedStudentName?: string;
  matchedStudentNis?: string;
  status: 'matched' | 'unmatched' | 'applied';
}

export interface Teacher {
  id: string;
  nama: string; // e.g. "Dra. Hj. Siti Aminah, M.Pd."
  nip?: string; // e.g. "197203151998032001" or "-"
  inisial: string; // e.g. "SA" (uppercase 2-4 chars)
  mataPelajaran?: string; // e.g. "Al-Qur'an Hadis"
  noHp?: string;
}

export interface ExamInfo {
  namaUjian: string;
  subNamaUjian: string;
  tahunPelajaran: string;
  semester: string;
  tanggalUjian: string;
  nomorPesertaPrefix: string; // e.g. "02-15-023-"
  tempatTanggalJadwal?: string; // e.g. "Tabir Selatan, 25 November 2026"
  ketuaPanitiaNama?: string; // e.g. "H. AHMAD RIFA'I, S.Pd.I."
  ketuaPanitiaNip?: string; // e.g. "198402122009011015"
}

export interface ExamRoom {
  id: string;
  nomorRuang: string; // e.g. "Ruang 01", "Ruang 02"
  namaRuang: string; // e.g. "Kelas 7A" or "Lab IPA"
  kapasitas: number; // e.g. 20
  barisMeja: number; // e.g. 5
  kolomMeja: number; // e.g. 4
  pengawas1: string;
  pengawas2: string;
}

export interface ExamAllocation {
  id: string;
  studentId: string;
  roomId: string;
  nomorPeserta: string;
  nomorMeja: number; // 1..kapasitas
  isCardPrinted?: boolean;
}

export interface ExamScheduleItem {
  id?: string;
  hariTanggal: string;
  jam: string;
  mataPelajaran: string;
  roomSupervisors?: Record<string, string>; // roomId -> teacher initial(s), e.g. { "room-01": "SA", "room-02": "RH" }
}

export type ActiveTab =
  | 'dashboard'
  | 'data-siswa'
  | 'upload-foto'
  | 'identitas-madrasah'
  | 'desain-perpus'
  | 'desain-siswa'
  | 'cetak-kartu'
  | 'manajemen-ujian'
  | 'data-guru'
  | 'tahun-pelajaran'
  | 'backup-data';

