import {
  SchoolIdentity,
  Student,
  LibraryCardConfig,
  StudentCardConfig,
  ExamInfo,
  ExamRoom,
  ExamScheduleItem,
} from '../types';

// Authentic Madrasah Logo SVG as Base64 Data URL
export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <!-- Outer Star 8 Point Badge -->
  <polygon points="100,10 120,40 155,25 150,60 185,75 160,100 185,125 150,140 155,175 120,160 100,190 80,160 45,175 50,140 15,125 40,100 15,75 50,60 45,25 80,40" fill="url(#goldGrad)" stroke="#78350f" stroke-width="2"/>
  <!-- Circular Green Shield -->
  <circle cx="100" cy="100" r="70" fill="url(#greenGrad)" stroke="#fbbf24" stroke-width="4"/>
  <circle cx="100" cy="100" r="62" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- Open Book / Al-Qur'an -->
  <path d="M100 95 C90 80 65 80 50 85 L50 125 C65 120 90 120 100 135 C110 120 135 120 150 125 L150 85 C135 80 110 80 100 95 Z" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
  <path d="M100 95 L100 135" stroke="#064e3b" stroke-width="2"/>
  <line x1="58" y1="96" x2="92" y2="94" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="58" y1="104" x2="92" y2="102" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="58" y1="112" x2="92" y2="110" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="108" y1="94" x2="142" y2="96" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="108" y1="102" x2="142" y2="104" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="108" y1="110" x2="142" y2="112" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Shining Star / Light of Knowledge -->
  <polygon points="100,52 104,64 116,64 106,72 110,84 100,76 90,84 94,72 84,64 96,64" fill="#fbbf24"/>
  <!-- Lower Ribbon -->
  <path d="M35 145 Q100 170 165 145 L155 165 Q100 185 45 165 Z" fill="#b45309" stroke="#fef08a" stroke-width="1"/>
  <text x="100" y="160" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">IKHLAS BERAMAL</text>
  <!-- Text Ring -->
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="#fef08a" text-anchor="middle">MIFTAHUL HUDA</text>
</svg>
`)}`;

// Official Stamp SVG as Data URL
export const DEFAULT_STEMPEL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <path id="upperCircle" d="M 25,100 A 75,75 0 0,1 175,100" fill="none" />
    <path id="lowerCircle" d="M 175,100 A 75,75 0 0,1 25,100" fill="none" />
  </defs>
  <!-- Blue/Purple Official Seal Ink Tone -->
  <circle cx="100" cy="100" r="92" fill="none" stroke="#2563eb" stroke-width="4" stroke-opacity="0.9"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-opacity="0.9"/>
  <circle cx="100" cy="100" r="54" fill="none" stroke="#2563eb" stroke-width="2" stroke-opacity="0.9"/>
  <!-- Upper Text Arc -->
  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="bold" fill="#2563eb" letter-spacing="1.5">
    <textPath href="#upperCircle" startOffset="50%" text-anchor="middle">
      MTs MIFTAHUL HUDA
    </textPath>
  </text>
  <!-- Lower Text Arc -->
  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="bold" fill="#2563eb" letter-spacing="2">
    <textPath href="#lowerCircle" startOffset="50%" text-anchor="middle">
      ★ MERANGIN - JAMBI ★
    </textPath>
  </text>
  <!-- Center Star and Stamp Text -->
  <polygon points="100,68 104,78 115,78 106,85 109,95 100,89 91,95 94,85 85,78 96,78" fill="#2563eb"/>
  <text x="100" y="112" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#2563eb" text-anchor="middle" letter-spacing="1">KEPALA</text>
  <text x="100" y="125" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#2563eb" text-anchor="middle">MADRASAH</text>
</svg>
`)}`;

// Authentic Headmaster Signature SVG as Data URL
export const DEFAULT_TTD_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="240" height="100">
  <path d="M 20 65 Q 40 20 60 55 T 90 40 T 120 70 Q 140 15 160 50 T 190 45 Q 210 50 225 35" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
  <path d="M 45 40 Q 65 80 85 45 T 105 75 Q 115 85 145 60" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 25 80 Q 80 75 180 78 Q 215 79 230 75" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
  <path d="M 170 30 Q 185 15 195 35" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
</svg>
`)}`;

