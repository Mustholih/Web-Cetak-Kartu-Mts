import React, { useState } from 'react';
import {
  DatabaseBackup,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Student, SchoolIdentity } from '../../types';
import { StorageService } from '../../services/storage';
import { ExcelService } from '../../services/excelService';

interface Props {
  students: Student[];
  identity: SchoolIdentity;
  onFullRestore: () => void;
  adminPin: string;
  onUpdateAdminPin: (pin: string) => void;
}

export const BackupDataView: React.FC<Props> = ({
  students,
  identity,
  onFullRestore,
  adminPin,
  onUpdateAdminPin,
}) => {
  const [notice, setNotice] = useState<string | null>(null);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinNotice, setPinNotice] = useState<string | null>(null);

  // Full JSON Backup download
  const handleDownloadFullBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Backup_Lengkap_MTs_Miftahul_Huda_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('File backup lengkap (.json) berhasil diunduh ke komputer Anda!');
    setTimeout(() => setNotice(null), 4000);
  };

  // Restore JSON
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importFullBackup(content);
      if (res.success) {
        onFullRestore();
        setNotice(res.message);
        setTimeout(() => setNotice(null), 5000);
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin mengembalikan seluruh aplikasi ke data awal (reset database)? Pastikan Anda telah mengunduh file backup.'
      )
    ) {
      StorageService.resetToDefaults();
      onFullRestore();
      setNotice('Database berhasil dikembalikan ke data awal!');
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Update PIN
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput !== adminPin) {
      setPinNotice('PIN lama salah!');
      return;
    }
    if (newPinInput.length < 4) {
      setPinNotice('PIN baru minimal 4 karakter!');
      return;
    }

    onUpdateAdminPin(newPinInput);
    setCurrentPinInput('');
    setNewPinInput('');
    setPinNotice('PIN Administrator berhasil diperbarui!');
    setTimeout(() => setPinNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Backup, Restore & Keamanan Sistem</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Database Permanen
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Simpan salinan data siswa, foto, logo, tanda tangan, dan pengaturan kartu agar aman.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Backup & Export Options */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Pencadangan Data (Backup)</span>
          </h3>

          <div className="space-y-3">
            {/* Backup JSON */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Backup Lengkap Database (.JSON)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                  Menyimpan seluruh {students.length} siswa, foto, logo, tanda tangan, stempel, dan template kartu.
                </p>
              </div>
              <button
                onClick={handleDownloadFullBackup}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Backup</span>
              </button>
            </div>

            {/* Export Excel */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Export Data Siswa ke Excel (.XLSX)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                  Tabel data siswa lengkap dengan NIS, NISN, kelas, dan status cetak.
                </p>
              </div>
              <button
                onClick={() => ExcelService.exportStudents(students, identity.namaMadrasah)}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Restore Options */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Pemulihan Data (Restore)</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-center">
              <input
                type="file"
                id="restore-file-input"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
              <label htmlFor="restore-file-input" className="cursor-pointer block">
                <DatabaseBackup className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-900">
                  Pilih File Backup (.JSON) untuk Dipulihkan
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Data yang dipulihkan akan menggantikan database saat ini secara aman.
                </p>
                <span className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs">
                  Buka File Backup
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between border-t text-xs">
              <div>
                <p className="font-bold text-rose-800">Reset Data Demo Awal</p>
                <p className="text-[11px] text-slate-500">Kembalikan ke data bawaan MTs Miftahul Huda.</p>
              </div>
              <button
                onClick={handleResetToDefault}
                className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* Admin Security PIN Settings */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Pengaturan Password / PIN Administrator</span>
          </h3>

          <form onSubmit={handleSavePin} className="max-w-xl space-y-3">
            {pinNotice && (
              <p
                className={`text-xs font-bold ${
                  pinNotice.includes('berhasil') ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {pinNotice}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Lama (Default: admin123)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN saat ini"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN baru"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Perbarui Password Operator</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
