import React from 'react';
import { Student, SchoolIdentity, ExamInfo, ExamAllocation, ExamRoom } from '../../types';

interface Props {
  student: Student;
  allocation?: ExamAllocation;
  room?: ExamRoom;
  identity: SchoolIdentity;
  examInfo: ExamInfo;
  scale?: number;
}

export const ExamCardItem: React.FC<Props> = ({
  student,
  allocation,
  room,
  identity,
  examInfo,
  scale = 1,
}) => {
  const nomorPeserta = allocation?.nomorPeserta || `U-${student.nis}`;
  const nomorRuang = room ? room.nomorRuang : 'Belum Ditentukan';
  const nomorMeja = allocation ? `Meja ${String(allocation.nomorMeja).padStart(2, '0')}` : '-';

  return (
    <div
      className="relative overflow-hidden font-sans select-none border box-border shadow-sm print:shadow-none bg-white"
      style={{
        width: '85.6mm',
        height: '53.98mm',
        minWidth: '85.6mm',
        minHeight: '53.98mm',
        maxWidth: '85.6mm',
        maxHeight: '53.98mm',
        borderColor: '#065f46',
        borderWidth: '2px',
        borderRadius: '3mm',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Subtle Madrasah Emblem Watermark */}
      {identity.logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-8">
          <img
            src={identity.logoUrl}
            alt="Watermark"
            className="w-36 h-36 object-contain filter grayscale"
          />
        </div>
      )}

      {/* Decorative Gold & Green Top/Bottom Bars */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800 z-10" />

      {/* Header Section */}
      <div className="relative z-10 px-2.5 pt-1 pb-1 bg-emerald-950 text-white flex items-center gap-2 border-b border-amber-400">
        {/* Logo */}
        <div className="w-8 h-8 flex-shrink-0 bg-white p-0.5 rounded-full border border-amber-300 shadow-sm flex items-center justify-center">
          {identity.logoUrl ? (
            <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-emerald-800 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
              MTs
            </div>
          )}
        </div>

        {/* Header Titles */}
        <div className="flex-1 text-center pr-2">
          <h2 className="text-[10px] font-black uppercase tracking-tight text-white leading-tight font-serif">
            {identity.namaMadrasah}
          </h2>
          <div className="mt-0.5 px-2 py-0.2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[7px] tracking-wider rounded inline-block uppercase leading-none shadow-xs">
            KARTU PESERTA UJIAN
          </div>
          <p className="text-[5.5px] text-emerald-200 uppercase tracking-wide leading-none mt-0.5">
            {examInfo.namaUjian} • T.P. {identity.tahunPelajaran}
          </p>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="relative z-10 p-2 flex gap-2 items-start h-[calc(53.98mm-16.5mm)]">
        {/* Left: Student Photo & Barcode */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-[19.5mm] h-[25mm] bg-slate-50 overflow-hidden shadow-xs relative flex items-center justify-center border-1.5 border-emerald-700 rounded">
            {student.fotoUrl ? (
              <img
                src={student.fotoUrl}
                alt={student.nama}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-1">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[5.5px] text-emerald-800 font-bold leading-tight">FOTO</span>
              </div>
            )}
          </div>

          {/* Simple Clean Barcode */}
          <div className="mt-0.5 flex flex-col items-center">
            <div className="flex items-center gap-[1px] h-2.5 px-1 bg-white rounded border border-slate-300">
              {nomorPeserta.replace(/[^0-9A-Z]/gi, '').slice(0, 10).split('').map((c, i) => (
                <span
                  key={i}
                  className="inline-block bg-slate-900"
                  style={{
                    width: i % 2 === 0 ? '1.5px' : '2px',
                    height: `${7 + (c.charCodeAt(0) % 3)}px`,
                  }}
                />
              ))}
              <span className="inline-block bg-slate-900 w-[2px] h-2.5 ml-[1px]" />
            </div>
            <span className="text-[5px] font-mono font-bold text-slate-700 tracking-wider">
              *{nomorPeserta}*
            </span>
          </div>
        </div>

        {/* Right: Exam Credentials & Room/Desk Assignment */}
        <div className="flex-1 flex flex-col justify-between h-full pr-0.5">
          {/* Identity Table */}
          <table className="text-[6.8px] leading-[1.25] w-full border-collapse">
            <tbody>
              <tr>
                <td className="font-bold text-slate-700 w-16 py-0.2">No. Peserta</td>
                <td className="w-1">:</td>
                <td className="font-extrabold text-[7.5px] text-emerald-950 font-mono">
                  {nomorPeserta}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-slate-700 py-0.2">Nama Siswa</td>
                <td>:</td>
                <td className="font-extrabold text-[7.4px] text-slate-900 leading-tight">
                  {student.nama}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-slate-700 py-0.2">NIS / NISN</td>
                <td>:</td>
                <td className="font-medium text-slate-800">
                  {student.nis} / {student.nisn || '-'}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-slate-700 py-0.2">Kelas Asal</td>
                <td>:</td>
                <td className="font-extrabold text-emerald-800">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-300">
                    {student.kelas}
                  </span>
                </td>
              </tr>
              {/* Exam Room & Seat Info Badge */}
              <tr>
                <td className="font-bold text-slate-900 py-0.5">Ruang & Meja</td>
                <td>:</td>
                <td className="py-0.5">
                  <div className="inline-flex items-center gap-1">
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[7px] shadow-2xs">
                      {nomorRuang}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-white font-black text-[7px]">
                      {nomorMeja}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bottom Right: Signature & Stamp Block */}
          <div className="flex justify-end items-end relative mt-0.5">
            <div className="text-center relative w-26 text-[6px]">
              <p className="text-[5.5px] text-slate-600 leading-none">
                {identity.kotaPenerbitan}, {identity.tanggalTerbit}
              </p>
              <p className="font-semibold text-slate-900 leading-tight mt-0.2">
                Kepala Madrasah,
              </p>

              {/* TTD + Stempel Overlap */}
              <div className="relative h-6 flex items-center justify-center my-0.2">
                {identity.showStempel && identity.stempelUrl && (
                  <img
                    src={identity.stempelUrl}
                    alt="Stempel"
                    className="absolute -left-1.5 -top-1 w-8 h-8 object-contain pointer-events-none select-none z-10"
                    style={{ opacity: identity.stempelOpacity }}
                  />
                )}
                {identity.ttdUrl && (
                  <img
                    src={identity.ttdUrl}
                    alt="Tanda Tangan"
                    className="h-6 max-w-[75px] object-contain relative z-20"
                    style={{
                      transform: `scale(${identity.ttdScale}) translateY(${identity.ttdOffsetY}px)`,
                    }}
                  />
                )}
              </div>

              {/* Name & NIP */}
              <p className="font-bold text-slate-950 underline leading-none truncate text-[6.2px]">
                {identity.kepalaMadrasah}
              </p>
              <p className="text-[5px] text-slate-600 leading-tight">
                NIP. {identity.nipKepala}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
