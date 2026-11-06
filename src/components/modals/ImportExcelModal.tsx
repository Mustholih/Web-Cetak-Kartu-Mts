import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Student } from '../../types';
import { ExcelService, ParseResult } from '../../services/excelService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  onImportComplete: (importedStudents: Omit<Student, 'id'>[]) => void;
}

export const ImportExcelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  existingStudents,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await ExcelService.parseFile(selectedFile, existingStudents);
      setParseResult(result);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca file: ${err.message || 'Format tidak dikenali'}`);
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
    if (parseResult && parseResult.validStudents.length > 0) {
      onImportComplete(parseResult.validStudents);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Import Data Siswa dari Excel / CSV</h3>
              <p className="text-xs text-emerald-200">
                Upload daftar siswa MTs Miftahul Huda secara massal
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Template helper callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Belum punya format Excel?</p>
                <p className="text-[11px] text-emerald-700">
                  Gunakan template resmi agar kolom NIS, Nama, Kelas, dan TTL terbaca otomatis.
                </p>
              </div>
            </div>
            <button
              onClick={ExcelService.downloadTemplate}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer"
          >
            <input
              type="file"
              id="excel-input"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="excel-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {file ? file.name : 'Klik untuk memilih file Excel atau seret ke sini'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mendukung .xlsx, .xls, atau .csv (Maksimal 5.000 siswa)
              </p>
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsing Results */}
          {loading && (
            <div className="py-6 text-center text-xs text-slate-500">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Menganalisis file Excel...
            </div>
          )}

          {parseResult && (
            <div className="space-y-3 pt-2">
              {/* Summary Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{parseResult.validStudents.length} Siswa Siap Diimport</span>
                </div>
                {parseResult.errors.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{parseResult.errors.length} Baris Dilewati</span>
                  </div>
                )}
              </div>

              {/* Error messages list */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 max-h-32 overflow-y-auto space-y-1">
                  <p className="font-bold text-amber-950">Catatan Validasi:</p>
                  {parseResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              {parseResult.validStudents.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1.5">
                    Preview Data Hasil Pembacaan ({parseResult.validStudents.length} siswa):
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Nama Lengkap</th>
                          <th className="py-2 px-3">NIS</th>
                          <th className="py-2 px-3">Kelas</th>
                          <th className="py-2 px-3">TTL</th>
                          <th className="py-2 px-3">JK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.validStudents.slice(0, 15).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-bold text-slate-900">{s.nama}</td>
                            <td className="py-1.5 px-3 font-mono text-emerald-800">{s.nis}</td>
                            <td className="py-1.5 px-3 font-semibold">{s.kelas}</td>
                            <td className="py-1.5 px-3 text-slate-600">
                              {s.tempatLahir}, {s.tanggalLahir}
                            </td>
                            <td className="py-1.5 px-3">{s.jenisKelamin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.validStudents.length > 15 && (
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      + {parseResult.validStudents.length - 15} data lainnya akan otomatis diimport...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.validStudents.length === 0}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              parseResult && parseResult.validStudents.length > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Simpan & Masukkan ke Database ({parseResult?.validStudents.length || 0})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
