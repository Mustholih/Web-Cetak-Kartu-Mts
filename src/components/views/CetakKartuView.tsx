import React, { useState, useRef, useMemo } from 'react';
import {
  Printer,
  FileDown,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Eye,
  CheckSquare,
  Square,
  BookOpen,
  CreditCard,
  Grid,
  Scissors,
  Layers,
  Filter,
} from 'lucide-react';
import {
  Student,
  SchoolIdentity,
  LibraryCardConfig,
  StudentCardConfig,
} from '../../types';
import { LibraryCardFront } from '../cards/LibraryCardFront';
import { LibraryCardBack } from '../cards/LibraryCardBack';
import { StudentCardFront } from '../cards/StudentCardFront';
import { StudentCardBack } from '../cards/StudentCardBack';
import { PrintService } from '../../services/printService';

interface PrintableCardItem {
  id: string;
  student: Student;
  side: 'front' | 'back';
}

interface Props {
  students: Student[];
  identity: SchoolIdentity;
  libraryConfig: LibraryCardConfig;
  studentConfig: StudentCardConfig;
  onMarkAsPrinted: (studentIds: string[], type: 'perpus' | 'siswa') => void;
  preSelectedIds?: string[];
}

export const CetakKartuView: React.FC<Props> = ({
  students,
  identity,
  libraryConfig,
  studentConfig,
  onMarkAsPrinted,
  preSelectedIds = [],
}) => {
  // Filter settings
  const [cardType, setCardType] = useState<'perpus' | 'siswa'>('perpus');
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('front');
  const [filterMode, setFilterMode] = useState<
    'all' | 'kelas-7' | 'kelas-8' | 'kelas-9' | 'selected'
  >('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    preSelectedIds.length > 0 ? preSelectedIds : []
  );

  // Print layout settings: 8 cards per page (2 cols x 4 rows) or 10 cards per page (2 cols x 5 rows)
  const [cardsPerPage, setCardsPerPage] = useState<number>(8);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [gapMm, setGapMm] = useState<number>(4);
  const [marginMm, setMarginMm] = useState<number>(8);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Compute targeted students based on filterMode
  const targetStudents = useMemo(() => {
    switch (filterMode) {
      case 'kelas-7':
        return students.filter((s) => s.kelas.startsWith('7'));
      case 'kelas-8':
        return students.filter((s) => s.kelas.startsWith('8'));
      case 'kelas-9':
        return students.filter((s) => s.kelas.startsWith('9'));
      case 'selected':
        return students.filter((s) => selectedStudentIds.includes(s.id));
      case 'all':
      default:
        return students;
    }
  }, [students, filterMode, selectedStudentIds]);

  // Segment card items into pages (e.g. 8 or 10 cards per page)
  const pagesOfCards = useMemo(() => {
    const items: PrintableCardItem[] = [];
    targetStudents.forEach((std) => {
      if (cardSide === 'front' || cardSide === 'both') {
        items.push({ id: `${std.id}-front`, student: std, side: 'front' });
      }
      if (cardSide === 'back' || cardSide === 'both') {
        items.push({ id: `${std.id}-back`, student: std, side: 'back' });
      }
    });

    const pages: PrintableCardItem[][] = [];
    for (let i = 0; i < items.length; i += cardsPerPage) {
      pages.push(items.slice(i, i + cardsPerPage));
    }
    return pages;
  }, [targetStudents, cardSide, cardsPerPage]);

  const totalCardItems = pagesOfCards.reduce((acc, curr) => acc + curr.length, 0);

  // Handle student selection toggle
  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllInList = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  // Direct Browser Print
  const handlePrintBrowser = () => {
    if (targetStudents.length === 0) {
      alert('Pilih minimal satu siswa untuk dicetak.');
      return;
    }
    onMarkAsPrinted(
      targetStudents.map((s) => s.id),
      cardType
    );
    window.print();
  };

  // Multi-Page PDF Export
  const handleExportPdf = async () => {
    if (!printAreaRef.current || targetStudents.length === 0) {
      alert('Pilih siswa untuk dicetak.');
      return;
    }
    setIsExporting(true);
    setExportNotice(
      `Sedang memproses PDF A4 (${pagesOfCards.length} lembar, ${totalCardItems} kartu)...`
    );
    try {
      const typeLabel = cardType === 'perpus' ? 'Kartu_Perpus' : 'Kartu_Siswa';
      const classLabel = filterMode.toUpperCase();
      await PrintService.downloadA4SheetPdf(
        printAreaRef.current,
        `Cetak_${typeLabel}_MTs_Miftahul_Huda_${classLabel}`,
        (cur, total) => {
          setExportNotice(`Sedang merender halaman A4 ke-${cur} dari ${total} halaman...`);
        }
      );
      onMarkAsPrinted(
        targetStudents.map((s) => s.id),
        cardType
      );
      setExportNotice(`File PDF berhasil diunduh (${pagesOfCards.length} halaman A4 siap cetak)!`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (e: any) {
      alert(`Gagal membuat PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // High-res PNG Export (first page or single sheet)
  const handleExportPng = async () => {
    if (!printAreaRef.current || targetStudents.length === 0) return;
    const firstPage = printAreaRef.current.querySelector<HTMLElement>('.a4-sheet-page');
    if (!firstPage) return;

    setIsExporting(true);
    setExportNotice('Sedang merender lembar pertama dalam resolusi tinggi...');
    try {
      await PrintService.downloadElementAsPng(
        firstPage,
        `Lembar_A4_${cardType}_Halaman_1_${Date.now()}`
      );
      setExportNotice('File PNG berhasil diunduh!');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (e: any) {
      alert(`Gagal membuat gambar: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action / Title Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Pusat Cetak Kartu Siswa & Perpustakaan</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {pagesOfCards.length} Lembar A4 ({totalCardItems} Kartu)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Setiap lembar A4 otomatis dibagi rapi ({cardsPerPage} kartu per lembar). Jika ada lebih dari {cardsPerPage} kartu, otomatis dipisah ke halaman berikutnya.
          </p>
        </div>

        {/* Print Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPng}
            disabled={isExporting || targetStudents.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download gambar A4 PNG (300 DPI)"
          >
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExporting || targetStudents.length === 0}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Download file PDF multi-halaman A4 dengan kartu ukuran presisi"
          >
            <FileDown className="w-4 h-4 text-emerald-300" />
            <span>Download PDF A4 ({pagesOfCards.length} Hal)</span>
          </button>
          <button
            onClick={handlePrintBrowser}
            disabled={isExporting || targetStudents.length === 0}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            title="Buka dialog printer browser"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Langsung (Print)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs no-print animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Control Box: Filters & Layout Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 no-print">
        {/* Left Column: Filter Siswa & Jenis Kartu */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Pengaturan Data & Jenis Kartu</span>
          </h3>

          {/* 1. Pilih Jenis Kartu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">1. Pilih Jenis Kartu:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCardType('perpus')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  cardType === 'perpus'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    cardType === 'perpus'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Kartu Anggota Perpustakaan</p>
                  <p className="text-[11px] text-slate-500">Perpustakaan &quot;Bahrul &apos;Ulum&quot;</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCardType('siswa')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  cardType === 'siswa'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    cardType === 'siswa'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Kartu Tanda Peserta Didik</p>
                  <p className="text-[11px] text-slate-500">MTs Miftahul Huda</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Pilih Target Siswa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              2. Kriteria Siswa yang Dicetak:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Siswa ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('kelas-7')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'kelas-7'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hanya Kelas 7 ({students.filter((s) => s.kelas.startsWith('7')).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('kelas-8')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'kelas-8'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hanya Kelas 8 ({students.filter((s) => s.kelas.startsWith('8')).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('kelas-9')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'kelas-9'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hanya Kelas 9 ({students.filter((s) => s.kelas.startsWith('9')).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('selected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'selected'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pilih Manual ({selectedStudentIds.length})
              </button>
            </div>
          </div>

          {/* Sisi Kartu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">3. Sisi Kartu:</label>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="cardSide"
                  checked={cardSide === 'front'}
                  onChange={() => setCardSide('front')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                <span>Hanya Sisi Depan</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="cardSide"
                  checked={cardSide === 'back'}
                  onChange={() => setCardSide('back')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                <span>Hanya Sisi Belakang</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="cardSide"
                  checked={cardSide === 'both'}
                  onChange={() => setCardSide('both')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                <span>Keduanya (Depan & Belakang berdampingan)</span>
              </label>
            </div>
          </div>

          {/* Manual Student Selector Box if filterMode === 'selected' */}
          {filterMode === 'selected' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Centang Siswa yang Ingin Dicetak:</span>
                <button
                  onClick={handleSelectAllInList}
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  {selectedStudentIds.length === students.length ? 'Batal Semua' : 'Pilih Semua'}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 border rounded-lg bg-white">
                {students.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleStudent(s.id)}
                      className="px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                        <span className="font-bold text-slate-800">{s.nama}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({s.nis})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {s.kelas}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Layout & Printer Calibration */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span>Tata Letak Kertas A4 & Garis Potong</span>
          </h3>

          <div className="space-y-3.5">
            {/* Cards Per Page Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kapasitas Kartu per Lembar A4:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCardsPerPage(8)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    cardsPerPage === 8
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">8 Kartu / Lembar</p>
                  <p className="text-[10px] text-slate-500">2 kolom × 4 baris (Rekomendasi)</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCardsPerPage(10)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    cardsPerPage === 10
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">10 Kartu / Lembar</p>
                  <p className="text-[10px] text-slate-500">2 kolom × 5 baris (Hemat Kertas)</p>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>Garis Potong (Crop Marks):</span>
                <span className="text-emerald-800 font-bold">
                  {showCropMarks ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span>Tampilkan garis tepi tipis sebagai panduan pemotongan</span>
              </label>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>Jarak Antar Kartu (Gap):</span>
                <span className="text-emerald-800 font-bold">{gapMm} mm</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={gapMm}
                onChange={(e) => setGapMm(parseInt(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                <span>Petunjuk Pencetakan:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                • Total siswa: <strong>{targetStudents.length}</strong> ➜ otomatis dibagi menjadi <strong>{pagesOfCards.length} halaman A4</strong> di file PDF.
              </p>
              <p className="text-[11px] leading-relaxed">
                • Kartu tidak akan terdistorsi atau tertekan karena setiap halaman A4 memuat tepat maks. {cardsPerPage} kartu berukuran asli 85.6 × 53.98 mm.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Live A4 Sheet Preview & Real Multi-Page Print DOM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Preview Lembar Cetak A4 ({pagesOfCards.length} Halaman A4)</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {totalCardItems} Kartu • {cardsPerPage} Kartu per Lembar
          </span>
        </div>

        {/* The Printable Multi-Page Container */}
        <div className="bg-slate-200/90 p-4 sm:p-8 rounded-2xl border border-slate-300 flex flex-col items-center overflow-x-auto shadow-inner">
          <div ref={printAreaRef} id="print-sheet-container" className="space-y-10">
            {pagesOfCards.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl shadow text-center text-slate-400 w-[210mm]">
                <p className="text-base font-bold">Tidak ada siswa yang dipilih untuk dicetak.</p>
                <p className="text-xs mt-1">Pilih filter atau centang siswa pada opsi di atas.</p>
              </div>
            ) : (
              pagesOfCards.map((pageCards, pageIndex) => (
                <div key={pageIndex} className="flex flex-col items-center">
                  {/* Page Badge header in UI (hidden during print) */}
                  <div className="mb-2 text-xs font-bold text-slate-700 no-print flex items-center justify-between w-full max-w-[210mm] px-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-800 text-white text-[11px] font-bold shadow-xs">
                      Lembar A4 - Halaman {pageIndex + 1} dari {pagesOfCards.length}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {pageCards.length} Kartu di halaman ini
                    </span>
                  </div>

                  {/* Individual A4 Page */}
                  <div
                    className="a4-sheet-page bg-white shadow-2xl transition-all"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      minHeight: '297mm',
                      maxHeight: '297mm',
                      padding: `${marginMm}mm`,
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      pageBreakAfter: 'always',
                      breakAfter: 'page',
                    }}
                  >
                    <div
                      className="grid grid-cols-2"
                      style={{
                        columnGap: `${gapMm}mm`,
                        rowGap: `${gapMm}mm`,
                      }}
                    >
                      {pageCards.map((item) => (
                        <div
                          key={item.id}
                          className={`relative card-print-item ${
                            showCropMarks
                              ? 'outline outline-1 outline-dashed outline-slate-400'
                              : ''
                          }`}
                          style={{
                            width: '85.6mm',
                            height: '53.98mm',
                            boxSizing: 'border-box',
                          }}
                        >
                          {showCropMarks && (
                            <>
                              <span className="absolute -top-1.5 -left-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                ┌
                              </span>
                              <span className="absolute -top-1.5 -right-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                ┐
                              </span>
                              <span className="absolute -bottom-1.5 -left-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                └
                              </span>
                              <span className="absolute -bottom-1.5 -right-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                ┘
                              </span>
                            </>
                          )}
                          {cardType === 'perpus' ? (
                            item.side === 'front' ? (
                              <LibraryCardFront
                                student={item.student}
                                identity={identity}
                                config={libraryConfig}
                                scale={1}
                              />
                            ) : (
                              <LibraryCardBack
                                identity={identity}
                                config={libraryConfig}
                                scale={1}
                              />
                            )
                          ) : item.side === 'front' ? (
                            <StudentCardFront
                              student={item.student}
                              identity={identity}
                              config={studentConfig}
                              scale={1}
                            />
                          ) : (
                            <StudentCardBack
                              identity={identity}
                              config={studentConfig}
                              scale={1}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
