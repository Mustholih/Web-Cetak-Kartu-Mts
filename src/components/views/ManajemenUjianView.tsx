import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Printer,
  FileDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Users,
  Grid,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowRight,
  MoveRight,
  UserPlus,
  RefreshCw,
  Shuffle,
  Shield,
  Eye,
  Sliders,
  X,
  Search,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import {
  Student,
  SchoolIdentity,
  ExamInfo,
  ExamRoom,
  ExamAllocation,
  ExamScheduleItem,
} from '../../types';
import { ExamCardItem } from '../cards/ExamCardItem';
import { ExamRoomLayoutPrint } from '../exam/ExamRoomLayoutPrint';
import { ExamAttendancePrint } from '../exam/ExamAttendancePrint';
import { PrintService } from '../../services/printService';
import { StorageService } from '../../services/storage';

interface Props {
  students: Student[];
  identity: SchoolIdentity;
  examInfo: ExamInfo;
  examRooms: ExamRoom[];
  examAllocations: ExamAllocation[];
  examSchedule: ExamScheduleItem[];
  onSaveExamInfo: (info: ExamInfo) => void;
  onSaveExamRooms: (rooms: ExamRoom[]) => void;
  onSaveExamAllocations: (allocations: ExamAllocation[]) => void;
  onSaveExamSchedule: (schedule: ExamScheduleItem[]) => void;
}

