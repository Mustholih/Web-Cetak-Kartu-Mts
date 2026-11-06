import React, { useState, useRef } from 'react';
import {
  Palette,
  CheckCircle2,
  Sliders,
  RotateCcw,
  BookOpen,
  Eye,
  FileDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SchoolIdentity, Student, LibraryCardConfig } from '../../types';
import { LibraryCardFront } from '../cards/LibraryCardFront';
import { LibraryCardBack } from '../cards/LibraryCardBack';
import { DEFAULT_LIBRARY_CARD_CONFIG } from '../../services/defaultData';
import { PrintService } from '../../services/printService';

interface Props {
  identity: SchoolIdentity;
  config: LibraryCardConfig;
  onSaveConfig: (updated: LibraryCardConfig) => void;
  sampleStudent: Student;
  students: Student[];
}

export const DesainKartuPerpusView: React.FC<Props> = ({
  identity,
  config,
  onSaveConfig,
  sampleStudent,
  students,
}) => {
  const [localConfig, setLocalConfig] = useState<LibraryCardConfig>({ ...config });
  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [selectedStudent, setSelectedStudent] = useState<Student>(sampleStudent);
  const [isExporting, setIsExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const colorPresets = [
    {
      name: 'Hijau Muda Elegan (Standar)',
      bgColor: '#f0fdf4',
      headerBg: '#065f46',
      borderColor: '#047857',
      photoBorder: '#059669',
    },
    {
      name: 'Emerald & Putih Bersih',
      bgColor: '#ffffff',
      headerBg: '#064e3b',
      borderColor: '#065f46',
      photoBorder: '#065f46',
    },
    {
      name: 'Mint Pastel & Hijau Tua',
      bgColor: '#ecfdf5',
      headerBg: '#047857',
      borderColor: '#0f766e',
      photoBorder: '#0d9488',
    },
    {
      name: 'Klasik Madrasah Emas',
      bgColor: '#fefce8',
      headerBg: '#064e3b',
      borderColor: '#b45309',
      photoBorder: '#d97706',
    },
  ];

  const handleApplyPreset = (p: (typeof colorPresets)[0]) => {
    setLocalConfig((prev) => ({
      ...prev,
      bgColor: p.bgColor,
      headerBg: p.headerBg,
      borderColor: p.borderColor,
      photoBorderColor: p.photoBorder,
    }));
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan desain kartu perpustakaan ke format default?')) {
      setLocalConfig({ ...DEFAULT_LIBRARY_CARD_CONFIG });
      onSaveConfig(DEFAULT_LIBRARY_CARD_CONFIG);
    }
  };

  const handleDownloadSamplePdf = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await PrintService.downloadSingleCardPdf(
        cardRef.current,
        `Kartu_Perpus_${selectedStudent.nis}_${selectedStudent.nama.replace(/\s+/g, '_')}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSamplePng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await PrintService.downloadElementAsPng(
        cardRef.current,
        `Kartu_Perpus_${selectedStudent.nis}_${selectedStudent.nama.replace(/\s+/g, '_')}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Editor Desain Kartu Anggota Perpustakaan</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ID-1 (85.6 × 53.98 mm)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan tata letak, warna latar, bingkai, judul, dan tata tertib kartu perpustakaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Desain</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Simpan Desain Kartu</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan desain kartu perpustakaan berhasil disimpan!</span>
        </div>
      )}

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Customization Controls */}
        <div className="lg:col-span-6 space-y-5">
          {/* Preset Palettes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tema Warna Kartu Perpustakaan</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {colorPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-600 text-left transition-all group cursor-pointer bg-slate-50 hover:bg-white"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: p.bgColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full shadow-2xs"
                      style={{ backgroundColor: p.headerBg }}
                    />
                    <span
                      className="w-4 h-4 rounded-full shadow-2xs"
                      style={{ backgroundColor: p.borderColor }}
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    {p.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Customizer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Detail Penyesuaian Desain</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Warna Background Kartu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.bgColor}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, bgColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={localConfig.bgColor}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, bgColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Warna Background Header
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.headerBg}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, headerBg: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={localConfig.headerBg}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, headerBg: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Warna Garis Bingkai
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.borderColor}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, borderColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={localConfig.borderColor}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, borderColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Warna Bingkai Foto Siswa
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.photoBorderColor}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, photoBorderColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={localConfig.photoBorderColor}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, photoBorderColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ketebalan Bingkai: {localConfig.borderWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={localConfig.borderWidth}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      borderWidth: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sudut Lengkung Foto: {localConfig.photoBorderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={localConfig.photoBorderRadius}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      photoBorderRadius: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Kartu (Header Banner)
                </label>
                <input
                  type="text"
                  value={localConfig.headerTitle}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, headerTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.showBarcode}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, showBarcode: e.target.checked })
                    }
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Tampilkan Barcode Nomor Anggota di Bagian Bawah Foto</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Preview & Sample Downloader */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>Preview Hasil Desain</span>
                </h3>
              </div>

              {/* Front / Back Toggle Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveSide('FRONT')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeSide === 'FRONT'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sisi Depan
                </button>
                <button
                  onClick={() => setActiveSide('BACK')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeSide === 'BACK'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sisi Belakang
                </button>
              </div>
            </div>

            {/* Select sample student */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                Contoh Siswa:
              </label>
              <select
                value={selectedStudent.id}
                onChange={(e) => {
                  const s = students.find((std) => std.id === e.target.value);
                  if (s) setSelectedStudent(s);
                }}
                className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nis} - {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Render Container */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden">
              <div ref={cardRef} className="shadow-xl rounded-xl overflow-hidden bg-white">
                {activeSide === 'FRONT' ? (
                  <LibraryCardFront
                    student={selectedStudent}
                    identity={identity}
                    config={localConfig}
                    scale={1}
                  />
                ) : (
                  <LibraryCardBack
                    identity={identity}
                    config={localConfig}
                    scale={1}
                  />
                )}
              </div>
            </div>

            {/* Instant Actions for Sample */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Ukuran asli kartu: 85.60 mm × 53.98 mm
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSamplePng}
                  disabled={isExporting}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download gambar PNG resolusi 300 DPI"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={handleDownloadSamplePdf}
                  disabled={isExporting}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Download file PDF ukuran asli 85.6mm x 53.98mm"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF ID-1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
