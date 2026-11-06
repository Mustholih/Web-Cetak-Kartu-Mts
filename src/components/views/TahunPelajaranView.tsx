import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import { SchoolIdentity, Student } from '../../types';

interface Props {
  identity: SchoolIdentity;
  academicYears: string[];
  onSaveAcademicYears: (years: string[]) => void;
  onUpdateIdentity: (identity: SchoolIdentity) => void;
  students: Student[];
  onPromoteStudents: () => void;
  onResetPrintStatus: () => void;
}

export const TahunPelajaranView: React.FC<Props> = ({
  identity,
  academicYears,
  onSaveAcademicYears,
  onUpdateIdentity,
  students,
  onPromoteStudents,
  onResetPrintStatus,
}) => {
  const [newYearInput, setNewYearInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSelectYear = (year: string) => {
    onUpdateIdentity({ ...identity, tahunPelajaran: year });
    setNotice(`Tahun Pelajaran aktif berhasil diubah menjadi ${year}!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAddNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newYearInput.trim();
    if (!clean) return;
    if (academicYears.includes(clean)) {
      alert('Tahun pelajaran ini sudah ada di daftar.');
      return;
    }

    const updated = [...academicYears, clean].sort();
    onSaveAcademicYears(updated);
    setNewYearInput('');
    setNotice(`Tahun pelajaran ${clean} berhasil ditambahkan!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handlePromote = () => {
    if (
      window.confirm(
        'PERINGATAN KENAIKAN KELAS:\n\n• Siswa Kelas 7 akan naik ke Kelas 8\n• Siswa Kelas 8 akan naik ke Kelas 9\n• Siswa Kelas 9 akan ditandai LULUS (Alumni)\n\nApakah Anda yakin ingin melanjutkan proses kenaikan kelas?'
      )
    ) {
      onPromoteStudents();
      setNotice('Proses kenaikan kelas otomatis berhasil diselesaikan!');
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleResetPrint = () => {
    if (
      window.confirm(
        'Reset status cetak seluruh siswa menjadi "Belum Dicetak" untuk tahun pelajaran baru?'
      )
    ) {
      onResetPrintStatus();
      setNotice('Status cetak kartu seluruh siswa berhasil di-reset!');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Pengaturan Tahun Pelajaran</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Aktif: {identity.tahunPelajaran}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ganti tahun pelajaran tanpa kehilangan data siswa. Desain dan data madrasah tetap aman.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Academic Year Selector */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
            <CalendarDays className="w-4 h-4 text-emerald-700" />
            <span>Daftar Tahun Pelajaran</span>
          </h3>

          <div className="space-y-2.5">
            {academicYears.map((year) => {
              const isActive = identity.tahunPelajaran === year;
              return (
                <div
                  key={year}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      TP
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Tahun Pelajaran {year}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isActive
                          ? '★ Sedang Digunakan di Seluruh Kartu'
                          : 'Tersedia di arsip'}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktif</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectYear(year)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Year Form */}
          <form
            onSubmit={handleAddNewYear}
            className="pt-4 border-t border-slate-200 flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Contoh: 2027/2028"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tahun Baru</span>
            </button>
          </form>
        </div>

        {/* Right Side: Promotion & Reset Helpers */}
        <div className="lg:col-span-5 space-y-5">
          {/* Automatic Grade Promotion */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Kenaikan Kelas Massal</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Memasuki tahun ajaran baru? Gunakan fitur kenaikan kelas otomatis ini untuk menaikkan
              seluruh siswa sekaligus:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex items-center justify-between font-semibold">
                <span>Kelas 7 ➜ Kelas 8</span>
                <span className="text-emerald-700">
                  {students.filter((s) => s.kelas.startsWith('7')).length} Siswa
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Kelas 8 ➜ Kelas 9</span>
                <span className="text-emerald-700">
                  {students.filter((s) => s.kelas.startsWith('8')).length} Siswa
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Kelas 9 ➜ Alumni (Lulus)</span>
                <span className="text-blue-700">
                  {students.filter((s) => s.kelas.startsWith('9')).length} Siswa
                </span>
              </div>
            </div>

            <button
              onClick={handlePromote}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Jalankan Kenaikan Kelas Massal</span>
            </button>
          </div>

          {/* Reset Print Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset Status Cetak Kartu</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Untuk mencetak kartu baru pada tahun ajaran baru, Anda dapat me-reset status
              pencetakan kartu seluruh siswa menjadi &ldquo;Belum Dicetak&rdquo;.
            </p>

            <button
              onClick={handleResetPrint}
              className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Reset Status Cetak Kartu Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
