import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Camera,
  CheckSquare,
  Square,
  Printer,
  BookOpen,
  CreditCard,
  X,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Student } from '../../types';
import { ExcelService } from '../../services/excelService';

interface Props {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => { success: boolean; message: string };
  onUpdateStudent: (student: Student) => { success: boolean; message: string };
  onDeleteStudent: (id: string) => void;
  onDeleteMultipleStudents: (ids: string[]) => void;
  onOpenImportModal: () => void;
  onQuickPreviewStudent: (student: Student, type: 'perpus' | 'siswa') => void;
  onSendToPrint: (selectedIds: string[]) => void;
}

export const DataSiswaView: React.FC<Props> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onOpenImportModal,
  onQuickPreviewStudent,
  onSendToPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    nis: '',
    nisn: '',
    kelas: '7A',
    tempatLahir: 'Merangin',
    tanggalLahir: '',
    jenisKelamin: 'L' as 'L' | 'P',
    alamat: 'Tabir Selatan, Merangin',
    noAnggotaPerpus: '',
    fotoUrl: '',
  });
  const [formError, setFormError] = useState('');

  // Extract distinct classes
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.kelas));
    return Array.from(set).sort();
  }, [students]);

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchClass = selectedClass === 'ALL' || s.kelas === selectedClass;
      const matchGender = selectedGender === 'ALL' || s.jenisKelamin === selectedGender;
      const matchPhoto =
        selectedPhotoFilter === 'ALL' ||
        (selectedPhotoFilter === 'HAS_PHOTO' && !!s.fotoUrl) ||
        (selectedPhotoFilter === 'NO_PHOTO' && !s.fotoUrl);

      return matchSearch && matchClass && matchGender && matchPhoto;
    });
  }, [students, searchQuery, selectedClass, selectedGender, selectedPhotoFilter]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nama: '',
      nis: '',
      nisn: '',
      kelas: availableClasses[0] || '7A',
      tempatLahir: 'Merangin',
      tanggalLahir: '',
      jenisKelamin: 'L',
      alamat: 'Tabir Selatan, Merangin',
      noAnggotaPerpus: '',
      fotoUrl: '',
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nama: student.nama,
      nis: student.nis,
      nisn: student.nisn || '',
      kelas: student.kelas,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      jenisKelamin: student.jenisKelamin,
      alamat: student.alamat || '',
      noAnggotaPerpus: student.noAnggotaPerpus || `P-${student.nis}`,
      fotoUrl: student.fotoUrl || '',
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Save form
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setFormError('Nama lengkap siswa wajib diisi!');
      return;
    }
    if (!formData.nis.trim()) {
      setFormError('NIS siswa wajib diisi!');
      return;
    }

    if (editingStudent) {
      const res = onUpdateStudent({
        ...editingStudent,
        ...formData,
        nama: formData.nama.toUpperCase().trim(),
        nis: formData.nis.trim(),
        nisn: formData.nisn.trim(),
        kelas: formData.kelas.toUpperCase().trim(),
      });
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    } else {
      const res = onAddStudent({
        ...formData,
        nama: formData.nama.toUpperCase().trim(),
        nis: formData.nis.trim(),
        nisn: formData.nisn.trim(),
        kelas: formData.kelas.toUpperCase().trim(),
        noAnggotaPerpus: formData.noAnggotaPerpus || `P-${formData.nis.trim()}`,
      });
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    }

    setIsAddEditModalOpen(false);
  };

  // Handle Photo upload in modal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, fotoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Bulk delete
  const handleDeleteSelected = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      onDeleteMultipleStudents(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Manajemen Data Siswa</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {students.length} Siswa
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data siswa, nomor induk, foto, dan status cetak kartu MTs Miftahul Huda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={ExcelService.downloadTemplate}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download Template Excel untuk Pengisian Massal"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Template Excel</span>
          </button>
          <button
            onClick={() => ExcelService.exportStudents(students)}
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download seluruh data siswa ke format .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenImportModal}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-200" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan Nama Siswa, NIS, atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Kelas:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua Kelas</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Jenis Kelamin */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">JK:</label>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua (L & P)</option>
            <option value="L">Laki-Laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        {/* Filter Foto */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Foto:</label>
          <select
            value={selectedPhotoFilter}
            onChange={(e) => setSelectedPhotoFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua Siswa</option>
            <option value="HAS_PHOTO">Ada Foto</option>
            <option value="NO_PHOTO">Belum Ada Foto</option>
          </select>
        </div>
      </div>

      {/* Selected Action Floating Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-950 text-white p-3 rounded-xl shadow-lg flex items-center justify-between border border-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span className="font-semibold">Siswa dipilih untuk tindakan massal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendToPrint(selectedIds)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Kartu ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-slate-300 text-xs cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Data Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 hover:text-emerald-700 cursor-pointer"
                    title="Pilih Semua"
                  >
                    {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-2 w-10 text-center">No</th>
                <th className="py-3 px-3 w-14 text-center">Foto</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-3 text-center">Kelas</th>
                <th className="py-3 px-4">Tempat, Tanggal Lahir</th>
                <th className="py-3 px-3 text-center">JK</th>
                <th className="py-3 px-4 text-center">Status Cetak</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">Tidak ada data siswa ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ubah kata kunci pencarian atau tambah siswa baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-emerald-50/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(s.id)}
                          className="p-1 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="w-9 h-11 mx-auto rounded-md bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center relative shadow-2xs">
                          {s.fotoUrl ? (
                            <img
                              src={s.fotoUrl}
                              alt={s.nama}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <Camera className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {s.nama}
                        {s.alamat && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                            {s.alamat}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-800">{s.nis}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{s.nisn || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {s.tempatLahir}, {s.tanggalLahir}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            s.jenisKelamin === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.isLibraryCardPrinted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Status Kartu Perpus"
                          >
                            Perpus: {s.isLibraryCardPrinted ? '✓' : '-'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.isStudentCardPrinted
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Status Kartu Siswa"
                          >
                            Siswa: {s.isStudentCardPrinted ? '✓' : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Quick Card Previews */}
                          <button
                            onClick={() => onQuickPreviewStudent(s, 'perpus')}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Preview Kartu Perpus"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onQuickPreviewStudent(s, 'siswa')}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Preview Kartu Peserta Didik"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data siswa ${s.nama} (${s.nis})?`)) {
                                onDeleteStudent(s.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <p className="text-xs text-emerald-200">
                  {editingStudent
                    ? `Perbarui informasi untuk ${editingStudent.nama}`
                    : 'Masukkan identitas siswa MTs Miftahul Huda'}
                </p>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Photo preview and upload */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-16 h-20 bg-slate-200 rounded-lg border-2 border-emerald-600 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                  {formData.fotoUrl ? (
                    <img
                      src={formData.fotoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Foto Siswa</label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Format JPG, JPEG, atau PNG. Pasfoto rasio 2:3 atau 3:4.
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                      Pilih Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, fotoUrl: '' }))}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Two columns grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AHMAD FAIZIN"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 7A, 7B, 8A, 9B"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIS (Nomor Induk Siswa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2607001"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    placeholder="10 digit NISN"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Merangin"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 12 Mei 2013"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex items-center gap-4 mt-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="jk"
                        checked={formData.jenisKelamin === 'L'}
                        onChange={() => setFormData({ ...formData, jenisKelamin: 'L' })}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Laki-Laki (L)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="jk"
                        checked={formData.jenisKelamin === 'P'}
                        onChange={() => setFormData({ ...formData, jenisKelamin: 'P' })}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Perempuan (P)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Anggota Perpus
                  </label>
                  <input
                    type="text"
                    placeholder="Otomatis: P-[NIS]"
                    value={formData.noAnggotaPerpus}
                    onChange={(e) => setFormData({ ...formData, noAnggotaPerpus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  placeholder="Contoh: Desa Rawa Jaya RT 04, Tabir Selatan"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
