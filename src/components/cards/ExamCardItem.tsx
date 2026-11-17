import React from 'react';
import { Student, SchoolIdentity, ExamInfo, ExamAllocation, ExamRoom } from '../../types';
import { DEFAULT_STEMPEL_SVG, DEFAULT_PANITIA_STEMPEL_SVG } from '../../services/defaultData';

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
  const deskLabel = allocation
    ? allocation.posisiKursi
      ? `Meja ${String(allocation.nomorMeja).padStart(2, '0')} (${allocation.posisiKursi})`
      : `Meja ${String(allocation.nomorMeja).padStart(2, '0')}`
    : '-';

  // Official MTs Miftahul Huda Stamp (use custom uploaded stamp if customized, otherwise Panitia Ujian MTs Miftahul Huda stamp)
  const officialStampUrl =
    identity.stempelUrl && identity.stempelUrl !== DEFAULT_STEMPEL_SVG
      ? identity.stempelUrl
      : DEFAULT_PANITIA_STEMPEL_SVG;

  const panitiaName = examInfo.ketuaPanitiaNama?.trim() || "H. AHMAD RIFA'I, S.Pd.I.";
  const panitiaNip = examInfo.ketuaPanitiaNip?.trim() || '-';
  const dateText =
    examInfo.tempatTanggalJadwal?.trim() ||
    `${identity.kotaPenerbitan}, ${identity.tanggalTerbit}`;

  return (
    <div
      className="relative overflow-hidden font-sans select-none border box-border shadow-sm print:shadow-none bg-white flex flex-col"
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
            className="w-34 h-34 object-contain filter grayscale"
          />
        </div>
      )}

      {/* Decorative Gold & Green Top/Bottom Bars */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800 z-10" />

      {/* Header Section */}
      <div className="relative z-10 px-2.5 pt-1.5 pb-1 bg-emerald-950 text-white flex items-center gap-2 border-b border-amber-400 flex-shrink-0">
        {/* Logo */}
        <div className="w-7.5 h-7.5 flex-shrink-0 bg-white p-0.5 rounded-full border border-amber-300 shadow-sm flex items-center justify-center">
          {identity.logoUrl ? (
            <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-emerald-800 rounded-full flex items-center justify-center text-[7.5px] font-bold text-white">
              MTs
            </div>
          )}
        </div>

        {/* Header Titles */}
        <div className="flex-1 text-center pr-2 min-w-0">
          <h2 className="text-[9.5px] font-black uppercase tracking-tight text-white leading-tight font-serif truncate">
            {identity.namaMadrasah}
          </h2>
          <div className="mt-0.5 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[6.8px] tracking-wider rounded inline-block uppercase leading-none shadow-xs">
            KARTU PESERTA UJIAN
          </div>
          <p className="text-[5.2px] text-emerald-200 uppercase tracking-wide leading-none mt-0.5 truncate">
            {examInfo.namaUjian} • T.P. {identity.tahunPelajaran}
          </p>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="relative z-10 px-2 pt-1.5 pb-2 flex gap-2 items-stretch flex-1 min-h-0">
        {/* Left: Student Photo & Barcode */}
        <div className="flex flex-col items-center justify-between flex-shrink-0 w-[19mm]">
          <div className="w-[18.5mm] h-[23.5mm] bg-slate-50 overflow-hidden shadow-xs relative flex items-center justify-center border border-emerald-700 rounded">
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
                    width: i % 2 === 0 ? '1.3px' : '1.8px',
                    height: `${6 + (c.charCodeAt(0) % 3)}px`,
                  }}
                />
              ))}
              <span className="inline-block bg-slate-900 w-[1.8px] h-2 ml-[1px]" />
            </div>
            <span className="text-[4.8px] font-mono font-bold text-slate-700 tracking-wider leading-tight">
              *{nomorPeserta}*
            </span>
          </div>
        </div>

        {/* Right: Exam Credentials & Room/Desk Assignment + Ketua Panitia Signature */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          {/* Identity Table - strictly contained in top portion so stamp/signature never overlaps */}
          <table className="text-[6.4px] leading-[1.2] w-full border-collapse table-fixed">
            <tbody>
              <tr>
                <td className="font-bold text-slate-700 w-[14.5mm] py-[0.5px] align-top">No. Peserta</td>
                <td className="w-[1.5mm] align-top">:</td>
                <td className="font-extrabold text-[7px] text-emerald-950 font-mono truncate">
                  {nomorPeserta}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-slate-700 py-[0.5px] align-top">Nama Siswa</td>
                <td className="align-top">:</td>
                <td className="font-extrabold text-[7px] text-slate-900 leading-tight truncate">
                  {student.nama}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-slate-700 py-[0.5px] align-top">NIS / NISN</td>
                <td className="align-top">:</td>
                <td className="font-medium text-slate-800 truncate">
                  {student.nis} / {student.nisn || '-'}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-slate-700 py-[0.5px] align-top">Kelas Asal</td>
                <td className="align-top">:</td>
                <td className="font-extrabold text-emerald-800">
                  <span className="px-1 py-[0.5px] rounded bg-emerald-100 border border-emerald-300 text-[6px]">
                    {student.kelas}
                  </span>
                </td>
              </tr>
              {/* Exam Room & Seat Info Badge */}
              <tr>
                <td className="font-bold text-slate-900 py-[1px] align-middle">Ruang/Meja</td>
                <td className="align-middle">:</td>
                <td className="py-[1px]">
                  <div className="inline-flex items-center gap-1 flex-wrap">
                    <span className="px-1.5 py-[0.5px] rounded bg-amber-500 text-slate-950 font-black text-[6.3px] shadow-2xs leading-tight">
                      {nomorRuang}
                    </span>
                    <span className="px-1.5 py-[0.5px] rounded bg-emerald-800 text-white font-black text-[6.3px] leading-tight">
                      {deskLabel}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bottom Right: Ketua Panitia Pelaksana Ujian Signature & Official Stamp */}
          <div className="flex justify-end items-end relative pt-0.5 flex-shrink-0">
            <div className="text-center relative w-[36mm] text-[5.5px]">
              <p className="text-[4.9px] text-slate-600 leading-none truncate">
                {dateText}
              </p>
              <p className="font-bold text-slate-900 leading-tight mt-[1px] text-[5.3px] whitespace-nowrap">
                Ketua Panitia Pelaksana Ujian,
              </p>

              {/* Signature Area & Official MTs Miftahul Huda Stamp */}
              <div className="relative h-[6.5mm] flex items-center justify-center my-[0.5px]">
                {officialStampUrl && (
                  <img
                    src={officialStampUrl}
                    alt="Stempel Resmi MTs Miftahul Huda"
                    className="absolute left-0 -top-1 w-[7.5mm] h-[7.5mm] object-contain pointer-events-none select-none z-10"
                    style={{ opacity: identity.stempelOpacity ?? 0.85 }}
                  />
                )}
                {examInfo.ketuaPanitiaTtdUrl && (
                  <img
                    src={examInfo.ketuaPanitiaTtdUrl}
                    alt="Tanda Tangan Ketua Panitia"
                    className="h-[6.5mm] max-w-[24mm] object-contain relative z-20"
                  />
                )}
              </div>

              {/* Ketua Panitia Name & NIP */}
              <p className="font-bold text-slate-950 underline leading-none truncate text-[5.8px]">
                {panitiaName}
              </p>
              <p className="text-[4.7px] text-slate-600 leading-tight mt-[0.5px] truncate">
                NIP. {panitiaNip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
