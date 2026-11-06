import React, { useState } from 'react';
import {
  School,
  Upload,
  CheckCircle2,
  FileSignature,
  Stamp,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { SchoolIdentity, Student, LibraryCardConfig } from '../../types';
import { LibraryCardFront } from '../cards/LibraryCardFront';
import { DEFAULT_SCHOOL_IDENTITY } from '../../services/defaultData';

interface Props {
  identity: SchoolIdentity;
  onSaveIdentity: (updated: SchoolIdentity) => void;
  sampleStudent: Student;
  libraryConfig: LibraryCardConfig;
}

export const IdentitasMadrasahView: React.FC<Props> = ({
  identity,
  onSaveIdentity,
  sampleStudent,
  libraryConfig,
}) => {
  const [formData, setFormData] = useState<SchoolIdentity>({ ...identity });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // File to base64 helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'ttdUrl' | 'stempelUrl'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          [field]: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIdentity(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan identitas madrasah ke data default MTs Miftahul Huda?')) {
      setFormData({ ...DEFAULT_SCHOOL_IDENTITY });
      onSaveIdentity(DEFAULT_SCHOOL_IDENTITY);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Identitas Madrasah, Logo & Legalitas</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Kementerian Agama
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas, logo, tanda tangan, dan stempel kepala madrasah otomatis berlaku untuk seluruh kartu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Simpan Identitas</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan identitas madrasah berhasil disimpan dan diterapkan pada semua kartu!</span>
        </div>
      )}

      {/* Grid: Forms & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Form Details */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* Section 1: Madrasah Profile */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <School className="w-4 h-4 text-emerald-700" />
              <span>Data Profil Madrasah</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Resmi Madrasah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaMadrasah}
                  onChange={(e) => setFormData({ ...formData, namaMadrasah: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 uppercase font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Madrasah *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email / Kontak</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NSM Madrasah</label>
                <input
                  type="text"
                  value={formData.nsm}
                  onChange={(e) => setFormData({ ...formData, nsm: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kota Penerbitan</label>
                <input
                  type="text"
                  placeholder="Contoh: Merangin"
                  value={formData.kotaPenerbitan}
                  onChange={(e) => setFormData({ ...formData, kotaPenerbitan: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Terbit</label>
                <input
                  type="text"
                  placeholder="Contoh: 14 Juli 2026"
                  value={formData.tanggalTerbit}
                  onChange={(e) => setFormData({ ...formData, tanggalTerbit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Pelajaran *
                </label>
                <input
                  type="text"
                  placeholder="2026/2027"
                  value={formData.tahunPelajaran}
                  onChange={(e) => setFormData({ ...formData, tahunPelajaran: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-bold text-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kepala Madrasah, Tanda Tangan & Stempel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <FileSignature className="w-4 h-4 text-emerald-700" />
              <span>Pimpinan Madrasah & Legalitas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kepala Madrasah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.kepalaMadrasah}
                  onChange={(e) => setFormData({ ...formData, kepalaMadrasah: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP Kepala Madrasah *
                </label>
                <input
                  type="text"
                  value={formData.nipKepala}
                  onChange={(e) => setFormData({ ...formData, nipKepala: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            {/* Upload Files: Logo, TTD, Stempel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* Logo */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 mb-1">Logo Madrasah</p>
                  <div className="w-16 h-16 mx-auto my-2 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shadow-xs">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>
                <label className="mt-2 block w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                  Ganti Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Tanda Tangan */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 mb-1">Tanda Tangan</p>
                  <div className="w-20 h-16 mx-auto my-2 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shadow-xs">
                    {formData.ttdUrl ? (
                      <img
                        src={formData.ttdUrl}
                        alt="TTD Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileSignature className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>
                <label className="mt-2 block w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                  Upload TTD (PNG)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'ttdUrl')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Stempel */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">Stempel</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showStempel}
                        onChange={(e) =>
                          setFormData({ ...formData, showStempel: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="w-16 h-16 mx-auto my-2 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shadow-xs">
                    {formData.stempelUrl ? (
                      <img
                        src={formData.stempelUrl}
                        alt="Stempel Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Stamp className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>
                <label className="mt-2 block w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                  Upload Stempel
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'stempelUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Slider Adjustments for TTD & Stamp */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pengaturan Posisi Tanda Tangan & Stempel</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                    <span>Ukuran Tanda Tangan:</span>
                    <span>{Math.round(formData.ttdScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.6"
                    step="0.05"
                    value={formData.ttdScale}
                    onChange={(e) =>
                      setFormData({ ...formData, ttdScale: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                    <span>Posisi Vertikal TTD:</span>
                    <span>{formData.ttdOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={formData.ttdOffsetY}
                    onChange={(e) =>
                      setFormData({ ...formData, ttdOffsetY: parseInt(e.target.value) })
                    }
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                    <span>Transparansi Stempel:</span>
                    <span>{Math.round(formData.stempelOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={formData.stempelOpacity}
                    onChange={(e) =>
                      setFormData({ ...formData, stempelOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showBarcode}
                      onChange={(e) =>
                        setFormData({ ...formData, showBarcode: e.target.checked })
                      }
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>Tampilkan Barcode Kartu</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Right Side: Sticky Live Preview */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Live Preview Hasil Kartu</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                Ukuran Standar ID-1
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Perhatikan posisi tanda tangan kepala madrasah dan stempel di sudut kanan bawah kartu:
            </p>

            {/* Scaled Preview Wrapper */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden">
              <div className="shadow-lg rounded-xl overflow-hidden">
                <LibraryCardFront
                  student={sampleStudent}
                  identity={formData}
                  config={libraryConfig}
                  scale={1}
                />
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[11px] text-slate-400">
                Setiap kali Anda mengubah logo, tanda tangan, nama kamad, atau NIP, kartu seluruh siswa langsung ter-update secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
