import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Teacher, ExamScheduleItem, ActiveTab } from '../../types';
import { StorageService } from '../../services/storage';
import { DEFAULT_TEACHERS } from '../../services/defaultData';

interface Props {
  teachers: Teacher[];
  examSchedule: ExamScheduleItem[];
  onSaveTeachers: (teachers: Teacher[]) => void;
  onNavigateToSchedule?: () => void;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const DataGuruView: React.FC<Props> = ({
  teachers,
  examSchedule,
  onSaveTeachers,
  onNavigateToSchedule,
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [inisial, setInisial] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [noHp, setNoHp] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to suggest 2-letter initials from name
  const suggestInitials = (fullName: string): string => {
    // Strip titles like Drs., Dra., Hj., H., S.Pd., M.Pd., etc.
    const clean = fullName
      .replace(/\b(Drs|Dra|Dr|Prof|Hj|H|Ust|Ustadz|Kyai|S\.Pd|M\.Pd|S\.Pd\.I|M\.Pd\.I|S\.Ag|S\.Si|S\.E|S\.Kom)\b/gi, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim();

    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return '';
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setNama('');
    setNip('');
    setInisial('');
    setMataPelajaran('');
    setNoHp('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setNama(t.nama);
    setNip(t.nip || '');
    setInisial(t.inisial);
    setMataPelajaran(t.mataPelajaran || '');
    setNoHp(t.noHp || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setNama(val);
    if (!editingTeacher && !inisial) {
      const suggested = suggestInitials(val);
      if (suggested) setInisial(suggested);
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = nama.trim();
    const cleanInisial = inisial.trim().toUpperCase();

    if (!cleanNama) {
      alert('Nama guru wajib diisi!');
      return;
    }
    if (!cleanInisial) {
      alert('Inisial guru wajib diisi (misal: SA, MI, RH)!');
      return;
    }

    if (editingTeacher) {
      // Update
      const res = StorageService.updateTeacher({
        ...editingTeacher,
        nama: cleanNama,
        nip: nip.trim(),
        inisial: cleanInisial,
        mataPelajaran: mataPelajaran.trim(),
        noHp: noHp.trim(),
      });
      if (res.success) {
        onSaveTeachers(StorageService.getTeachers());
        setIsModalOpen(false);
        showToast('Data guru berhasil diperbarui!');
      } else {
        alert(res.message);
      }
    } else {
      // Add
      const res = StorageService.addTeacher({
        nama: cleanNama,
        nip: nip.trim(),
        inisial: cleanInisial,
        mataPelajaran: mataPelajaran.trim(),
        noHp: noHp.trim(),
      });
      if (res.success) {
        onSaveTeachers(StorageService.getTeachers());
        setIsModalOpen(false);
        showToast('Data guru berhasil ditambahkan!');
      } else {
        alert(res.message);
      }
    }
  };

  const handleDeleteTeacher = (t: Teacher) => {
    if (confirm(`Hapus guru "${t.nama}" (Inisial: ${t.inisial})?`)) {
      if (StorageService.deleteTeacher(t.id)) {
        onSaveTeachers(StorageService.getTeachers());
        showToast(`Guru ${t.nama} berhasil dihapus.`);
      }
    }
  };

  const handleResetDefaultTeachers = () => {
    if (
      confirm(
        'Kembalikan daftar guru ke 12 Guru Default MTs Miftahul Huda beserta inisial resminya?'
      )
    ) {
      StorageService.saveTeachers(DEFAULT_TEACHERS);
      onSaveTeachers(DEFAULT_TEACHERS);
      showToast('Daftar guru berhasil di-reset ke default MTs Miftahul Huda!');
    }
  };

  // Compute how many exam sessions each teacher is assigned to supervise
  const supervisorDutyCount = useMemo(() => {
    const counts: Record<string, number> = {};
    teachers.forEach((t) => {
      counts[t.inisial.toUpperCase()] = 0;
    });

    examSchedule.forEach((sch) => {
      if (sch.roomSupervisors) {
        Object.values(sch.roomSupervisors).forEach((init) => {
          if (init && init !== '-') {
            const up = init.trim().toUpperCase();
            counts[up] = (counts[up] || 0) + 1;
          }
        });
      }
    });

    return counts;
  }, [teachers, examSchedule]);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.inisial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nip && t.nip.includes(searchQuery)) ||
      (t.mataPelajaran && t.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 no-print">
          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-lg border border-emerald-700/50">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md border-2 border-white/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Pengawas Ujian Madrasah</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black font-serif tracking-tight text-white leading-tight">
                Data Guru & Inisial Pengawas
              </h1>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Kelola profil guru dan kode inisial pengawas ujian (misal: SA, MI, RH). Inisial ini akan
                otomatis tertera pada kolom ruang saat mencetak jadwal ujian resmi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Input Guru Baru</span>
            </button>
            <button
              onClick={() => {
                if (onNavigateToSchedule) {
                  onNavigateToSchedule();
                } else if (setActiveTab) {
                  setActiveTab('manajemen-ujian');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Jadwal & Pengawas Ruang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Guru Terdaftar
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{teachers.length} Guru</h3>
            <p className="text-[11px] text-emerald-700 mt-0.5">Semua memiliki kode inisial</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sesi Ujian Terjadwal
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{examSchedule.length} Sesi</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Mata pelajaran terjadwal</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Format Inisial
            </p>
            <h3 className="text-2xl font-black text-emerald-800 mt-1">2-3 Karakter</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Memudahkan cetak jadwal ringkas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header and Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Guru & Inisial Pengawas</h2>
            <p className="text-xs text-slate-500">
              Gunakan inisial untuk menandai guru pengawas pada setiap ruang ujian
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama / Inisial / NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
              />
            </div>

            <button
              onClick={handleResetDefaultTeachers}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
              title="Kembalikan ke data 12 guru MTs Miftahul Huda"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-24 text-center">Inisial</th>
                <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                <th className="py-3 px-4">NIP / NPK</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4 text-center">Tugas Mengawas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ada data guru yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const dutyCount = supervisorDutyCount[t.inisial.toUpperCase()] || 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-emerald-900 text-amber-300 font-mono font-black text-xs border border-amber-300/40 shadow-xs">
                          {t.inisial}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">{t.nama}</div>
                        {t.noHp && (
                          <div className="text-[10px] text-slate-400">HP: {t.noHp}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {t.nip && t.nip !== '-' ? (
                          <span>{t.nip}</span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t.mataPelajaran ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            {t.mataPelajaran}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            dutyCount > 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {dutyCount} Sesi
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Add / Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  {editingTeacher ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingTeacher ? 'Edit Data Guru & Inisial' : 'Input Guru & Pengawas Baru'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    MTs Miftahul Huda - Tahun Pelajaran Aktif
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Dra. Hj. Siti Aminah, M.Pd."
                  value={nama}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inisial Pengawas <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="contoh: SA"
                      value={inisial}
                      onChange={(e) => setInisial(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl border border-amber-400 focus:outline-none focus:border-emerald-600 bg-amber-50/50 font-mono font-black text-sm uppercase text-emerald-950"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sug = suggestInitials(nama);
                        if (sug) setInisial(sug);
                      }}
                      className="absolute right-2 top-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-semibold hover:bg-emerald-800 cursor-pointer"
                      title="Generate dari nama"
                    >
                      Auto
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Maks 2-3 huruf (akan dicetak di kolom jadwal)
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP / NPK</label>
                  <input
                    type="text"
                    placeholder="197203151998032001 (opsional)"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: Al-Qur'an Hadis"
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08127456xxxx (opsional)"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
              </div>

              {/* Inisial Preview Banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tampilan Inisial di Jadwal:
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded bg-emerald-900 text-amber-300 font-mono font-black text-xs border border-amber-400">
                      {inisial || '??'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {nama || '(Nama Guru)'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  Siap Cetak
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md cursor-pointer transition-all"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