// Default School Identity according to prompt specifications
export const DEFAULT_SCHOOL_IDENTITY: SchoolIdentity = {
  namaMadrasah: 'MTs MIFTAHUL HUDA',
  jenjang: 'Madrasah Tsanawiyah',
  nsm: '121215020023',
  npsn: '10505891',
  alamat: 'Jl. Tumbro Raya, Desa Rawa Jaya, Kecamatan Tabir Selatan, Kabupaten Merangin, Provinsi Jambi.',
  desa: 'Rawa Jaya',
  kecamatan: 'Tabir Selatan',
  kabupaten: 'Merangin',
  provinsi: 'Jambi',
  telepon: '0852-6688-9921',
  email: 'mtsmiftahulhuda.rawajaya@gmail.com',
  kepalaMadrasah: 'H. Ahmad Syaifuddin, S.Pd.I., M.Pd.',
  nipKepala: '19780512 200501 1 004',
  tahunPelajaran: '2026/2027',
  kotaPenerbitan: 'Merangin',
  tanggalTerbit: '14 Juli 2026',
  logoUrl: DEFAULT_LOGO_SVG,
  ttdUrl: DEFAULT_TTD_SVG,
  stempelUrl: DEFAULT_STEMPEL_SVG,
  showStempel: true,
  showBarcode: true,
  showQrCode: true,
  stempelOpacity: 0.85,
  ttdScale: 1.0,
  ttdOffsetY: 0,
};

// Default Library Card Config
export const DEFAULT_LIBRARY_CARD_CONFIG: LibraryCardConfig = {
  bgColor: '#f0fdf4', // Soft mint green background
  bgSecondary: '#dcfce7',
  headerBg: '#065f46', // Deep emerald green
  headerTextColor: '#ffffff',
  titleColor: '#064e3b',
  borderColor: '#047857',
  borderWidth: 2,
  headerTitle: 'KARTU ANGGOTA PERPUSTAKAAN',
  headerSubtitle: 'PERPUSTAKAAN "BAHRUL \'ULUM"',
  showPhoto: true,
  photoBorderRadius: 4,
  photoBorderColor: '#059669',
  watermarkOpacity: 0.08,
  showBarcode: true,
  barcodeType: 'barcode',
  rulesTitle: 'TATA TERTIB PERPUSTAKAAN',
  rulesList: [
    'Kartu ini wajib dibawa setiap kali berkunjung dan meminjam buku.',
    'Peminjaman buku maksimal 3 eksemplar selama 7 hari.',
    'Menjaga keutuhan, kebersihan, dan kerapian buku perpustakaan.',
    'Keterlambatan pengembalian dikenakan sanksi sesuai ketentuan.',
    'Kartu anggota tidak boleh dipinjamkan kepada orang lain.',
  ],
};

// Default Student Card Config
export const DEFAULT_STUDENT_CARD_CONFIG: StudentCardConfig = {
  bgColor: '#ffffff',
  headerBg: '#064e3b',
  headerTextColor: '#ffffff',
  accentColor: '#d97706', // Gold accent
  borderColor: '#065f46',
  borderWidth: 2,
  headerTitle: 'KARTU PESERTA DIDIK',
  subTitle: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
  showPhoto: true,
  photoBorderRadius: 6,
  photoBorderColor: '#d97706',
  watermarkOpacity: 0.07,
  showBarcode: true,
  barcodeType: 'barcode',
  visiText: 'Terwujudnya Generasi Qurani, Berakhlak Mulia, Cerdas, dan Berprestasi.',
  misiText: [
    'Menyelenggarakan pendidikan Islam yang berkarakter dan berkualitas.',
    'Membina akhlakul karimah dan kecintaan pada Al-Qur\'an.',
    'Mengembangkan potensi sains, teknologi, dan bakat siswa.',
  ],
};

// Helper to generate realistic student avatars
const createAvatar = (isBoy: boolean, initial: string, bg: string) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
      <rect width="100" height="120" fill="${bg}"/>
      <!-- Body / Uniform (White Madrasah Shirt & Green Tie) -->
      <path d="M 20 120 L 80 120 L 75 80 L 25 80 Z" fill="#ffffff" stroke="#cbd5e1"/>
      <polygon points="46,80 54,80 52,110 48,110" fill="#15803d"/>
      <!-- Collar -->
      <polygon points="35,80 50,92 42,80" fill="#f1f5f9"/>
      <polygon points="65,80 50,92 58,80" fill="#f1f5f9"/>
      <!-- Head / Face -->
      <circle cx="50" cy="52" r="22" fill="#fed7aa"/>
      ${isBoy 
        ? `<!-- Peci / Songkok Hitam khas Santri / Madrasah -->
           <path d="M 28 42 Q 50 34 72 42 L 72 26 Q 50 20 28 26 Z" fill="#1e293b"/>
           <rect x="27" y="38" width="46" height="4" fill="#0f172a" rx="1"/>`
        : `<!-- Hijab / Jilbab Putih Khas Siswi MTs -->
           <path d="M 22 42 C 22 20, 78 20, 78 42 C 78 68, 80 90, 76 96 C 65 92, 35 92, 24 96 C 20 90, 22 68, 22 42 Z" fill="#ffffff" stroke="#e2e8f0"/>
           <path d="M 33 46 C 33 36, 67 36, 67 46 C 67 60, 60 70, 50 70 C 40 70, 33 60, 33 46 Z" fill="#fed7aa"/>`
      }
      <!-- Eyes & Smile -->
      <circle cx="43" cy="52" r="2" fill="#334155"/>
      <circle cx="57" cy="52" r="2" fill="#334155"/>
      <path d="M 46 60 Q 50 63 54 60" fill="none" stroke="#b45309" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Name badge watermark -->
      <rect x="10" y="104" width="80" height="12" rx="3" fill="#064e3b" opacity="0.9"/>
      <text x="50" y="113" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">${initial}</text>
    </svg>
  `)}`;
};

