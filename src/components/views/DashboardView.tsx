import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Camera,
  FileSpreadsheet,
  ImageUp,
  UserPlus,
  Printer,
  ChevronRight,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Student, SchoolIdentity, ActiveTab } from '../../types';

interface Props {
  students: Student[];
  identity: SchoolIdentity;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onQuickPreviewStudent: (student: Student, type: 'perpus' | 'siswa') => void;
}

export const DashboardView: React.FC<Props> = ({
  students,
  identity,
  setActiveTab,
  onOpenAddModal,
  onOpenImportModal,
  onQuickPreviewStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Class calculations
  const total = students.length;
  const countClass7 = students.filter((s) => s.kelas.startsWith('7')).length;
  const countClass8 = students.filter((s) => s.kelas.startsWith('8')).length;
  const countClass9 = students.filter((s) => s.kelas.startsWith('9')).length;

  const countLibPrinted = students.filter((s) => s.isLibraryCardPrinted).length;
  const countLibUnprinted = total - countLibPrinted;

  const countStdPrinted = students.filter((s) => s.isStudentCardPrinted).length;
  const countStdUnprinted = total - countStdPrinted;

  const countWithPhoto = students.filter((s) => s.fotoUrl).length;
  const countNoPhoto = total - countWithPhoto;

  // Filtered recent students
  const filteredStudents = students
    .filter(
      (s) =>
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Top Banner: Madrasah Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-lg border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-400/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border-2 border-amber-400 shadow-md flex items-center justify-center flex-shrink-0">
              {identity.logoUrl ? (
                <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-emerald-700 rounded-xl" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tahun Pelajaran: {identity.tahunPelajaran}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black font-serif tracking-tight text-white leading-tight">
                {identity.namaMadrasah}
              </h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-1 opacity-90">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                <span>{identity.alamat}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('cetak-kartu')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu Massal</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Import Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <button
          onClick={onOpenImportModal}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Upload Excel
            </h3>
            <p className="text-[11px] text-slate-500">Import data siswa massal</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('upload-foto')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ImageUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Upload Foto Massal
            </h3>
            <p className="text-[11px] text-slate-500">Cocokkan otomatis NISN</p>
          </div>
        </button>

        <button
          onClick={onOpenAddModal}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Tambah Siswa
            </h3>
            <p className="text-[11px] text-slate-500">Input manual 1 siswa</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('cetak-kartu')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Cetak Semua Kartu
            </h3>
            <p className="text-[11px] text-slate-500">Format A4 & ID-1 PDF</p>
          </div>
        </button>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total Siswa
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{total}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Rasio L / P</span>
            <span className="font-bold text-slate-800">
              {students.filter((s) => s.jenisKelamin === 'L').length} L •{' '}
              {students.filter((s) => s.jenisKelamin === 'P').length} P
            </span>
          </div>
        </div>

        {/* Classes breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Distribusi Kelas
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-emerald-700">7: {countClass7}</span>
                <span className="text-slate-300">|</span>
                <span className="text-lg font-bold text-teal-700">8: {countClass8}</span>
                <span className="text-slate-300">|</span>
                <span className="text-lg font-bold text-blue-700">9: {countClass9}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                style={{ width: total ? `${(countClass7 / total) * 100}%` : '0%' }}
                className="bg-emerald-600 h-full"
                title={`Kelas 7: ${countClass7}`}
              />
              <div
                style={{ width: total ? `${(countClass8 / total) * 100}%` : '0%' }}
                className="bg-teal-500 h-full"
                title={`Kelas 8: ${countClass8}`}
              />
              <div
                style={{ width: total ? `${(countClass9 / total) * 100}%` : '0%' }}
                className="bg-blue-600 h-full"
                title={`Kelas 9: ${countClass9}`}
              />
            </div>
          </div>
        </div>

        {/* Library Card Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Kartu Perpustakaan
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-700">{countLibPrinted}</span>
                <span className="text-xs text-slate-500 font-medium">/ {total} cetak</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Belum dicetak:</span>
            <span className="font-bold text-amber-600">{countLibUnprinted} siswa</span>
          </div>
        </div>

        {/* Student ID Card Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Kartu Peserta Didik
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-700">{countStdPrinted}</span>
                <span className="text-xs text-slate-500 font-medium">/ {total} cetak</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Belum dicetak:</span>
            <span className="font-bold text-indigo-600">{countStdUnprinted} siswa</span>
          </div>
        </div>
      </div>

      {/* Photo Status Alert if there are missing photos */}
      {countNoPhoto > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Ada {countNoPhoto} siswa yang belum memiliki foto
              </p>
              <p className="text-[11px] text-amber-700">
                Gunakan menu Upload Foto Massal untuk memasukkan foto secara bersamaan berdasarkan NISN.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('upload-foto')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            Upload Sekarang
          </button>
        </div>
      )}

      {/* Recent Students Table & Quick Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Data Siswa Terdaftar</h3>
            <p className="text-xs text-slate-500">Daftar siswa siap cetak kartu</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
              />
            </div>
            <button
              onClick={() => setActiveTab('data-siswa')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Kelola Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Foto</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Kartu Perpus</th>
                <th className="py-3 px-4">Kartu Siswa</th>
                <th className="py-3 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-8 h-10 rounded bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center">
                        {s.fotoUrl ? (
                          <img src={s.fotoUrl} alt={s.nama} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                      <div>{s.nis}</div>
                      {s.nisn && <div className="text-[10px] text-slate-400">{s.nisn}</div>}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {s.nama}
                      <span className="ml-2 text-[10px] font-normal text-slate-500">
                        ({s.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'})
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-800">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {s.isLibraryCardPrinted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Tercetak
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {s.isStudentCardPrinted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Tercetak
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onQuickPreviewStudent(s, 'perpus')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Preview Kartu Perpus"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Perpus</span>
                        </button>
                        <button
                          onClick={() => onQuickPreviewStudent(s, 'siswa')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Preview Kartu Siswa"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Siswa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
