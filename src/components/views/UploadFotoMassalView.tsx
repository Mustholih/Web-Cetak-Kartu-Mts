import React, { useState } from 'react';
import {
  ImageUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  RefreshCw,
  Search,
  Check,
  UserCheck,
  Camera,
  FolderOpen,
} from 'lucide-react';
import { Student } from '../../types';

interface MatchedPhotoItem {
  id: string;
  file: File;
  fileName: string;
  dataUrl: string;
  matchedStudentId: string | null;
  matchedStudentName: string | null;
  matchedStudentNis: string | null;
  matchType: 'NIS' | 'NAMA' | 'MANUAL' | 'NONE';
  isApplied: boolean;
}

interface Props {
  students: Student[];
  onApplyPhotos: (matchedList: { studentId: string; photoUrl: string }[]) => void;
}

export const UploadFotoMassalView: React.FC<Props> = ({ students, onApplyPhotos }) => {
  const [photos, setPhotos] = useState<MatchedPhotoItem[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'MATCHED' | 'UNMATCHED'>('ALL');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Match photo against student list based on NIS or Name
  const matchPhoto = (
    fileName: string,
    file: File,
    dataUrl: string
  ): MatchedPhotoItem => {
    // Clean filename (remove extension and extra punctuation)
    const baseName = fileName.replace(/\.[^/.]+$/, '').trim();
    const cleanNumbers = baseName.replace(/[^0-9]/g, '');

    // 1. Try match by NIS (e.g. "2607001.jpg" or "foto_2607001.png")
    if (cleanNumbers) {
      const matchByNis = students.find(
        (s) => s.nis === cleanNumbers || cleanNumbers.includes(s.nis) || s.nis.includes(cleanNumbers)
      );
      if (matchByNis) {
        return {
          id: `photo-${Date.now()}-${Math.random()}`,
          file,
          fileName,
          dataUrl,
          matchedStudentId: matchByNis.id,
          matchedStudentName: matchByNis.nama,
          matchedStudentNis: matchByNis.nis,
          matchType: 'NIS',
          isApplied: false,
        };
      }
    }

    // 2. Try match by Name (e.g. "ahmad_faizin.jpg")
    const normalizedBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchByName = students.find((s) => {
      const normName = s.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        normName.includes(normalizedBase) ||
        normalizedBase.includes(normName) ||
        (normName.length > 5 && normalizedBase.length > 5 && normName.slice(0, 8) === normalizedBase.slice(0, 8))
      );
    });

    if (matchByName) {
      return {
        id: `photo-${Date.now()}-${Math.random()}`,
        file,
        fileName,
        dataUrl,
        matchedStudentId: matchByName.id,
        matchedStudentName: matchByName.nama,
        matchedStudentNis: matchByName.nis,
        matchType: 'NAMA',
        isApplied: false,
      };
    }

    // No automatic match found
    return {
      id: `photo-${Date.now()}-${Math.random()}`,
      file,
      fileName,
      dataUrl,
      matchedStudentId: null,
      matchedStudentName: null,
      matchedStudentNis: null,
      matchType: 'NONE',
      isApplied: false,
    };
  };

  // Process incoming files
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setSuccessNotice(null);
    const filesArray = Array.from(fileList).filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const matchedItem = matchPhoto(file.name, file, dataUrl);
        setPhotos((prev) => [...prev, matchedItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Change student association manually
  const handleManualAssign = (photoId: string, studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          return {
            ...p,
            matchedStudentId: student ? student.id : null,
            matchedStudentName: student ? student.nama : null,
            matchedStudentNis: student ? student.nis : null,
            matchType: student ? 'MANUAL' : 'NONE',
          };
        }
        return p;
      })
    );
  };

  // Remove photo from list
  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Kosongkan antrean upload foto?')) {
      setPhotos([]);
    }
  };

  // Apply all matched photos to database
  const handleApplyAll = () => {
    const validMatches = photos.filter((p) => p.matchedStudentId);
    if (validMatches.length === 0) {
      alert('Tidak ada foto yang cocok dengan data siswa.');
      return;
    }

    const payload = validMatches.map((p) => ({
      studentId: p.matchedStudentId!,
      photoUrl: p.dataUrl,
    }));

    onApplyPhotos(payload);
    setPhotos((prev) =>
      prev.map((p) => (p.matchedStudentId ? { ...p, isApplied: true } : p))
    );
    setSuccessNotice(`Berhasil menyimpan ${validMatches.length} foto ke database data siswa!`);
  };

  // Filtered lists
  const matchedCount = photos.filter((p) => p.matchedStudentId).length;
  const unmatchedCount = photos.filter((p) => !p.matchedStudentId).length;

  const displayPhotos = photos.filter((p) => {
    if (filterTab === 'MATCHED') return !!p.matchedStudentId;
    if (filterTab === 'UNMATCHED') return !p.matchedStudentId;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Upload Foto Siswa Massal</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              Auto Match NIS
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Upload puluhan atau ratusan foto siswa sekaligus. Sistem secara otomatis mencocokkan foto
            dengan data siswa berdasarkan nama file (NIS). Contoh: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">2607001.jpg</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleApplyAll}
            disabled={matchedCount === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              matchedCount > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Terapkan ke Data Siswa ({matchedCount})</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            ✕
          </button>
        </div>
      )}

      {/* Dropzone Area */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-600 transition-colors shadow-xs text-center">
        <input
          type="file"
          id="bulk-photos"
          multiple
          accept="image/jpeg,image/png,image/jpg"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <label htmlFor="bulk-photos" className="cursor-pointer flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
            <ImageUp className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Klik untuk Memilih Banyak Foto Siswa Sekaligus
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Atau tarik dan lepaskan foto ke area ini (Mendukung JPG, JPEG, PNG)
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] text-slate-600 font-medium">
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Tip: Beri nama file foto dengan NIS siswa (misal: 2607001.jpg)</span>
          </div>
        </label>
      </div>

      {/* Tabs and Photo Grid */}
      {photos.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Foto ({photos.length})
              </button>
              <button
                onClick={() => setFilterTab('MATCHED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'MATCHED'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cocok Otomatis ({matchedCount})</span>
              </button>
              <button
                onClick={() => setFilterTab('UNMATCHED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'UNMATCHED'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Belum Cocok ({unmatchedCount})</span>
              </button>
            </div>

            {unmatchedCount > 0 && (
              <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Foto yang belum cocok dapat Anda pasangkan secara manual di bawah.</span>
              </p>
            )}
          </div>

          {/* Photos Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayPhotos.map((item) => {
              const isMatched = !!item.matchedStudentId;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isMatched
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-amber-300 bg-amber-50/30'
                  }`}
                >
                  <div>
                    {/* Photo Preview */}
                    <div className="relative w-full h-36 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-2xs mb-2">
                      <img
                        src={item.dataUrl}
                        alt={item.fileName}
                        className="w-full h-full object-cover object-top"
                      />
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                          isMatched
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {isMatched ? `Cocok via ${item.matchType}` : 'Belum Cocok'}
                      </span>
                      {item.isApplied && (
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-white shadow-xs">
                          ✓ Tersimpan
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-slate-500 truncate" title={item.fileName}>
                      File: {item.fileName}
                    </p>

                    {/* Matched Info */}
                    {isMatched ? (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-100/70 border border-emerald-300">
                        <p className="text-[11px] font-bold text-emerald-950 truncate">
                          {item.matchedStudentName}
                        </p>
                        <p className="text-[10px] text-emerald-800 font-mono">
                          NIS: {item.matchedStudentNis}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <label className="text-[10px] font-bold text-amber-900 block">
                          Pilih Siswa Manual:
                        </label>
                        <select
                          value={item.matchedStudentId || ''}
                          onChange={(e) => handleManualAssign(item.id, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-medium focus:outline-none focus:border-amber-600"
                        >
                          <option value="">-- Pasangkan dengan Siswa --</option>
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nis} - {s.nama} ({s.kelas})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleRemovePhoto(item.id)}
                      className="text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                    {isMatched && (
                      <button
                        onClick={() => handleManualAssign(item.id, '')}
                        className="text-slate-500 hover:text-slate-800 font-medium text-[11px] cursor-pointer"
                      >
                        Ganti Siswa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