// Realistic initial sample students of MTs Miftahul Huda
export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-001',
    nis: '2607001',
    nisn: '0112345678',
    nama: 'AHMAD FAIZIN AL-FARUQ',
    kelas: '7A',
    tempatLahir: 'Merangin',
    tanggalLahir: '12 Mei 2013',
    jenisKelamin: 'L',
    alamat: 'Desa Rawa Jaya RT 04, Tabir Selatan',
    noAnggotaPerpus: 'P-2607001',
    fotoUrl: createAvatar(true, 'A. FAIZIN', '#0284c7'),
    isLibraryCardPrinted: true,
    isStudentCardPrinted: true,
  },
  {
    id: 'std-002',
    nis: '2607002',
    nisn: '0112345679',
    nama: 'AISYAH NUR FATIMAH',
    kelas: '7A',
    tempatLahir: 'Bangko',
    tanggalLahir: '24 Agustus 2013',
    jenisKelamin: 'P',
    alamat: 'Jl. Poros Rawa Jaya Unit 1',
    noAnggotaPerpus: 'P-2607002',
    fotoUrl: createAvatar(false, 'AISYAH N.', '#ec4899'),
    isLibraryCardPrinted: true,
    isStudentCardPrinted: false,
  },
  {
    id: 'std-003',
    nis: '2607003',
    nisn: '0112345680',
    nama: 'BILAL AL-GHIFARI',
    kelas: '7B',
    tempatLahir: 'Merangin',
    tanggalLahir: '03 Maret 2013',
    jenisKelamin: 'L',
    alamat: 'Desa Bungo Antoi, Tabir Selatan',
    noAnggotaPerpus: 'P-2607003',
    fotoUrl: createAvatar(true, 'BILAL', '#10b981'),
    isLibraryCardPrinted: false,
    isStudentCardPrinted: false,
  },
  {
    id: 'std-004',
    nis: '2508001',
    nisn: '0103456781',
    nama: 'DIMAS ARYA PRATAMA',
    kelas: '8A',
    tempatLahir: 'Tabir Selatan',
    tanggalLahir: '17 Oktober 2012',
    jenisKelamin: 'L',
    alamat: 'Desa Rawa Jaya Jalur 3',
    noAnggotaPerpus: 'P-2508001',
    fotoUrl: createAvatar(true, 'DIMAS A.', '#6366f1'),
    isLibraryCardPrinted: true,
    isStudentCardPrinted: true,
  },
  {
    id: 'std-005',
    nis: '2508002',
    nisn: '0103456782',
    nama: 'HANIFAH AZ-ZAHRA',
    kelas: '8A',
    tempatLahir: 'Jambi',
    tanggalLahir: '09 Januari 2012',
    jenisKelamin: 'P',
    alamat: 'Desa Sinar Gading RT 02',
    noAnggotaPerpus: 'P-2508002',
    fotoUrl: createAvatar(false, 'HANIFAH', '#f43f5e'),
    isLibraryCardPrinted: true,
    isStudentCardPrinted: true,
  },
  {
    id: 'std-006',
    nis: '2508003',
    nisn: '0103456783',
    nama: 'MUHAMMAD RIZKY FIRDAUS',
    kelas: '8B',
    tempatLahir: 'Merangin',
    tanggalLahir: '21 Juli 2012',
    jenisKelamin: 'L',
    alamat: 'Desa Muara Delang, Tabir Selatan',
    noAnggotaPerpus: 'P-2508003',
    fotoUrl: createAvatar(true, 'M. RIZKY', '#059669'),
    isLibraryCardPrinted: false,
    isStudentCardPrinted: false,
  },
  {
    id: 'std-007',
    nis: '2409001',
    nisn: '0094567891',
    nama: 'NABILAH KHAIRUNNISA',
    kelas: '9A',
    tempatLahir: 'Bangko',
    tanggalLahir: '05 Februari 2011',
    jenisKelamin: 'P',
    alamat: 'Jl. Tumbro Raya No. 12',
    noAnggotaPerpus: 'P-2409001',
    fotoUrl: createAvatar(false, 'NABILAH', '#8b5cf6'),
    isLibraryCardPrinted: true,
    isStudentCardPrinted: true,
  },
  {
    id: 'std-008',
    nis: '2409002',
    nisn: '0094567892',
    nama: 'RAFLI AL-BUKHARI',
    kelas: '9A',
    tempatLahir: 'Merangin',
    tanggalLahir: '30 September 2011',
    jenisKelamin: 'L',
    alamat: 'Desa Rawa Jaya RT 08',
    noAnggotaPerpus: 'P-2409002',
    fotoUrl: createAvatar(true, 'RAFLI', '#d97706'),
    isLibraryCardPrinted: true,
    isStudentCardPrinted: false,
  },
  {
    id: 'std-009',
    nis: '2409003',
    nisn: '0094567893',
    nama: 'ZASKIA SALSABILA PUTRI',
    kelas: '9B',
    tempatLahir: 'Bungo',
    tanggalLahir: '14 November 2011',
    jenisKelamin: 'P',
    alamat: 'Desa Mekar Jaya, Tabir Selatan',
    noAnggotaPerpus: 'P-2409003',
    fotoUrl: createAvatar(false, 'ZASKIA S.', '#ec4899'),
    isLibraryCardPrinted: false,
    isStudentCardPrinted: false,
  },
];