export const ManajemenUjianView: React.FC<Props> = ({
  students,
  identity,
  examInfo,
  examRooms,
  examAllocations,
  examSchedule,
  onSaveExamInfo,
  onSaveExamRooms,
  onSaveExamAllocations,
  onSaveExamSchedule,
}) => {
  // Sub-tabs: 'ruang' | 'kartu' | 'denah' | 'absensi' | 'pengaturan'
  const [subTab, setSubTab] = useState<'ruang' | 'kartu' | 'denah' | 'absensi' | 'pengaturan'>('ruang');
  const [activeRoomId, setActiveRoomId] = useState<string>(examRooms[0]?.id || '');
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Modals state
  const [isAutoAllocateModalOpen, setIsAutoAllocateModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ExamRoom | null>(null);
  const [isMoveStudentModalOpen, setIsMoveStudentModalOpen] = useState(false);
  const [movingStudentAllocation, setMovingStudentAllocation] = useState<ExamAllocation | null>(null);
  const [selectedTargetRoomId, setSelectedTargetRoomId] = useState<string>('');

  // Auto-allocate modal settings
  const [autoMode, setAutoMode] = useState<'by_class' | 'cross_class' | 'alphabetical' | 'by_nis'>('cross_class');
  const [autoPrefix, setAutoPrefix] = useState<string>(examInfo.nomorPesertaPrefix || '02-15-023-');
  const [autoCapacity, setAutoCapacity] = useState<number>(20);

  // Exam card print filters
  const [cardFilterMode, setCardFilterMode] = useState<'all' | 'room' | 'class'>('all');
  const [cardFilterRoomId, setCardFilterRoomId] = useState<string>(examRooms[0]?.id || '');
  const [cardFilterClass, setCardFilterClass] = useState<string>('7A');
  const [cardsPerPage, setCardsPerPage] = useState<number>(8);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);

  // Attendance print settings
  const [selectedAttendanceRoomId, setSelectedAttendanceRoomId] = useState<string>(examRooms[0]?.id || '');
  const [selectedAttendanceSubject, setSelectedAttendanceSubject] = useState<string>(
    examSchedule[0]?.mataPelajaran || 'Al-Qur\'an Hadis'
  );
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(
    examSchedule[0]?.hariTanggal || 'Senin, 01 Desember 2026'
  );
  const [selectedAttendanceTime, setSelectedAttendanceTime] = useState<string>(
    examSchedule[0]?.jam || '07.30 - 09.30 WIB'
  );

  // Denah print settings
  const [selectedDenahRoomId, setSelectedDenahRoomId] = useState<string>(examRooms[0]?.id || '');

  // Add room form
  const [roomFormData, setRoomFormData] = useState({
    nomorRuang: '',
    namaRuang: '',
    kapasitas: 20,
    kolomMeja: 4,
    pengawas1: '',
    pengawas2: '',
  });

  const printCardsContainerRef = useRef<HTMLDivElement>(null);
  const printDenahContainerRef = useRef<HTMLDivElement>(null);
  const printAttendanceContainerRef = useRef<HTMLDivElement>(null);

  const showNotification = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Maps and computations
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const roomMap = useMemo(() => new Map(examRooms.map((r) => [r.id, r])), [examRooms]);
  const allocationByStudentId = useMemo(
    () => new Map(examAllocations.map((a) => [a.studentId, a])),
    [examAllocations]
  );

  const allocatedStudentIds = useMemo(
    () => new Set(examAllocations.map((a) => a.studentId)),
    [examAllocations]
  );

  const unallocatedStudents = useMemo(
    () => students.filter((s) => !allocatedStudentIds.has(s.id)),
    [students, allocatedStudentIds]
  );

  const activeRoom = roomMap.get(activeRoomId) || examRooms[0];

  const activeRoomAllocations = useMemo(
    () =>
      examAllocations
        .filter((a) => a.roomId === (activeRoom?.id || ''))
        .sort((a, b) => a.nomorMeja - b.nomorMeja),
    [examAllocations, activeRoom]
  );

  // Available classes
  const distinctClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.kelas));
    return Array.from(set).sort();
  }, [students]);

  // Execute Auto Allocation
  const handleExecuteAutoAllocate = () => {
    if (examRooms.length === 0) {
      alert('Tambahkan minimal satu ruang ujian terlebih dahulu.');
      return;
    }

    // Update room capacities if requested
    const updatedRooms = examRooms.map((r) => ({
      ...r,
      kapasitas: autoCapacity,
      barisMeja: Math.ceil(autoCapacity / (r.kolomMeja || 4)),
    }));
    onSaveExamRooms(updatedRooms);

    // Run auto distribution
    const newAllocations = StorageService.autoAllocateStudents(
      students,
      updatedRooms,
      autoMode,
      autoPrefix
    );

    onSaveExamAllocations(newAllocations);
    setIsAutoAllocateModalOpen(false);
    showNotification(
      `Berhasil membagi ${newAllocations.length} siswa ke dalam ${updatedRooms.length} ruang ujian!`
    );
  };

  // Add / Edit Room
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    const nextNum = examRooms.length + 1;
    setRoomFormData({
      nomorRuang: `Ruang ${String(nextNum).padStart(2, '0')}`,
      namaRuang: `Gedung Kelas ${nextNum}`,
      kapasitas: 20,
      kolomMeja: 4,
      pengawas1: '',
      pengawas2: '',
    });
    setIsAddRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: ExamRoom) => {
    setEditingRoom(room);
    setRoomFormData({
      nomorRuang: room.nomorRuang,
      namaRuang: room.namaRuang,
      kapasitas: room.kapasitas,
      kolomMeja: room.kolomMeja || 4,
      pengawas1: room.pengawas1 || '',
      pengawas2: room.pengawas2 || '',
    });
    setIsAddRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.nomorRuang.trim()) return;

    if (editingRoom) {
      const updated = examRooms.map((r) =>
        r.id === editingRoom.id
          ? {
              ...r,
              ...roomFormData,
              barisMeja: Math.ceil(roomFormData.kapasitas / roomFormData.kolomMeja),
            }
          : r
      );
      onSaveExamRooms(updated);
      showNotification(`Data ${roomFormData.nomorRuang} berhasil diperbarui.`);
    } else {
      const newRoom: ExamRoom = {
        id: `room-${Date.now()}`,
        ...roomFormData,
        barisMeja: Math.ceil(roomFormData.kapasitas / roomFormData.kolomMeja),
      };
      const updated = [...examRooms, newRoom];
      onSaveExamRooms(updated);
      setActiveRoomId(newRoom.id);
      showNotification(`${roomFormData.nomorRuang} berhasil ditambahkan.`);
    }
    setIsAddRoomModalOpen(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = roomMap.get(roomId);
    if (!room) return;
    if (
      window.confirm(
        `Hapus ${room.nomorRuang}? Siswa yang berada di ruang ini akan dikembalikan ke daftar belum terbagi.`
      )
    ) {
      const updatedRooms = examRooms.filter((r) => r.id !== roomId);
      const updatedAllocations = examAllocations.filter((a) => a.roomId !== roomId);
      onSaveExamRooms(updatedRooms);
      onSaveExamAllocations(updatedAllocations);
      if (activeRoomId === roomId) {
        setActiveRoomId(updatedRooms[0]?.id || '');
      }
      showNotification(`${room.nomorRuang} telah dihapus.`);
    }
  };

  // Add individual student to room
  const handleAddStudentToRoom = (studentId: string) => {
    if (!activeRoom) return;
    const currentSeats = activeRoomAllocations.map((a) => a.nomorMeja);
    let nextSeat = 1;
    while (currentSeats.includes(nextSeat)) {
      nextSeat++;
    }

    if (nextSeat > activeRoom.kapasitas) {
      alert(`Kapasitas ${activeRoom.nomorRuang} (${activeRoom.kapasitas} meja) sudah penuh.`);
      return;
    }

    const nomorPeserta = `${examInfo.nomorPesertaPrefix}${String(
      examAllocations.length + 1
    ).padStart(3, '0')}`;

    const newAllocation: ExamAllocation = {
      id: `alloc-${studentId}`,
      studentId,
      roomId: activeRoom.id,
      nomorPeserta,
      nomorMeja: nextSeat,
      isCardPrinted: false,
    };

    const updated = [...examAllocations, newAllocation];
    onSaveExamAllocations(updated);
    showNotification(`Siswa berhasil ditambahkan ke ${activeRoom.nomorRuang} (Meja ${nextSeat})`);
  };

  // Move student to another room
  const handleOpenMoveModal = (allocation: ExamAllocation) => {
    setMovingStudentAllocation(allocation);
    setSelectedTargetRoomId(examRooms.find((r) => r.id !== allocation.roomId)?.id || '');
    setIsMoveStudentModalOpen(true);
  };

  const handleExecuteMove = () => {
    if (!movingStudentAllocation || !selectedTargetRoomId) return;
    const targetRoom = roomMap.get(selectedTargetRoomId);
    if (!targetRoom) return;

    // Check available seat in target room
    const targetSeats = examAllocations
      .filter((a) => a.roomId === selectedTargetRoomId)
      .map((a) => a.nomorMeja);

    let nextSeat = 1;
    while (targetSeats.includes(nextSeat)) {
      nextSeat++;
    }

    if (nextSeat > targetRoom.kapasitas) {
      alert(`Ruang tujuan (${targetRoom.nomorRuang}) sudah penuh.`);
      return;
    }

    const updated = examAllocations.map((a) =>
      a.id === movingStudentAllocation.id
        ? { ...a, roomId: selectedTargetRoomId, nomorMeja: nextSeat }
        : a
    );

    onSaveExamAllocations(updated);
    setIsMoveStudentModalOpen(false);
    showNotification(
      `Siswa berhasil dipindahkan ke ${targetRoom.nomorRuang} (Meja ${nextSeat}). Data identitas dan kartu ujian otomatis disinkronkan!`
    );
  };

  // Remove student from room
  const handleRemoveFromRoom = (studentId: string) => {
    const student = studentMap.get(studentId);
    if (
      window.confirm(
        `Keluarkan ${student?.nama || 'siswa ini'} dari ruang ujian? (Data siswa tetap tersimpan di database).`
      )
    ) {
      const updated = examAllocations.filter((a) => a.studentId !== studentId);
      onSaveExamAllocations(updated);
      showNotification('Siswa telah dikeluarkan dari penempatan ruang.');
    }
  };

  // Exam card target list computation
  const targetExamCardStudents = useMemo(() => {
    if (cardFilterMode === 'room') {
      const roomAllocIds = examAllocations
        .filter((a) => a.roomId === cardFilterRoomId)
        .map((a) => a.studentId);
      return students.filter((s) => roomAllocIds.includes(s.id));
    }
    if (cardFilterMode === 'class') {
      return students.filter((s) => s.kelas === cardFilterClass);
    }
    return students;
  }, [students, examAllocations, cardFilterMode, cardFilterRoomId, cardFilterClass]);

  // Exam card pagination into A4 sheets (8 cards per sheet)
  const examCardPages = useMemo(() => {
    const pages: Student[][] = [];
    for (let i = 0; i < targetExamCardStudents.length; i += cardsPerPage) {
      pages.push(targetExamCardStudents.slice(i, i + cardsPerPage));
    }
    return pages;
  }, [targetExamCardStudents, cardsPerPage]);

  // Export Exam Cards PDF
  const handleExportCardsPdf = async () => {
    if (!printCardsContainerRef.current || targetExamCardStudents.length === 0) {
      alert('Tidak ada kartu ujian untuk dicetak.');
      return;
    }
    setIsExporting(true);
    setToastNotice(`Sedang membuat PDF Kartu Ujian (${examCardPages.length} halaman A4)...`);
    try {
      await PrintService.downloadA4SheetPdf(
        printCardsContainerRef.current,
        `Kartu_Peserta_Ujian_MTs_Miftahul_Huda_${examInfo.tahunPelajaran.replace('/', '-')}`,
        (cur, total) => {
          setToastNotice(`Merender halaman kartu ${cur} dari ${total}...`);
        }
      );
      setToastNotice(`Berhasil mengunduh PDF Kartu Ujian (${examCardPages.length} Halaman A4)!`);
      setTimeout(() => setToastNotice(null), 4000);
    } catch (e: any) {
      alert(`Gagal membuat PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Denah PDF
  const handleExportDenahPdf = async () => {
    if (!printDenahContainerRef.current) return;
    const room = roomMap.get(selectedDenahRoomId) || examRooms[0];
    setIsExporting(true);
    setToastNotice(`Sedang membuat PDF Denah Tempat Duduk ${room.nomorRuang}...`);
    try {
      await PrintService.downloadA4SheetPdf(
        printDenahContainerRef.current,
        `Denah_Tempat_Duduk_${room.nomorRuang.replace(/\s+/g, '_')}_${examInfo.tahunPelajaran.replace('/', '-')}`
      );
      setToastNotice('File PDF Denah Tempat Duduk berhasil diunduh!');
      setTimeout(() => setToastNotice(null), 4000);
    } catch (e: any) {
      alert(`Gagal membuat PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Attendance PDF
  const handleExportAttendancePdf = async () => {
    if (!printAttendanceContainerRef.current) return;
    const room = roomMap.get(selectedAttendanceRoomId) || examRooms[0];
    setIsExporting(true);
    setToastNotice(`Sedang membuat PDF Daftar Hadir ${room.nomorRuang}...`);
    try {
      await PrintService.downloadA4SheetPdf(
        printAttendanceContainerRef.current,
        `Daftar_Hadir_Ujian_${room.nomorRuang.replace(/\s+/g, '_')}_${selectedAttendanceSubject.replace(/\s+/g, '_')}`
      );
      setToastNotice('File PDF Daftar Hadir Ujian berhasil diunduh!');
      setTimeout(() => setToastNotice(null), 4000);
    } catch (e: any) {
      alert(`Gagal membuat PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 no-print">
          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastNotice}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Manajemen Ujian & Penempatan Ruang</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {examInfo.namaUjian}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Terintegrasi langsung dengan database siswa ({students.length} siswa). Mengatur pembagian ruang ujian, kartu peserta, denah tempat duduk, dan daftar absensi secara otomatis.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-700">
            Total Ruang: <span className="font-bold text-slate-900">{examRooms.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 font-semibold text-emerald-900">
            Siswa Ditempatkan: <span className="font-bold">{examAllocations.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-semibold text-amber-900">
            Belum Terbagi: <span className="font-bold">{unallocatedStudents.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5 no-print">
        <button
          onClick={() => setSubTab('ruang')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'ruang'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>1. Pembagian Ruang & Meja</span>
        </button>

        <button
          onClick={() => setSubTab('kartu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'kartu'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>2. Cetak Kartu Peserta Ujian</span>
        </button>

        <button
          onClick={() => setSubTab('denah')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'denah'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Denah Tempat Duduk</span>
        </button>

        <button
          onClick={() => setSubTab('absensi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'absensi'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>4. Daftar Hadir / Absensi</span>
        </button>

        <button
          onClick={() => setSubTab('pengaturan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'pengaturan'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>5. Pengaturan & Jadwal Ujian</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: PEMBAGIAN RUANG & TEMPAT DUDUK */}
      {/* ========================================================= */}
      {subTab === 'ruang' && (
        <div className="space-y-5">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kelola Ruang Ujian & Penempatan</h3>
              <p className="text-xs text-slate-500">
                Pilih ruang di bawah untuk melihat dan memodifikasi posisi duduk siswa.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAutoAllocateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Shuffle className="w-4 h-4 text-amber-300" />
                <span>Bagi Ruang Otomatis (Cepat)</span>
              </button>
              <button
                onClick={handleOpenAddRoom}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ruang Baru</span>
              </button>
            </div>
          </div>

          {/* Room Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {examRooms.map((room) => {
              const count = examAllocations.filter((a) => a.roomId === room.id).length;
              const isSelected = activeRoom?.id === room.id;
              const percent = Math.min(100, Math.round((count / (room.kapasitas || 20)) * 100));

              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-600/30'
                      : 'border-slate-200 bg-white hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          isSelected
                            ? 'bg-emerald-800 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {room.nomorRuang}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditRoom(room);
                          }}
                          className="p-1 hover:text-emerald-700 text-slate-400"
                          title="Edit Ruang"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          className="p-1 hover:text-rose-600 text-slate-400"
                          title="Hapus Ruang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {room.namaRuang}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pengawas: {room.pengawas1 || 'Belum diisi'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-600">Terisi:</span>
                      <span className={count >= room.kapasitas ? 'text-amber-700 font-bold' : 'text-emerald-800 font-bold'}>
                        {count} / {room.kapasitas} Siswa
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full ${percent >= 100 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Room Occupants & Unallocated Sidebar */}
          {activeRoom && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Occupants in Active Room */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Daftar Siswa di {activeRoom.nomorRuang}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {activeRoomAllocations.length} Siswa
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lokasi: {activeRoom.namaRuang} • Kapasitas: {activeRoom.kapasitas} Meja
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDenahRoomId(activeRoom.id);
                        setSubTab('denah');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Lihat Denah</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAttendanceRoomId(activeRoom.id);
                        setSubTab('absensi');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Daftar Hadir</span>
                    </button>
                  </div>
                </div>

                {/* Table of Occupants */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">Meja</th>
                        <th className="py-2.5 px-3 w-28">No. Peserta</th>
                        <th className="py-2.5 px-4">Nama Siswa</th>
                        <th className="py-2.5 px-3 text-center">Kelas</th>
                        <th className="py-2.5 px-3 font-mono">NISN</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeRoomAllocations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Ruang ini masih kosong. Tambahkan siswa dari daftar di samping atau gunakan pembagian otomatis.
                          </td>
                        </tr>
                      ) : (
                        activeRoomAllocations.map((alloc) => {
                          const std = studentMap.get(alloc.studentId);
                          return (
                            <tr key={alloc.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center font-black">
                                <span className="w-7 h-7 mx-auto rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs">
                                  {alloc.nomorMeja}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-950">
                                {alloc.nomorPeserta}
                              </td>
                              <td className="py-2 px-4 font-bold text-slate-900">
                                {std?.nama || 'Siswa Dihapus'}
                              </td>
                              <td className="py-2 px-3 text-center font-bold">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {std?.kelas || '-'}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                                {std?.nisn || std?.nis || '-'}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenMoveModal(alloc)}
                                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="Pindah ke Ruang Lain"
                                  >
                                    <MoveRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFromRoom(alloc.studentId)}
                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Keluarkan dari Ruang"
                                  >
                                    <X className="w-4 h-4" />
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

              {/* Right Column: Unassigned Student Pool */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="border-b pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                    <span>Siswa Belum Ditempatkan</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {unallocatedStudents.length} Siswa
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klik tanda &ldquo;+&rdquo; untuk memasukkan siswa ke {activeRoom.nomorRuang}.
                  </p>
                </div>

                <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100 border rounded-xl">
                  {unallocatedStudents.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 p-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-700">Semua siswa sudah ditempatkan!</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tidak ada siswa yang tertinggal tanpa ruang ujian.
                      </p>
                    </div>
                  ) : (
                    unallocatedStudents.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 flex items-center justify-between hover:bg-emerald-50/50 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{s.nama}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Kelas {s.kelas} • NISN: {s.nisn || s.nis}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddStudentToRoom(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer flex-shrink-0"
                          title={`Masukkan ke ${activeRoom.nomorRuang}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pilih</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: CETAK KARTU PESERTA UJIAN */}
      {/* ========================================================= */}
      {subTab === 'kartu' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Pengaturan Cetak Kartu Ujian</h3>
              <p className="text-xs text-slate-500">
                Kartu memuat Nama, NIS/NISN, Kelas, Foto, Ruang Ujian, Nomor Meja, dan Tanda Tangan Kepala Madrasah.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCardsPdf}
                disabled={isExporting || targetExamCardStudents.length === 0}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-emerald-300" />
                <span>Download PDF A4 ({examCardPages.length} Hal)</span>
              </button>
              <button
                onClick={() => window.print()}
                disabled={isExporting || targetExamCardStudents.length === 0}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Langsung (Print)</span>
              </button>
            </div>
          </div>

          {/* Filter Criteria */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs font-semibold no-print">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Filter Cetak:</span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setCardFilterMode('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    cardFilterMode === 'all'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua Siswa ({students.length})
                </button>
                <button
                  onClick={() => setCardFilterMode('room')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    cardFilterMode === 'room'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Berdasarkan Ruang
                </button>
                <button
                  onClick={() => setCardFilterMode('class')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    cardFilterMode === 'class'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Berdasarkan Kelas Asal
                </button>
              </div>
            </div>

            {cardFilterMode === 'room' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Pilih Ruang:</span>
                <select
                  value={cardFilterRoomId}
                  onChange={(e) => setCardFilterRoomId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                >
                  {examRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nomorRuang} ({r.namaRuang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {cardFilterMode === 'class' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Pilih Kelas:</span>
                <select
                  value={cardFilterClass}
                  onChange={(e) => setCardFilterClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                >
                  {distinctClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <span>Garis Potong (Crop Marks)</span>
              </label>
            </div>
          </div>

          {/* Multi-Page A4 Printable Display Container */}
          <div className="bg-slate-200/90 p-4 sm:p-8 rounded-2xl border border-slate-300 flex flex-col items-center overflow-x-auto shadow-inner">
            <div ref={printCardsContainerRef} className="space-y-10">
              {examCardPages.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl shadow text-center text-slate-400 w-[210mm]">
                  <p className="text-base font-bold">Tidak ada kartu ujian untuk kriteria ini.</p>
                </div>
              ) : (
                examCardPages.map((pageCards, pageIdx) => (
                  <div key={pageIdx} className="flex flex-col items-center">
                    {/* Header badge */}
                    <div className="mb-2 text-xs font-bold text-slate-700 no-print flex items-center justify-between w-full max-w-[210mm] px-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-800 text-white text-[11px] font-bold shadow-xs">
                        Lembar A4 - Halaman {pageIdx + 1} dari {examCardPages.length}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {pageCards.length} Kartu Peserta Ujian
                      </span>
                    </div>

                    {/* A4 Sheet */}
                    <div
                      className="a4-sheet-page bg-white shadow-2xl transition-all"
                      style={{
                        width: '210mm',
                        height: '297mm',
                        minHeight: '297mm',
                        maxHeight: '297mm',
                        padding: '8mm',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        pageBreakAfter: 'always',
                        breakAfter: 'page',
                      }}
                    >
                      <div
                        className="grid grid-cols-2"
                        style={{
                          columnGap: '4mm',
                          rowGap: '4mm',
                        }}
                      >
                        {pageCards.map((std) => {
                          const alloc = allocationByStudentId.get(std.id);
                          const room = alloc ? roomMap.get(alloc.roomId) : undefined;
                          return (
                            <div
                              key={std.id}
                              className={`relative card-print-item ${
                                showCropMarks
                                  ? 'outline outline-1 outline-dashed outline-slate-400'
                                  : ''
                              }`}
                              style={{
                                width: '85.6mm',
                                height: '53.98mm',
                                boxSizing: 'border-box',
                              }}
                            >
                              {showCropMarks && (
                                <>
                                  <span className="absolute -top-1.5 -left-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                    ┌
                                  </span>
                                  <span className="absolute -top-1.5 -right-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                    ┐
                                  </span>
                                  <span className="absolute -bottom-1.5 -left-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                    └
                                  </span>
                                  <span className="absolute -bottom-1.5 -right-1.5 text-[7px] text-slate-400 font-mono pointer-events-none select-none">
                                    ┘
                                  </span>
                                </>
                              )}
                              <ExamCardItem
                                student={std}
                                allocation={alloc}
                                room={room}
                                identity={identity}
                                examInfo={examInfo}
                                scale={1}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: DENAH TEMPAT DUDUK RUANG UJIAN */}
      {/* ========================================================= */}
      {subTab === 'denah' && (
        <div className="space-y-5">
          {/* Top Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Pilih Ruang Ujian:</label>
              <select
                value={selectedDenahRoomId}
                onChange={(e) => setSelectedDenahRoomId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 font-bold text-emerald-950 focus:outline-none"
              >
                {examRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nomorRuang} ({r.namaRuang})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDenahPdf}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-emerald-300" />
                <span>Download PDF Denah Ruang</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Denah (Print)</span>
              </button>
            </div>
          </div>

          {/* Printable Layout Container */}
          <div className="bg-slate-200/90 p-4 sm:p-8 rounded-2xl border border-slate-300 flex justify-center overflow-x-auto shadow-inner">
            <div ref={printDenahContainerRef}>
              {roomMap.get(selectedDenahRoomId) ? (
                <ExamRoomLayoutPrint
                  room={roomMap.get(selectedDenahRoomId)!}
                  students={students}
                  allocations={examAllocations}
                  identity={identity}
                  examInfo={examInfo}
                />
              ) : (
                <div className="bg-white p-12 text-center text-slate-400">Pilih ruang ujian.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: DAFTAR HADIR / ABSENSI UJIAN */}
      {/* ========================================================= */}
      {subTab === 'absensi' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Ruang:</span>
                <select
                  value={selectedAttendanceRoomId}
                  onChange={(e) => setSelectedAttendanceRoomId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-emerald-950"
                >
                  {examRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nomorRuang} ({r.namaRuang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Mata Pelajaran:</span>
                <input
                  type="text"
                  value={selectedAttendanceSubject}
                  onChange={(e) => setSelectedAttendanceSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Hari / Tgl:</span>
                <input
                  type="text"
                  value={selectedAttendanceDate}
                  onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAttendancePdf}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-emerald-300" />
                <span>Download PDF Absensi</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Absensi (Print)</span>
              </button>
            </div>
          </div>

          {/* Printable Attendance Sheet */}
          <div className="bg-slate-200/90 p-4 sm:p-8 rounded-2xl border border-slate-300 flex justify-center overflow-x-auto shadow-inner">
            <div ref={printAttendanceContainerRef}>
              {roomMap.get(selectedAttendanceRoomId) ? (
                <ExamAttendancePrint
                  room={roomMap.get(selectedAttendanceRoomId)!}
                  students={students}
                  allocations={examAllocations}
                  identity={identity}
                  examInfo={examInfo}
                  subjectName={selectedAttendanceSubject}
                  examDate={selectedAttendanceDate}
                  examTime={selectedAttendanceTime}
                />
              ) : (
                <div className="bg-white p-12 text-center text-slate-400">Pilih ruang ujian.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: PENGATURAN & JADWAL UJIAN */}
      {/* ========================================================= */}
      {subTab === 'pengaturan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Exam Profile Configuration */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b pb-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Identitas & Judul Asesmen / Ujian</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Asesmen / Ujian *
                </label>
                <input
                  type="text"
                  value={examInfo.namaUjian}
                  onChange={(e) => onSaveExamInfo({ ...examInfo, namaUjian: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Contoh: ASESMEN SUMATIF AKHIR SEMESTER (ASAS) atau ASESMEN MADRASAH (AM)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester
                </label>
                <select
                  value={examInfo.semester}
                  onChange={(e) => onSaveExamInfo({ ...examInfo, semester: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Pelaksanaan Ujian
                </label>
                <input
                  type="text"
                  value={examInfo.tanggalUjian}
                  onChange={(e) => onSaveExamInfo({ ...examInfo, tanggalUjian: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Format Prefix Nomor Peserta Ujian
                </label>
                <input
                  type="text"
                  value={examInfo.nomorPesertaPrefix}
                  onChange={(e) => onSaveExamInfo({ ...examInfo, nomorPesertaPrefix: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-emerald-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Contoh: 02-15-023- (akan menghasilkan 02-15-023-001, 02-15-023-002, dst)
                </p>
              </div>
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Jadwal Mata Pelajaran Ujian</span>
              </h3>
              <button
                onClick={() => {
                  const newItem: ExamScheduleItem = {
                    hariTanggal: 'Senin, 01 Des 2026',
                    jam: '07.30 - 09.30',
                    mataPelajaran: 'Mata Pelajaran Baru',
                  };
                  onSaveExamSchedule([...examSchedule, newItem]);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mapel</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                  <tr>
                    <th className="py-2 px-3">Hari & Tanggal</th>
                    <th className="py-2 px-3">Waktu</th>
                    <th className="py-2 px-3">Mata Pelajaran</th>
                    <th className="py-2 px-2 text-center w-8">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examSchedule.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={item.hariTanggal}
                          onChange={(e) => {
                            const updated = [...examSchedule];
                            updated[idx].hariTanggal = e.target.value;
                            onSaveExamSchedule(updated);
                          }}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 text-xs py-0.5"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={item.jam}
                          onChange={(e) => {
                            const updated = [...examSchedule];
                            updated[idx].jam = e.target.value;
                            onSaveExamSchedule(updated);
                          }}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 text-xs py-0.5"
                        />
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">
                        <input
                          type="text"
                          value={item.mataPelajaran}
                          onChange={(e) => {
                            const updated = [...examSchedule];
                            updated[idx].mataPelajaran = e.target.value;
                            onSaveExamSchedule(updated);
                          }}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 text-xs py-0.5 font-bold"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = examSchedule.filter((_, i) => i !== idx);
                            onSaveExamSchedule(updated);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AUTO ALLOCATE STUDENTS */}
      {/* ========================================================= */}
      {isAutoAllocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Pembagian Ruang & Tempat Duduk Otomatis</h3>
                <p className="text-xs text-emerald-200">
                  Mendistribusikan seluruh siswa ke {examRooms.length} ruang ujian
                </p>
              </div>
              <button
                onClick={() => setIsAutoAllocateModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Metode Pembagian Siswa:
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-emerald-50/50 cursor-pointer">
                    <input
                      type="radio"
                      name="autoMode"
                      checked={autoMode === 'cross_class'}
                      onChange={() => setAutoMode('cross_class')}
                      className="mt-0.5 text-emerald-700"
                    />
                    <div>
                      <p className="font-bold text-slate-900">
                        Silang Kelas / Campur (Rekomendasi Ujian Madrasah)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Siswa Kelas 7, 8, dan 9 disusun berselang-seling pada deretan meja untuk mencegah mencontek.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-emerald-50/50 cursor-pointer">
                    <input
                      type="radio"
                      name="autoMode"
                      checked={autoMode === 'by_class'}
                      onChange={() => setAutoMode('by_class')}
                      className="mt-0.5 text-emerald-700"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Urut Kelas Asal (7A ➜ 7B ➜ 8A ➜ ...)</p>
                      <p className="text-[11px] text-slate-500">
                        Siswa dikelompokkan sesuai kelas asal masing-masing.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-emerald-50/50 cursor-pointer">
                    <input
                      type="radio"
                      name="autoMode"
                      checked={autoMode === 'alphabetical'}
                      onChange={() => setAutoMode('alphabetical')}
                      className="mt-0.5 text-emerald-700"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Urut Abjad Nama (A - Z)</p>
                      <p className="text-[11px] text-slate-500">
                        Disusun alfabetis berdasarkan nama lengkap siswa.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-emerald-50/50 cursor-pointer">
                    <input
                      type="radio"
                      name="autoMode"
                      checked={autoMode === 'by_nis'}
                      onChange={() => setAutoMode('by_nis')}
                      className="mt-0.5 text-emerald-700"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Urut Nomor Induk (NIS / NISN)</p>
                      <p className="text-[11px] text-slate-500">
                        Disusun berdasarkan nomor induk siswa.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kapasitas Tiap Ruang:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={autoCapacity}
                    onChange={(e) => setAutoCapacity(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Standar: 20 meja per ruang</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Format No. Peserta:
                  </label>
                  <input
                    type="text"
                    value={autoPrefix}
                    onChange={(e) => setAutoPrefix(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Contoh: 02-15-023-</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                Total Siswa: <strong>{students.length}</strong> ➜ Ruang Tersedia: <strong>{examRooms.length} Ruang</strong> (Daya tampung: {examRooms.length * autoCapacity} kursi).
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2.5">
              <button
                onClick={() => setIsAutoAllocateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteAutoAllocate}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4 text-amber-300" />
                <span>Jalankan Pembagian Otomatis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT ROOM */}
      {/* ========================================================= */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingRoom ? 'Edit Data Ruang Ujian' : 'Tambah Ruang Ujian Baru'}
                </h3>
                <p className="text-xs text-emerald-200">
                  Atur nomor ruang, nama lokasi, dan kapasitas meja
                </p>
              </div>
              <button
                onClick={() => setIsAddRoomModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Ruang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang 01"
                  value={roomFormData.nomorRuang}
                  onChange={(e) => setRoomFormData({ ...roomFormData, nomorRuang: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Lokasi Ruang</label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung A - Kelas 7A"
                  value={roomFormData.namaRuang}
                  onChange={(e) => setRoomFormData({ ...roomFormData, namaRuang: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kapasitas Kursi</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={roomFormData.kapasitas}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, kapasitas: parseInt(e.target.value) || 20 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kolom Meja Denah</label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={roomFormData.kolomMeja}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, kolomMeja: parseInt(e.target.value) || 4 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Standar: 4 lajur meja</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pengawas 1</label>
                <input
                  type="text"
                  placeholder="Nama pengawas pertama"
                  value={roomFormData.pengawas1}
                  onChange={(e) => setRoomFormData({ ...roomFormData, pengawas1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pengawas 2</label>
                <input
                  type="text"
                  placeholder="Nama pengawas kedua"
                  value={roomFormData.pengawas2}
                  onChange={(e) => setRoomFormData({ ...roomFormData, pengawas2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingRoom ? 'Simpan Perubahan' : 'Tambah Ruang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MOVE STUDENT ROOM */}
      {/* ========================================================= */}
      {isMoveStudentModalOpen && movingStudentAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Pindah Ruang Ujian Siswa</h3>
                <p className="text-xs text-emerald-200">
                  {studentMap.get(movingStudentAllocation.studentId)?.nama}
                </p>
              </div>
              <button
                onClick={() => setIsMoveStudentModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-slate-500 font-semibold">Penempatan Saat Ini:</p>
                <p className="font-bold text-slate-900 text-sm">
                  {roomMap.get(movingStudentAllocation.roomId)?.nomorRuang} • Meja {movingStudentAllocation.nomorMeja}
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  No. Peserta: {movingStudentAllocation.nomorPeserta}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pilih Ruang Ujian Baru:
                </label>
                <select
                  value={selectedTargetRoomId}
                  onChange={(e) => setSelectedTargetRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold bg-white"
                >
                  {examRooms.map((r) => {
                    const count = examAllocations.filter((a) => a.roomId === r.id).length;
                    return (
                      <option key={r.id} value={r.id} disabled={r.id === movingStudentAllocation.roomId}>
                        {r.nomorRuang} ({r.namaRuang}) — {count}/{r.kapasitas} kursi
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Nomor meja akan diisi ke kursi kosong berikutnya di ruang tujuan secara otomatis.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2.5 text-xs">
              <button
                onClick={() => setIsMoveStudentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteMove}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <MoveRight className="w-4 h-4" />
                <span>Pindahkan Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
