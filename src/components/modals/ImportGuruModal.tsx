import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  Sparkles,
  Info,
} from 'lucide-react';
import { Teacher } from '../../types';
import { ExcelService, TeacherParseResult } from '../../services/excelService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingTeachers: Teacher[];
  onImportComplete: (importedTeachers: Omit<Teacher, 'id'>[], mode: 'append' | 'replace') => void;
}

export const ImportGuruModal: React.FC<Props> = ({
  isOpen,
  onClose,
  existingTeachers,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState<TeacherParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await ExcelService.parseTeacherFile(selectedFile, existingTeachers, importMode);
      setParseResult(result);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca file: ${err.message || 'Format file tidak didukung'}`);
      setParseResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.validTeachers.length > 0) {
      onImportComplete(parseResult.validTeachers, importMode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Import Data Guru & Inisial Pengawas</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-semibold border border-emerald-600/40">
                  Excel / CSV
                </span>
              </h3>
              <p className="text-xs text-emerald-100">
                Upload daftar profil guru madrasah beserta kode inisial secara massal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Template helper callout */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Gunakan Template Resmi Excel Guru</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Kolom: <span className="font-mono font-semibold">Nama Lengkap & Gelar</span>,{' '}
                  <span className="font-mono font-semibold">Inisial</span>,{' '}
                  <span className="font-mono font-semibold">NIP/NPK</span>,{' '}
                  <span className="font-mono font-semibold">Mata Pelajaran</span>, dan{' '}
                  <span className="font-mono font-semibold">No HP</span>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={ExcelService.downloadTeacherTemplate}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Mode Selection */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Opsi Penggabungan Data:</span>
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => {
                    setImportMode('append');
                    if (file) handleFileChange(file);
                  }}
                  className="accent-emerald-700"
                />
                <span>Tambahkan ke data saat ini ({existingTeachers.length} guru)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => {
                    setImportMode('replace');
                    if (file) handleFileChange(file);
                  }}
                  className="accent-emerald-700"
                />
                <span>Gantikan Seluruh Data Lama</span>
              </label>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer"
          >
            <input
              type="file"
              id="guru-excel-input"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="guru-excel-input" className="cursor-pointer flex flex-col items-center w-full">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {file ? file.name : 'Klik untuk memilih file Excel data guru atau seret ke sini'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Format didukung: <span className="font-semibold text-slate-700">.xlsx, .xls, .csv</span>.
                Jika inisial kosong, sistem otomatis membuat inisial 2 huruf unik dari nama guru.
              </p>
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="inline-block animate-spin text-lg">⏳</span>
              <span className="font-semibold">Menganalisis dan memvalidasi file Excel guru...</span>
            </div>
          )}

          {/* Parsing Results & Preview */}
          {parseResult && (
            <div className="space-y-3 pt-2">
              {/* Summary Stats */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{parseResult.validTeachers.length} Guru Siap Diimport</span>
                </div>

                {parseResult.warnings.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{parseResult.warnings.length} Inisial Disesuaikan Otomatis</span>
                  </div>
                )}

                {parseResult.errors.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{parseResult.errors.length} Baris Dilewati (Error)</span>
                  </div>
                )}
              </div>

              {/* Warnings List (e.g. Inisial generated) */}
              {parseResult.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] space-y-1 max-h-28 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1 text-amber-950 mb-1">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Catatan Penyesuaian Inisial:</span>
                  </div>
                  {parseResult.warnings.map((warn, i) => (
                    <div key={i} className="text-amber-800">
                      • {warn}
                    </div>
                  ))}
                </div>
              )}

              {/* Errors List */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1 max-h-28 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1 text-rose-950 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Daftar Kesalahan Baris:</span>
                  </div>
                  {parseResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              {parseResult.validTeachers.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
                    <span>Pratinjau Hasil Pembacaan Data ({parseResult.validTeachers.length} Guru)</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      Inisial akan digunakan saat mencetak jadwal ruang
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 w-10 text-center">No</th>
                          <th className="py-2 px-3 w-20 text-center">Inisial</th>
                          <th className="py-2 px-3">Nama Lengkap & Gelar</th>
                          <th className="py-2 px-3">NIP / NPK</th>
                          <th className="py-2 px-3">Mata Pelajaran</th>
                          <th className="py-2 px-3">No HP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.validTeachers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-center text-slate-400 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-900 text-amber-300 border border-amber-300/40">
                                {t.inisial}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{t.nama}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{t.nip || '-'}</td>
                            <td className="py-2 px-3 text-slate-700">{t.mataPelajaran || '-'}</td>
                            <td className="py-2 px-3 text-slate-600">{t.noHp || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.validTeachers.length === 0 || loading}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>
              {parseResult && parseResult.validTeachers.length > 0
                ? `Import ${parseResult.validTeachers.length} Guru Sekarang`
                : 'Pilih File Terlebih Dahulu'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