// Default Exam Configuration
export const DEFAULT_EXAM_INFO: ExamInfo = {
  namaUjian: 'ASESMEN SUMATIF AKHIR SEMESTER (ASAS)',
  subNamaUjian: 'MADRASAH TSANAWIYAH MIFTAHUL HUDA',
  tahunPelajaran: '2026/2027',
  semester: 'Ganjil',
  tanggalUjian: '01 - 08 Desember 2026',
  nomorPesertaPrefix: '02-15-023-',
};

export const DEFAULT_EXAM_ROOMS: ExamRoom[] = [
  {
    id: 'room-01',
    nomorRuang: 'Ruang 01',
    namaRuang: 'Gedung A - Kelas 7A',
    kapasitas: 20,
    barisMeja: 5,
    kolomMeja: 4,
    pengawas1: 'Dra. Hj. Siti Aminah',
    pengawas2: 'Ust. Muhammad Ilyas, S.Pd.',
  },
  {
    id: 'room-02',
    nomorRuang: 'Ruang 02',
    namaRuang: 'Gedung A - Kelas 7B',
    kapasitas: 20,
    barisMeja: 5,
    kolomMeja: 4,
    pengawas1: 'Rahmat Hidayat, S.Pd.I.',
    pengawas2: 'Nurul Hidayati, S.Si.',
  },
  {
    id: 'room-03',
    nomorRuang: 'Ruang 03',
    namaRuang: 'Gedung B - Kelas 8A',
    kapasitas: 20,
    barisMeja: 5,
    kolomMeja: 4,
    pengawas1: 'Zainuddin, S.Ag.',
    pengawas2: 'Fatmawati, S.Pd.',
  },
  {
    id: 'room-04',
    nomorRuang: 'Ruang 04',
    namaRuang: 'Gedung B - Kelas 8B',
    kapasitas: 20,
    barisMeja: 5,
    kolomMeja: 4,
    pengawas1: 'Budi Santoso, S.Pd.',
    pengawas2: 'Laila Muniroh, S.Pd.I.',
  },
];

export const DEFAULT_EXAM_SCHEDULE: ExamScheduleItem[] = [
  { hariTanggal: 'Senin, 01 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'Al-Qur\'an Hadis' },
  { hariTanggal: 'Senin, 01 Des 2026', jam: '10.00 - 11.30', mataPelajaran: 'Akidah Akhlak' },
  { hariTanggal: 'Selasa, 02 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'Bahasa Indonesia' },
  { hariTanggal: 'Selasa, 02 Des 2026', jam: '10.00 - 11.30', mataPelajaran: 'Fikih' },
  { hariTanggal: 'Rabu, 03 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'Matematika' },
  { hariTanggal: 'Rabu, 03 Des 2026', jam: '10.00 - 11.30', mataPelajaran: 'Sejarah Kebudayaan Islam' },
  { hariTanggal: 'Kamis, 04 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'IPA Terpadu' },
  { hariTanggal: 'Kamis, 04 Des 2026', jam: '10.00 - 11.30', mataPelajaran: 'Bahasa Arab' },
  { hariTanggal: 'Jumat, 05 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'Bahasa Inggris' },
  { hariTanggal: 'Sabtu, 06 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'IPS Terpadu' },
  { hariTanggal: 'Senin, 08 Des 2026', jam: '07.30 - 09.30', mataPelajaran: 'Pendidikan Pancasila' },
];

