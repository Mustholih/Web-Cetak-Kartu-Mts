import React from 'react';
import { Student, SchoolIdentity, ExamInfo, ExamRoom, ExamAllocation } from '../../types';

interface Props {
  room: ExamRoom;
  students: Student[];
  allocations: ExamAllocation[];
  identity: SchoolIdentity;
  examInfo: ExamInfo;
}

export const ExamRoomLayoutPrint: React.FC<Props> = ({
  room,
  students,
  allocations,
  identity,
  examInfo,
}) => {
  const roomAllocations = allocations.filter((a) => a.roomId === room.id);
  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Map seat number to allocation
  const seatMap = new Map<number, { allocation: ExamAllocation; student: Student }>();
  roomAllocations.forEach((alloc) => {
    const student = studentMap.get(alloc.studentId);
    if (student) {
      seatMap.set(alloc.nomorMeja, { allocation: alloc, student });
    }
  });

  const totalSeats = room.kapasitas || 20;
  const cols = room.kolomMeja || 4;
  const rows = Math.ceil(totalSeats / cols);

  // Generate grid matrix
  const gridCells: number[] = [];
  for (let i = 1; i <= totalSeats; i++) {
    gridCells.push(i);
  }

  return (
    <div
      className="bg-white p-6 font-sans text-slate-900 border border-slate-300 shadow-xl print:shadow-none print:border-none a4-sheet-page"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Kop Surat Resmi Madrasah */}
      <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3 mb-4">
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          {identity.logoUrl && (
            <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          )}
        </div>
        <div className="flex-1 text-center pr-10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            KEMENTERIAN AGAMA REPUBLIK INDONESIA
          </p>
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-700">
            KANTOR KEMENTERIAN AGAMA KABUPATEN {identity.kabupaten.toUpperCase()}
          </p>
          <h1 className="text-base font-black font-serif uppercase tracking-tight text-slate-950">
            {identity.namaMadrasah}
          </h1>
          <p className="text-[8.5px] text-slate-600 mt-0.5">
            {identity.alamat} • Telp: {identity.telepon} • Email: {identity.email}
          </p>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-emerald-950 underline">
          DENAH TEMPAT DUDUK PESERTA UJIAN
        </h2>
        <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
          {examInfo.namaUjian}
        </p>
        <p className="text-[11px] font-semibold text-slate-600">
          Tahun Pelajaran {identity.tahunPelajaran} • Semester {examInfo.semester}
        </p>

        {/* Room Info Pill */}
        <div className="inline-flex items-center gap-4 mt-2 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950">
          <span>{room.nomorRuang} ({room.namaRuang})</span>
          <span>•</span>
          <span>Kapasitas: {room.kapasitas} Peserta</span>
          <span>•</span>
          <span>Terisi: {roomAllocations.length} Siswa</span>
        </div>
      </div>

      {/* Front Classroom Banner */}
      <div className="mb-4 text-center">
        <div className="py-1.5 px-4 bg-slate-100 border-2 border-dashed border-slate-400 rounded-lg text-xs font-bold uppercase text-slate-700 tracking-wider">
          ▲ PAPAN TULIS & MEJA PENGAWAS UJIAN (DEPAN RUANG) ▲
        </div>
      </div>

      {/* Desk Grid */}
      <div
        className="grid gap-3 mb-6"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {gridCells.map((seatNum) => {
          const occupant = seatMap.get(seatNum);
          return (
            <div
              key={seatNum}
              className={`p-2.5 rounded-xl border flex flex-col justify-between min-h-[78px] text-center transition-all ${
                occupant
                  ? 'border-emerald-700 bg-emerald-50/40 shadow-2xs'
                  : 'border-slate-200 bg-slate-50 border-dashed text-slate-400'
              }`}
            >
              {/* Desk Number Header */}
              <div className="flex items-center justify-between border-b pb-1 mb-1 border-slate-200">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-800 text-white leading-none">
                  MEJA {String(seatNum).padStart(2, '0')}
                </span>
                {occupant && (
                  <span className="text-[8px] font-bold text-emerald-800 px-1 py-0.2 rounded bg-emerald-100 border border-emerald-300">
                    {occupant.student.kelas}
                  </span>
                )}
              </div>

              {/* Student Occupant */}
              {occupant ? (
                <div className="my-auto">
                  <p className="text-[10px] font-black text-slate-950 uppercase leading-tight line-clamp-2">
                    {occupant.student.nama}
                  </p>
                  <p className="text-[8.5px] font-mono font-bold text-emerald-900 mt-0.5">
                    {occupant.allocation.nomorPeserta}
                  </p>
                  <p className="text-[7.5px] text-slate-500 font-mono">
                    NISN: {occupant.student.nisn || occupant.student.nis}
                  </p>
                </div>
              ) : (
                <div className="my-auto py-2">
                  <p className="text-[9px] font-semibold text-slate-400 italic">[ KOSONG ]</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back Classroom Banner */}
      <div className="mb-6 text-center">
        <div className="py-1 px-4 bg-slate-50 border border-slate-300 rounded text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
          ▼ PINTU MASUK & KELUAR / BELAKANG RUANG ▼
        </div>
      </div>

      {/* Signatures & Supervisors Info */}
      <div className="mt-auto pt-4 border-t border-slate-200 grid grid-cols-2 text-xs">
        <div>
          <p className="font-bold text-slate-800">Petugas Pengawas Ujian:</p>
          <div className="mt-2 space-y-2 text-[11px] text-slate-700">
            <p>1. {room.pengawas1 || '......................................................'}</p>
            <p>2. {room.pengawas2 || '......................................................'}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-slate-600">
            {identity.kotaPenerbitan}, {examInfo.tanggalUjian.split('-')[0].trim() || identity.tanggalTerbit}
          </p>
          <p className="font-bold text-slate-900 text-xs mt-0.5">
            Kepala MTs Miftahul Huda,
          </p>
          <div className="h-12 flex items-center justify-end my-1">
            {identity.ttdUrl && (
              <img
                src={identity.ttdUrl}
                alt="TTD"
                className="h-12 object-contain"
              />
            )}
          </div>
          <p className="font-bold text-slate-950 underline leading-none">
            {identity.kepalaMadrasah}
          </p>
          <p className="text-[10px] text-slate-600 leading-tight">
            NIP. {identity.nipKepala}
          </p>
        </div>
      </div>
    </div>
  );
};
