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

export type ActiveTab =
  | 'dashboard'
  | 'data-siswa'
  | 'upload-foto'
  | 'identitas-madrasah'
  | 'desain-perpus'
  | 'desain-siswa'
  | 'cetak-kartu'
  | 'tahun-pelajaran'
  | 'backup-data';
