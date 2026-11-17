import React, { useMemo } from 'react';
import { Student, SchoolIdentity, ExamInfo, ExamRoom, ExamAllocation } from '../../types';

export interface DeskSlotSelection {
  roomId: string;
  deskNum: number;
  side: 'Kiri' | 'Kanan';
  allocation?: ExamAllocation;
}

interface Props {
  room: ExamRoom;
  students: Student[];
  allocations: ExamAllocation[];
  identity: SchoolIdentity;
  examInfo: ExamInfo;
  paperSize?: 'A4' | 'F4';
  interactive?: boolean;
  selectedSlot?: DeskSlotSelection | null;
  onSlotClick?: (deskNum: number, side: 'Kiri' | 'Kanan', allocation?: ExamAllocation) => void;
}

interface OccupantEntry {
  allocation: ExamAllocation;
  student: Student;
}

export const ExamRoomLayoutPrint: React.FC<Props> = ({
  room,
  students,
  allocations,
  identity,
  examInfo,
  paperSize = 'A4',
  interactive = false,
  selectedSlot = null,
  onSlotClick,
}) => {
  const isF4 = paperSize === 'F4';
  const cols = room.kolomMeja || 3; // Standard: 3 meja ke samping (horizontal)
  const perDesk = room.siswaPerMeja || 2; // Standard: 2 siswa per meja
  const capacity = room.kapasitas || 30;
  const maxDesksFromRows = (room.barisMeja || 5) * cols; // e.g. 5 x 3 = 15 desks
  const totalDesks = Math.max(
    Math.ceil(capacity / perDesk),
    maxDesksFromRows
  );

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  const roomAllocations = useMemo(
    () =>
      allocations
        .filter((a) => a.roomId === room.id && studentMap.has(a.studentId))
        .sort((a, b) => {
          if (a.nomorMeja !== b.nomorMeja) return a.nomorMeja - b.nomorMeja;
          if (a.posisiKursi === b.posisiKursi) return 0;
          return a.posisiKursi === 'Kiri' ? -1 : 1;
        }),
    [allocations, room.id, studentMap]
  );

  // Build desk map: deskNumber -> { Kiri?: OccupantEntry; Kanan?: OccupantEntry }
  const { deskMap, classSummary, actualTotalDesks } = useMemo(() => {
    const map = new Map<number, { Kiri?: OccupantEntry; Kanan?: OccupantEntry }>();
    const counts: Record<string, number> = {};
    let highestDesk = totalDesks;

    const ensureDesk = (d: number) => {
      if (d > highestDesk) highestDesk = d;
      if (!map.has(d)) map.set(d, {});
      return map.get(d)!;
    };

    const unplaced: OccupantEntry[] = [];

    // First pass: place allocations that explicitly specify posisiKursi
    roomAllocations.forEach((alloc) => {
      const student = studentMap.get(alloc.studentId);
      if (!student) return;
      counts[student.kelas] = (counts[student.kelas] || 0) + 1;

      if (alloc.posisiKursi === 'Kiri' || alloc.posisiKursi === 'Kanan') {
        const d = Math.max(1, alloc.nomorMeja || 1);
        const slotObj = ensureDesk(d);
        if (!slotObj[alloc.posisiKursi]) {
          slotObj[alloc.posisiKursi] = { allocation: alloc, student };
        } else {
          unplaced.push({ allocation: alloc, student });
        }
      } else {
        unplaced.push({ allocation: alloc, student });
      }
    });

    // Second pass: place legacy or colliding allocations cleanly into free slots
    unplaced.forEach((entry) => {
      const preferredDesk = Math.max(1, entry.allocation.nomorMeja || 1);
      if (preferredDesk <= totalDesks) {
        const prefObj = ensureDesk(preferredDesk);
        if (!prefObj.Kiri) {
          prefObj.Kiri = entry;
          return;
        }
        if (perDesk === 2 && !prefObj.Kanan) {
          prefObj.Kanan = entry;
          return;
        }
      }
      // Find first available desk slot
      let placed = false;
      for (let d = 1; d <= highestDesk + 5; d++) {
        const dObj = ensureDesk(d);
        if (!dObj.Kiri) {
          dObj.Kiri = entry;
          placed = true;
          break;
        }
        if (perDesk === 2 && !dObj.Kanan) {
          dObj.Kanan = entry;
          placed = true;
          break;
        }
      }
      if (!placed) {
        const nextD = highestDesk + 1;
        ensureDesk(nextD).Kiri = entry;
      }
    });

    const summaryEntries = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
    return { deskMap: map, classSummary: summaryEntries, actualTotalDesks: highestDesk };
  }, [roomAllocations, studentMap, totalDesks, perDesk]);

  // Generate desk numbers 1..actualTotalDesks (e.g. 1..15)
  const deskNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= actualTotalDesks; i++) {
      arr.push(i);
    }
    return arr;
  }, [actualTotalDesks]);

  const rowsCount = Math.ceil(actualTotalDesks / cols);

  const renderSeatSlot = (
    deskNum: number,
    side: 'Kiri' | 'Kanan',
    occupant?: OccupantEntry
  ) => {
    const isSelected =
      interactive &&
      selectedSlot &&
      selectedSlot.roomId === room.id &&
      selectedSlot.deskNum === deskNum &&
      selectedSlot.side === side;

    const canClick = interactive && Boolean(onSlotClick);

    const getClassBadgeStyle = (kelas: string) => {
      if (kelas.startsWith('7')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      if (kelas.startsWith('8')) return 'bg-amber-100 text-amber-900 border-amber-300';
      return 'bg-sky-100 text-sky-900 border-sky-300';
    };

    return (
      <div
        onClick={
          canClick
            ? () => onSlotClick?.(deskNum, side, occupant?.allocation)
            : undefined
        }
        className={`flex flex-col justify-between p-1.5 rounded-md min-h-[48px] transition-all ${
          canClick ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500' : ''
        } ${
          isSelected
            ? 'ring-2 ring-amber-500 bg-amber-50 border border-amber-400 shadow-xs'
            : occupant
            ? 'bg-white border border-slate-300/90'
            : 'bg-slate-50/70 border border-dashed border-slate-300'
        }`}
      >
        {/* Top Row: Seat Label & Class Badge */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-400">
            {side === 'Kiri' ? 'A • Kiri' : 'B • Kanan'}
          </span>
          {occupant ? (
            <span
              className={`text-[8px] font-black px-1.5 py-0.2 rounded border leading-tight ${getClassBadgeStyle(
                occupant.student.kelas
              )}`}
            >
              {occupant.student.kelas}
            </span>
          ) : (
            <span className="text-[7.5px] text-slate-300 font-semibold">-</span>
          )}
        </div>

        {/* Middle/Bottom: Student Name & Participant ID */}
        {occupant ? (
          <div className="my-auto text-left">
            <p
              className={`font-black text-slate-950 uppercase leading-tight line-clamp-2 ${
                rowsCount > 5 ? 'text-[8.5px]' : 'text-[9.5px]'
              }`}
              title={occupant.student.nama}
            >
              {occupant.student.nama}
            </p>
            <p className="text-[7.5px] font-mono font-semibold text-emerald-900 mt-0.5 truncate">
              {occupant.allocation.nomorPeserta}
            </p>
          </div>
        ) : (
          <div className="my-auto text-center py-1">
            <p className="text-[8px] font-semibold text-slate-400 italic">
              {canClick && selectedSlot ? '[ Pindah ke Sini ]' : '[ Kosong ]'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white font-sans text-slate-900 border border-slate-300 shadow-xl print:shadow-none print:border-none flex flex-col justify-between overflow-hidden ${
        isF4 ? 'f4-landscape-page' : 'a4-landscape-page'
      }`}
      style={{
        width: isF4 ? '330mm' : '297mm',
        height: isF4 ? '215mm' : '210mm',
        minHeight: isF4 ? '215mm' : '210mm',
        maxHeight: isF4 ? '215mm' : '210mm',
        padding: isF4 ? '6mm 9mm' : '6mm 8mm',
        boxSizing: 'border-box',
        margin: '0 auto',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* TOP HEADER BAR: Madrasah Identity + Document Title + Room Badge */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-slate-900 pb-2 mb-2 flex-shrink-0">
        {/* Left: Madrasah Logo & Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center">
            {identity.logoUrl ? (
              <img src={identity.logoUrl} alt="Logo Madrasah" className="w-full h-full object-contain" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center">
                MTs
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600 leading-none">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </p>
            <h1 className="text-sm font-black font-serif uppercase tracking-tight text-slate-950 leading-tight mt-0.5">
              {identity.namaMadrasah}
            </h1>
            <p className="text-[8px] text-slate-600 truncate max-w-md">
              {identity.alamat}
            </p>
          </div>
        </div>

        {/* Center: Document Title & Academic Year */}
        <div className="text-center flex-shrink-0">
          <h2 className="text-xs font-black uppercase tracking-wide text-emerald-950 underline">
            DENAH TEMPAT DUDUK PESERTA UJIAN
          </h2>
          <p className="text-[11px] font-bold text-slate-900 uppercase leading-tight mt-0.5">
            {examInfo.namaUjian}
          </p>
          <p className="text-[9.5px] font-semibold text-slate-700">
            Tahun Pelajaran {identity.tahunPelajaran} • Semester {examInfo.semester}
          </p>
        </div>

        {/* Right: Room & Capacity Box */}
        <div className="flex flex-col items-end flex-shrink-0">
          <div className="px-3.5 py-1 rounded-lg bg-emerald-900 text-white text-center shadow-2xs border border-amber-400">
            <p className="text-xs font-black tracking-wide uppercase leading-tight">
              {room.nomorRuang}
            </p>
            <p className="text-[8.5px] text-amber-300 font-semibold leading-tight">
              {room.namaRuang}
            </p>
          </div>
          <p className="text-[9px] font-bold text-slate-700 mt-1">
            Terisi: <span className="text-emerald-900">{roomAllocations.length}</span> / {room.kapasitas || 30} Siswa
            <span className="text-slate-400 mx-1">•</span>
            <span>{actualTotalDesks} Meja (3×{rowsCount})</span>
          </p>
        </div>
      </div>

      {/* FRONT OF CLASSROOM BANNER */}
      <div className="mb-2 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex-1 py-1 px-3 bg-slate-100 border border-dashed border-slate-400 rounded-md text-[9.5px] font-extrabold uppercase text-slate-700 tracking-wider text-center">
          ▲ PAPAN TULIS &amp; MEJA PENGAWAS UJIAN (BAGIAN DEPAN RUANG) ▲
        </div>
        {classSummary.length > 0 && (
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[8.5px] font-bold text-emerald-950 flex-shrink-0">
            <span className="text-slate-600">Komposisi Rombel:</span>
            {classSummary.map(([cls, cnt]) => (
              <span key={cls} className="px-1.5 py-0.2 rounded bg-white border border-emerald-300 text-emerald-900">
                {cls}: {cnt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* DESK GRID: 3 Desks Horizontal x 5 Rows Vertical (2 Students per Desk = Max 30) */}
      <div
        className="grid gap-2 flex-1 min-h-0"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rowsCount}, minmax(0, 1fr))`,
        }}
      >
        {deskNumbers.map((deskNum) => {
          const slot = deskMap.get(deskNum) || {};
          const hasOccupant = Boolean(slot.Kiri || slot.Kanan);
          return (
            <div
              key={deskNum}
              className={`rounded-lg border p-1.5 flex flex-col justify-between min-h-0 ${
                hasOccupant
                  ? 'border-emerald-700/80 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50/60 border-dashed'
              }`}
            >
              {/* Desk Header */}
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/90 flex-shrink-0">
                <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-800 text-white leading-none">
                  MEJA {String(deskNum).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-semibold text-slate-500">
                  {perDesk === 2 ? '2 Kursi (Kiri / Kanan)' : '1 Kursi'}
                </span>
              </div>

              {/* 2 Student Slots Inside Each Desk */}
              <div
                className={`grid gap-1.5 flex-1 min-h-0 ${
                  perDesk === 2 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {renderSeatSlot(deskNum, 'Kiri', slot.Kiri)}
                {perDesk === 2 && renderSeatSlot(deskNum, 'Kanan', slot.Kanan)}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER: Rear Door Indicator, Supervisors & Committee Signature */}
      <div className="mt-2 pt-1.5 border-t border-slate-300 flex items-end justify-between gap-4 text-[9.5px] flex-shrink-0">
        {/* Left: Supervisors & Back Banner */}
        <div className="flex items-center gap-6">
          <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[8.5px] font-bold text-slate-600 uppercase">
            ▼ Pintu Masuk / Belakang Ruang ▼
          </div>
          <div className="space-y-0.5 text-slate-800">
            <p className="font-bold text-slate-900">Pengawas Ruang:</p>
            <p className="text-[9px]">
              1. {room.pengawas1 || '........................................'} &nbsp;|&nbsp; 2.{' '}
              {room.pengawas2 || '........................................'}
            </p>
          </div>
        </div>

        {/* Right: Ketua Panitia Pelaksana Ujian */}
        <div className="text-right flex items-end gap-4">
          <div className="text-center min-w-[160px]">
            <p className="text-[8.5px] text-slate-600 leading-tight">
              {examInfo.tempatTanggalJadwal ||
                `${identity.kotaPenerbitan}, ${identity.tanggalTerbit}`}
            </p>
            <p className="font-bold text-slate-900 text-[9px] leading-tight">
              Ketua Panitia Pelaksana Ujian,
            </p>
            <div className="h-6 flex items-center justify-center">
              {examInfo.ketuaPanitiaTtdUrl && (
                <img
                  src={examInfo.ketuaPanitiaTtdUrl}
                  alt="TTD Ketua Panitia"
                  className="h-6 object-contain"
                />
              )}
            </div>
            <p className="font-bold text-slate-950 underline text-[9.5px] leading-tight">
              {examInfo.ketuaPanitiaNama || "H. AHMAD RIFA'I, S.Pd.I."}
            </p>
            <p className="text-[8px] text-slate-600 leading-tight">
              NIP. {examInfo.ketuaPanitiaNip || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
